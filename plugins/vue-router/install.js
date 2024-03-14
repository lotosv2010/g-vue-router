import Link from './components/link'
import View from './components/view'

export let _Vue
export default function install(Vue, options){
  console.log(options)
  // 插件安装入口
  // 插件一般用于定义全局组件、全局指令、过滤器、原型方法...
  // https://cn.vuejs.org/v2/guide/plugins.html

  _Vue = Vue // 这样其他文件都可以使用 Vue 变量

  // 给所有组件混入一个属性 router
  Vue.mixin({ // 给所有组件的生命周期都增加beforeCreate方法
    beforeCreate() {
      // 将父组件传入的 router 注入到所有的子组件
      if(this.$options.router) { // 如果有router属性说明是根实例
        // _routerRoot 代表的是 vue 组件的实例，将根实例挂载在_routerRoot属性上
        this._routerRoot = this
        // _router 代表用户传过来的属性，将当前router实例挂载在_router上
        this._router = this.$options.router

        // 初始化
        this._router.init(this) // this 代表根实例

        // 获取 current 属性, 包装成响应式
        Vue.util.defineReactive(this, '_route', this._router.history.current)
        console.log('this._route', this._route)
      } else {
        // 组件渲染是一层层的渲染
        // 无论是父组件还是子组件，都可以通过 this._routerRoot._router 获取共同实例
        // 保证所有子组件都拥有_routerRoot 属性，指向根实例
        // 保证所有组件都可以通过 this._routerRoot._router 拿到用户传递进来的路由实例对象
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }
    }
  })

  Vue.component('router-link', Link)
  Vue.component('router-view', View)

  // Vue.prototype.$route = {}
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route // 属性：path matched
    }
  })

  // Vue.prototype.$router = {}
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router // 方法：match push go replace
    }
  })
}