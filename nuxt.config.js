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
      { hid: 'description', name: 'description', content: 'Dashboard for decentralized finance from Delphi Digital.'}
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
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
    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js",
      },
    ]
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
    pollingFrequency: process.env.POLLING_FREQUENCY || 5000,
    TESTNET_NODE_IP: process.env.TESTNET_NODE_IP,
    CHAOSNET_NODE_IP: process.env.CHAOSNET_NODE_IP,
    DATA_SOURCE: process.env.DATA_SOURCE || 'cache',
    CACHE_URL: process.env.CACHE_URL || 'http://localhost:3021',
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
  router: {
    linkActiveClass: 'link--active',
  },
  serverMiddleware: [
    '~/api',
    '~/serverMiddleware/redirects.js',
  ],
};
