<template>
  <div>
    <h2>login</h2>
    <hr>
     <div style="display:flex;justify-content: space-evenly;">
      <router-link to='/login/forget'>forget</router-link>
      <router-link to='/login/reg'>register</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'Login'
}
</script>