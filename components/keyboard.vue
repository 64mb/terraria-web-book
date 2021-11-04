<template>
  <div></div>
</template>

<script>
export default {
  name: 'Keyboard',
  mounted() {
    const component = this
    this.handler = function(e) {
      component.$emit('keyup', e)
    }
    if (window) window.addEventListener('keydown', this.handler)
  },
  beforeDestroy() {
    if (window) window.removeEventListener('keydown', this.handler)
  }
}
</script>

<style lang="scss" scoped>
div {
  display: none;
}
</style>
