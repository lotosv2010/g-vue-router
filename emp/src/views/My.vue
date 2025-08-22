<template>
  <div>
    <nav>
      <RouterLink to="/my/c1">C1</RouterLink>
      <RouterLink to="/my/c2">C2</RouterLink>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'My',
  props: {},
  beforeRouteEnter(to, from) {
    console.log('beforeRouteEnter My')
  },
  beforeRouteUpdate(to, from) {
    console.log('beforeRouteUpdate My')
  },
  beforeRouteLeave(to, from) {
    console.log('beforeRouteLeave My')
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" scoped>

</style>