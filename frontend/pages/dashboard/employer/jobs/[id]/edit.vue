<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-4 mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Edit Job Posting</h1>
        <p class="text-grey-darken-1">Update the details of your job.</p>
      </div>
    </div>

    <!-- Rejection Alert -->
    <v-alert
      v-if="jobStatus === 'rejected'"
      type="error"
      variant="tonal"
      class="mb-6 rounded-lg"
      icon="mdi-alert-circle-outline"
    >
      <h3 class="text-h6 font-weight-bold mb-1">Job Rejected</h3>
      <p>{{ rejectionReason }}</p>
      <div class="mt-2 text-caption">Please make the necessary changes and resubmit for approval.</div>
    </v-alert>

    <v-card color="white" rounded="xl" border class="pa-6 shadow-card">
      <v-form ref="form">
        <v-row>
          <!-- Basic Info -->
          <v-col cols="12">
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Basic Information</h3>
            <v-text-field
              v-model="formData.title"
              label="Job Title"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Title is required']"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formData.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Job Category"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Category is required']"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.type"
              :items="['full_time', 'part_time', 'contract', 'internship']"
              label="Employment Type"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Type is required']"
            >
              <template v-slot:selection="{ item }">
                <span class="text-capitalize">{{ item.title.replace('_', ' ') }}</span>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" class="text-capitalize">{{ item.title.replace('_', ' ') }}</v-list-item>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.location"
              label="Location (City, Country)"
              variant="outlined"
              color="primary"
              :disabled="formData.is_remote"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6" class="d-flex align-center">
            <v-switch
              v-model="formData.is_remote"
              label="This is a Remote position"
              color="primary"
              hide-details
              inset
            ></v-switch>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.salary_range"
              label="Salary Range (e.g. $50k - $70k)"
              variant="outlined"
              color="primary"
              placeholder="Not Disclosed"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.deadline"
              label="Application Deadline"
              type="date"
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.experience_level"
              label="Experience Level"
              variant="outlined"
              color="primary"
              placeholder="e.g. 2-3 Years, Mid-Level"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.number_of_openings"
              label="Number of Openings"
              type="number"
              variant="outlined"
              color="primary"
              placeholder="1"
              min="1"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="my-6 opacity-20"></v-divider>

        <!-- Requirements -->
        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Requirements</h3>
        <v-row>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="formData.required_skills"
              label="Required Skills"
              multiple
              chips
              closable-chips
              variant="outlined"
              color="primary"
              hint="Press enter to add"
              persistent-hint
            ></v-combobox>
          </v-col>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="formData.nice_to_have_skills"
              label="Nice-to-Have Skills"
              multiple
              chips
              closable-chips
              variant="outlined"
              color="primary"
              hint="Press enter to add"
              persistent-hint
            ></v-combobox>
          </v-col>
        </v-row>

        <v-divider class="my-6 opacity-20"></v-divider>

        <!-- Description -->
        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Job Description</h3>
        <div class="tiptap-wrapper mb-6 rounded-lg border">
          <div class="toolbar pa-2 bg-grey-lighten-4 border-b d-flex gap-2">
            <v-btn size="small" variant="text" icon="mdi-format-bold" @click="editor?.chain().focus().toggleBold().run()" :color="editor?.isActive('bold') ? 'primary' : ''"></v-btn>
            <v-btn size="small" variant="text" icon="mdi-format-italic" @click="editor?.chain().focus().toggleItalic().run()" :color="editor?.isActive('italic') ? 'primary' : ''"></v-btn>
            <v-divider vertical class="mx-2"></v-divider>
            <v-btn size="small" variant="text" icon="mdi-format-list-bulleted" @click="editor?.chain().focus().toggleBulletList().run()" :color="editor?.isActive('bulletList') ? 'primary' : ''"></v-btn>
            <v-btn size="small" variant="text" icon="mdi-format-list-numbered" @click="editor?.chain().focus().toggleOrderedList().run()" :color="editor?.isActive('orderedList') ? 'primary' : ''"></v-btn>
          </div>
          <editor-content :editor="editor" class="editor-content pa-4 bg-white text-grey-darken-4 min-h-200" />
        </div>

        <!-- Application Link -->
        <v-text-field
          v-model="formData.apply_url"
          label="External Application URL or Email (Optional)"
          variant="outlined"
          color="primary"
          hint="Leave blank to use AEMS internal application system"
          persistent-hint
          class="mb-8"
        ></v-text-field>

        <div class="d-flex gap-4">
          <v-spacer></v-spacer>
          <v-btn variant="tonal" size="x-large" rounded="lg" @click="$router.back()" :disabled="loading">Cancel</v-btn>
          <v-btn v-if="authStore.userRole === 'employer' && (jobStatus === 'draft' || jobStatus === 'rejected')" variant="outlined" color="primary" size="x-large" rounded="lg" class="font-weight-bold" @click="submitJob('draft')" :loading="loading" :disabled="loading">
            Save Changes
          </v-btn>
          <v-btn color="primary" size="x-large" rounded="lg" class="font-weight-bold" @click="submitJob('submit')" :loading="loading" :disabled="loading" id="submit-job-btn">
            {{ jobStatus === 'rejected' ? 'Resubmit for Approval' : 'Submit for Approval' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from '#imports';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer', 'super_admin', 'tutor'] });

const api = useApi();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const form = ref<any>(null);
const loading = ref(false);
const categories = ref<any[]>([]);

const jobId = route.params.id as string;
const jobStatus = ref('');
const rejectionReason = ref('');

const formData = ref({
  title: '',
  category_id: null as any,
  location: '',
  is_remote: false,
  type: 'full_time',
  salary_range: '',
  description: '',
  required_skills: [] as any[],
  nice_to_have_skills: [] as any[],
  experience_level: '',
  number_of_openings: 1,
  deadline: '',
  apply_url: ''
});

const editor = shallowRef<Editor | undefined>(undefined);

onMounted(async () => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: '<p>Loading...</p>',
    onUpdate: ({ editor: tiptapEditor }) => {
      formData.value.description = tiptapEditor.getHTML();
    }
  });

  try {
    const { data } = await api.get('/public/job-categories');
    categories.value = data;
  } catch (error) {
    categories.value = [{ id: '1', name: 'Web Development' }];
  }

  // Fetch job
  try {
    const endpoint = authStore.isAdmin || authStore.userRole === 'tutor' 
      ? `/admin/jobs/${jobId}` 
      : `/employers/jobs/${jobId}`;
      
    // The current admin route doesn't have GET /jobs/:id, but employer does.
    // Employer gets array of jobs where id = ?, so it returns a single object.
    const res = await api.get(`/employers/jobs/${jobId}`);
    const job = res.data;
    
    if (job) {
      jobStatus.value = job.status;
      rejectionReason.value = job.rejection_reason;
      
      formData.value.title = job.title;
      formData.value.category_id = job.category;
      formData.value.location = job.location;
      formData.value.is_remote = !!job.is_remote;
      formData.value.type = job.type;
      formData.value.salary_range = job.salary_range;
      formData.value.deadline = job.deadline ? job.deadline.split('T')[0] : '';
      formData.value.apply_url = job.apply_url;
      
      let reqs = { required: [], nice_to_have: [], experience_level: '', number_of_openings: 1 };
      try { reqs = JSON.parse(job.requirements_json || '{}'); } catch (e) {}
      
      formData.value.required_skills = reqs.required || [];
      formData.value.nice_to_have_skills = reqs.nice_to_have || [];
      formData.value.experience_level = reqs.experience_level || '';
      formData.value.number_of_openings = reqs.number_of_openings || 1;
      
      formData.value.description = job.description || '';
      if (editor.value) {
        editor.value.commands.setContent(job.description || '');
      }
    }
  } catch (error) {
    console.error('Failed to fetch job', error);
    alert('Failed to load job details');
    router.back();
  }
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});

const submitJob = async (action: 'draft' | 'submit') => {
  const { valid } = await form.value?.validate() || { valid: false };
  if (!valid) return;

  loading.value = true;
  try {
    const payload = { ...formData.value, action };
    await api.put(`/employers/jobs/${jobId}`, payload);
    alert(action === 'submit' ? 'Job submitted for admin review!' : 'Job changes saved.');
    router.push('/dashboard/employer');
  } catch (error: any) {
    alert(error.data?.message || 'Failed to update job.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
.tiptap-wrapper {
  border-color: rgba(255,255,255,0.2) !important;
  overflow: hidden;
}
.min-h-200 {
  min-height: 200px;
}
::v-deep(.ProseMirror) {
  min-height: 200px;
  outline: none;
}
::v-deep(.ProseMirror p) {
  margin-bottom: 1em;
}
</style>
