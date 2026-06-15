// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  },

  experimental: {
    appManifest: false
  },

  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],
  site: {
    url: 'http://localhost:3000',
  },

  sitemap: {
    exclude: [
      '/dashboard/**',
      '/exam/**',
      '/learn/**'
    ],
    urls: [
      '/',
      '/about',
      '/courses',
      '/jobs',
      '/verify'
    ]
  },

  robots: {
    disallow: ['/dashboard/', '/exam/', '/learn/'],
    allow: ['/']
  },

  googleFonts: {
    families: {
      Figtree: [300, 400, 500, 600, 700, 800, 900]
    },
    display: 'swap'
  },

  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'appleLight',
        themes: {
          appleLight: {
            dark: false,
            colors: {
              primary:    '#5624D0', // Udemy purple
              secondary:  '#6A6F73', // Udemy secondary grey
              success:    '#1CA15B',
              error:      '#D63D2D',
              warning:    '#E59819', // Udemy gold
              info:       '#A435F0', // Udemy accent violet
              surface:    '#FFFFFF',
              background: '#F7F9FA',
            }
          }
        }
      },
      defaults: {
        VCard: {
          elevation: 0,
          rounded: 'lg',   /* Udemy uses a squarer 8px radius */
        },
        VBtn: {
          rounded: 'lg',
          flat: true,
          style: 'text-transform: none; font-weight: 600;'
        },
        VTextField: {
          variant: 'outlined',
          density: 'comfortable',
          color: 'primary',
        },
        VSelect: {
          variant: 'outlined',
          density: 'comfortable',
          color: 'primary',
        },
        VChip: {
          rounded: 'pill',
          variant: 'flat',
          style: 'font-weight: 700; font-size: 11px; letter-spacing: 0.1px;'
        }
      }
    }
  },

  css: [
    '@/assets/styles/base.css',
    '@/assets/styles/main.css'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    }
  },

  app: {
    head: {
      title: 'AEMS Academy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Advanced eLearning Management System' }
      ],
      script: [
        { src: 'https://checkout.razorpay.com/v1/checkout.js', defer: true }
      ]
    }
  }
})
