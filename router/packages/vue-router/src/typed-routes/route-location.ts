import { RouteRecordNormalized } from "../matcher/types"
import { _RouteLocationBase, RouteLocationMatched, RouteParamsGeneric } from "../types"
import { RouteMap, RouteMapGeneric } from "./route-map"
import { RouteRecordNameGeneric } from "./route-records"

export type RouteLocationRaw = any

export type RouteLocation = any

export interface RouteLocationNormalizedGeneric extends _RouteLocationBase {
  name: RouteRecordNameGeneric
  params: RouteParamsGeneric 
  matched: RouteRecordNormalized[]
}
export type RouteLocationNormalizedTypeList<
  RouteMap extends RouteMapGeneric = RouteMapGeneric
> = {
  [N in keyof RouteMap] : RouteLocationNormalizedTyped<RouteMap, N>
}

export interface RouteLocationNormalizedTyped<
  RouteMap extends RouteMapGeneric = RouteMapGeneric,
  Name extends keyof RouteMap = keyof RouteMap
> extends RouteLocationNormalizedGeneric {
  name: Extract<Name, string | symbol>
  params: RouteMap[Name]['params']
  matched: RouteRecordNormalized[]
}

export type RouteLocationNormalized<
  Name extends keyof RouteMap = keyof RouteMap
> = RouteMapGeneric extends RouteMap
  ? RouteLocationNormalizedGeneric
  : RouteLocationNormalizedTypeList<RouteMap>[Name]

export interface RouteLocationNormalizedLoadedGeneric extends RouteLocationNormalizedGeneric {
  matched: RouteLocationMatched[]
}
export type RouteLocationNormalizedLoaded<
  Name extends keyof RouteMap = keyof RouteMap
> = RouteMapGeneric extends RouteMap
  ? RouteLocationNormalizedGeneric
  : RouteLocationNormalizedTypeList<RouteMap>[Name]