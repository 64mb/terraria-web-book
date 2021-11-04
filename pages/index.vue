<template>
  <b-row class="m-0 h-100">
    <b-col
      md="4"
      sm="12"
      :class="item != null ? 'p-0 d-none d-sm-block' : 'p-0'"
      style="border-right: solid #ced4da 1px;"
    >
      <div class="py-4 px-4" style="border-bottom: solid #ced4da 1px">
        <div style="display: inline-flex; width: 100%">
          <b-form-input
            :value="search"
            size="sm"
            class="w-100"
            placeholder="Поиск..."
            @input="inputSearch"
          ></b-form-input>
          <b-button
            id="popover-settings"
            class="ml-1 hover-animation"
            variant="outline-secondary"
            size="sm"
          >
            <b-icon-three-dots-vertical></b-icon-three-dots-vertical>
          </b-button>
          <b-popover
            target="popover-settings"
            title="Настройки"
            placement="bottomleft"
            triggers="click"
          >
            <b-form-checkbox
              :checked="onlyWithoutGender"
              switch
              class="item-label-value py-1"
              @input="setOnlyWithoutGender"
            >
              Скрывать завершенные
            </b-form-checkbox>
            <b-form-checkbox
              :checked="useSearchResult"
              switch
              class="item-label-value py-1"
              @input="setUseSearchResult"
            >
              Учитывать поиск
            </b-form-checkbox>
            <b-button
              variant="light"
              size="sm"
              class="font-small"
              @click="downloadFile"
            >
              <b-icon-download></b-icon-download>
              Скачать переводы
            </b-button>
            <hr
              role="separator"
              aria-orientation="horizontal"
              class="dropdown-divider"
            />
          </b-popover>
        </div>
        <b-progress class="mt-3" :max="items.length">
          <b-progress-bar
            :value="progress"
            :label="`${((progress / items.length) * 100).toFixed(2)} %`"
          ></b-progress-bar>
        </b-progress>
      </div>
      <div
        v-infinite-scroll="loadMoreItems"
        class="py-1 px-4 scroll-layout"
        :infinite-scroll-distance="200"
      >
        <div>
          <item
            v-for="itemObj in filteredItems"
            :key="itemObj.item_id"
            :item="itemObj"
            @click.native="openItem(itemObj)"
          ></item>
        </div>
      </div>
    </b-col>
    <b-col
      md="8"
      sm="12"
      :class="item != null ? 'p-0' : 'p-0 d-none d-sm-block'"
    >
      <item-detail></item-detail>
    </b-col>
  </b-row>
</template>

<script>
import infiniteScroll from 'vue-infinite-scroll'
import { mapMutations, mapState } from 'vuex'
import Item from '~/components/item'
import ItemDetail from '~/components/item_detail'

export default {
  components: {
    ItemDetail,
    Item
  },
  directives: { infiniteScroll },
  data() {
    return {
      itemTimeout: {
        en: null,
        ru: null
      },
      throttle: 20,
      throttleTimeout: null,
      searchTimeout: null,
      detailVisible: false,
      popStateListener: null
    }
  },
  computed: {
    ...mapState([
      'items',
      'item',
      'itemId',
      'search',
      'onlyWithoutGender',
      'useSearchResult'
    ]),
    filteredItems() {
      let items = []
      if (this.search == null || this.search === '') {
        if (this.onlyWithoutGender) {
          items = this.items.filter(
            (it) => it.gender == null || (it.name == null && it.name.ru == null)
          )
          items = items.slice(0, this.throttle)
        } else {
          items = this.items.slice(0, this.throttle)
        }
      } else {
        const searchSeed = this.search.trim().toLowerCase()
        let isId = searchSeed.replace(/[^\d]/, '') === searchSeed
        if (isId) isId = parseInt(searchSeed)
        this.items.forEach((it) => {
          if (isId) {
            if (it.item_id === isId) items.push(it)
          } else if (searchSeed.length > 2) {
            if (
              it.name.en != null &&
              it.name.en.toLowerCase().includes(searchSeed)
            ) {
              items.push(it)
            } else if (
              it.name.ru != null &&
              it.name.ru.toLowerCase().includes(searchSeed)
            ) {
              items.push(it)
            }
          }
        })
        if (this.useSearchResult && this.onlyWithoutGender) {
          items = items.filter(
            (it) => it.gender == null || (it.name == null && it.name.ru == null)
          )
        }
      }
      this.setFilteredItems(items)
      return items
    },
    progress() {
      let progress = 0
      this.items.forEach((it) => {
        if (it.gender != null) progress += 1
      })
      return progress
    }
  },
  mounted() {
    if (window.history.length < 2) window.history.pushState({}, '')

    this.popStateListener = () => {
      if (this.item != null) {
        this.closeItem()
      } else {
        this.$bvToast.toast('Ещё раз назад для закрытия', {
          toaster: 'b-toaster-bottom-center',
          appendToast: true,
          noCloseButton: true,
          autoHideDelay: 2000,
          variant: 'secondary',
          solid: true
        })
        setTimeout(() => {
          window.history.pushState({}, '')
        }, 2000)
      }
    }
    window.addEventListener('popstate', this.popStateListener)

    if (this.item != null) {
      window.history.pushState({}, '')
    }
  },
  destroyed() {
    if (this.throttleTimeout != null) clearTimeout(this.throttleTimeout)
    window.removeEventListener('popstate', this.popStateListener)
  },
  methods: {
    ...mapMutations([
      'setItem',
      'setSearch',
      'setOnlyWithoutGender',
      'setUseSearchResult',
      'setFilteredItems'
    ]),
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
          items.findIndex((it) => it.id === this.itemId) + directionStep
      } else {
        direction = parseInt(this.itemId) + directionStep
      }
      if (this.onlyWithoutGender) {
        while (items[direction] != null && items[direction].gender != null) {
          direction += directionStep
        }
      }

      if (items[direction] != null) {
        this.setItem(items[direction])
      }
    },
    loadMoreItems() {
      this.throttle += 20
    },
    inputSearch(value) {
      if (this.searchTimeout != null) clearTimeout(this.searchTimeout)
      if (value == null || value === '') {
        this.throttle = 20
      }
      this.searchTimeout = setTimeout(() => {
        this.setSearch(value)
      }, 100)
    },
    openItem(item) {
      this.setItem(item)
      window.history.pushState({}, '')
      this.detailVisible = true
    },
    getItemImage(id) {
      const square = 32

      return `-${40 * (id % square)}px -${40 * ((id / square) | 0)}px`
    },
    downloadFile() {
      const urlData = window.URL.createObjectURL(
        new Blob([JSON.stringify(this.items, null, 2)])
      )
      const link = document.createElement('a')

      link.href = urlData
      link.setAttribute('download', `items_${this.formatDate(new Date())}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
  },
  head() {
    let title = 'Terraria Book'
    if (this.item && this.item.name && this.item.name.ru)
      title = this.item.name.ru
    return {
      title
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/add.scss';
@import '../assets/scss/font.scss';
@import '../assets/scss/color.scss';

.scroll-layout {
  max-height: calc(100vh - 7rem - 1px) !important;
  overflow-y: scroll;

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar {
    width: 6px;
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #7f828b;
    border-radius: 3px;
  }
}

.fade {
  &-enter-active,
  &-leave-active {
    transition: all 275ms cubic-bezier(0.5, 0.15, 0.4, 1);
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }

  &-leave,
  &-enter-to {
    opacity: 1;
  }
}

.detail {
  transition: opacity 0.5s ease-out;
  opacity: 0;
}

.active {
  transition: opacity 0.5s ease-out;
  opacity: 1;
}

.item-label {
  font-size: small;
}

.item-label-value {
  font-size: small;

  label {
    line-height: 24px !important;
  }
}

.item-label-icon {
  position: absolute;
}

.item-input {
  width: calc(100% - 20px);
}

.hover-animation {
  &:hover {
    transform: scale(1.1);
    transition: transform 0.15s;
  }
}

h3.popover-header {
  font-size: small;
}

.font-small {
  font-size: small;
}

.font-large {
  font-size: larger;
}

.border-plain {
  border: solid 1px rgba(0, 0, 0, 0.125);
  border-radius: 2px;
}

label.d-block {
  font-size: small;
}
</style>
