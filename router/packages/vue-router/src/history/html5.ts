import { stripBase } from "../location"
import { _ScrollPositionNormalized, computeScrollPosition } from "../scrollBehavior"
import { assign } from "../utils"
import { createHref, HistoryLocation, HistoryState, NavigationCallback, NavigationDirection, NavigationType, normalizeBase, RouterHistory, ValueContainer } from "./common"

let createBaseLocation = () =>  location.protocol + '//' + location.host

interface StateEntry extends HistoryState {
  back: HistoryLocation | null
  current: HistoryLocation
  forward: HistoryLocation | null
  position: number
  replaced: boolean
  scroll: _ScrollPositionNormalized | null | false
}

function createCurrentLocation(
  base: string,
  location: Location
): HistoryLocation {
  const { pathname, search, hash } = location
  const hashPos = base.indexOf('#')
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos))
      ? base.slice(hashPos).length
      : 1
    let pathFromHash = hash.slice(slicePos)
    if (pathFromHash[0] !== '/') pathFromHash = '/' + pathFromHash
    return stripBase(pathFromHash, '')
  }
  const path = stripBase(pathname, base)
  return path + search + hash
}

function buildState(
  back: HistoryLocation | null,
  current: HistoryLocation,
  forward: HistoryLocation | null,
  replaced: boolean = false,
  computeScroll: boolean = false
): StateEntry {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  }
}

function useHistoryListeners(
  base: string,
  historyState: any,
  currentLocation: any,
  replace: any
) {
  let listeners: NavigationCallback[] = []
  let teardowns: Array<() => void> = []
  let pauseState: HistoryLocation | null = null

  const popStateHandler = ({ state }) => {
    console.log('popStateHandler', state)
    const to = createCurrentLocation(base, location)
    const from = currentLocation.value
    const fromState = historyState.value
    let delta = 0

    if (state) {
      currentLocation.value = to
      historyState.value = state
      if (pauseState &&  pauseState === from) {
        pauseState = null
        return
      }
      delta = fromState ? state.position - fromState.position : 0
    } else {
      replace(to)
    }

    listeners.forEach(listener => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta 
          ? delta > 0
            ? NavigationDirection.forward
            : NavigationDirection.back
          : NavigationDirection.unknown,
      })
    })
  }

  function pauseListeners() {}
  function listen(callback: NavigationCallback) {
    listeners.push(callback)

    const teardown = () => {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
    teardowns.push(teardown)
    return teardown
  }
  function destroy() {}

  window.addEventListener('popstate', popStateHandler)
  return {
    pauseListeners,
    listen,
    destroy,
  }
}

function useHistoryStateNavigation(base: string) {
  const { history, location } = window
  const currentLocation: ValueContainer<HistoryLocation> = {
    value: createCurrentLocation(base, location)
  }

  const historyState: ValueContainer<StateEntry> = {
    value: history.state
  }

  // 根据页面构建初始状态
  if (!historyState.value) {
    changeLocation(
      currentLocation.value,
      {
        back: null,
        current: currentLocation.value,
        forward: null,
        position: history.length - 1,
        replaced: true,
        scroll: null,
      },
      true
    )
  }

  function changeLocation(
    to: HistoryLocation,
    state: StateEntry,
    replace: boolean,
  ): void {
    const hashIndex = base.indexOf('#')
    const url = hashIndex > -1
      ? (location.host && document.querySelector('base') ? base : base.slice(hashIndex)) + to
      : createBaseLocation() + base + to
    try {
      history[replace ? 'replaceState' : 'pushState'](state, '', url)
      historyState.value = state
    } catch (error) {
      console.warn('Error with push/replace State', error)
      location[replace ? 'replace' : 'assign'](url)
    }
  }

  function push(to: HistoryLocation, data?: HistoryState) {
    const currentState = assign(
      {},
      historyState.value,
      history.state,
      {
        forward: to,
        scroll: computeScrollPosition()
      }
    )
    if (!history.state) {
      console.warn('history.state is not available')
    }
    // 跳转前，将当前页面状态保存到 historyState.value 中
    changeLocation(currentState.current, currentState, false)

    // 构建新的页面状态
    const state: StateEntry = assign(
      {},
      buildState(currentLocation.value, to, null),
      { position: currentState.position + 1 },
      data
    )

    // 跳转
    changeLocation(to, state, false)
    // 更新当前路径状态
    currentLocation.value = to
  }
  function replace(to: HistoryLocation, data?: HistoryState) {
    const state: StateEntry = assign(
      {},
      history.state,
      buildState(
        historyState.value.back,
        to,
        historyState.value.forward,
        true
      ),
      data,
      { position: historyState.value.position }
    )
    changeLocation(to, state, true)
    currentLocation.value = to
  }
  return {
    location: currentLocation, // 当前路径状态
    state: historyState, // 浏览器历史状态

    push,
    replace,
  }
}

export function createWebHistory(base?: string): RouterHistory {
  base = normalizeBase(base)

  const historyNavigation = useHistoryStateNavigation(base)
  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace
  )
  function go(delta: number, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners()
    history.go(delta)
  }

  const routerHistory = assign(
    {
      location: '',
      base,
      go,
      createHref: createHref.bind(null, base),
    },
    historyNavigation,
    historyListeners
  )
  Object.defineProperty(routerHistory, 'location', {
    enumerable: true,
    get: () => historyNavigation.location.value
  })
  Object.defineProperty(routerHistory, 'state', {
    enumerable: true,
    get: () => historyNavigation.state.value
  })
  return routerHistory
}