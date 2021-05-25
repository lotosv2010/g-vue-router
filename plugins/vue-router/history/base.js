// 存放路由状态
export function createRoute(record, location) {
  // ['/login', '/login/reg']
  let res = []
  if(record) {
    while(record) {
      res.unshift(record)
      record = record.parent
    }
  }

  return {
    ...location,
    matched: res
  }
}

function runQueue(queue, iterator, cb) {
  // 异步迭代
  function step(index) {
    if(index >= queue.length) {
      return cb()
    }
    let hook = queue[index]
    // 先执行第一个，将第二个执行逻辑当作参数传入
    iterator(hook, () => step(index + 1))
  }
  step(0)
}
class History {
  constructor(router) {
    this.router = router

    // 当我们创建完路由，先有一个默认值路径和匹配到的记录做成一个映射表
    // 默认当创建history时， 路径应该是 / 并且匹配到的记录是 []
    // this.current = { path: '/', matched: [] }
    this.current = createRoute(null, {
      path: '/'
    })
  }

  // 核心逻辑，跳转时都会调用此方法，路径变化了视图要刷新，响应式的数据原理
  transitionTo(location, onComplete) {
    // 去匹配路径
    // 相同路径不必过渡
    // route => {'/', matched: []}
    let route = this.router.match(location)
    
    // 这个 route 就是相当于最新匹配到的结果
    // 防止重复跳转
    if(location == this.current.path && route.matched.length == this.current.matched.length) {
      return
    }

    // 在更新之前调用注册好的导航钩子守卫
    let queue = [].concat(this.router.beforeHooks)

    const iterator = (hook, next) => {
      hook(this.current, route, () => {
        next()
      })
    }

    runQueue(queue, iterator, () => {
      this.updateRoute(route)
      console.log(`更新 current`, `路由发生了变化`)
      onComplete && onComplete()
    })
  }
  updateRoute(route) {
    // 每次路由切换都会更新 current 属性
    this.current = route
    this.cb && this.cb(route)
    // 视图重新渲染的几个要求？
    // 1.模板中要用
    // 2.current 是响应式的
  }
  listen(cb) {
    this.cb = cb
  }
  push(location) {
    this.transitionTo(location, () => {
      window.location.hash = location
    })
  }
}

export {
  History
}