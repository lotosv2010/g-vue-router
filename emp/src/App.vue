<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
// import {useRoute, useRouter } from '../../router/packages/vue-router/src/index'

// const router: any = useRouter()
// const route = useRoute()
// console.log(router, route)

// const goA = () => {
//   router.push('/a')
// }

// const goB = () => {
//   router.push('/b')
// }

// router.listen((to: any, from: any) => {
//   console.log('routeChange', to, from)
// })
</script>

<template>
  <HelloWorld msg="Vite + Vue + VueRouter" />
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/my">My</RouterLink>
    <!-- <button @click="goA">go a</button>
    <button @click="goB">go b</button> -->
  </nav>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>