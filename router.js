import Vue from 'vue'
import VueRouter from './plugins/vue-router/index'
debugger
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('./views/home/index.vue')
  },
  {
    path: '/login',
    component: () => import('./views/user/login.vue'),
    children: [
      {
        path: 'forget',
        component: {
          render:(h) => h('h3', {}, 'forget')
        }
      },
      {
        path: 'reg',
        component: {
          render:(h) => h('h3', {}, 'register')
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// router.beforeEach((to, from, next) => {
//   console.log('beforeEach', 1, to, from)
//   setTimeout(() => {
//     next()
//   }, 1000)
// })

// router.beforeEach((to, from, next) => {
//   console.log('beforeEach', 2, to, from)
//   setTimeout(() => {
//     next()
//   }, 1000)
// })


export default router