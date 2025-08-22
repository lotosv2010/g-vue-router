import { App, shallowReactive, shallowRef, unref } from 'vue'
import { RouterView } from './RouterView'
import { isSameRouteRecord, START_LOCATION_NORMALIZED, stringifyURL } from './location'
import { routeLocationKey, routerKey, routerViewLocationKey } from './injectionSymbol'
import { createRouterMatcher, PathParserOptions } from './matcher'
import { HistoryState, RouterHistory } from './history/common'
import { isRouteName, Lazy, MatcherLocationRaw, RouteLocationOptions, RouteRecordRaw } from './types'
import { 
  stringifyQuery as originalStringifyQuery,
  parseQuery as originalParseQuery,
  stringifyQuery
} from './query'
import { _ScrollPositionCoordinates, ScrollPosition } from './scrollBehavior'
import { assign, isArray, isBrowser } from './utils'
import { NavigationGuardWithThis, NavigationHookAfter, RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteLocationRaw, RouteRecordNameGeneric } from './typed-routes'
import { RouteRecord, RouteRecordNormalized } from './matcher/types'
import { RouterLink } from './RouterLink'
import { useCallbacks } from './utils/callbacks'
import { extractComponentsGuards, guardToPromiseFn } from './navigationGuards'

type Awaitable<T> = T | Promise<T>

export interface RouterScrollBehavior {
  (
    to: any,
    from: any,
    savedPosition?: _ScrollPositionCoordinates | null
  ): Awaitable<ScrollPosition | false | void>
}

export interface RouterOptions extends PathParserOptions {
  history: RouterHistory
  routes: Readonly<RouteRecordRaw[]>
  scrollBehavior?: RouterScrollBehavior
  parseQuery?: typeof originalParseQuery
  stringifyQuery?: typeof originalStringifyQuery
  linkActiveClass?: string
  linkExactActiveClass?: string
}

export interface Router {
  readonly currentRoute?: any
  readonly options?: RouterOptions
  listening?: boolean
  addRoute?(
    parentName: any,
    route: RouteRecordRaw
  ): () => void
  addRoute?(route: RouteRecordRaw): () => void
  removeRoute?(name: string): void
  hasRoute?(name: NonNullable<RouteRecordNameGeneric>): boolean
  getRoutes(): RouteRecord[]
  clearRoutes?(): void
  resolve?(to: any, currentLocation?: any): any
  push?(to: any): Promise<any | void | undefined>
  replace?(to: any): Promise<any | void | undefined>
  back?(): void
  go?(n: number): void
  forward?(): void
  beforeEach(guard: NavigationGuardWithThis<undefined>): () => void
  beforeResolve(guard: NavigationGuardWithThis<undefined>): () => void
  afterEach(guard: NavigationHookAfter): () => void
  onError?(handler: any): () => void
  isReady?(): Promise<void>
  install(app: App): void
}

export function createRouter(options: RouterOptions): Router {
  const matcher = createRouterMatcher(options.routes, options)
  const routerHistory = options.history

  if (!routerHistory) {
    throw new Error('Provide then "history" option when calling "createRouter".')
  }

  const beforeGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const beforeResolveGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const afterGuards = useCallbacks<NavigationHookAfter>()
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED)

  function addRoute(
    parentOrRoute: NonNullable<RouteRecordNameGeneric> | RouteRecordRaw,
    route?: RouteRecordRaw
  ) {
    let parent: Parameters<(typeof matcher)['addRoute']>[1] | undefined
    let record: RouteRecordRaw
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute)
      record = route!
    } else {
      record = parentOrRoute
    }
    return matcher.addRoute(record, parent)
  }

  function removeRoute(name: NonNullable<RouteRecordNameGeneric>) {
    const recordMatcher = matcher.getRecordMatcher(name)
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher)
    } else {
      console.warn(`cannot remove no-existent route ${String(name)}`)
    }
  }
  const push = (to: any) => {
    return pushWithRedirect(to)
  }

  function replace(to: RouteLocationRaw) {
    return push(assign(to, { replace: true }))
  }

  function finalizeNavigation(
    toLocation: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
    isPush: boolean,
    replace?: boolean,
    data?: HistoryState
  ): any | void {
    const isFirstNavigation = from === START_LOCATION_NORMALIZED
    const state: Partial<HistoryState> | null = !isBrowser ? {} : history.state
    if (isPush) {
      if (replace || isFirstNavigation)
        routerHistory.replace(
          toLocation.fullPath,
          assign(
            {
              scroll: isFirstNavigation && state && state.scroll,
            },
            data
          )
        )
      else routerHistory.push(toLocation.fullPath, data)
    }

    // accept current navigation
    currentRoute.value = toLocation
    markAsReady()
  }
  const pushWithRedirect = (
    to: any,
    redirectedFrom?: any
  ): Promise<any | void | undefined> => {
    const targetLocation = resolve(to)
    const from = currentRoute.value
    const data: HistoryState | undefined = (to as RouteLocationOptions).state
    const force: boolean | undefined = (to as RouteLocationOptions).force
    const replace = (to as RouteLocationOptions).replace === true

    // 监听 to 和 from，后续来更新路径
    // 跳转路由 + 监听
    // console.log('push', to, targetLocation, from, currentRoute)

    const toLocation = targetLocation as RouteLocationNormalized
    toLocation.redirectedFrom = redirectedFrom
    let failure: any | void | undefined 

    return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
      .catch(error => {
        throw error
      })
      .then(failure => {
        failure = finalizeNavigation(toLocation, from, true, replace, data)
        return failure
      }).then((failure) => {
        //!  全局路由守卫: afterEach
        afterGuards.list().forEach(hook => {
          hook(toLocation, from, failure)
        })
      })
  }

  function runWithContext<T>(fn: () => T): T {
    const app: App | undefined = installedApps.values().next().value
    return app && typeof app.runWithContext === 'function'
      ? app.runWithContext(fn)
      : fn()
  }

  function runGuardQueue(guards: Lazy<any>[]): Promise<any> {
    return guards.reduce(
      (promise, guard) => promise.then(() => runWithContext(guard)),
      Promise.resolve()
    )
  }

  function navigate(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded
  ): Promise<any> {
    let guards: Lazy<any>[]

    const [leavingRecords, updatingRecords, enteringRecords] =
      extractChangingRecords(to, from)

    //! 组件离开守卫：beforeRouteLeave
    guards = extractComponentsGuards(
        leavingRecords.reverse(),
        'beforeRouteLeave',
        to,
        from
      )

    for (const record of leavingRecords) {
      record.leaveGuards.forEach(guard => {
        guards.push(guardToPromiseFn(guard, to, from))
      })
    }

    return (
      runGuardQueue(guards)
      .then(() => {
        //! 全局路由守卫：beforeEach
        guards = []
        for (const guard of beforeGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from))
        }

        return runGuardQueue(guards)
      })
      .then(() => {
        //! 组件更新守卫：beforeRouteUpdate
        guards = extractComponentsGuards(
          updatingRecords,
          'beforeRouteUpdate',
          to,
          from
        )
        for (const record of updatingRecords) {
          record.updateGuards.forEach(guard => {
            guards.push(guardToPromiseFn(guard, to, from))
          })
        }
        return runGuardQueue(guards)
      })
      .then(() => {
        //! 路由独享守卫: beforeEnter
        guards = []
        for (const record of enteringRecords) {
          if (record.beforeEnter) {
            if (isArray(record.beforeEnter)) {
              for (const beforeEnter of record.beforeEnter) {
                guards.push(guardToPromiseFn(beforeEnter, to, from))
              }
            } else {
              guards.push(guardToPromiseFn(record.beforeEnter, to, from))
            }
          }
        }
        return runGuardQueue(guards)
      })
      .then(() => { 
        //! 组件进入守卫：beforeRouteEnter
        guards = extractComponentsGuards(
          enteringRecords,
          'beforeRouteEnter',
          to,
          from,
          runWithContext
        )
        return runGuardQueue(guards)
      })
      .then(() => {
        //! 全局路由守卫：beforeResolve
        guards = []
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from))
        }
        return runGuardQueue(guards)
      })
      .catch(err =>
        {
          console.error(err)
          return Promise.reject(err)
        }
      )
    )
  }

  let removeHistoryListener: undefined | null | (() => void)
  function setupListeners() {
    if (removeHistoryListener) return
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      const toLocation = resolve(to) as RouteLocationNormalized
      const from = currentRoute.value
      navigate(toLocation, from)
        .catch(err => {
          throw err
        })
        .then((failure) => {
          failure = finalizeNavigation(toLocation, from, false)
          return failure
        })
    })
  }

  let ready: boolean

  function markAsReady<E = any>(err: E): E
  function markAsReady<E = any>(): void
  function markAsReady<E = any>(err?: E): E | void {
    if (!ready) {
      // still not ready if an error happened
      ready = !err
      setupListeners()
    }
    return err
  }

  function getRoutes() {
    return matcher.getRoutes().map(routeMatcher => routeMatcher.record)
  }

  function hasRoute(name: NonNullable<RouteRecordNameGeneric>): boolean {
    return !!matcher.getRecordMatcher(name)
  }

  function resolve(
    rawLocation: RouteRecordRaw,
    currentLocation?: RouteLocationNormalizedLoaded
  ) {

    currentLocation = assign({}, currentLocation || currentRoute.value )
    if (typeof rawLocation === 'string') {
      const locationNormalized = {
        path: rawLocation,
        fullPath: rawLocation,
        query: {},
        hash: location.hash || '',
      }
      const matchedRoute = matcher.resolve(
        {path: locationNormalized.path},
        currentLocation
      )

      const href = routerHistory.createHref(locationNormalized.fullPath)

      return assign(locationNormalized, matchedRoute, {
        params: matchedRoute.params,
        hash: locationNormalized.hash,
        redirectedFrom: undefined,
        href
      })
    }

    let matcherLocation: MatcherLocationRaw

    if (rawLocation.path !== null) {
      matcherLocation = assign({}, rawLocation, {
        path: {
          fullPath: rawLocation.path,
          path: rawLocation.path,
          params: {},
          query: {},
          hash: '',
        }
      })
    } else {
      const targetParams = assign({}, rawLocation.params)
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          Reflect.deleteProperty(targetParams, key)
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: targetParams,
      })
    }

    const matchedRoute = matcher.resolve(matcherLocation, currentLocation)
    const hash = rawLocation.hash || ''

    const fullPath = stringifyURL(
      stringifyQuery,
      assign({}, rawLocation, {
        hash,
        path: matchedRoute.path,
      })
    )

    const href = routerHistory.createHref(rawLocation)
    return assign({
        fullPath,
        hash,
        query: rawLocation.query,
      },
      matchedRoute,
      {
        redirectedFrom: undefined,
        href
      }
    )
  }

  const go = (delta: number) => routerHistory.go(delta)
  let started: boolean | undefined
  const installedApps = new Set<App>()

  const router = {
    currentRoute,
    listening: true,

    addRoute,
    removeRoute,
    clearRoutes: matcher.clearRoutes,
    getRoutes,
    hasRoute,
    resolve,
    options,

    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),

    install(app: App) {
      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)
      app.config.globalProperties.$router = router
      Object.defineProperty(app.config.globalProperties, '$route', {
        enumerable: true,
        get: () => unref(currentRoute)
      })

      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true
        push(routerHistory.location).catch(err => {
          console.warn('Unexpected error when starting the router:', err)
        })
      }

      const reactiveRoute = {}
      for (const key in START_LOCATION_NORMALIZED) {
        Object.defineProperty(reactiveRoute, key, {
          enumerable: true,
          get: () => currentRoute.value[key],
        })
      }

      app.provide(routerKey, router)
      app.provide(routeLocationKey, shallowReactive(reactiveRoute))
      app.provide(routerViewLocationKey, currentRoute)

      const unmountApp = app.unmount
      installedApps.add(app)

      app.unmount = () => {
        installedApps.delete(app)
        if (installedApps.size < 1) {
          currentRoute.value = START_LOCATION_NORMALIZED
          started = false
        }
        unmountApp()
      }
    },

    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
  }
  return router
}

function extractChangingRecords(
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
) {
  const leavingRecords: RouteRecordNormalized[] = []
  const updatingRecords: RouteRecordNormalized[] = []
  const enteringRecords: RouteRecordNormalized[] = []

  const len = Math.max(from.matched.length, to.matched.length)
  for (let i = 0; i < len; i++) { 
    const recordFrom = from.matched[i]
    if (recordFrom) {
      if (to.matched.find(record => isSameRouteRecord(record, recordFrom))) {
        updatingRecords.push(recordFrom)
      } else {
        leavingRecords.push(recordFrom)
      }
    }
    const recordTo = to.matched[i]
    if (recordTo) {
      if (!from.matched.find(record => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo)
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords]
}