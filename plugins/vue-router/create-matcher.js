import createRouteMap from "./create-route-map"
import { createRoute } from './history/base'

export default function createMatcher(routes) {
  // 扁平化配置，收集所有的路由路径, 收集路径的对应渲染关系
  // pathMap = {'/': Home, '/login': Login, '/login/reg': Register, '/login/forget': Forget}
  let { pathList, pathMap } = createRouteMap(routes)

  // 这个方法就是动态加载路由的方法
  function addRoutes(routes) {
    // 将新增的路由追加到pathList和pathMap中
    createRouteMap(routes, pathList ,pathMap)
  }
  function match(location) { // 稍后根据路径找到对应的记录
    let record = pathMap[location] // 可能一个路径有多个记录
    if(record) {
      return createRoute(record, {
        path: location
      })
    }
    // record 不存在
    return createRoute(null, {
      path: location
    })
  }
  return {
    addRoutes, // 动态添加路由
    match // 匹配路由
  }
}