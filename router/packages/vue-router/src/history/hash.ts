import { RouterHistory } from "./common";
import { createWebHistory } from "./html5";

export function createWebHashHistory(base?: string): RouterHistory {
  base = location.host ? base || location.pathname + location.search : ''
  if (!base.includes('#')) base += '#'
  return createWebHistory(base)
}