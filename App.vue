<template>
  <div>
    <div style="display:flex;justify-content: space-evenly;">
      <router-link to='/'>home</router-link>
      <router-link to='/login'>login</router-link>
    </div>
    <hr>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log(this._routerRoot._router)
  }
}
</script>