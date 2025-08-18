<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <HelloWorld msg="Vite + Vue + VueRouter" />
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
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
