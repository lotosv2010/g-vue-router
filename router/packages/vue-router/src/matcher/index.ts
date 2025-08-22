import { _RouteRecordProps, RouteRecordNameGeneric } from '../typed-routes';
import { isRouteName, MatcherLocation, MatcherLocationRaw, RouteRecordRaw } from '../types';
import { assign, noop } from '../utils';
import { createRouteRecordMatcher, RouteRecordMatcher } from './pathMatcher';
import { PathParams, PathParserOptions, _PathParserOptions, comparePathParserScore } from './pathParserRanker';
import { RouteRecordNormalized } from './types';

export interface RouterMatcher {
  addRoute?: (record: RouteRecordRaw, parent?: RouteRecordMatcher) => () => void
  removeRoute?(matcher: RouteRecordMatcher): void
  removeRoute?(name: NonNullable<RouteRecordNameGeneric>): void
  clearRoutes?: () => void
  getRoutes?: () => RouteRecordMatcher[]
  getRecordMatcher?:(name: NonNullable<RouteRecordNameGeneric>) => RouteRecordMatcher | undefined
  resolve?: (location: MatcherLocationRaw, currentLocation: MatcherLocation) => MatcherLocation
}

export function createRouterMatcher(
  routes: Readonly<RouteRecordRaw[]>,
  globalOptions: PathParserOptions
): RouterMatcher {
  const matchers: RouteRecordMatcher[] = []
  const matcherMap = new Map<
    NonNullable<RouteRecordNameGeneric>,
    RouteRecordMatcher
  >()

  function getRecordMatcher(name: NonNullable<RouteRecordNameGeneric>) {
    return matcherMap.get(name)
  }

  function addRoute(record: RouteRecordRaw, parent?: RouteRecordMatcher, originalRecord?: RouteRecordMatcher) {
    const mainNormalizedRecord = normalizeRouteRecord(record)

    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record
    const options = mergeOptions(globalOptions, record)
    const normalizedRecords: RouteRecordNormalized[] = [mainNormalizedRecord]

    if ('alias' in record) {
      const aliases = typeof record.alias === 'string' ? [record.alias] : record.alias
      for (const alias of aliases) {
        normalizedRecords.push(
          normalizeRouteRecord(
            assign({}, mainNormalizedRecord, {
              components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
              path: alias,
              aliasOf: originalRecord
                ? originalRecord.record
                : mainNormalizedRecord
            }) as any
          )
        )
      }
    }

    let matcher: RouteRecordMatcher
    let originalMatcher: RouteRecordMatcher | undefined

    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord
      if (parent && path[0] !== '/') {
        const parentPath = parent.record.path
        const connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/'
        normalizedRecord.path = parentPath + (path && connectingSlash + path)
      }

      matcher = createRouteRecordMatcher(normalizedRecord, parent, options)

      if (originalRecord) {
        originalRecord.alias.push(matcher)
      } else {
        originalMatcher = originalMatcher || matcher
      }

      if (isMatchable(matcher)) {
        insertMatcher(matcher)
      }

      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children
        for (let i = 0; i < children.length; i++) {
          addRoute(
            children[i],
            matcher,
            originalMatcher && originalMatcher.children[i]
          )
        }
      }
      originalRecord = originalRecord || matcher
    }

    return originalMatcher ? () => {
      removeRoute(originalMatcher)
    } : noop
  }

  function removeRoute(matcherRef: NonNullable<RouteRecordNameGeneric> | RouteRecordMatcher) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef)
      if (matcher) {
        matcherMap.delete(matcherRef)
        matchers.splice(matchers.indexOf(matcher), 1)
        matcher.children.forEach(removeRoute)
        matcher.alias.forEach(removeRoute)
      } else {
        const index = matchers.indexOf(matcherRef as unknown as RouteRecordMatcher)
        if (index > -1) {
          matchers.splice(index, 1)
          const name = (matcherRef as unknown as RouteRecordMatcher).record.name
          if (name) {
            matcherMap.delete(name)
          }
          (matcherRef as unknown as RouteRecordMatcher).children.forEach(removeRoute);
          (matcherRef as unknown as RouteRecordMatcher).alias.forEach(removeRoute)
        }
      }
    }
  }

  function insertMatcher(matcher: RouteRecordMatcher) { 
    const index = findInsertionIndex(matcher, matchers)
    matchers.splice(index, 0, matcher)
    if (matcher.record.name && !isAliasRecord(matcher)) {
      matcherMap.set(matcher.record.name, matcher)
    }
  }

  function getRoutes() {
    return matchers
  }

  function resolve(
    location: Readonly<MatcherLocationRaw>,
    currentLocation: Readonly<MatcherLocation>
  ): MatcherLocation {
    let matcher: RouteRecordMatcher | undefined 
    let params: PathParams = {}
    let path: MatcherLocation['path']
    let name: MatcherLocation['name']

    if ('name' in location && location.name) {
      matcher = matcherMap.get(location.name)
      name = matcher.record.name
      params = assign({}, location.params)
      path = matcher.record.path
    } else if (location.path != null) {
      path = location.path
      matcher = matchers.find(m => m.record.path === path)
      if (matcher) {
        params = matcher?.parse?.(path)
        name = matcher.record.name
      }
    } else {
      matcher = currentLocation.name
        ? matcherMap.get(currentLocation.name)
        : matchers.find(m => m.record.path === currentLocation.path)
      if (!matcher) {
        throw new Error('No match!')
      }
      name = matcher.record.name
      params = assign({}, currentLocation.params, (location as any).params)
      path = currentLocation.path
    }

    const matched: MatcherLocation['matched'] = []
    let parentMatcher: RouteRecordMatcher | undefined = matcher

    while(parentMatcher) {
      matched.unshift(parentMatcher.record)
      parentMatcher = parentMatcher.parent
    }

    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    }
  }

  // 递归添加路由记录
  routes.forEach(route => addRoute(route))

  function clearRoutes() {
    matchers.length = 0
    matcherMap.clear()
  }

  return {
    addRoute,
    getRoutes,
    removeRoute,
    clearRoutes,
    getRecordMatcher,
    resolve
  }
}

export function normalizeRouteRecord(
  record: RouteRecordRaw & { aliasOf?: RouteRecordNormalized }
): RouteRecordNormalized {
  const normalized: Omit<RouteRecordNormalized, 'mods'> = {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: record.aliasOf,
    beforeEnter: record.beforeEnter,
    props: normalizedRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: new Set(),
    updateGuards: new Set(),
    enterCallbacks: {},
    components: 'components' in record
      ? record.components || null
      : record.component && { default: record.component }
  }
  return normalized as RouteRecordNormalized
}

function normalizedRecordProps(record: RouteRecordRaw): Record<string, _RouteRecordProps> {
  const propsObject = {} as Record<string, _RouteRecordProps>
  const props = record.props || false
  if ('component' in record) {
    propsObject.default = props
  } else {
    for (const name in record.components) {
      propsObject[name] = typeof props === 'object' ? props[name] : props
    }
  }
  return propsObject
}

function mergeOptions<T extends Object>(
  defaults: T,
  partialOptions: Partial<T>
): T {
  const options = {} as T
  for (const key in defaults) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults[key]
  }
  return options
}

function findInsertionIndex(
  matcher: RouteRecordMatcher,
  matchers: RouteRecordMatcher[]
)  {
  let lower = 0
  let upper = matchers.length

  while(lower !== upper) {
    const mid = (lower + upper) >> 1
    const sortOrder = comparePathParserScore(matcher, matchers[mid])

    if (sortOrder < 0) {
      upper = mid
    } else {
      lower = mid + 1
    }
  }

  const insertionAncestor = getInsertionAncestor(matcher)
  if (insertionAncestor) {
    upper = matchers.lastIndexOf(insertionAncestor, upper - 1)
  }
  return upper
}

function getInsertionAncestor(matcher: RouteRecordMatcher) {
  let ancestor: RouteRecordMatcher | undefined = matcher
  while (ancestor = ancestor.parent) {
    if (isMatchable(ancestor) && comparePathParserScore(matcher, ancestor) === 0) {
      return ancestor
    }
  }
  return
}

function isAliasRecord(record: RouteRecordMatcher | undefined) {
  while (record) {
    if (record.record.aliasOf) return true
    record = record.parent
  }
  return false
}

function isMatchable({ record }: RouteRecordMatcher): boolean {
  return !!(
    record.name ||
    (record.components && Object.keys(record.components).length) ||
    record.redirect
  )
}

function mergeMetaFields(matched: MatcherLocation['matched']) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {})
}

export * from './pathParserRanker'