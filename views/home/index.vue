<template>
  <div>
    <h2>home</h2>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    // 路由相关的属性
    console.dir(this.$route)
    // 路由相关的方法
    console.dir(this.$router)
  }
}
</script>