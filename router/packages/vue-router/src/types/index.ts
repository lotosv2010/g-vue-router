import { Component, DefineComponent } from "vue"
import { PathParserOptions } from "../matcher"
import { _RouteRecordProps, NavigationGuardWithThis, RouteLocation, RouteRecordNameGeneric, RouteRecordRedirectOption } from "../typed-routes"
import { LocationQuery } from "../query"
import { RouteRecord, RouteRecordNormalized } from "../matcher/types"
import { HistoryState } from "../history/common"

export interface _RouteRecordBase extends PathParserOptions {
  path: string
  redirect?: RouteRecordRedirectOption
  alias?: string | string[]
  name?: RouteRecordNameGeneric
  beforeEnter: 
    | NavigationGuardWithThis<undefined>
    | NavigationGuardWithThis<undefined>[]
  meta?: RouteMeta
  props?: _RouteRecordProps | Record<string, _RouteRecordProps>
  children?: RouteRecordRaw[]
}

export interface RouteMeta extends Record<PropertyKey, unknown> {}

export type Lazy<T> = () => Promise<T>

export type RouteComponent = Component | DefineComponent

export type RawRouteComponent = RouteComponent | Lazy<RouteComponent>

export interface RouteRecordMultipleViews extends _RouteRecordBase {
  components: Record<string, RawRouteComponent>
  component?: never
  children?: never
  redirect?: never
  props?: Record<string, _RouteRecordBase> | boolean 
}

export interface RouteRecordSingleView extends _RouteRecordBase {
  components?: never
  component: RawRouteComponent
  children?: never
  redirect?: never
  props?: _RouteRecordProps
}

export interface RouteRecordSingleViewWithChildren extends _RouteRecordBase {
  component?: RawRouteComponent | null | undefined
  components?: never
  children: RouteRecordRaw[]
  props?: _RouteRecordProps
}

export interface RouteRecordMultipleViewsWithChildren extends _RouteRecordBase {
  components: Record<string, RawRouteComponent>
  component?: never
  children?: never
  redirect?: never
  props?: Record<string, _RouteRecordProps> | boolean
}

export interface RouteRecordRedirect extends _RouteRecordBase {
  redirect: RouteRecordRedirectOption
  component?: never
  components?: never
  props?: never
}

export type RouteRecordRaw = 
  | RouteRecordSingleView
  | RouteRecordSingleViewWithChildren
  | RouteRecordMultipleViews
  | RouteRecordMultipleViewsWithChildren
  | RouteRecordRedirect
  | any

export type RouteParamValue = string
export type RouteParamValueRaw =  RouteParamValue | number | null | undefined
export type RouteParamsGeneric = Record<string, RouteParamValue | RouteParamValue[]>
export type RouteParamsRawGeneric = Record<string, RouteParamValueRaw  | Exclude<RouteParamValueRaw, null | undefined>>[]

export interface _RouteLocationBase extends Pick<MatcherLocation, 'name' | 'path' | 'params' | 'meta'>{
  fullPath: string
  query: LocationQuery
  hash: string
  redirectedFrom?: RouteLocation | undefined
}

export interface MatcherLocation {
  name: RouteRecordNameGeneric | null | undefined
  path: string
  params: RouteParamsGeneric
  meta: RouteMeta
  matched: RouteRecord[]
}

export interface RouteLocationMatched extends RouteRecordNormalized {
  components: Record<string, RouteComponent> | null | undefined
}

export interface MatcherLocationAsPath {
  path: string
}

export interface MatcherLocationAsName {
  name: RouteRecordNameGeneric
  path?: undefined
  params?: RouteParamsGeneric
}

export interface MatcherLocationAsRelative {
  path?: undefined
  params?: RouteParamsGeneric
}

export type MatcherLocationRaw = 
  | MatcherLocationAsPath
  | MatcherLocationAsName
  | MatcherLocationAsRelative

  export interface RouteLocationOptions {
    replace?: boolean
    force?: boolean
    state?: HistoryState
  }

export * from './typeGuards'