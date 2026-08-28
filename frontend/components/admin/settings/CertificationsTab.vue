<template>
  <div class="dashboard-page pa-4 pa-md-8 max-w-1200 mx-auto">
    <div class="page-header d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-8 gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Certifications & Standards</h1>
        <p class="text-body-1 text-secondary">Manage globally recognized certifications, inner explanation pages, and custom metadata.</p>
      </div>
      <AppButton icon="mdi-plus" size="lg" @click="openDialog()">
        Add Standard
      </AppButton>
    </div>

    <!-- Data Table -->
    <v-card variant="outlined" class="rounded-xl border-surface overflow-hidden">
      <v-table hover>
        <thead>
          <tr>
            <th class="font-weight-bold bg-surface-light px-6 py-4">Standard</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4">URL Slug</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4">Subtitle</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4">Inner Page Status</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4 text-center">Status</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4 text-center">Order</th>
            <th class="font-weight-bold bg-surface-light px-6 py-4 text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in standards" :key="item.id">
            <td class="px-6 py-4 font-weight-medium">
              <div class="d-flex align-center gap-2">
                <v-chip size="small" :color="item.color" variant="tonal" class="font-weight-bold">
                  <v-icon start size="small">{{ item.icon }}</v-icon>
                  {{ item.name }}
                </v-chip>
              </div>
            </td>
            <td class="px-6 py-4 text-primary font-weight-mono text-caption">
              /certifications/{{ item.slug || item.id }}
            </td>
            <td class="px-6 py-4 text-secondary">{{ item.sub }}</td>
            <td class="px-6 py-4">
              <v-chip size="x-small" :color="item.description ? 'blue-lighten-4' : 'grey-lighten-3'" :class="item.description ? 'text-blue-darken-3' : 'text-grey-darken-1'" variant="flat" class="font-weight-bold">
                {{ item.description ? 'Explanation Configured' : 'No Inner Page' }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-center">
              <v-chip size="small" :color="item.is_active ? 'success' : 'grey'" variant="flat" class="font-weight-bold">
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-center text-secondary">{{ item.sort_order }}</td>
            <td class="px-6 py-4 text-end">
              <v-btn icon="mdi-open-in-new" variant="text" size="small" color="info" :to="`/certifications/${item.slug || item.id}`" target="_blank" title="View Inner Page" class="mr-1"></v-btn>
              <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openDialog(item)" class="mr-1" title="Edit"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteItem(item.id)" title="Delete"></v-btn>
            </td>
          </tr>
          <tr v-if="!standards.length">
            <td colspan="7" class="text-center py-12 text-secondary">
              <v-icon size="48" color="grey-lighten-2" class="mb-4">mdi-certificate-outline</v-icon>
              <p>No standards found. Add one to get started.</p>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="900" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 pb-4 text-h5 font-weight-bold d-flex align-center justify-space-between border-b">
          {{ editedId ? 'Edit Certification Standard' : 'Add Certification Standard' }}
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" size="small"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-tabs v-model="modalTab" color="primary" class="mb-6 border-b">
            <v-tab value="basic" class="text-none font-weight-bold">Basic &amp; Sidebar Info</v-tab>
            <v-tab value="highlights" class="text-none font-weight-bold">Highlights Bar</v-tab>
            <v-tab value="benefits" class="text-none font-weight-bold">Key Benefits</v-tab>
            <v-tab value="content" class="text-none font-weight-bold">Rich HTML Explanation</v-tab>
          </v-tabs>

          <v-form ref="form" @submit.prevent="save">
            <v-window v-model="modalTab">
              <!-- Basic & Sidebar Tab -->
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.name"
                      label="Certification Name (e.g. ISO, FSSC)"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.sub"
                      label="Subtitle / Focus Area (e.g. Food Safety)"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.slug"
                      label="URL Slug (Optional)"
                      placeholder="e.g. iso or iso-9001-quality"
                      hint="Custom URL path for the inner page. Auto-generated from name if empty."
                      persistent-hint
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="editedItem.color"
                      :items="['primary', 'secondary', 'success', 'info', 'warning', 'error', 'teal', 'orange', 'deep-purple', 'indigo', 'red']"
                      label="Color Theme"
                      variant="outlined"
                      density="compact"
                    >
                      <template v-slot:selection="{ item }">
                        <v-chip size="small" :color="item.value" variant="flat">{{ item.title }}</v-chip>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.icon"
                      label="MDI Icon Class"
                      placeholder="mdi-certificate-outline"
                    >
                      <template v-slot:append-inner>
                        <v-icon :color="editedItem.color">{{ editedItem.icon }}</v-icon>
                      </template>
                    </AppInput>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.scope"
                      label="Sidebar Scope Label"
                      placeholder="International Standard"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <AppInput
                      v-model="editedItem.compliance_info"
                      label="Sidebar Audit Compliance Label"
                      placeholder="GFSI & ISO Aligned"
                    />
                  </v-col>

                  <v-col cols="12" sm="3">
                    <AppInput
                      v-model="editedItem.sort_order"
                      label="Sort Order"
                      type="number"
                    />
                  </v-col>

                  <v-col cols="12" sm="3">
                    <v-switch
                      v-model="editedItem.is_active"
                      label="Active Status"
                      color="success"
                      hide-details
                      class="mt-2"
                    ></v-switch>
                  </v-col>

                  <v-col cols="12">
                    <AppInput
                      v-model="editedItem.banner_image"
                      label="Banner / Hero Image URL (Optional)"
                      placeholder="https://example.com/images/iso-banner.jpg or /uploads/iso.jpg"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="editedItem.meta_description"
                      label="SEO Meta Description (Optional)"
                      placeholder="Brief summary of this certification standard for search engines..."
                      variant="outlined"
                      rows="2"
                      density="comfortable"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- Highlights Bar Tab -->
              <v-window-item value="highlights">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold">Highlights Bar Pills</h3>
                    <p class="text-caption text-secondary">Featured badges shown in the top 4 highlight boxes on the inner page.</p>
                  </div>
                  <v-btn size="small" color="primary" prepend-icon="mdi-plus" variant="tonal" @click="addHighlight">Add Highlight Pill</v-btn>
                </div>

                <v-card v-for="(h, idx) in editedItem.highlights" :key="idx" variant="outlined" class="pa-4 mb-3 rounded-lg border">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption font-weight-bold text-primary">Highlight #{{ Number(idx) + 1 }}</span>
                    <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removeHighlight(Number(idx))"></v-btn>
                  </div>
                  <v-row dense>
                    <v-col cols="12" sm="3">
                      <AppInput v-model="h.icon" label="MDI Icon" placeholder="mdi-earth" density="compact" />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <AppInput v-model="h.title" label="Title" placeholder="Global Standard" density="compact" />
                    </v-col>
                    <v-col cols="12" sm="5">
                      <AppInput v-model="h.sub" label="Subtitle" placeholder="Worldwide Acceptance" density="compact" />
                    </v-col>
                  </v-row>
                </v-card>

                <div v-if="!editedItem.highlights.length" class="text-center py-6 text-secondary">
                  <p>No custom highlights added. Default highlights will be shown.</p>
                </div>
              </v-window-item>

              <!-- Key Benefits Tab -->
              <v-window-item value="benefits">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold">Key Benefits List</h3>
                    <p class="text-caption text-secondary">Checkmarked benefits shown on the certification inner page.</p>
                  </div>
                  <v-btn size="small" color="primary" prepend-icon="mdi-plus" variant="tonal" @click="addBenefit">Add Benefit Item</v-btn>
                </div>

                <v-card v-for="(b, idx) in editedItem.benefits" :key="idx" variant="outlined" class="pa-4 mb-3 rounded-lg border">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption font-weight-bold text-primary">Benefit #{{ Number(idx) + 1 }}</span>
                    <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removeBenefit(Number(idx))"></v-btn>
                  </div>
                  <v-row dense>
                    <v-col cols="12" sm="5">
                      <AppInput v-model="b.title" label="Benefit Title" placeholder="Global Market Access" density="compact" />
                    </v-col>
                    <v-col cols="12" sm="7">
                      <AppInput v-model="b.desc" label="Description" placeholder="Fulfill compliance expectations required..." density="compact" />
                    </v-col>
                  </v-row>
                </v-card>

                <div v-if="!editedItem.benefits.length" class="text-center py-6 text-secondary">
                  <p>No custom benefits added. Default benefits will be shown.</p>
                </div>
              </v-window-item>

              <!-- Rich HTML Explanation Tab -->
              <v-window-item value="content">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-2">
                  Inner Page Overview &amp; Documentation (Rich Text)
                </div>
                <div class="tiptap-wrapper rounded-lg border overflow-hidden">
                  <div class="toolbar pa-2 bg-grey-lighten-4 border-b d-flex gap-2 align-center">
                    <v-btn size="small" variant="text" icon="mdi-format-bold" @click="editor?.chain().focus().toggleBold().run()" :color="editor?.isActive('bold') ? 'primary' : ''"></v-btn>
                    <v-btn size="small" variant="text" icon="mdi-format-italic" @click="editor?.chain().focus().toggleItalic().run()" :color="editor?.isActive('italic') ? 'primary' : ''"></v-btn>
                    <v-divider vertical class="mx-1"></v-divider>
                    <v-btn size="small" variant="text" icon="mdi-format-header-2" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :color="editor?.isActive('heading', { level: 2 }) ? 'primary' : ''"></v-btn>
                    <v-btn size="small" variant="text" icon="mdi-format-header-3" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" :color="editor?.isActive('heading', { level: 3 }) ? 'primary' : ''"></v-btn>
                    <v-divider vertical class="mx-1"></v-divider>
                    <v-btn size="small" variant="text" icon="mdi-format-list-bulleted" @click="editor?.chain().focus().toggleBulletList().run()" :color="editor?.isActive('bulletList') ? 'primary' : ''"></v-btn>
                    <v-btn size="small" variant="text" icon="mdi-format-list-numbered" @click="editor?.chain().focus().toggleOrderedList().run()" :color="editor?.isActive('orderedList') ? 'primary' : ''"></v-btn>
                  </div>
                  <editor-content :editor="editor" class="editor-content pa-4 bg-white text-grey-darken-4 min-h-250" />
                </div>
              </v-window-item>
            </v-window>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-3 border-t">
          <v-btn class="text-none font-weight-bold" @click="closeDialog" :disabled="saving" variant="text">Cancel</v-btn>
          <AppButton @click="save" :loading="saving" :disabled="!isFormValid" icon="mdi-check">Save Certification Standard</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notification -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" rounded="lg" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useApi } from '@/composables/useApi';

const api = useApi();
const standards = ref<any[]>([]);
const dialog = ref(false);
const modalTab = ref('basic');
const form = ref<any>(null);
const saving = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const defaultItem = {
  name: '',
  sub: '',
  slug: '',
  icon: 'mdi-certificate-outline',
  color: 'primary',
  scope: 'International Standard',
  compliance_info: 'GFSI & ISO Aligned',
  description: '',
  banner_image: '',
  meta_description: '',
  highlights: [
    { icon: 'mdi-earth', title: 'Global Standard', sub: 'Worldwide Acceptance' },
    { icon: 'mdi-shield-check', title: 'Audit Ready', sub: 'GFSI Benchmarked' },
    { icon: 'mdi-school', title: 'Expert Training', sub: 'Certified Lead Auditors' },
    { icon: 'mdi-file-document-check', title: 'Verifiable Certs', sub: 'Online Validation' }
  ],
  benefits: [
    { title: 'Global Market Access', desc: 'Fulfill compliance expectations required by international retailers and buyers.' },
    { title: 'Risk Reduction', desc: 'Identify critical control points to minimize food safety and operational hazards.' },
    { title: 'Process Efficiency', desc: 'Standardize management procedures to improve productivity and quality.' },
    { title: 'Brand Trust & Recognition', desc: 'Demonstrate commitment to international food safety and quality standards.' }
  ],
  sort_order: 0,
  is_active: true
};

const editedId = ref<number | null>(null);
const editedItem = ref<any>({ ...defaultItem });

const editor = shallowRef<Editor | undefined>(undefined);

const isFormValid = computed(() => {
  return !!(
    editedItem.value?.name && String(editedItem.value.name).trim() &&
    editedItem.value?.sub && String(editedItem.value.sub).trim() &&
    editedItem.value?.icon && String(editedItem.value.icon).trim()
  );
});

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: '<p>Write certification explanation and guidelines here...</p>',
    onUpdate: ({ editor: tiptapEditor }) => {
      editedItem.value.description = tiptapEditor.getHTML();
    }
  });

  fetchStandards();
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});

const parseJson = (val: any, fallback: any[]) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

const fetchStandards = async () => {
  try {
    const { data } = await api.get('/admin/master-standards');
    standards.value = data;
  } catch (error) {
    console.error('Failed to fetch standards:', error);
  }
};

const openDialog = (item?: any) => {
  modalTab.value = 'basic';
  if (item) {
    editedId.value = item.id;
    editedItem.value = { 
      ...item, 
      slug: item.slug || '',
      scope: item.scope || 'International Standard',
      compliance_info: item.compliance_info || 'GFSI & ISO Aligned',
      description: item.description || '',
      banner_image: item.banner_image || '',
      meta_description: item.meta_description || '',
      highlights: parseJson(item.highlights_json, defaultItem.highlights),
      benefits: parseJson(item.benefits_json, defaultItem.benefits),
      is_active: !!item.is_active 
    };
    if (editor.value) {
      editor.value.commands.setContent(item.description || '<p>Write certification explanation and guidelines here...</p>');
    }
  } else {
    editedId.value = null;
    editedItem.value = { ...defaultItem, sort_order: standards.value.length + 1 };
    if (editor.value) {
      editor.value.commands.setContent('<p>Write certification explanation and guidelines here...</p>');
    }
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  if (form.value) form.value.resetValidation();
};

const addHighlight = () => {
  editedItem.value.highlights.push({ icon: 'mdi-star', title: 'New Highlight', sub: 'Subtitle' });
};

const removeHighlight = (idx: number | string) => {
  const index = typeof idx === 'string' ? parseInt(idx, 10) : idx;
  editedItem.value.highlights.splice(index, 1);
};

const addBenefit = () => {
  editedItem.value.benefits.push({ title: 'New Benefit', desc: 'Description of the benefit...' });
};

const removeBenefit = (idx: number | string) => {
  const index = typeof idx === 'string' ? parseInt(idx, 10) : idx;
  editedItem.value.benefits.splice(index, 1);
};

const save = async () => {
  if (!isFormValid.value) {
    snackbarMessage.value = 'Please fill in required fields: Name, Subtitle, and Icon';
    snackbarColor.value = 'warning';
    snackbar.value = true;
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...editedItem.value,
      highlights_json: editedItem.value.highlights,
      benefits_json: editedItem.value.benefits,
      description: editor.value?.getHTML() || editedItem.value.description
    };

    if (editedId.value) {
      await api.put(`/admin/master-standards/${editedId.value}`, payload);
      snackbarMessage.value = 'Certification standard updated successfully';
    } else {
      await api.post('/admin/master-standards', payload);
      snackbarMessage.value = 'Certification standard created successfully';
    }
    snackbarColor.value = 'success';
    snackbar.value = true;
    await fetchStandards();
    closeDialog();
  } catch (error: any) {
    console.error('Failed to save standard:', error);
    snackbarMessage.value = error.response?.data?.message || 'Failed to save certification standard';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    saving.value = false;
  }
};

const deleteItem = async (id: number) => {
  if (confirm('Are you sure you want to delete this standard?')) {
    try {
      await api.delete(`/admin/master-standards/${id}`);
      snackbarMessage.value = 'Certification standard deleted successfully';
      snackbarColor.value = 'success';
      snackbar.value = true;
      await fetchStandards();
    } catch (error: any) {
      console.error('Failed to delete standard:', error);
      snackbarMessage.value = error.response?.data?.message || 'Failed to delete certification standard';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  }
};
</script>

<style scoped>
.min-h-250 {
  min-height: 250px;
}
:deep(.ProseMirror) {
  min-height: 250px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
}
:deep(.ProseMirror p) {
  margin-bottom: 0.8em;
}
:deep(.ProseMirror h2) {
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 1em;
  margin-bottom: 0.5em;
}
:deep(.ProseMirror h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
}
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.8em;
}
</style>
