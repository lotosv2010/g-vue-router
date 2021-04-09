## 安装依赖
- npm install -g @vue/cli-service-global

## 路由
- 路由：不同的路径，渲染不同的内容

- 路由有两种模式
- hash模式
- history模式

- MPA 多页面应用中跳转逻辑都是由后端处理
- 前后端分离，前端需要根据路径的不同进行跳转(可以根据hash值显示变化的内容)
- history模式，用于生产环境(需要服务端支持，否则一刷新页面就报404)

## vue-router
- vue-router是一个插件
- 调用 Vu.use(Router) ，内部会提供两个全局组件 router-link router-view

- this.$rout：路由相关的属性
- this.$router：路由相关的方法
