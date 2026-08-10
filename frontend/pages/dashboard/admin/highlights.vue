<template>
  <v-container fluid class="pa-6">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Highlights</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-0">Manage highlights displayed on the homepage slider.</p>
      </div>
      <div class="d-flex align-center gap-3">
        <AppButton icon="mdi-plus" @click="openDialog()">
          Create Highlight
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
            placeholder="Search highlights by title..." 
            class="search-input"
            style="width: 100%"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="blue" size="48"></v-progress-circular>
      <div class="mt-4 text-secondary font-weight-bold">Loading highlights...</div>
    </div>

    <div v-else-if="filteredHighlights.length === 0" class="text-center py-16 empty-state">
      <v-icon size="64" color="var(--g2)">mdi-star-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mt-4 text-secondary">No highlights found</h3>
      <p class="text-secondary">Click "Create Highlight" to add a new one.</p>
    </div>

    <div v-else class="fade-in">
      <v-row>
        <v-col v-for="item in filteredHighlights" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="h-100 rounded-xl overflow-hidden d-flex flex-column bg-white highlight-card" elevation="0" border>
            <div class="thumbnail-wrapper position-relative" style="height: 160px;">
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
                <v-btn icon="mdi-pencil" size="x-small" color="white" variant="flat" @click="openDialog(item)" class="shadow-sm"></v-btn>
                <v-btn icon="mdi-delete" size="x-small" color="error" variant="flat" @click="deleteItem(item.id)" class="shadow-sm"></v-btn>
              </div>
            </div>
            
            <div class="pa-4 flex-grow-1 d-flex flex-column">
              <h3 class="text-subtitle-1 font-weight-bold mb-2 line-clamp-2" style="line-height: 1.4;">{{ item.title }}</h3>
              <p class="text-body-2 text-secondary line-clamp-3 mb-0">{{ item.description }}</p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="700" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 pb-4 text-h5 font-weight-bold d-flex align-center justify-space-between">
          {{ editedId ? 'Edit Highlight' : 'Add Highlight' }}
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" size="small"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0">
          <v-form ref="form" @submit.prevent="save" v-model="isValid">
            <v-row>
              <v-col cols="12">
                <AppInput
                  v-model="editedItem.title"
                  label="Highlight Title"
                  :rules="[v => !!v || 'Title is required']"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="Description"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="imageFile"
                  label="Image"
                  accept="image/*"
                  variant="outlined"
                  rounded="lg"
                  prepend-icon="mdi-camera"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-3">
          <v-btn class="text-none font-weight-bold" @click="closeDialog" :disabled="saving" variant="text">Cancel</v-btn>
          <AppButton @click="save" :loading="saving" :disabled="!isValid" icon="mdi-check">Save</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'lms_user']
});

const api = useApi();

const highlights = ref<any[]>([]);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const isValid = ref(false);
const form = ref<any>(null);
const searchQuery = ref('');

const editedId = ref<string | null>(null);
const editedItem = ref({
  title: '',
  description: ''
});
const imageFile = ref<any>(null);

const filteredHighlights = computed(() => {
  if (!searchQuery.value) return highlights.value;
  const lowerSearch = searchQuery.value.toLowerCase();
  return highlights.value.filter(h => h.title.toLowerCase().includes(lowerSearch));
});

const fetchHighlights = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/highlights');
    highlights.value = data || [];
  } catch (error: any) {
    alert(error.data?.message || 'Failed to fetch highlights');
  } finally {
    loading.value = false;
  }
};

const openDialog = (item?: any) => {
  if (item) {
    editedId.value = item.id;
    editedItem.value = {
      title: item.title,
      description: item.description || ''
    };
  } else {
    editedId.value = null;
    editedItem.value = {
      title: '',
      description: ''
    };
  }
  imageFile.value = null;
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedId.value = null;
  editedItem.value = { title: '', description: '' };
  imageFile.value = null;
};

const save = async () => {
  if (!isValid.value) return;
  saving.value = true;
  
  const formData = new FormData();
  formData.append('title', editedItem.value.title);
  formData.append('description', editedItem.value.description);
  
  if (imageFile.value) {
    formData.append('thumbnail', imageFile.value);
  }

  try {
    if (editedId.value) {
      await api.put(`/highlights/manage/${editedId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post('/highlights/manage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    closeDialog();
    fetchHighlights();
  } catch (error: any) {
    alert(error.data?.message || 'Failed to save highlight');
  } finally {
    saving.value = false;
  }
};

const deleteItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this highlight?')) return;
  try {
    await api.delete(`/highlights/manage/${id}`);
    fetchHighlights();
  } catch (error: any) {
    alert(error.data?.message || 'Failed to delete highlight');
  }
};

onMounted(() => {
  fetchHighlights();
});
</script>

<style scoped>
.highlight-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
}
.shadow-sm {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
}
</style>
