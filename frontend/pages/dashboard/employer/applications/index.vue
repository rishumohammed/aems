<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black text-grey-darken-4 mb-2">Candidate Applications</h1>
        <p class="text-blue-grey-300">Review, shortlist, and manage job applicants.</p>
      </div>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-select
          v-model="statusFilter"
          :items="['All', 'Applied', 'Viewed', 'Shortlisted', 'Rejected']"
          label="Filter by Status"
          variant="outlined"
          color="primary"
          bg-color="rgba(255,255,255,0.05)"
          hide-details
          class="text-grey-darken-4"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search applicants by name, email, or skills..."
          variant="outlined"
          color="primary"
          bg-color="rgba(255,255,255,0.05)"
          hide-details
          class="text-grey-darken-4"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card color="white" rounded="xl" border class="shadow-card">
      <v-data-table
        :headers="headers"
        :items="filteredApplications"
        :loading="loading"
        :search="search"
        class="bg-transparent text-grey-darken-4 custom-table"
      >
        <template v-slot:item.applicant="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" class="mr-3 text-uppercase font-weight-bold">
              {{ item.user_name ? item.user_name.charAt(0) : (item.user_email ? item.user_email.charAt(0) : 'U') }}
            </v-avatar>
            <div>
              <div class="font-weight-bold text-h6">{{ item.user_name || 'Unknown Student' }}</div>
              <div class="text-caption text-blue-grey-300">{{ item.user_email || 'No email provided' }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.job="{ item }">
          <div class="font-weight-bold">{{ item.job_title }}</div>
          <div class="text-caption text-grey">Applied: {{ new Date(item.applied_at).toLocaleDateString() }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip 
            size="small" 
            variant="flat" 
            :color="getStatusColor(item.status)"
            class="text-uppercase font-weight-bold"
          >
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.resume="{ item }">
          <v-btn 
            v-if="item.resume_path"
            size="small" 
            variant="tonal" 
            color="info" 
            prepend-icon="mdi-file-pdf-box"
            :href="getResumeUrl(item.resume_path)"
            target="_blank"
          >
            View Resume
          </v-btn>
          <span v-else class="text-grey text-caption">No Resume</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <!-- View Full Profile -->
            <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-eye" @click="viewApplicant(item)">View Profile</v-btn>
            
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-chevron-down" variant="text" size="small" v-bind="props" color="grey-lighten-1"></v-btn>
              </template>
              <v-list bg-color="white" class="text-grey-darken-4 border border-opacity-10" rounded="lg">
                <v-list-item v-if="item.status !== 'shortlisted'" prepend-icon="mdi-star" title="Shortlist" @click="updateStatus(item.id, 'shortlisted')" color="success"></v-list-item>
                <v-list-item v-if="!item.interview_count" prepend-icon="mdi-calendar-clock" title="Schedule Interview" @click="openInterviewDialog(item)" color="info"></v-list-item>
                <v-list-item v-if="item.status !== 'rejected'" prepend-icon="mdi-close-circle" title="Reject" @click="updateStatus(item.id, 'rejected')" color="error"></v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-8 text-center text-blue-grey-300">
            <v-icon size="64" class="mb-4 opacity-50">mdi-account-search-outline</v-icon>
            <h3>No applications found.</h3>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Applicant Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card v-if="selectedApplicant" color="white" rounded="xl" border class="text-grey-darken-4">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between mb-6 border-b border-opacity-10 pb-4">
            <div class="d-flex align-center">
              <v-avatar size="64" color="primary" class="mr-4 text-h4 font-weight-bold">
                {{ selectedApplicant.user_name ? selectedApplicant.user_name.charAt(0) : (selectedApplicant.user_email ? selectedApplicant.user_email.charAt(0) : 'U') }}
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-black">{{ selectedApplicant.user_name || 'Unknown Student' }}</h2>
                <div class="text-blue-grey-300 mb-1">
                  {{ selectedApplicant.user_email || 'No Email' }} • 
                  {{ selectedApplicant.user_phone || selectedApplicant.applicant_phone || 'No Phone' }}
                </div>
                <v-chip size="x-small" color="grey" variant="tonal" class="font-weight-medium">ID: {{ selectedApplicant.student_id }}</v-chip>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold text-primary mb-2">Education & Experience</h4>
              <p><strong>Qualification:</strong> {{ selectedApplicant.qualification || 'N/A' }}</p>
              <p><strong>Institution:</strong> {{ selectedApplicant.institution || 'N/A' }} ({{ selectedApplicant.year_of_passing || 'N/A' }})</p>
              <p><strong>Experience:</strong> {{ selectedApplicant.experience_years || 0 }} years</p>
              <p><strong>Last Role:</strong> {{ selectedApplicant.last_role || 'N/A' }} at {{ selectedApplicant.last_company || 'N/A' }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold text-primary mb-2">Skills & Links</h4>
              <div class="mb-2">
                <v-chip v-for="(skill, i) in parseSkills(selectedApplicant.skills_json)" :key="i" size="small" class="mr-1 mb-1" color="indigo" variant="tonal">
                  {{ skill }}
                </v-chip>
                <span v-if="!parseSkills(selectedApplicant.skills_json).length" class="text-grey">No skills listed</span>
              </div>
              <v-btn v-if="selectedApplicant.linkedin" :href="selectedApplicant.linkedin" target="_blank" prepend-icon="mdi-linkedin" variant="tonal" size="small" color="blue" class="mt-2">LinkedIn Profile</v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4 border-opacity-10"></v-divider>

          <h4 class="text-subtitle-1 font-weight-bold text-primary mb-2">Cover Note</h4>
          <v-card color="rgba(255,255,255,0.05)" rounded="lg" class="pa-4 text-body-2" elevation="0">
            {{ selectedApplicant.cover_note || 'No cover note provided.' }}
          </v-card>

        </v-card-text>
        <v-card-actions class="pa-6 pt-0 d-flex gap-4 border-t border-opacity-10 mt-4">
          <v-spacer></v-spacer>
          <v-btn variant="tonal" color="error" @click="updateStatus(selectedApplicant.id, 'rejected')">Reject</v-btn>
          <v-btn color="success" variant="flat" class="font-weight-bold" @click="updateStatus(selectedApplicant.id, 'shortlisted')">Shortlist</v-btn>
          <v-btn v-if="!selectedApplicant.interview_count" color="info" variant="flat" class="font-weight-bold" @click="openInterviewDialog(selectedApplicant)">Schedule Interview</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Schedule Interview Dialog -->
    <v-dialog v-model="interviewDialog" max-width="500">
      <v-card color="white" rounded="xl" border class="text-grey-darken-4 pa-4">
        <v-card-title class="font-weight-bold">Schedule Interview</v-card-title>
        <v-card-text>
          <v-form ref="interviewForm" @submit.prevent="submitInterview">
            <v-text-field
              v-model="interviewData.scheduled_at"
              label="Date & Time"
              type="datetime-local"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4 mt-2"
            ></v-text-field>
            
            <v-select
              v-model="interviewData.type"
              :items="['Online', 'In-Person', 'Phone']"
              label="Interview Type"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model.number="interviewData.duration"
              label="Duration (minutes)"
              type="number"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="interviewData.type === 'Online'"
              v-model="interviewData.meeting_link"
              label="Meeting Link (Google Meet, Zoom, etc.)"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="interviewData.type === 'In-Person'"
              v-model="interviewData.location"
              label="Office Location / Address"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="interviewData.notes"
              label="Message / Notes for Candidate"
              variant="outlined"
              color="primary"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="interviewDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="interviewLoading" @click="submitInterview">Send Invitation</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const api = useApi();
const config = useRuntimeConfig();
const applications = ref<any[]>([]);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('All');

const detailDialog = ref(false);
const selectedApplicant = ref<any>(null);

const interviewDialog = ref(false);
const interviewLoading = ref(false);
const interviewForm = ref<any>(null);
const interviewData = ref({
  application_id: '',
  scheduled_at: '',
  type: 'Online',
  duration: 60,
  meeting_link: '',
  location: '',
  notes: ''
});

const headers: any[] = [
  { title: 'Candidate', key: 'applicant', sortable: true },
  { title: 'Applied Job', key: 'job', sortable: true },
  { title: 'Resume', key: 'resume', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadApplications();
});

const loadApplications = async () => {
  loading.value = true;
  try {
    const res = await api.get('/employers/applications');
    applications.value = res.data || res;
  } catch (error) {
    console.error('Failed to load applications', error);
  } finally {
    loading.value = false;
  }
};

const filteredApplications = computed(() => {
  if (statusFilter.value === 'All') return applications.value;
  return applications.value.filter(a => a.status.toLowerCase() === statusFilter.value.toLowerCase());
});

const parseSkills = (skillsJson: any) => {
  if (!skillsJson) return [];
  if (typeof skillsJson === 'string') {
    try { return JSON.parse(skillsJson); } catch(e) { return []; }
  }
  return skillsJson;
};

const getResumeUrl = (path: string) => {
  if (!path) return '#';
  // Replace Windows backslashes with forward slashes
  const normalizedPath = path.replace(/\\/g, '/');
  // Ensure the path starts with a slash
  const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${config.public.apiBase.replace('/api', '')}${finalPath}`;
};

const viewApplicant = async (item: any) => {
  if (item.status === 'applied') {
    await updateStatus(item.id, 'viewed', false);
  }
  navigateTo(`/dashboard/employer/applicants/${item.id}`);
};

const updateStatus = async (id: string, status: string, showPrompt = true) => {
  if (showPrompt && !confirm(`Update status to ${status}?`)) return;
  try {
    await api.patch(`/employers/applications/${id}/status`, { status });
    // Update locally
    const app = applications.value.find(a => a.id === id);
    if (app) app.status = status;
    if (selectedApplicant.value && selectedApplicant.value.id === id) {
      selectedApplicant.value.status = status;
    }
  } catch (error) {
    console.error('Failed to update status', error);
  }
};

const openInterviewDialog = (item: any) => {
  interviewData.value = {
    application_id: item.id,
    scheduled_at: '',
    type: 'Online',
    duration: 60,
    meeting_link: '',
    location: '',
    notes: ''
  };
  interviewDialog.value = true;
};

const submitInterview = async () => {
  const { valid } = await interviewForm.value?.validate() || { valid: false };
  if (!valid) return;
  
  interviewLoading.value = true;
  try {
    await api.post('/interviews', interviewData.value);
    
    // Update local state
    const app = applications.value.find(a => a.id === interviewData.value.application_id);
    if (app) app.interview_count = (app.interview_count || 0) + 1;
    if (selectedApplicant.value && selectedApplicant.value.id === interviewData.value.application_id) {
      selectedApplicant.value.interview_count = (selectedApplicant.value.interview_count || 0) + 1;
    }

    // Also mark as shortlisted if not already
    await updateStatus(interviewData.value.application_id, 'shortlisted', false);
    alert('Interview invitation sent!');
    interviewDialog.value = false;
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to schedule interview');
  } finally {
    interviewLoading.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'applied': return 'grey';
    case 'viewed': return 'info';
    case 'shortlisted': return 'success';
    case 'rejected': return 'error';
    default: return 'grey';
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
::v-deep(.custom-table) {
  background: transparent !important;
}
::v-deep(.custom-table th) {
  background: rgba(255,255,255,0.03) !important;
  color: #94a3b8 !important;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  padding: 16px !important;
}
::v-deep(.custom-table td) {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}
</style>
