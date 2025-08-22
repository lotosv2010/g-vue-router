import { RouteLocation, RouteLocationNormalized, RouteLocationRaw } from "./route-location"
import { RouteMap } from "./route-map"

export type RouteRecordNameGeneric = string | symbol | undefined

export type RouteRecordRedirectOption = 
  | RouteLocationRaw
  | ((to: RouteLocation) => RouteLocationRaw)

export type _RouteRecordProps <Name extends keyof RouteMap = keyof RouteMap> = 
  | boolean
  | Record<string, any>
  | ((name: RouteLocationNormalized<Name>) => Record<string, any>)