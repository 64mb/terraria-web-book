const items = require('~/assets/terraria/seed.json')

export const state = () => ({
  items,
  filteredItems: [],
  item: null,
  itemId: localStorage.getItem('itemId') || null,
  search: localStorage.getItem('search') || '',
  onlyWithoutGender:
    localStorage.getItem('onlyWithoutGender') === 'true' || false,
  useSearchResult: false
})
export const mutations = {
  setSearch(st, payload) {
    st.search = payload
    localStorage.setItem('search', payload)
  },
  setOnlyWithoutGender(st, payload) {
    st.onlyWithoutGender = payload
    localStorage.setItem('onlyWithoutGender', st.onlyWithoutGender.toString())
  },
  setItem(st, payload) {
    st.item = payload
    if (payload != null) {
      st.itemId = payload.id
      localStorage.setItem('itemId', st.itemId.toString())
    } else {
      st.itemId = null
      localStorage.removeItem('itemId')
    }
  },
  setUseSearchResult(st, payload) {
    st.useSearchResult = payload
  },
  setFilteredItems(st, payload) {
    st.filteredItems = payload
  }
}
