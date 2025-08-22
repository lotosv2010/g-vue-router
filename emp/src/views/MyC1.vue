<template>
  <div>
    MyC1
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyC1',
  props: {},
  beforeRouteEnter(to, from) {
    console.log('beforeRouteEnter MyC1')
  },
  beforeRouteUpdate(to, from) {
    console.log('beforeRouteUpdate MyC1')
  },
  beforeRouteLeave(to, from) {
    console.log('beforeRouteLeave MyC1')
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" scoped>

</style>