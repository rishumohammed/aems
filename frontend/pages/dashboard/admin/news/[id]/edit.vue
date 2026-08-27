<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-4 mb-8">
      <v-btn icon="mdi-arrow-left" variant="text" to="/dashboard/admin/news" exact></v-btn>
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Edit News</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-0">Update this article.</p>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="blue"></v-progress-circular>
    </div>

    <v-card v-else class="rounded-xl border pa-6" elevation="0">
      <v-form ref="form" v-model="isValid" @submit.prevent="save">
        <v-row>
          <v-col cols="12">
            <AppInput
              v-model="formData.title"
              label="Article Title"
              placeholder="e.g. New Feature Announcement"
              :rules="[(v: any) => !!v || 'Title is required']"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="text-subtitle-2 font-weight-medium mb-2">Cover Image</p>
            <div class="image-upload-box d-flex flex-column align-center justify-center pa-6 rounded-lg position-relative"
                 @click="($refs.fileInput as any).click()"
                 :class="{'has-image': imagePreview}">
              <input 
                type="file" 
                ref="fileInput" 
                class="d-none" 
                accept="image/*"
                @change="handleImageUpload"
              >
              <template v-if="!imagePreview">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-cloud-upload-outline</v-icon>
                <div class="text-body-1 font-weight-medium">Click to upload cover image</div>
                <div class="text-caption text-secondary">JPEG, PNG up to 5MB</div>
              </template>
              <template v-else>
                <v-img :src="imagePreview" cover class="w-100 h-100 position-absolute rounded-lg" style="top:0; left:0;"></v-img>
                <v-btn 
                  icon="mdi-close" 
                  size="small" 
                  color="white" 
                  class="position-absolute top-0 right-0 ma-2 z-10"
                  @click.stop="clearImage"
                ></v-btn>
              </template>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="d-flex flex-column">
            <p class="text-subtitle-2 font-weight-medium mb-2">Publishing Options</p>
            <v-radio-group v-model="publishMode" inline hide-details class="mb-2">
              <v-radio label="Draft" value="draft" color="grey"></v-radio>
              <v-radio label="Publish Now" value="immediate" color="success"></v-radio>
              <v-radio label="Schedule" value="schedule" color="blue"></v-radio>
            </v-radio-group>
            
            <div v-if="publishMode === 'schedule'" class="mt-2">
              <AppInput 
                v-model="formData.published_at"
                type="datetime-local" 
                label="Scheduled Date & Time" 
                :rules="[(v: any) => !!v || 'Scheduled time is required']"
                hide-details
              />
            </div>
            <p v-else-if="publishMode === 'immediate'" class="text-caption text-secondary mt-2 ms-1">
              The article will be visible on the public website immediately upon saving.
            </p>
          </v-col>

          <v-col cols="12">
            <p class="text-subtitle-2 font-weight-medium mb-2">Content</p>
              <RichTextEditor v-model="formData.content" />
          </v-col>
        </v-row>

        <div class="d-flex justify-end gap-4 mt-8">
          <AppButton variant="outlined" to="/dashboard/admin/news">Cancel</AppButton>
          <AppButton type="submit" :loading="saving" :disabled="!isValid">Save Article</AppButton>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';
import { useRouter, useRoute } from 'vue-router';
import RichTextEditor from '~/components/RichTextEditor.vue';
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

const api = useApi();
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();

const form = ref<any>(null);
const isValid = ref(false);
const saving = ref(false);
const loading = ref(true);
const fileInput = ref<any>(null);

const id = route.params.id as string;

const publishMode = ref('draft');

const formData = ref({
  title: '',
  content: '',
  published_at: ''
});

const selectedFile = ref<File | null>(null);
const imagePreview = ref('');

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  selectedFile.value = null;
  imagePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const fetchNews = async () => {
  try {
    const { data } = await api.get(`/admin/news/${id}`);
    formData.value.title = data.title;
    formData.value.content = data.content || '';
    
    if (data.is_published && data.published_at) {
      const pubDate = new Date(data.published_at);
      if (pubDate > new Date()) {
        publishMode.value = 'schedule';
        const offset = pubDate.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(pubDate.getTime() - offset)).toISOString().slice(0,16);
        formData.value.published_at = localISOTime;
      } else {
        publishMode.value = 'immediate';
      }
    } else {
      publishMode.value = 'draft';
    }

    if (data.image_url) {
      imagePreview.value = config.public.apiBase.replace('/api', '') + data.image_url;
    }
  } catch (err) {
    console.error(err);
    alert('News not found');
    router.push('/dashboard/admin/news');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNews();
});

const save = async () => {
  if (!isValid.value) return;
  saving.value = true;
  
  try {
    const fd = new FormData();
    fd.append('title', formData.value.title);
    fd.append('content', formData.value.content);
    fd.append('publish_mode', publishMode.value);
    if (publishMode.value === 'schedule' && formData.value.published_at) {
      fd.append('published_at', new Date(formData.value.published_at).toISOString());
    }
    
    if (selectedFile.value) {
      fd.append('image', selectedFile.value);
    }
    
    await api.put(`/admin/news/${id}`, fd);
    router.push('/dashboard/admin/news');
  } catch (err: any) {
    alert(err.message || 'Failed to save news article');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.image-upload-box {
  border: 2px dashed rgba(0, 0, 0, 0.15);
  background: #f8f9fc;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 200px;
}
.image-upload-box:hover:not(.has-image) {
  border-color: var(--g1);
  background: rgba(var(--g1-rgb), 0.02);
}
.z-10 {
  z-index: 10;
}
</style>
