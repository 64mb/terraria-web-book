<template>
  <div
    v-if="item != null"
    v-touch:swipe.left="swipeHandler"
    v-touch:swipe.right="swipeHandler"
    class="h-100"
  >
    <keyboard @keyup="fastKeyPress"></keyboard>
    <div class="p-4" style="border-bottom: solid #ced4da 1px">
      <item-image :id="item.id"></item-image>
      <span class="item-title p-1">ID: {{ item.id }}</span>
      <button
        type="button"
        class="close d-block d-sm-none"
        aria-label="Close"
        @click="closeItem(true)"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="px-4 pt-2 pb-4">
      <div class="item-label">Английский перевод</div>
      <b-input
        class="item-input"
        :value="item.name.en"
        placeholder="Текст не задан"
        size="sm"
        @input="updateItemEn"
      ></b-input>
      <div class="item-label mt-2">Русский оригинал</div>
      <b-input
        class="item-input"
        :value="item.name.o_ru"
        placeholder="Текст не задан"
        size="sm"
        @input="updateItemEn"
      ></b-input>
      <div class="item-label mt-2">Русский перевод</div>
      <b-input
        class="item-input"
        :value="item.name.ru"
        placeholder="Текст не задан"
        size="sm"
        @input="updateItemRu"
      ></b-input>
      <div class="item-label mt-2">Род:</div>
      <b-form-radio-group
        :key="`radio_${item.id}`"
        :checked="item.gender != null ? item.gender : -1"
        size="md"
        @change="updateItemGender"
      >
        <b-form-radio :value="0" class="item-label-value color-success"
          >Мужской
        </b-form-radio>
        <b-form-radio :value="1" class="item-label-value color-warning"
          >Женский
        </b-form-radio>
        <b-form-radio :value="2" class="item-label-value color-info"
          >Средний
        </b-form-radio>
        <b-form-radio :value="3" class="item-label-value color-danger"
          >Множественное
        </b-form-radio>
      </b-form-radio-group>
      <div class="item-label mt-2">Ловеркейс:</div>
      <b-form-checkbox
        :key="`check_${item.id}`"
        :checked="item.lowercase != null ? !!item.lowercase : false"
        switch
        class="item-label-value"
        @input="updateItemLowercase"
      >
        Ловеркейс
      </b-form-checkbox>
      <div v-if="itemRecipes.length" class="item-label mt-2">Рецепты:</div>
      <b-table
        v-if="itemRecipes.length"
        small
        class="mt-2 mb-0 item-label"
        :fields="recipesTableFields"
        :items="itemRecipes"
        stacked="sm"
        bordered
      >
        <template v-slot:cell(count)="data">
          <item-image :id="item.id" small></item-image>
          <b>x {{ data.value }}</b>
        </template>
        <template v-slot:cell(ingredients)="{ value: ingredients }">
          <div
            v-for="ingredient in ingredients"
            :key="'ingredient_' + ingredient.id"
            class="mb-1"
          >
            <item-image :id="ingredient.id" small></item-image>
            {{
              ingredient.id > 0
                ? itemsById[ingredient.id].name.ru
                : toolItems[ingredient.id].name
            }}
            ({{ ingredient.count }})
          </div>
        </template>
        <template v-slot:cell(stations)="{ value: stations }">
          <div
            v-for="(stationSeed, index) in stations"
            :key="'station_seed_' + index"
          >
            <div
              v-for="stId in stationSeed"
              :key="'station_' + index + '_' + stId"
              class="d-inline-block mr-2"
            >
              <item-image :id="stId" small></item-image>
              {{ stId > 0 ? itemsById[stId].name.ru : toolItems[stId].name }}
            </div>
            <p
              v-if="stations.length > 0 && index !== stations.length - 1"
              class="mt-1 mb-1"
            >
              <b>или</b>
            </p>
          </div>
        </template>
      </b-table>
      <b-button
        v-b-toggle.collapse-examples
        size="sm"
        variant="outline-secondary"
        class="mt-2 font-small"
      >
        <b-icon-eye></b-icon-eye>
        Отобразить примеры
      </b-button>
      <b-collapse id="collapse-examples" class="mt-2">
        <b-card body-class="px-2 pt-2 pb-0">
          <b-row
            v-if="item.gender != null && item.name && item.name.ru"
            class="font-large"
          >
            <b-col
              v-for="pkey in exPrefixes"
              :key="pkey"
              sm="12"
              md="6"
              lg="4"
              class=""
            >
              <div class="font-andy border-plain px-2 mb-2">
                {{ prefixes[pkey][item.gender] }}
                {{
                  item.lowercase === 1 && item.name && item.name.ru
                    ? item.name.ru[0].toLowerCase() + item.name.ru.slice(1)
                    : item.name.ru
                }}
              </div>
            </b-col>
          </b-row>
          <p v-else class="font-small">Установите род</p>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import prefixes from '../assets/terraria/prefixes.json'
import recipes from '../assets/terraria/recipes.json'
import toolItems from '../assets/terraria/tool_items.json'
import Keyboard from '~/components/keyboard'
import ItemImage from '~/components/item_image'

export default {
  name: 'ItemDetail',
  components: {
    ItemImage,
    Keyboard
  },
  data() {
    return {
      itemReady: false,
      itemTimeout: {
        en: null,
        ru: null
      },
      itemUpdate: {},
      detailVisible: false,
      prefixes,
      prefixesTimeout: null,
      prefixesExamples: null,
      recipes,
      toolItems,
      itemsByIdData: null,
      recipesTableFields: [
        { key: 'count', label: 'Кол-во' },
        { key: 'ingredients', label: 'Ингредиенты' },
        { key: 'stations', label: 'Инструменты' }
      ]
    }
  },
  computed: {
    ...mapState([
      'items',
      'useSearchResult',
      'item',
      'filteredItems',
      'onlyWithoutGender'
    ]),
    itemRecipes() {
      if (this.recipes[this.item.id] != null) return this.recipes[this.item.id]
      return []
    },
    itemsById() {
      if (this.itemsByIdData == null) {
        if (this.items != null) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.itemsByIdData = {}
          this.items.forEach((item) => {
            this.itemsByIdData[item.id] = item
          })
        } else {
          return {}
        }
      }
      return this.itemsByIdData
    },
    exPrefixes() {
      if (this.item) {
        if (this.prefixesExamples == null) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.prefixesExamples = Object.keys(prefixes)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)
        }

        return this.prefixesExamples
      }
      return []
    }
  },
  methods: {
    ...mapMutations(['setItem']),
    fastKeyPress(event) {
      if (!event || !event.code) return
      if (event.target && event.target.tagName.toLowerCase() === 'input') return
      switch (event.code) {
        case 'ArrowRight': {
          this.swipeHandler('left')
          break
        }
        case 'ArrowLeft': {
          this.swipeHandler('right')
          break
        }
        case 'Numpad1':
        case 'Numpad2':
        case 'Numpad3':
        case 'Numpad4': {
          this.updateItemGender(parseInt(event.code.replace('Numpad', '')) - 1)
          break
        }
      }
    },
    swipeHandler(direction) {
      let items = this.items
      if (this.useSearchResult) items = this.filteredItems

      const directionStep = direction === 'right' ? -1 : 1

      if (this.useSearchResult) {
        direction =
          items.findIndex((it) => it.id === this.item.id) + directionStep
      } else {
        direction = parseInt(this.item.id) + directionStep
      }
      if (this.onlyWithoutGender) {
        while (
          items[direction - 1] != null &&
          items[direction - 1].gender != null
        ) {
          direction += directionStep
        }
      }

      if (items[direction] != null) {
        this.setItem(items[direction - 1])
      }
    },
    updateItem(value) {
      if (value.name && value.name.ru != null) {
        if (this.itemUpdate.name == null) {
          this.itemUpdate.name = {}
        }
        this.itemUpdate.name.ru = value.name.ru.toString()
      }
      if (value.name && value.name.en != null) {
        if (this.itemUpdate.name == null) {
          this.itemUpdate.name = {}
        }
        this.itemUpdate.name.en = this.itemUpdate.name.en.toString()
      }
      if (value.gender != null) this.itemUpdate.gender = parseInt(value.gender)
      if (value.lowercase != null)
        this.itemUpdate.lowercase = parseInt(value.lowercase)

      const id = this.item.id
      const update = { ...this.itemUpdate }
      const item = { ...this.item }

      if (this.itemTimeout[id] != null) clearTimeout(this.itemTimeout[id])
      this.itemTimeout[id] = setTimeout(() => {
        if (update.name != null) {
          update.name = { ...item.name, ...update.name }
        }
        this.$fireStore
          .collection('items')
          .doc(id)
          .update(this.itemUpdate)
      }, 1000)
    },
    updateItemGender(value) {
      this.updateItem({ id: value.id, gender: value })
    },
    updateItemRu(value) {
      if (this.itemTimeout.ru != null) clearTimeout(this.itemTimeout.ru)
      this.itemTimeout.ru = setTimeout(() => {
        this.updateItem({ name: { ru: value } })
      }, 500)
    },
    updateItemEn(value) {
      if (this.itemTimeout.en != null) clearTimeout(this.itemTimeout.en)
      this.itemTimeout.en = setTimeout(() => {
        this.updateItem({ name: { en: value } })
      }, 500)
    },
    updateItemLowercase(value) {
      this.updateItem({ lowercase: value ? 1 : 0 })
    },
    closeItem(force = false) {
      if (force) {
        window.history.back()
      } else {
        this.detailVisible = false
        this.setItem(null)
      }
    },
    formatDate(date) {
      let minutes = date.getMinutes()
      let hours = date.getHours()
      let month = date.getMonth() + 1
      let dateTemp = date.getDate()
      if (minutes < 10) minutes = `0${minutes}`
      if (hours < 10) hours = `0${hours}`
      if (dateTemp < 10) dateTemp = `0${dateTemp}`
      if (month < 10) month = `0${month}`

      return `${dateTemp}.${month}.${date.getFullYear()}_${hours}:${minutes}`
    }
  }
}
</script>
<style lang="scss">
@font-face {
  font-family: 'Andy';
  src: url('../assets/fonts/andy.ttf') format('truetype');
}

.font-andy {
  font-family: Andy, serif;
}
</style>
