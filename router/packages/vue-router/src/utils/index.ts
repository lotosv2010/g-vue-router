import { RawRouteComponent, RouteComponent } from '../types'

export * from './env'
export const assign = Object.assign

export const noop = () => {}

export function isRouteComponent(
  component: RawRouteComponent
): component is RouteComponent {
  return (
    typeof component === 'object' ||
    'displayName' in component ||
    'props' in component ||
    '__vccOpts' in component
  )
}

export function isESModule(obj: any): obj is { default: RouteComponent } {
  return (
    obj.__esModule ||
    obj[Symbol.toStringTag] === 'Module' ||
    // support CF with dynamic imports that do not
    // add the Module string tag
    (obj.default && isRouteComponent(obj.default))
  )
}

export const isArray: (args: ArrayLike<any> | any) => args is ReadonlyArray<any> = Array.isArray