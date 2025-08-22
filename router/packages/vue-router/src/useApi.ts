import { inject } from "vue";
import { Router } from "./router";
import { routeLocationKey, routerKey } from "./injectionSymbol";

export function useRouter(): Router {
  return inject(routerKey)
}

export function useRoute() {
  return inject(routeLocationKey)
}