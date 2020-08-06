
export default {
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'universal',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: 'Delphi Digital: Thorchain',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/purecss@2.0.3/build/pure-min.css',
        integrity: 'sha384-cg6SkqEOCV1NbJoCu11+bm0NvBRc8IYLRGXkmNrqUBfTjmMYwNKPWBTIKyw9mHNJ',
        crossorigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/purecss@2.0.3/build/grids-responsive-min.css',
      },
      {
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
        rel: 'stylesheet',
      },
    ],
  },
  /*
  ** Global CSS
  */
  css: [
    '~assets/css/global.scss',
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    ['@nuxtjs/google-analytics', {
      id: 'UA-174637134-1',
    }],
  ],
  env: {
    nodeBaseUrl: process.env.NODE_BASE_URL || 'http://44.231.128.98',
    midgardBaseUrl: process.env.MIDGARD_BASE_URL || 'http://44.231.128.98',
    pollingFrequency: process.env.POLLING_FREQUENCY || 10000,
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    'nuxt-highcharts',
    '@nuxtjs/style-resources',
    '@nuxtjs/redirect-module',
  ],
  redirect: [
    { from: '^/$', to: '/thorchain' },
  ],
  styleResources: {
    scss: ['./assets/css/*.scss'],
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    watch: ['api'],
    extend(config, ctx) {
    },
  },
  serverMiddleware: ['~/api'],
};
