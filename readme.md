
# Vue-router 源码实现

## 目录结构

```tree
.
├── emp # vue-router 测试代码
│   ├── index.html
│   ├── node_modules
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── public
│   │   └── vite.svg
│   ├── README.md
│   ├── src
│   │   ├── App.vue
│   │   ├── assets
│   │   ├── components
│   │   │   └── HelloWorld.vue
│   │   ├── main.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   ├── style.css
│   │   ├── views
│   │   │   ├── About.vue
│   │   │   └── Home.vue
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── readme.md # 说明文件
└── router # vue router 源码
    ├── node_modules
    ├── package.json
    ├── packages
    │   └── vue-router
    │       ├── dist
    │       ├── node_modules
    │       ├── package.json
    │       └── src
    │           └── index.ts
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── scripts
    │   └── dev.js
    └── tsconfig.json
```

## 项目测试

```shell
cd router && pnpm dev
cd emp && pnpm dev
```

## 路由的模式

- 前端路由的特点就是根据路径的变化，渲染对应的组件
- hash(#)、history(h5API的)、memory(内存型 不会修改url地址)hash无法做ssr,history 可以做ssr(hash是前端的锚点，不会发送给后端)seo优化hash是不支持的
- hash的特点刷新不会出现404，因为服务端无法获取7baidu.com、baidu.com/#/aaa 丑， 无法seo优化，有点就是兼容性好。
- h5api 好看，用起来方便。 缺点就是服务器没有对应的资源会产生404。解决方案就是无论访问什么资源都重定向到首页
- 虽然用户访问的可能是www.baidu.com/about->返回的是首页内容(会拿到当前/about 找到组件来渲染)需要服务端支持
- hash模式如何实现路径的跳转和监控（基于浏览器的 location.hash 和 hashchange + popstate 事件）
- history模式如何实现跳转和监控（基于 HTML5 的 history.pushState 和 popstate 事件）
