export default {
  name: 'routerView',
  functional: true, // 函数式组件，特点：性能高，不用创建实例
  render(h, { parent, data }) { // 调用 render 方法，说明他一定是一个 routerView组件
    // 获取当前要渲染的记录
    let route = parent.$route
    let depth = 0
    data.routerView = true

    // App.vue 中渲染组件时，默认回调用 render 函数，父级组件中没有 data.routerView 属性
    // 渲染第一次，并且标识当前 routerView 为 true
    while(parent) { // router-view 的父组件
      // $vnode 代表占位符
      // _vnode.parentVnode = $vnode 组件内部渲染的虚拟节点
      if(parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      parent = parent.$parent
    }

    // 获取对应层级的记录
    let record = route.matched[depth]
    if(!record) {
      return h() // 空的虚拟节点 empty-vnode 注释节点
    }
    return h(record.component, data)
  }
}