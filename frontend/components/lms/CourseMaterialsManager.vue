<template>
  <div class="course-materials-manager">
    <!-- Header & Action Bar -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <h2 class="text-h6 font-weight-black mb-1 d-flex align-center gap-2">
          <v-icon color="primary">mdi-folder-download-outline</v-icon>
          Course Study Materials
        </h2>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Upload and manage downloadable reference notes, guides, cheatsheets, and documents for this course.
        </p>
      </div>

      <div class="d-flex align-center gap-3">
        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          rounded="lg"
          size="small"
          color="grey-darken-2"
          :loading="loading"
          title="Refresh List"
          @click="fetchMaterials"
        ></v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-upload"
          class="font-weight-bold px-6 text-none"
          @click="openUploadModal"
        >
          Upload Material
        </v-btn>
      </div>
    </div>

    <!-- Error Alert if Fetching Fails -->
    <v-alert
      v-if="fetchError"
      type="error"
      variant="tonal"
      rounded="xl"
      class="mb-6"
      closable
      @click:close="fetchError = ''"
    >
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <span>{{ fetchError }}</span>
        <v-btn size="small" variant="text" color="error" class="font-weight-bold" @click="fetchMaterials">
          Try Again
        </v-btn>
      </div>
    </v-alert>

    <!-- Search / Filter Bar -->
    <v-card flat border rounded="xl" class="pa-4 mb-6 bg-grey-lighten-5">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search study materials..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            rounded="lg"
            bg-color="white"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="8" class="d-flex align-center justify-end text-caption text-grey">
          <span>Total Materials: <strong class="text-primary font-weight-bold">{{ filteredMaterials.length }}</strong></span>
        </v-col>
      </v-row>
    </v-card>

    <!-- Materials Table -->
    <v-data-table
      :headers="headers"
      :items="filteredMaterials"
      :loading="loading"
      class="elevation-0 rounded-xl border materials-table"
      no-data-text="No study materials uploaded for this course yet."
    >
      <!-- Title & Type Column -->
      <template v-slot:item.title="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="42" rounded="lg" :color="getFileTypeColor(getRow(item).file_type) + '-lighten-5'" class="mr-3 border">
            <v-icon size="24" :color="getFileTypeColor(getRow(item).file_type)">{{ getFileIcon(getRow(item).file_type) }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-grey-darken-4">{{ getRow(item).title || 'Untitled Document' }}</div>
            <div v-if="getRow(item).description" class="text-caption text-grey line-clamp-1 max-width-350">
              {{ getRow(item).description }}
            </div>
            <div class="text-caption text-grey-darken-1 font-weight-medium mt-0-5">
              File: {{ getRow(item).file_name || 'Downloadable attachment' }}
            </div>
          </div>
        </div>
      </template>

      <!-- Source / Origin Column -->
      <template v-slot:item.source_type="{ item }">
        <v-chip
          size="x-small"
          :color="getRow(item).source_type === 'direct' ? 'primary' : 'teal'"
          variant="tonal"
          class="font-weight-bold text-uppercase"
        >
          {{ getRow(item).source_type === 'direct' ? 'Study Material' : 'Lesson Attachment' }}
        </v-chip>
      </template>

      <!-- File Size Column -->
      <template v-slot:item.file_size="{ item }">
        <span class="text-caption font-weight-medium text-grey-darken-2">
          {{ getRow(item).file_size || 'PDF File' }}
        </span>
      </template>

      <!-- Uploaded Date Column -->
      <template v-slot:item.created_at="{ item }">
        <span class="text-caption text-grey-darken-1">
          {{ formatDate(getRow(item).created_at) }}
        </span>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center justify-end gap-1">
          <!-- Download / Preview -->
          <v-btn
            icon="mdi-download"
            size="small"
            variant="text"
            color="primary"
            title="Download Study Material"
            :href="getFullUrl(getRow(item).file_url)"
            target="_blank"
          ></v-btn>

          <!-- Edit (Direct materials only) -->
          <v-btn
            v-if="getRow(item).source_type === 'direct'"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            color="grey-darken-2"
            title="Edit Title & Description"
            @click="openEditModal(getRow(item))"
          ></v-btn>

          <!-- Delete (Direct materials only) -->
          <v-btn
            v-if="getRow(item).source_type === 'direct'"
            icon="mdi-trash-can-outline"
            size="small"
            variant="text"
            color="error"
            title="Delete Material"
            @click="openDeleteModal(getRow(item))"
          ></v-btn>
        </div>
      </template>

      <!-- Custom No Data Slot -->
      <template v-slot:no-data>
        <div class="py-8 text-center">
          <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-folder-open-outline</v-icon>
          <div class="text-subtitle-1 font-weight-bold text-grey-darken-2">No Study Materials Found</div>
          <div class="text-body-2 text-grey mb-4">
            {{ search ? 'No materials match your search filter.' : 'Upload reference notes, PDFs, or worksheets for this course.' }}
          </div>
          <v-btn
            v-if="!search"
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-upload"
            class="text-none font-weight-bold"
            @click="openUploadModal"
          >
            Upload First Material
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- ========================================== -->
    <!-- UPLOAD MATERIAL MODAL                      -->
    <!-- ========================================== -->
    <v-dialog v-model="uploadModal" max-width="560px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="primary" flat>
          <v-icon color="white" class="ml-4 mr-2">mdi-upload</v-icon>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Upload Study Material</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="uploadModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-alert
            v-if="uploadError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4 rounded-lg"
            closable
            @click:close="uploadError = ''"
          >
            {{ uploadError }}
          </v-alert>

          <v-form ref="uploadFormRef" @submit.prevent="submitUpload">
            <v-file-input
              v-model="uploadFile"
              label="Select PDF Document *"
              variant="outlined"
              rounded="lg"
              prepend-icon="mdi-file-pdf-box"
              accept=".pdf,application/pdf"
              hint="Study materials must be in PDF format."
              persistent-hint
              class="mb-4"
              :rules="[validatePdfRequired, validatePdfFormat]"
              @change="onFileSelected"
              @update:model-value="onFileModelUpdated"
            ></v-file-input>

            <v-text-field
              v-model="uploadForm.title"
              label="Material Title *"
              variant="outlined"
              rounded="lg"
              placeholder="e.g. Chapter 1 Summary & Lecture Notes"
              class="mb-4"
              :rules="[v => (!!v && !!v.trim()) || 'Material title is required']"
            ></v-text-field>

            <v-textarea
              v-model="uploadForm.description"
              label="Description / Notes (Optional)"
              variant="outlined"
              rounded="lg"
              rows="3"
              placeholder="Brief summary of what this study material covers..."
              class="mb-2"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="uploadModal = false" :disabled="uploading">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold text-none"
            :loading="uploading"
            :disabled="!hasSelectedFile"
            @click="submitUpload"
          >
            Upload Document
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- EDIT MATERIAL MODAL                        -->
    <!-- ========================================== -->
    <v-dialog v-model="editModal" max-width="500px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Edit Study Material</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="editModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-text-field
            v-model="editForm.title"
            label="Material Title *"
            variant="outlined"
            rounded="lg"
            class="mb-4"
            :rules="[v => !!v || 'Title is required']"
          ></v-text-field>

          <v-textarea
            v-model="editForm.description"
            label="Description / Notes"
            variant="outlined"
            rounded="lg"
            rows="3"
          ></v-textarea>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="editModal = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold text-none"
            :loading="editing"
            @click="submitEdit"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- DELETE MATERIAL MODAL                      -->
    <!-- ========================================== -->
    <v-dialog v-model="deleteModal" max-width="450px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="error" flat>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Delete Study Material</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="deleteModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <p class="text-body-1 text-grey-darken-3 mb-0">
            Are you sure you want to permanently delete <strong>{{ selectedMaterial?.title }}</strong>?
          </p>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="deleteModal = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold text-none"
            :loading="deleting"
            @click="submitDelete"
          >
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
      location="top right"
      rounded="pill"
    >
      <v-icon start :icon="snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'"></v-icon>
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import dayjs from 'dayjs';

const props = defineProps({
  courseId: { type: [String, Number], required: true },
  active: { type: Boolean, default: true }
});

const api = useApi();
const config = useRuntimeConfig();

const materials = ref([]);
const loading = ref(false);
const fetchError = ref('');
const search = ref('');

// Snackbar notification state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showNotification = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  };
};

// Vuetify 3 helper to safely extract row data whether item or item.raw
const getRow = (item) => {
  if (!item) return {};
  return item.raw || item;
};

const headers = [
  { title: 'Material / Document', key: 'title', align: 'start' },
  { title: 'Type', key: 'source_type', align: 'center' },
  { title: 'File Size', key: 'file_size', align: 'center' },
  { title: 'Upload Date', key: 'created_at', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
];

const filteredMaterials = computed(() => {
  if (!search.value) return materials.value;
  const q = search.value.toLowerCase().trim();
  return materials.value.filter(m => {
    const row = getRow(m);
    return (
      (row.title && row.title.toLowerCase().includes(q)) ||
      (row.description && row.description.toLowerCase().includes(q)) ||
      (row.file_name && row.file_name.toLowerCase().includes(q))
    );
  });
});

const fetchMaterials = async () => {
  if (!props.courseId) return;
  loading.value = true;
  fetchError.value = '';
  try {
    const { data } = await api.get(`/lms/courses/${props.courseId}/materials`);
    materials.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Failed to fetch course study materials:', error);
    fetchError.value = error.response?.data?.message || 'Failed to fetch course study materials';
  } finally {
    loading.value = false;
  }
};

// Upload State
const uploadModal = ref(false);
const uploading = ref(false);
const uploadError = ref('');
const uploadFile = ref(null);
const rawFile = ref(null);
const uploadFormRef = ref(null);
const uploadForm = ref({
  title: '',
  description: ''
});

// Checks if a file is present across rawFile and reactive models
const hasSelectedFile = computed(() => {
  if (rawFile.value) return true;
  if (!uploadFile.value) return false;
  if (Array.isArray(uploadFile.value)) return uploadFile.value.length > 0 && !!uploadFile.value[0];
  if (typeof uploadFile.value === 'object' && ('name' in uploadFile.value || 'size' in uploadFile.value)) return true;
  return false;
});

// Robust validation rules for Vuetify 3 v-file-input
const validatePdfRequired = (v) => {
  if (rawFile.value) return true;
  if (!v) return 'PDF file is required';
  if (Array.isArray(v)) {
    return (v.length > 0 && !!v[0]) ? true : 'PDF file is required';
  }
  if (typeof v === 'object' && ('name' in v || 'size' in v)) {
    return true;
  }
  return 'PDF file is required';
};

const validatePdfFormat = (v) => {
  const file = rawFile.value || (Array.isArray(v) ? v[0] : v);
  if (!file) return true;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  if (name && !name.endsWith('.pdf')) {
    return 'Only PDF documents are allowed';
  }
  if (type && !type.includes('pdf') && !name.endsWith('.pdf')) {
    return 'Only PDF documents are allowed';
  }
  return true;
};

const openUploadModal = () => {
  uploadFile.value = null;
  rawFile.value = null;
  uploadError.value = '';
  uploadForm.value = { title: '', description: '' };
  if (uploadFormRef.value) {
    uploadFormRef.value.resetValidation();
  }
  uploadModal.value = true;
};

const onFileSelected = (e) => {
  const file = e?.target?.files?.[0] || (Array.isArray(uploadFile.value) ? uploadFile.value[0] : uploadFile.value);
  if (file) {
    rawFile.value = file;
    if (file.name && (!uploadForm.value.title || !uploadForm.value.title.trim())) {
      uploadForm.value.title = file.name.replace(/\.[^/.]+$/, "");
    }
  }
};

const onFileModelUpdated = (val) => {
  const file = Array.isArray(val) ? val[0] : val;
  if (file && (file.name || file.size !== undefined)) {
    rawFile.value = file;
    if (file.name && (!uploadForm.value.title || !uploadForm.value.title.trim())) {
      uploadForm.value.title = file.name.replace(/\.[^/.]+$/, "");
    }
  } else if (!val || (Array.isArray(val) && val.length === 0)) {
    rawFile.value = null;
  }
};

const submitUpload = async () => {
  uploadError.value = '';

  const fileObj = rawFile.value || (Array.isArray(uploadFile.value) ? uploadFile.value[0] : uploadFile.value);
  if (!fileObj) {
    uploadError.value = 'Please select a PDF document to upload.';
    return;
  }

  const fileName = (fileObj.name || '').toLowerCase();
  if (fileName && !fileName.endsWith('.pdf')) {
    uploadError.value = 'Only PDF documents are allowed.';
    return;
  }

  if (!uploadForm.value.title || !uploadForm.value.title.trim()) {
    uploadError.value = 'Please enter a title for the study material.';
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('title', uploadForm.value.title.trim());
    if (uploadForm.value.description) {
      formData.append('description', uploadForm.value.description.trim());
    }

    const res = await api.post(`/lms/courses/${props.courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data?.material) {
      materials.value.unshift(res.data.material);
    }
    uploadModal.value = false;
    showNotification('Study material uploaded successfully!', 'success');
    await fetchMaterials();
  } catch (error) {
    console.error('Failed to upload study material:', error);
    const msg = error.response?.data?.message || 'Failed to upload study material. Please try again.';
    uploadError.value = msg;
    showNotification(msg, 'error');
  } finally {
    uploading.value = false;
  }
};

// Edit State
const editModal = ref(false);
const editing = ref(false);
const selectedMaterial = ref(null);
const editForm = ref({
  title: '',
  description: ''
});

const openEditModal = (material) => {
  const row = getRow(material);
  selectedMaterial.value = row;
  editForm.value = {
    title: row.title || '',
    description: row.description || ''
  };
  editModal.value = true;
};

const submitEdit = async () => {
  if (!selectedMaterial.value?.id) return;
  editing.value = true;
  try {
    await api.put(`/lms/courses/${props.courseId}/materials/${selectedMaterial.value.id}`, editForm.value);
    editModal.value = false;
    showNotification('Study material updated successfully', 'success');
    await fetchMaterials();
  } catch (error) {
    console.error('Failed to update study material:', error);
    showNotification(error.response?.data?.message || 'Failed to update study material', 'error');
  } finally {
    editing.value = false;
  }
};

// Delete State
const deleteModal = ref(false);
const deleting = ref(false);

const openDeleteModal = (material) => {
  const row = getRow(material);
  selectedMaterial.value = row;
  deleteModal.value = true;
};

const submitDelete = async () => {
  if (!selectedMaterial.value?.id) return;
  deleting.value = true;
  try {
    await api.delete(`/lms/courses/${props.courseId}/materials/${selectedMaterial.value.id}`);
    deleteModal.value = false;
    showNotification('Study material deleted successfully', 'success');
    await fetchMaterials();
  } catch (error) {
    console.error('Failed to delete study material:', error);
    showNotification(error.response?.data?.message || 'Failed to delete study material', 'error');
  } finally {
    deleting.value = false;
  }
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = config.public.apiBase.replace('/api', '');
  return base + url;
};

const getFileIcon = (ext) => {
  const e = (ext || '').toLowerCase();
  switch (e) {
    case 'pdf': return 'mdi-file-pdf-box';
    case 'doc':
    case 'docx': return 'mdi-file-word-box';
    case 'xls':
    case 'xlsx': return 'mdi-file-excel-box';
    case 'ppt':
    case 'pptx': return 'mdi-file-powerpoint-box';
    case 'zip':
    case 'rar':
    case '7z': return 'mdi-zip-box';
    case 'txt': return 'mdi-file-document-outline';
    default: return 'mdi-file-pdf-box';
  }
};

const getFileTypeColor = (ext) => {
  const e = (ext || '').toLowerCase();
  switch (e) {
    case 'pdf': return 'error';
    case 'doc':
    case 'docx': return 'primary';
    case 'xls':
    case 'xlsx': return 'success';
    case 'ppt':
    case 'pptx': return 'warning';
    case 'zip':
    case 'rar': return 'purple';
    default: return 'error';
  }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY');
};

// Watch courseId reactively so data fetches as soon as prop is available
watch(
  () => props.courseId,
  (newId) => {
    if (newId) {
      fetchMaterials();
    }
  },
  { immediate: true }
);

// Watch active prop so data fetches when switching to this tab
watch(
  () => props.active,
  (isActive) => {
    if (isActive && props.courseId) {
      fetchMaterials();
    }
  }
);

onMounted(() => {
  fetchMaterials();
});
</script>

<style scoped>
.max-width-350 {
  max-width: 350px;
}
.materials-table :deep(th) {
  font-weight: 700 !important;
  color: #475569 !important;
}
</style>
