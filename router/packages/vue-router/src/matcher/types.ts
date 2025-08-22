import { ComponentPublicInstance } from "vue"
import { _RouteRecordBase, RouteRecordMultipleViews, RouteRecordRaw } from "../types"
import { _RouteRecordProps, NavigationGuard, NavigationGuardNextCallback } from "../typed-routes"

export interface RouteRecordNormalized {
  path: _RouteRecordBase['path']
  redirect: _RouteRecordBase['redirect'] | undefined
  name: _RouteRecordBase['name']
  components: RouteRecordMultipleViews['components'] | null | undefined
  mods: Record<string, unknown>
  children: RouteRecordRaw[]
  meta: Exclude<_RouteRecordBase['meta'], void>
  props: Record<string, _RouteRecordProps>
  beforeEnter: _RouteRecordBase['beforeEnter']  
  leaveGuards: Set<NavigationGuard>
  updateGuards: Set<NavigationGuard>
  enterCallbacks: Record<string, NavigationGuardNextCallback[]>
  instances: Record<string, ComponentPublicInstance | undefined | null>
  aliasOf: RouteRecordNormalized | undefined
}

export type RouteRecord = RouteRecordNormalized