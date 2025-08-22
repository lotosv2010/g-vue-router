
export type _ScrollPositionCoordinates = {
  behavior?: ScrollOptions['behavior'],
  left?: number,
  top?: number
}

export type _ScrollPositionNormalized = {
  behavior?: ScrollOptions['behavior'],
  left: number,
  top: number
}

type Awaitable<T> = T | PromiseLike<T>
export interface ScrollPositionElement extends ScrollOptions {
  el: string | Element
}

export type ScrollPosition = _ScrollPositionCoordinates | ScrollPositionElement

export const computeScrollPosition = (): _ScrollPositionNormalized => ({
  left: window.scrollX,
  top: window.scrollY
})