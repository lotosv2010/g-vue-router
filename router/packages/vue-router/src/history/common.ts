import { removeTrailingSlash } from "../location"
import { isBrowser } from "../utils"

export type HistoryLocation = string

export type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryStateArray

export interface HistoryStateArray extends Array<HistoryStateValue> {}

export interface HistoryState {
  [x: number]: HistoryStateValue
  [x: string]: HistoryStateValue
}

export enum NavigationDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}

export interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}

export interface NavigationCallback {
  (
    to: HistoryLocation,
    from: HistoryLocation,
    information: NavigationInformation
  ): void
}

export enum NavigationType {
  pop = 'pop',
  push = 'push'
}

export interface RouterHistory {
  readonly base?: string
  readonly location?: HistoryLocation
  readonly state?: HistoryState
  push?(to: HistoryLocation, data?: HistoryState): void
  replace?(to: HistoryLocation, data?: HistoryState): void
  go?(delta: number, triggerListeners?: boolean): void
  listen?(callback: NavigationCallback): () => void
  createHref?(location: HistoryLocation): string
  destroy?(): void
}

export type ValueContainer<T> = { value: T }

export function normalizeBase(base?: string): string {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      base = base.replace(/^\w+:\/\/[^\/]+/, '')
    } else {
      base = '/'
    }
  }

  if (base[0] !== '/' && base[0] !== '#') base = '/' + base 
  return removeTrailingSlash(base)
}

const BEFORE_HASH_RE = /^[^#]+#/
export function createHref(base: string, location: HistoryLocation): string {
  return base.replace(BEFORE_HASH_RE, '#') + location
}