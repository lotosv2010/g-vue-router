import Vue from 'vue'
import router from './router'
import App from './App'

new Vue({
  el: '#app',
  name: 'Root',
  router,
  render: (h) => {
    return h(App)
  }
})