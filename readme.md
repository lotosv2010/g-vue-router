
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

## 总结

### 路由模式

#### Hash 模式

- 基于 location.hash 和 hashchange 事件。
- 兼容性最好，适合所有浏览器。

#### History 模式

- 基于 popstate 和 pushState / replaceState 。
- 需要服务器支持（避免 404 问题）。
- 更干净的 URL，适合 SEO。

#### 重点

- 明确区分两种模式的适用场景。
- 补充服务器配置的注意事项（如 Nginx 的 try_files ）。

### Vue Router 4 模式统一

- 在 Vue Router 4 中，Hash 模式的核心逻辑是通过 popstate 事件监听 URL 变化，而不是传统的 hashchange 事件。具体实现如下：

#### 关键点

##### popstate 统一监听

- 无论是 Hash 模式还是 History 模式，Vue Router 4 都通过 popstate 事件监听浏览器导航（前进/后退）。
- 这是为了统一事件处理逻辑，减少代码冗余。

##### Hash 模式的特殊处理

- 在 Hash 模式下，URL 的 # 部分（即 location.hash ）会被解析为路由路径。
- 通过 pushState 和 replaceState 修改 URL 时，会手动触发 popstate 事件。

##### 源码中的体现

- 在 src/history/hash.ts 中，Hash 模式的实现继承自 History 基类，并通过 popstate 监听路由变化。
- 例如：

```ts
window.addEventListener('popstate', () => {
    // 处理 Hash 或 History 模式的路由变化
  });
```

#### 为什么不再使用 hashchange

##### 统一事件流

- 使用 popstate 可以统一处理 Hash 和 History 模式的路由变化，简化代码逻辑。
- 避免同时监听 hashchange 和 popstate 导致的事件冲突或重复触发。

##### 现代浏览器的支持

- popstate 在现代浏览器中表现稳定，且能覆盖 Hash 模式的需求。
- hashchange 的兼容性优势在现代开发中逐渐弱化。

##### 编程式导航的一致性

- 无论是 Hash 还是 History 模式，都可以通过 pushState 和 replaceState 修改 URL，行为一致。

### 路由匹配与组件渲染

#### 匹配逻辑

- 根据路径解析为 RouteRecord 数组（嵌套路由支持）。
- 使用 matcher 核心模块高效匹配。

#### 组件渲染

- 通过 `<RouterView>` 动态渲染匹配的组件。
- 内部使用 shallowRef 优化性能（避免深层响应式开销）。

#### 重点

- 强调 shallowRef 的作用（减少不必要的响应式追踪）。
- 补充嵌套路由的匹配顺序（父 → 子）。

### 导航守卫与生命周期

#### 钩子分类

- 全局守卫： beforeEach 、 beforeResolve 、 afterEach 。
- 路由独享守卫： beforeEnter 。
- 组件内守卫： onBeforeRouteUpdate 、 onBeforeRouteLeave （Composition API）。

#### 执行流程

- 钩子被转换为 Promise 链式调用。
- 支持异步控制（如 next(false) 或重定向）。

#### 重点

- 明确钩子的执行顺序（全局 → 路由 → 组件）。
- 补充错误处理逻辑（如 next(error) ）。

> 完整的导航解析流程
>
> 1. 导航被触发。
> 2. 在失活的组件里调用 beforeRouteLeave 守卫。
> 3. 调用全局的 beforeEach 守卫。
> 4. 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。
> 5. 在路由配置里调用 beforeEnter。
> 6. 解析异步路由组件。
> 7. 在被激活的组件里调用 beforeRouteEnter。
> 8. 调用全局的 beforeResolve 守卫(2.5+)。
> 9. 导航被确认。
> 10. 调用全局的 afterEach 钩子。
> 11. 触发 DOM 更新。
> 12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

### 动态路由

#### 核心方法

- addRoute ：动态添加路由规则。
- removeRoute ：移除路由规则。
- hasRoute ：检查路由是否存在。

#### 使用场景

- 权限控制（根据用户角色加载路由）。
- 懒加载模块化路由。

#### 重点

- 补充动态路由的缓存策略（避免重复加载）。
- 强调路由唯一性（ name 或 path 冲突处理）。

### 响应式设计

#### 路由状态

- 使用 reactive 封装当前路由信息（ route 对象）。
- 通过 inject/provide 跨组件共享状态。

#### 性能优化

- 依赖收集仅针对必要的路由属性（如 params 、 query ）。

### 核心模块

- Router：管理路由实例和全局配置。
- Matcher：高效匹配路由规则。
- Navigation：处理导航流程和守卫调度。
- History：抽象路由模式的具体实现。
