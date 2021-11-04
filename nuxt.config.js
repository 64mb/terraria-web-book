export default {
  target: 'static',
  router: {
    base: `/${process.env.npm_package_name}/`
  },
  ssr: false,
  head: {
    title: 'Terraria Book',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Ubuntu:200,300,500,700'
      }
    ]
  },
  pwa: {
    manifest: {
      name: 'Terraria Book',
      short_name: 'Terraria Book'
    },
    meta: {
      mobileAppIOS: true
    }
  },
  loading: { color: '#fff' },
  css: [],
  plugins: [{ src: '@/plugins/vue_2_touch_events', ssr: false }],
  buildModules: [],
  modules: ['bootstrap-vue/nuxt', '@nuxtjs/pwa', '@nuxtjs/dotenv'],
  bootstrapVue: {
    icons: true
  }
}
