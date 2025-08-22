<template>
  <div>
    MyC2
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyC2',
  props: {},
  beforeRouteEnter(to, from) {
    console.log('beforeRouteEnter MyC2')
  },
  beforeRouteUpdate(to, from) {
    console.log('beforeRouteUpdate MyC2')
  },
  beforeRouteLeave(to, from) {
    console.log('beforeRouteLeave MyC2')
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" scoped>

</style>