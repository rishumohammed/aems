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
      Figtree: [300, 400, 500, 600, 700, 800, 900],
      Inter: [400, 500, 600, 700],
      'JetBrains Mono': [400, 500, 600]
    },
    display: 'swap'
  },

  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'brand',
        themes: {
          brand: {
            dark: false,
            colors: {
              primary: '#1B1B3A',
              secondary: '#6B6B76',
              accent: '#F4791F',
              background: '#FAFAF9',
              surface: '#FFFFFF',
              error: '#D85A30',
              success: '#27500A',
              warning: '#854F0B',
              info: '#0C447C'
            }
          },
          adminNeutral: {
            dark: false,
            colors: {
              primary: '#2563EB',
              secondary: '#64748B',
              accent: '#2563EB',
              background: '#F8FAFC',
              surface: '#FFFFFF',
              error: '#DC2626',
              success: '#16A34A',
              warning: '#D97706',
              info: '#0EA5E9'
            }
          }
        }
      },
      defaults: {
        VCard: {
          elevation: 0,
        },
        VBtn: {
          elevation: 0,
          rounded: 'md',
          style: 'text-transform: none;'
        },
        VAppBar: {
          elevation: 0
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
    '@/assets/styles/main.css',
    '@/assets/css/tokens.css'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    }
  },

  app: {
    head: {
      titleTemplate: '%s',
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
