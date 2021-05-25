// 将当前路由存储到pathList和pathMap中
function addRouteRecord(route, pathList, pathMap, parent){
  // 如果是子路由记录 需要增加前缀 
  let path = parent?`${parent.path}/${route.path}`:route.path
  let record = { // 提取需要的信息
    path,
    component: route.component,
    parent
  }
  if(!pathMap[path]) { // 不能定义重复的路由，否则只生效第一条
    pathList.push(path)
    pathMap[path] = record
  }
  if(route.children) {
    // 递归添加子路由
    route.children.forEach(childRoute => {
      addRouteRecord(childRoute, pathList, pathMap, route)
    })
  }
}

export default function createRouteMap(routes, oldPathList, oldPathMap) {
  // 当第一次加载的时候没有 pathList 和 pathMap
  let pathList = oldPathList || []
  let pathMap = oldPathMap || Object.create(null)
  routes.forEach(route => {
    // 添加到路由记录，用户配置可能是无限层级，稍后要递归调用此方法
    addRouteRecord(route, pathList, pathMap)
  })

  // 导出映射关系
  return {
    pathList,
    pathMap
  }
}