<template>
  <div class="news-detail-page bg-grey-lighten-4 min-h-screen pb-16">
    <div v-if="loading" class="d-flex justify-center align-center py-16" style="min-height: 50vh;">
      <v-progress-circular indeterminate color="blue" size="64"></v-progress-circular>
    </div>

    <div v-else-if="!news" class="text-center py-16">
      <h1 class="text-h4 font-weight-bold mb-4">News Not Found</h1>
      <v-btn to="/" color="primary">Return Home</v-btn>
    </div>

    <div v-else class="fade-in">
      <!-- Hero Banner -->
      <div 
        class="news-hero position-relative d-flex align-end pb-8"
        :style="news.image_url ? `background-image: url('${baseUrl}${news.image_url}')` : 'background-color: var(--primary)'"
      >
        <div class="hero-overlay"></div>
        <v-container class="position-relative z-10">
          <v-btn icon="mdi-arrow-left" variant="text" color="white" to="/" class="mb-4" exact></v-btn>
          <div class="d-flex align-center gap-3 mb-4">
            <v-chip color="white" size="small" variant="flat" class="text-primary font-weight-bold text-uppercase tracking-wider">
              News & Updates
            </v-chip>
            <span class="text-white opacity-80 text-body-2 font-weight-medium">
              {{ new Date(news.published_at || news.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }}
            </span>
          </div>
          <h1 class="text-h3 md:text-h2 font-weight-black text-white line-height-tight" style="max-width: 800px;">
            {{ news.title }}
          </h1>
        </v-container>
      </div>

      <!-- Content -->
      <v-container class="mt-n8 position-relative z-10">
        <v-row justify="center">
          <v-col cols="12" lg="10" xl="8">
            <v-card class="pa-6 pa-md-12 rounded-xl bg-white shadow-sm" border="0" elevation="0">
              <!-- Render HTML content -->
              <div class="news-content prose" v-html="news.content"></div>
              
              <v-divider class="my-8"></v-divider>
              
              <div class="d-flex align-center justify-space-between">
                <v-btn variant="text" to="/" color="primary" prepend-icon="mdi-arrow-left">Back to Home</v-btn>
                <div class="d-flex gap-2">
                  <v-btn icon="mdi-facebook" variant="text" color="grey-darken-1" size="small"></v-btn>
                  <v-btn icon="mdi-twitter" variant="text" color="grey-darken-1" size="small"></v-btn>
                  <v-btn icon="mdi-linkedin" variant="text" color="grey-darken-1" size="small"></v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'public'
});

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();

const baseUrl = computed(() => config.public.apiBase.replace('/api', ''));
const loading = ref(true);
const news = ref<any>(null);

const fetchNews = async () => {
  try {
    const slug = route.params.slug as string;
    const { data } = await api.get(`/public/news/${slug}`) as any;
    news.value = data;
    
    useSeoMeta({
      title: `${data.title} - Brix Certifications News`,
      description: data.content ? data.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : ''
    });
  } catch (err) {
    console.error('Failed to load news article', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
.news-hero {
  min-height: 40vh;
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
}
.z-10 {
  z-index: 10;
}
.tracking-wider {
  letter-spacing: 0.05em;
}
.line-height-tight {
  line-height: 1.1 !important;
}
.shadow-sm {
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}
.prose {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #333;
}
.prose :deep(p) {
  margin-bottom: 1.5em;
}
.prose :deep(h2), .prose :deep(h3), .prose :deep(h4) {
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: 700;
  color: #111;
}
.prose :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 2em 0;
}
.prose :deep(ul), .prose :deep(ol) {
  margin-bottom: 1.5em;
  padding-left: 2em;
}
.prose :deep(li) {
  margin-bottom: 0.5em;
}
</style>
