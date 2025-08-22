import { ComponentPublicInstance } from "vue";
import { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteLocationRaw } from "./route-location";
import { _Awaitable } from "../types/utils";

export type NavigationGuardReturn = void | Error | boolean | RouteLocationRaw

export interface NavigationGuard {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
  ): _Awaitable<NavigationGuardReturn>
}

export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean | undefined): void
  (cb: NavigationGuardNextCallback): void
}

export type NavigationGuardNextCallback = (
  vm: ComponentPublicInstance
) => unknown

export interface NavigationGuardWithThis<T> {
  (
    this: T,
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
  ): _Awaitable<NavigationGuardReturn>
}

export interface NavigationHookAfter {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    failure?: Error | void
  ): unknown
}