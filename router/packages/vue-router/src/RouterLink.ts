import { defineComponent, h, inject, reactive, unref } from "vue"
import { routeLocationKey, routerKey } from "./injectionSymbol"
import { noop } from "./utils"
import { Router } from "./router"

function useLink(props) {
  const router: Router = inject(routerKey)!
  const currentRoute = inject(routeLocationKey)!

  function navigate(
    e: MouseEvent = {} as MouseEvent
  ): Promise<void | any> {
    if (guardEvent(e)) {
      const p = router[unref(props.replace) ? 'replace' : 'push'](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop)
      if (
        props.viewTransition &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document
      ) {
        document.startViewTransition(() => p)
      }
      return p
    }
    return Promise.resolve()
  }

  const { href } = router.resolve(props.to)

  return {
    navigate,
    href
  }
}

export const RouterLinkImpl = defineComponent({
  name: 'RouterLink',
  compatConfig: {
    MODE: 3
  },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: 'page'
    },
    viewTransition: Boolean
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props))
    const children = slots.default && slots.default(null)
    return () => h('a', {
      href: link.href,
      onClick: link.navigate
    }, children)
  }
})

function guardEvent(e: MouseEvent) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return
  // don't redirect if `target="_blank"`
  // @ts-expect-error getAttribute does exist
  if (e.currentTarget && e.currentTarget.getAttribute) {
    // @ts-expect-error getAttribute exists
    const target = e.currentTarget.getAttribute('target')
    if (/\b_blank\b/i.test(target)) return
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) e.preventDefault()

  return true
}

export const RouterLink = RouterLinkImpl