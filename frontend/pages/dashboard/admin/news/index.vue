<template>
  <v-container fluid class="pa-6">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">News & Updates</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-0">Manage news articles displayed on the homepage.</p>
      </div>
      <div class="d-flex align-center gap-3">
        <AppButton icon="mdi-plus" to="/dashboard/admin/news/create">
          Create News
        </AppButton>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card mb-6 pa-4">
      <div class="d-flex flex-column flex-md-row gap-3">
        <div class="search-pill d-flex align-center px-3 flex-grow-1">
          <v-icon icon="mdi-magnify" size="18" color="grey-darken-1" class="mr-2"></v-icon>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search news by title..." 
            class="search-input"
            style="width: 100%"
            @input="debounceSearch"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="blue" size="48"></v-progress-circular>
      <div class="mt-4 text-secondary font-weight-bold">Loading news...</div>
    </div>

    <div v-else-if="news.length === 0" class="text-center py-16 empty-state">
      <v-icon size="64" color="var(--g2)">mdi-newspaper-variant-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mt-4 text-secondary">No news found</h3>
      <p class="text-secondary">Click "Create News" to publish your first article.</p>
    </div>

    <div v-else class="fade-in">
      <v-row>
        <v-col v-for="item in news" :key="item.id" cols="12" sm="6" md="4">
          <v-card class="h-100 rounded-xl overflow-hidden d-flex flex-column bg-white highlight-card" elevation="0" border>
            <div class="thumbnail-wrapper position-relative" style="height: 200px;">
              <v-img 
                v-if="item.image_url" 
                :src="$config.public.apiBase.replace('/api', '') + item.image_url" 
                cover 
                height="100%"
              ></v-img>
              <div v-else class="w-100 h-100 bg-grey-lighten-4 d-flex align-center justify-center">
                <v-icon size="48" color="grey-lighten-2">mdi-image-outline</v-icon>
              </div>
              
              <div class="position-absolute top-0 right-0 pa-2 d-flex gap-2">
                <v-btn icon="mdi-pencil" size="x-small" color="white" variant="flat" :to="`/dashboard/admin/news/${item.id}/edit`" class="shadow-sm"></v-btn>
                <v-btn icon="mdi-delete" size="x-small" color="error" variant="flat" @click="deleteItem(item.id)" class="shadow-sm"></v-btn>
              </div>
              
              <v-chip 
                class="position-absolute top-0 left-0 ma-2 font-weight-medium"
                :color="item.is_published ? 'success' : 'grey'"
                size="small"
              >
                {{ item.is_published ? 'Published' : 'Draft' }}
              </v-chip>
            </div>
            
            <div class="pa-4 flex-grow-1 d-flex flex-column">
              <h3 class="text-subtitle-1 font-weight-bold mb-2 line-clamp-2" style="line-height: 1.4;">{{ item.title }}</h3>
              <p class="text-caption text-secondary mb-0">
                Created: {{ new Date(item.created_at).toLocaleDateString() }}
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-pagination
        v-if="totalPages > 1"
        v-model="page"
        :length="totalPages"
        class="mt-8"
        active-color="blue"
        @update:model-value="fetchNews"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

const api = useApi();
const loading = ref(true);
const news = ref<any[]>([]);
const searchQuery = ref('');
const page = ref(1);
const totalPages = ref(1);
const limit = 12;

const fetchNews = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/admin/news?page=${page.value}&limit=${limit}&search=${encodeURIComponent(searchQuery.value)}`);
    news.value = data.news || [];
    totalPages.value = Math.ceil((data.total || 0) / limit);
  } catch (err) {
    console.error('Failed to fetch news', err);
  } finally {
    loading.value = false;
  }
};

let timeout: any;
const debounceSearch = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    page.value = 1;
    fetchNews();
  }, 500);
};

const deleteItem = async (id: string) => {
  if (confirm('Are you sure you want to delete this news article?')) {
    try {
      await api.delete(`/admin/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  }
};

onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
.filters-card {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.search-pill {
  background: #f8f9fc;
  border-radius: 100px;
  height: 44px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.search-pill:focus-within {
  background: white;
  border-color: var(--g1);
  box-shadow: 0 0 0 4px rgba(var(--g1-rgb), 0.1);
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
}
.highlight-card {
  transition: all 0.3s ease;
}
.highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
  border-color: rgba(0,0,0,0.08) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.empty-state {
  background: white;
  border-radius: 16px;
  border: 1px dashed rgba(0,0,0,0.1);
}
</style>
