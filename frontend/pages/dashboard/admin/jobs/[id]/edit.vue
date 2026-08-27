<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-4">
      <div class="d-flex align-center gap-4">
        <AppButton variant="g" icon="mdi-arrow-left" to="/dashboard/admin/jobs"></AppButton>
        <div>
          <div class="d-flex align-center gap-2">
            <h1 class="text-h4 font-weight-bold" style="color: var(--g7);">Edit Job Posting</h1>
            <Badge v-if="jobStatus" :color="getStatusBadgeColor(jobStatus)">
              {{ jobStatus }}
            </Badge>
          </div>
          <p style="color: var(--g4); font-size: 13px; font-weight: 500;" class="mt-1">
            <span v-if="formData.company">
              <v-icon size="small" class="mr-1">mdi-domain</v-icon>{{ formData.company }}
              <span class="mx-2">|</span>
            </span>
            <span>Job ID: {{ jobId }}</span>
            <span v-if="postedByInfo" class="ml-2">
              <span class="mx-1">•</span> Posted by: <strong>{{ postedByInfo }}</strong>
            </span>
          </p>
        </div>
      </div>

      <div class="d-flex align-center gap-3">
        <v-btn
          v-if="jobStatus === 'approved'"
          variant="outlined"
          color="primary"
          rounded="lg"
          prepend-icon="mdi-eye-outline"
          :to="`/jobs/${jobId}`"
          target="_blank"
        >
          View Public Post
        </v-btn>
        <AppButton variant="g" to="/dashboard/admin/jobs">
          Cancel
        </AppButton>
        <AppButton variant="blue" icon="mdi-content-save-outline" @click="saveJob" :loading="saving">
          Save Changes
        </AppButton>
      </div>
    </div>

    <!-- Alert / Status Notice -->
    <v-alert
      v-if="rejectionReason && jobStatus === 'rejected'"
      type="error"
      variant="tonal"
      class="mb-6 rounded-xl"
      icon="mdi-alert-circle-outline"
    >
      <h4 class="text-subtitle-1 font-weight-bold mb-1">Rejection Reason</h4>
      <p class="mb-0">{{ rejectionReason }}</p>
    </v-alert>

    <!-- Main Form Card -->
    <v-card color="white" rounded="xl" class="pa-6 pa-md-8 apple-form-card">
      <v-form ref="form" v-model="isFormValid" @submit.prevent="saveJob">
        <!-- Section 1: Basic Information & Publishing Status -->
        <div class="section-title mb-4">
          <v-icon size="20" color="primary" class="mr-2">mdi-information-outline</v-icon>
          <span class="text-h6 font-weight-bold">Basic Information &amp; Publishing</span>
        </div>

        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="formData.title"
              label="Job Title"
              placeholder="e.g. Senior Frontend Engineer"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Job title is required']"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.status"
              label="Publishing Status"
              :items="[
                { title: 'Approved / Live', value: 'approved' },
                { title: 'Pending Approval', value: 'pending_approval' },
                { title: 'Draft', value: 'draft' },
                { title: 'Rejected', value: 'rejected' },
                { title: 'Closed', value: 'closed' }
              ]"
              item-title="title"
              item-value="value"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Status is required']"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.company"
              label="Company Name (Optional if Hidden)"
              placeholder="e.g. Brix Certifications or Employer Organization"
              variant="outlined"
              color="primary"
              :disabled="formData.hide_company_name"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6" class="d-flex align-center">
            <v-switch
              v-model="formData.hide_company_name"
              label="Hide Company Name (Confidential Posting)"
              color="primary"
              hide-details
              inset
            ></v-switch>
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

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.type"
              :items="[
                { title: 'Full Time', value: 'full_time' },
                { title: 'Part Time', value: 'part_time' },
                { title: 'Contract', value: 'contract' },
                { title: 'Internship', value: 'internship' }
              ]"
              item-title="title"
              item-value="value"
              label="Employment Type"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Employment type is required']"
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.location"
              label="Location (City, Country)"
              placeholder="e.g. Bangalore, India"
              variant="outlined"
              color="primary"
              :disabled="formData.is_remote"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-center">
            <v-switch
              v-model="formData.is_remote"
              label="Remote Position"
              color="primary"
              hide-details
              inset
            ></v-switch>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.salary_range"
              label="Salary Range"
              placeholder="e.g. ₹6 LPA - ₹10 LPA or $50k - $70k"
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.deadline"
              label="Application Deadline"
              type="date"
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.number_of_openings"
              label="Number of Openings"
              type="number"
              variant="outlined"
              color="primary"
              min="1"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

        <!-- Section 2: Candidate Requirements & Eligibility -->
        <div class="section-title mb-4">
          <v-icon size="20" color="primary" class="mr-2">mdi-account-check-outline</v-icon>
          <span class="text-h6 font-weight-bold">Candidate Requirements &amp; Eligibility</span>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="formData.required_skills"
              label="Required Skills"
              placeholder="Type skill & press Enter"
              multiple
              chips
              closable-chips
              variant="outlined"
              color="primary"
              hint="Press Enter to add tags"
              persistent-hint
            ></v-combobox>
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              v-model="formData.nice_to_have_skills"
              label="Nice-to-Have Skills"
              placeholder="Type skill & press Enter"
              multiple
              chips
              closable-chips
              variant="outlined"
              color="primary"
              hint="Press Enter to add tags"
              persistent-hint
            ></v-combobox>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.experience_level"
              label="Experience Level"
              placeholder="e.g. 0-1 Years, 2-3 Years, Mid-Level"
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.qualification_req"
              label="Minimum Qualification"
              :items="['High School', 'Diploma', 'Bachelors', 'Masters', 'PhD']"
              variant="outlined"
              color="primary"
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.gender_preference"
              label="Gender Preference"
              :items="[
                { title: 'Any', value: 'any' },
                { title: 'Male', value: 'male' },
                { title: 'Female', value: 'female' },
                { title: 'Other', value: 'other' }
              ]"
              item-title="title"
              item-value="value"
              variant="outlined"
              color="primary"
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.language_req"
              label="Required Languages"
              :items="['English', 'Hindi', 'Malayalam', 'Tamil', 'Kannada', 'Telugu', 'Arabic', 'Spanish', 'French', 'German']"
              multiple
              chips
              variant="outlined"
              color="primary"
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.specialization_req"
              label="Specialization / Discipline"
              placeholder="e.g. Computer Science, Mechanical"
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formData.joining_status_req"
              label="Expected Joining Status"
              :items="['Immediate', '15 Days', '30 Days', '60 Days', '90 Days']"
              variant="outlined"
              color="primary"
              clearable
            ></v-select>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

        <!-- Section 3: Job Description -->
        <div class="section-title mb-4">
          <v-icon size="20" color="primary" class="mr-2">mdi-text-box-outline</v-icon>
          <span class="text-h6 font-weight-bold">Job Description</span>
        </div>

        <div class="tiptap-wrapper mb-6 rounded-lg border">
          <div class="toolbar pa-2 bg-grey-lighten-4 border-b d-flex gap-2 align-center">
            <v-btn size="small" variant="text" icon="mdi-format-bold" @click="editor?.chain().focus().toggleBold().run()" :color="editor?.isActive('bold') ? 'primary' : ''"></v-btn>
            <v-btn size="small" variant="text" icon="mdi-format-italic" @click="editor?.chain().focus().toggleItalic().run()" :color="editor?.isActive('italic') ? 'primary' : ''"></v-btn>
            <v-divider vertical class="mx-2"></v-divider>
            <v-btn size="small" variant="text" icon="mdi-format-list-bulleted" @click="editor?.chain().focus().toggleBulletList().run()" :color="editor?.isActive('bulletList') ? 'primary' : ''"></v-btn>
            <v-btn size="small" variant="text" icon="mdi-format-list-numbered" @click="editor?.chain().focus().toggleOrderedList().run()" :color="editor?.isActive('orderedList') ? 'primary' : ''"></v-btn>
          </div>
          <editor-content :editor="editor" class="editor-content pa-4 bg-white text-grey-darken-4 min-h-200" />
        </div>

        <v-divider class="my-6"></v-divider>

        <!-- Section 4: Application Link & Routing -->
        <div class="section-title mb-4">
          <v-icon size="20" color="primary" class="mr-2">mdi-link-variant</v-icon>
          <span class="text-h6 font-weight-bold">Application Routing</span>
        </div>

        <v-text-field
          v-model="formData.apply_url"
          label="External Application URL or Email (Optional)"
          placeholder="https://company.com/careers/apply or hr@company.com"
          variant="outlined"
          color="primary"
          hint="Leave blank to use the Brix Certifications integrated one-click applicant management system."
          persistent-hint
          class="mb-6"
        ></v-text-field>

        <!-- Form Actions Footer -->
        <div class="d-flex align-center justify-end gap-3 pt-4">
          <AppButton variant="g" to="/dashboard/admin/jobs" :disabled="saving">
            Cancel
          </AppButton>
          <AppButton variant="blue" icon="mdi-content-save-check" @click="saveJob" :loading="saving">
            Save Changes
          </AppButton>
        </div>
      </v-form>
    </v-card>

    <!-- Success / Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000" location="top right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useApi } from '@/composables/useApi';
import { useRouter, useRoute } from '#imports';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'sub_admin', 'placement_coordinator']
});

const api = useApi();
const router = useRouter();
const route = useRoute();

const jobId = route.params.id as string;
const form = ref<any>(null);
const isFormValid = ref(false);
const loading = ref(false);
const saving = ref(false);
const categories = ref<any[]>([]);

const jobStatus = ref('');
const rejectionReason = ref('');
const postedByInfo = ref('');

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const formData = ref({
  title: '',
  company: '',
  hide_company_name: false,
  status: 'approved',
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
  apply_url: '',
  gender_preference: 'any',
  qualification_req: null as string | null,
  language_req: [] as string[],
  specialization_req: '',
  joining_status_req: null as string | null
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

  await Promise.all([loadCategories(), loadJobDetails()]);
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});

async function loadCategories() {
  try {
    const { data } = await api.get('/admin/job-categories');
    categories.value = data;
  } catch (error) {
    console.error('Failed to load categories', error);
  }
}

async function loadJobDetails() {
  loading.value = true;
  try {
    const { data: job } = await api.get(`/admin/jobs/${jobId}`);
    if (job) {
      jobStatus.value = job.status;
      rejectionReason.value = job.rejection_reason || '';
      postedByInfo.value = job.employer_name ? `${job.employer_name} (${job.employer_email})` : '';

      formData.value.title = job.title || '';
      formData.value.company = job.company || 'Brix Certifications';
      formData.value.hide_company_name = !!job.hide_company_name;
      formData.value.status = job.status || 'approved';
      formData.value.category_id = job.category;
      formData.value.location = job.location || '';
      formData.value.is_remote = !!job.is_remote;
      formData.value.type = job.type || 'full_time';
      formData.value.salary_range = job.salary_range || '';
      formData.value.deadline = job.deadline ? job.deadline.split('T')[0] : '';
      formData.value.apply_url = job.apply_url || '';

      let reqs: any = {};
      try {
        reqs = typeof job.requirements_json === 'string' ? JSON.parse(job.requirements_json) : (job.requirements_json || {});
      } catch (e) {
        reqs = {};
      }

      formData.value.required_skills = Array.isArray(reqs.required) ? reqs.required : [];
      formData.value.nice_to_have_skills = Array.isArray(reqs.nice_to_have) ? reqs.nice_to_have : [];
      formData.value.experience_level = reqs.experience_level || '';
      formData.value.number_of_openings = reqs.number_of_openings || 1;

      formData.value.gender_preference = job.gender_preference || 'any';
      formData.value.qualification_req = job.qualification_req || null;

      let langs: string[] = [];
      try {
        langs = typeof job.language_req === 'string' ? JSON.parse(job.language_req) : (job.language_req || []);
      } catch (e) {
        langs = [];
      }
      formData.value.language_req = Array.isArray(langs) ? langs : [];
      formData.value.specialization_req = job.specialization_req || '';
      formData.value.joining_status_req = job.joining_status_req || null;

      formData.value.description = job.description || '';
      if (editor.value) {
        editor.value.commands.setContent(job.description || '');
      }
    }
  } catch (error: any) {
    console.error('Failed to load job details', error);
    snackbarText.value = 'Failed to load job details';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'approved': return 'green';
    case 'pending':
    case 'pending_approval': return 'warning';
    case 'rejected': return 'red';
    case 'closed': return 'gray';
    default: return 'blue';
  }
}

async function saveJob() {
  const { valid } = await form.value?.validate() || { valid: false };
  if (!valid) {
    snackbarText.value = 'Please fill all required fields.';
    snackbarColor.value = 'error';
    snackbar.value = true;
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...formData.value,
      description: editor.value?.getHTML() || formData.value.description
    };

    await api.put(`/admin/jobs/${jobId}`, payload);
    snackbarText.value = 'Job posting updated successfully!';
    snackbarColor.value = 'success';
    snackbar.value = true;

    setTimeout(() => {
      router.push('/dashboard/admin/jobs');
    }, 800);
  } catch (error: any) {
    console.error('Failed to save job', error);
    snackbarText.value = error.data?.message || error.message || 'Failed to update job';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.apple-form-card {
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.section-title {
  display: flex;
  align-items: center;
  color: var(--g7);
}

.tiptap-wrapper {
  border-color: rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
}

.min-h-200 {
  min-height: 200px;
}

:deep(.ProseMirror) {
  min-height: 200px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.ProseMirror p) {
  margin-bottom: 0.8em;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.8em;
}
</style>
