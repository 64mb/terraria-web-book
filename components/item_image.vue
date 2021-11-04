<template>
  <div v-if="id != null" class="d-inline-block">
    <b-img-lazy
      v-if="id >= 0"
      :height="sizePX"
      :width="sizePX"
      :blank-height="sizePX"
      :blank-width="sizePX"
      :rounded="true"
      :style="{
        'object-fit': 'none',
        'object-position': id != null ? getItemImage(id) : '',
        '-moz-transform': `scale(${zoom})`,
        zoom
      }"
      class="item-image"
      src="../assets/terraria/items.png"
      blank-src="../assets/loader-image.gif"
    >
    </b-img-lazy>
    <b-img-lazy
      v-else
      :height="sizePX"
      :width="sizePX"
      :blank-height="sizePX"
      :blank-width="sizePX"
      :rounded="true"
      :style="{
        'object-fit':
          toolItems[id].image === 'snow_biome.png' ? 'cover' : 'contain',
        padding: '4px',
        zoom
      }"
      class="item-image"
      :src="getExceptionItemImage(id)"
      blank-src="../assets/loader-image.gif"
    >
    </b-img-lazy>
  </div>
</template>

<script>
import toolItems from '../assets/terraria/tool_items.json'

export default {
  name: 'ItemImage',
  props: {
    id: {
      type: Number,
      default: null
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      toolItems,
      size: 40
    }
  },
  computed: {
    zoom() {
      if (this.small) return 0.76
      else return 1
    },
    sizePX() {
      return this.size + 'px'
    }
  },
  methods: {
    getItemImage(id) {
      const square = 32

      return `-${this.size * (id % square) + 1}px -${this.size *
        ((id / square) | 0) +
        1}px`
    },
    getExceptionItemImage(id) {
      const image = require('../assets/terraria/tool/' + toolItems[id].image)
      return image
    }
  }
}
</script>
<style lang="scss">
@import '../assets/scss/color.scss';

.item-image {
  background-color: $color-mystic;
  border: solid 1px;
  transform-origin: 0 0;
  -moz-transform-origin: 0 0;
}
</style>
