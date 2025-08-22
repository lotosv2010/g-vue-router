import { ComponentOptions } from "vue";
import { RouteRecordNormalized } from "./matcher/types";
import { NavigationGuard, NavigationGuardNext, NavigationGuardNextCallback, RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteLocationRaw } from "./typed-routes";
import { isESModule, isRouteComponent } from "./utils";
import { isRouteLocation, Lazy, RouteComponent } from "./types";

type GuardType = 'beforeRouteEnter' | 'beforeRouteUpdate' | 'beforeRouteLeave'

export function guardToPromiseFn(
  guard: NavigationGuard,
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
): () => Promise<void>
export function guardToPromiseFn(
  guard: NavigationGuard,
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded,
  record: RouteRecordNormalized,
  name: string,
  runWithContext: <T>(fn: () => T) => T
): () => Promise<void>
export function guardToPromiseFn(
  guard: NavigationGuard,
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded,
  record?: RouteRecordNormalized,
  name?: string,
  runWithContext: <T>(fn: () => T) => T = fn => fn()
): () => Promise<void> {
  const enterCallbackArray =
    record &&
    (record.enterCallbacks[name!] = record.enterCallbacks[name!] || [])

  return (): Promise<void> =>
    new Promise((resolve, reject) => { 
      const next: NavigationGuardNext = (
        valid?: boolean | RouteLocationRaw | NavigationGuardNextCallback | Error
      ) => {
        if (valid === false) {
          reject(new Error('Navigation aborted'))
        } else if (valid instanceof Error) {
          reject(valid)
        } else if (isRouteLocation(valid)) {
          reject(new Error('Navigation guard redirect'))
        } else {
          if (
            enterCallbackArray &&
            record!.enterCallbacks[name!] === enterCallbackArray &&
            typeof valid === 'function'
          ) {
            enterCallbackArray.push(valid)
          }
          resolve()
        }
      }

      const guardReturn = runWithContext(() =>
        guard.call(
          record && record.instances[name!],
          to,
          from,
          next
        )
      )
      let guardCall = Promise.resolve(guardReturn)

      if (guard.length < 3) guardCall = guardCall.then(next)

      guardCall.catch(err => reject(err))
    })
}

export function extractComponentsGuards(
  matched: RouteRecordNormalized[],
  guardType: GuardType,
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded,
  runWithContext: <T>(fn: () => T) => T = fn => fn()
) {
  const guards: Array<() => Promise<void>> = []

  for (const record of matched) {
    if (!record.components && !record.children.length) {
      console.warn(
        `Record with path "${record.path}" is either missing a "component(s)"` +
          ` or "children" property.`
      )
    }
    for (const name in record.components) {
      let rawComponent = record.components[name]

      if (guardType !== 'beforeRouteEnter' && !record.instances[name]) continue

      if (isRouteComponent(rawComponent)) {
        const options: ComponentOptions =
          (rawComponent as any).__vccOpts || rawComponent
        const guard = options[guardType]
        guard &&
          guards.push(
            guardToPromiseFn(guard, to, from, record, name, runWithContext)
          )
      } else {
        let componentPromise: Promise<
          RouteComponent | null | undefined | void
        > = (rawComponent as Lazy<RouteComponent>)()

        guards.push(() =>
          componentPromise.then(resolved => {
            if (!resolved)
              throw new Error(
                `Couldn't resolve component "${name}" at "${record.path}"`
              )
            const resolvedComponent = isESModule(resolved)
              ? resolved.default
              : resolved
            record.mods[name] = resolved
            record.components![name] = resolvedComponent
            const options: ComponentOptions =
              (resolvedComponent as any).__vccOpts || resolvedComponent
            const guard = options[guardType]

            return (
              guard &&
              guardToPromiseFn(guard, to, from, record, name, runWithContext)()
            )
          })
        )
      }
    }
  }
  return guards
}
