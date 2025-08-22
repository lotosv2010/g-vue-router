import { RouteLocationRaw, RouteRecordNameGeneric } from "../typed-routes";

export function isRouteName(name: any): name is RouteRecordNameGeneric {
  return typeof name === 'string' || typeof name === 'symbol'
}

export function isRouteLocation(route: any): route is RouteLocationRaw {
  return typeof route === 'string' || (route && typeof route === 'object')
}