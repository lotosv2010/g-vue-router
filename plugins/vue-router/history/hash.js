import { History } from "./base";

function ensureSlash() {
  if(window.location.hash) {
    return
  }
  window.location.hash = '/'
}

function getHash() {
  return window.location.hash.slice(1)
}
class HashHistory extends History{
  constructor(router) {
    super(router)
    this.router = router

    //  确保有hash, hash 模式下，有一个/路径
    ensureSlash()
  }
  getCurrentLocation() {
    return getHash()
  }
  setupListener() {
    window.addEventListener('hashchange', () => {
      // 当 hash 值变化了，再次拿到 hash 值进行跳转
      this.transitionTo(getHash())
    })
  }
}
export default HashHistory