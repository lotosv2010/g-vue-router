import { RouteRecord } from "./matcher/types"

export function stringifyURL(
  stringifyQuery: (params: any) => string,
  location: any
) {
  const query = location.query ? stringifyQuery(location.query) : ''
  return location.path + (query && '?') + query + (location.hash || '')
}

export function stripBase(pathname: string, base: string) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname
  return pathname.slice(base.length) || '/'
}

const TRAILING_SLASH_RE = /\/$/
export const removeTrailingSlash = (path: string) =>
  path.replace(TRAILING_SLASH_RE, '')

export const START_LOCATION_NORMALIZED: any = {
  path: '/',
  // TODO: could we use a symbol in the future?
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
}

export function isSameRouteRecord(a: RouteRecord, b: RouteRecord): boolean {
  return (a.aliasOf || a) === (b.aliasOf || b)
}