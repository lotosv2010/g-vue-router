// import { createRouter, createWebHistory } from "vue-router";
import { createRouter, createWebHistory, createWebHashHistory } from '../../../router/packages/vue-router/src/index'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import MyC1 from '../views/MyC1.vue'
import MyC2 from '../views/MyC2.vue'
import My from '../views/My.vue'

const routes = [
  {
    path: "/",
    name: "Home",
    // component: () => import("../views/Home.vue"),
    component: Home,
    beforeEnter: (to: any, from: any) => {
      console.log('beforeEnter Home')
      // return { to, from }
    }
  },
  {
    path: "/about",
    name: "About",
    // component: () => import("../views/About.vue"),
    component: About,
    beforeEnter: (to: any, from: any) => {
      console.log('beforeEnter About')
      // return { to, from }
    }
  },
  {
    path: '/my',
    name: 'My',
    component: My,
    children: [
      {
        path: 'c1',
        name: 'MyC1',
        component: MyC1
      },
      {
        path: 'c2',
        name: 'MyC2',
        component: MyC2
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  // history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  console.log('beforeEach', to.path, from.path);
})

router.beforeResolve((to, from) => {
  console.log('beforeResolve', to.path, from.path);
})

router.afterEach((to, from) => {
  console.log('afterEach', to.path, from.path);
})

console.log(router.getRoutes());

export default router;
