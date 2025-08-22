import { ComponentPublicInstance, computed, defineComponent, h, inject, PropType, provide, ref, Slot, Slots, unref, VNodeProps, watch } from "vue"
import { matchedRouteKey, routeLocationKey, routerKey, routerViewLocationKey, viewDepthKey } from "./injectionSymbol"
import { RouteLocationMatched } from "./types"
import { RouteLocationNormalizedLoaded } from "./typed-routes"
import { assign } from "./utils"
import { isSameRouteRecord } from "./location"

export const RouterViewImpl = defineComponent({
  name: 'RouterView',
  inheritAttrs: false,
  props: {
    name: {
      type: String as PropType<string>,
      default: 'default',
    },
    route: Object,
  },
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute: any = inject(routerViewLocationKey)
    const routeToDisplay = computed<RouteLocationNormalizedLoaded>(() => props.route || injectedRoute.value)

    const injectedDepth = inject(viewDepthKey, 0)

    const depth = computed(() => {
      let initialDepth = unref(injectedDepth)
      const { matched } = routeToDisplay.value
      let matchedRoute: RouteLocationMatched | undefined
      while (
        (matchedRoute = matched[initialDepth]) &&
        !matchedRoute.components
      ) {
        initialDepth++
      }
      return initialDepth
    })

    const matchedRouteRef = computed<RouteLocationMatched | undefined>(() => routeToDisplay.value.matched[depth.value])

    provide(viewDepthKey, computed(() => depth.value + 1))
    provide(matchedRouteKey, matchedRouteRef)
    provide(routerViewLocationKey, routeToDisplay)

    const viewRef = ref<ComponentPublicInstance>()

    watch(
      () => [viewRef.value, matchedRouteRef.value, props.name] as const,
      ([instance, to, name], [oldInstance, from, oldName]) => {
        if (to) {
          to.instances[name] = instance
          if (from && from !== to && instance && instance === oldInstance) {
            if (!to.leaveGuards.size) {
              to.leaveGuards = from.leaveGuards
            }
            if (!to.updateGuards.size) {
              to.updateGuards = from.updateGuards
            }
          }
        }
        if (
          instance &&
          to &&
          // if there is no instance but to and from are the same this might be
          // the first visit
          (!from || !isSameRouteRecord(to, from) || !oldInstance)
        ) {
          ;(to.enterCallbacks[name] || []).forEach(callback =>
            callback(instance)
          )
        }
      },
      { flush: 'post' }
    )

    return () => {
      const route = routeToDisplay.value
      const currentName = props.name
      const matchedRoute = matchedRouteRef.value
      const ViewComponent = matchedRoute && matchedRoute.components[currentName]

      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route })
      }

      const routePropsOption = matchedRoute.props[currentName]
      const routeProps = routePropsOption
        ? routePropsOption === true
          ? route.params
          : typeof routePropsOption === 'function'
          ? routePropsOption(route)
          : routePropsOption
        : null
      const onVnodeUnmounted: VNodeProps['onVnodeUnmounted'] = vnode => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null
        }
      }

      const component = h(
        ViewComponent,
        assign({}, routeProps, attrs, {
          onVnodeUnmounted,
          ref: viewRef,
        })
      )

      return (
        normalizeSlot(slots.default, { Component: ViewComponent, route }) ||
        component
      )
    }
  }
})

export function normalizeSlot(slot: Slot | undefined, data) {
  if (!slot) return null
  const slotContent = slot(data)
  return slotContent.length === 1 ? slotContent[0] : slotContent
}

export const RouterView = RouterViewImpl