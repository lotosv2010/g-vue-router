export default {
  name: 'routerLink',
  props: {
    to: {
      type: String,
      require: true
    },
    tag: {
      type: String,
      default: 'a'
    }
  },
  methods: {
    handler(to) {
      this.$router.push(to)
    }
  },
  render() {
    let { tag, to } = this
    // jsx 语法，绑定事件
  return <tag onclick={this.handler.bind(this, to)}>{this.$slots.default}</tag>
  }
}