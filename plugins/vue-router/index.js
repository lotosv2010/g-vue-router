import createMatcher from "./create-matcher"
import HashHistory from "./history/hash";
import BrowserHistory from "./history/history";
import install from "./install"

class VueRouter {
  constructor(options) {
    // 创建匹配器，可用于后续的匹配操作
    // 用户没有传递配置时默认为空数组
    // 1.match 通过路由来匹配组件
    // 2.addRoutes 动态添加路遇
    this.matcher = createMatcher(options.routes || [])

    // vue路由有三种模式 hash / h5api /abstract ,为了保证调用时方法一致。
    // 我们需要提供一个base类，在分别实现子类，不同模式下通过父类调用对应子类的方法
    options.mode = options.mode || 'hash' // 默认是hash模式
    switch (options.mode) {
      case 'hash':
        this.history = new HashHistory(this)
        break;
      case 'history':
        this.history = new BrowserHistory(this)
        break;
      default:
        break;
    }
    // console.log(this.history)
    this.beforeHooks = []
  }
  init(app) {
    // 监听 hash 变化，默认跳转到对应的路径中
    const history = this.history

    // 让路由系统过度到某个路径
    const setUpHashListener = () => {
      history.setupListener() // 监听路径变化
    }

    // 父类提供方法负责跳转
    history.transitionTo(
      history.getCurrentLocation(), // 子类获取对应的路径
      setUpHashListener // 跳转成功后注册路径监听，为视图更新做准备
    )

    history.listen((route) => {
      app._route = route
    })
  }
  match(location) {
    return this.matcher.match(location)
  } 
  push(to) {
    this.history.push(to)
  }
  go() {}
  replace() {}
  beforeEach(fn) {
    this.beforeHooks.push(fn)
  }

}
VueRouter.install = install
export default VueRouter