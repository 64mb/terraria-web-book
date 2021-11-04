<template>
  <div class="item">
    <b-row class="my-2" no-gutters>
      <b-col cols="auto">
        <b-img-lazy
          height="40px"
          width="40px"
          blank-height="40px"
          blank-width="40px"
          :rounded="true"
          :show.sync="ready"
          :style="{
            'object-fit': 'none',
            'object-position': ready ? getItemImage(item.id) : '',
            border: 'solid 1px'
          }"
          class="item-image"
          src="../assets/terraria/items.png"
          blank-src="../assets/loader-image.gif"
        >
        </b-img-lazy>
      </b-col>
      <b-col
        :class="
          ready ? 'item-title-add p-1' : 'item-title-add item-title-loading p-1'
        "
      >
        <div v-if="ready">
          <span class="item-title-l">id:</span> {{ item.id }}
        </div>
        <div v-if="ready">
          <span class="item-title-l">ru:</span> {{ item.name.ru }}
        </div>
        <div v-if="ready">
          <span class="item-title-l">en:</span> {{ item.name.en }}
        </div>
        <div v-if="ready">
          <span class="item-title-l">gender:</span>
          <span
            :class="
              genders[item.gender]
                ? genders[item.gender].color + ' item-title-l'
                : ''
            "
            >{{
              genders[item.gender] ? genders[item.gender].label : 'Не определен'
            }}</span
          >
        </div>
        <div v-if="ready">
          <span class="item-title-l">lcase:</span>
          {{ item.lowercase === 1 || item.lowercase == null ? 'вкл' : 'выкл' }}
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'Item',
  props: {
    item: {
      type: Object,
      default: () => {
        return { id: 0 }
      }
    }
  },
  data() {
    return {
      data: {},
      ready: false,
      genders: {
        0: { color: 'color-success', label: 'Мужской' },
        1: { color: 'color-warning', label: 'Женский' },
        2: { color: 'color-info', label: 'Средний' },
        3: { color: 'color-danger', label: 'Множественное' }
      }
    }
  },
  methods: {
    getItemImage(id) {
      const square = 32

      return `-${40 * (id % square)}px -${40 * ((id / square) | 0)}px`
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/font.scss';
@import '../assets/scss/color.scss';

.item-title {
  background-color: $color-mystic;
  border-radius: 4px;
  font-size: smaller;
  margin-left: 8px;
}

.item-title-add {
  border: solid 1px;
  border-radius: 4px;
  font-size: smaller;
  margin-left: 8px;
}

.item-title-l {
  font-weight: bold;
}

.item-title-loading {
  background-image: url('../assets/loader-image.gif');
}

.item {
  border-radius: 4px;

  &:hover {
    opacity: 0.6;
  }
}
</style>
