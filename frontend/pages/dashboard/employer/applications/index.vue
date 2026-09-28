<template>
  <v-container fluid class="pa-6">
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Candidate Applications</h1>
        <p class="text-secondary mb-0">Review, match, shortlist, and manage job applicants.</p>
      </div>

      <!-- Quick match metrics pills -->
      <div class="d-flex gap-2">
        <v-chip color="success" variant="tonal" class="font-weight-bold" size="default">
          <v-icon start size="16">mdi-star-check</v-icon>
          {{ matchedApplicationsCount }} Criteria Matched
        </v-chip>
        <v-chip color="grey-darken-1" variant="tonal" class="font-weight-medium" size="default">
          {{ applications.length }} Total Applications
        </v-chip>
      </div>
    </div>

    <!-- Match Segmentation Tabs -->
    <v-card color="white" rounded="xl" border elevation="0" class="pa-3 mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3">
        <v-btn-toggle
          v-model="matchTab"
          mandatory
          color="primary"
          rounded="lg"
          variant="outlined"
          density="comfortable"
        >
          <v-btn value="matched" class="text-none font-weight-bold px-4">
            <v-icon start color="success" size="18">mdi-star-check</v-icon>
            Criteria Matched ({{ matchedApplicationsCount }})
          </v-btn>
          <v-btn value="all" class="text-none font-weight-medium px-4">
            All Applications ({{ applications.length }})
          </v-btn>
          <v-btn value="unmatched" class="text-none font-weight-medium px-4">
            Other / Unmatched ({{ unmatchedApplicationsCount }})
          </v-btn>
        </v-btn-toggle>

        <div v-if="matchTab === 'matched'" class="text-caption text-success font-weight-bold d-flex align-center">
          <v-icon size="14" class="mr-1">mdi-shield-check</v-icon>
          Showing applicants who meet qualification, experience, and skill criteria
        </div>
      </div>
    </v-card>

    <!-- Filters Row -->
    <v-row class="mb-4">
      <v-col cols="12" sm="3">
        <v-select
          v-model="statusFilter"
          :items="['All', 'Applied', 'Viewed', 'Shortlisted', 'Rejected']"
          label="Filter by Status"
          variant="outlined"
          color="primary"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="genderFilter"
          :items="['All', 'male', 'female', 'other']"
          label="Gender"
          variant="outlined"
          color="primary"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="qualificationFilter"
          :items="['All', 'High School', 'Diploma', 'Bachelors', 'Masters', 'PhD']"
          label="Qualification"
          variant="outlined"
          color="primary"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="joiningStatusFilter"
          :items="['All', 'Immediate', '15 Days', '30 Days', '60 Days', '90 Days']"
          label="Joining Status"
          variant="outlined"
          color="primary"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
    </v-row>

    <!-- Search bar -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search applicants by name, email, job title, or skills..."
          variant="outlined"
          color="primary"
          density="comfortable"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Applications Table -->
    <v-card color="white" rounded="xl" border elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredApplications"
        :loading="loading"
        :search="search"
        class="bg-transparent"
        :items-per-page="15"
      >
        <!-- Applicant Column -->
        <template v-slot:item.applicant="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" class="mr-3 text-uppercase font-weight-bold" size="38">
              {{ item.user_name ? item.user_name.charAt(0) : (item.user_email ? item.user_email.charAt(0) : 'U') }}
            </v-avatar>
            <div>
              <div class="font-weight-bold text-subtitle-1 text-grey-darken-4">{{ item.user_name || 'Unknown Student' }}</div>
              <div class="text-caption text-secondary">{{ item.user_email || 'No email' }} <span v-if="item.user_phone">• {{ item.user_phone }}</span></div>
            </div>
          </div>
        </template>

        <!-- Match Score Column -->
        <template v-slot:item.match="{ item }">
          <div class="py-2">
            <CandidateMatchBadge
              :score="item.matchScore"
              :is-match="item.isMatch"
              :criteria-breakdown="item.criteriaBreakdown"
              :matched-skills="item.matchedSkills"
              :missing-skills="item.missingSkills"
              size="md"
            />
          </div>
        </template>

        <!-- Job Applied -->
        <template v-slot:item.job="{ item }">
          <div class="py-1">
            <div class="font-weight-bold text-grey-darken-3">{{ item.job_title }}</div>
            <div class="text-caption text-secondary">Applied: {{ new Date(item.applied_at).toLocaleDateString() }}</div>
          </div>
        </template>

        <!-- Experience & Education -->
        <template v-slot:item.profile="{ item }">
          <div class="py-1">
            <div class="text-caption font-weight-bold text-grey-darken-3">
              {{ item.qualification || 'Qualification N/A' }}
            </div>
            <div class="text-caption text-secondary">
              {{ item.experience_years ? `${item.experience_years} Yrs Exp` : 'Fresher' }}
              <span v-if="item.joining_status">• {{ item.joining_status }}</span>
            </div>
          </div>
        </template>

        <!-- Application Status -->
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
        
        <!-- Resume -->
        <template v-slot:item.resume="{ item }">
          <v-btn 
            v-if="item.resume_path"
            size="small" 
            variant="tonal" 
            color="info" 
            prepend-icon="mdi-file-pdf-box"
            :href="getResumeUrl(item.resume_path)"
            target="_blank"
            class="text-none font-weight-bold"
          >
            Resume
          </v-btn>
          <span v-else class="text-grey text-caption">No Resume</span>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end align-center gap-1">
            <v-btn icon="mdi-eye-outline" variant="text" size="small" color="primary" @click="viewApplicant(item)" title="View Profile"></v-btn>
            <v-btn v-if="item.status !== 'shortlisted'" icon="mdi-star-outline" variant="text" size="small" color="success" @click="updateStatus(item.id, 'shortlisted')" title="Shortlist"></v-btn>
            <v-btn v-if="!item.interview_count" icon="mdi-calendar-clock" variant="text" size="small" color="info" @click="openInterviewDialog(item)" title="Schedule Interview"></v-btn>
            <v-btn v-if="item.status !== 'rejected'" icon="mdi-close-circle-outline" variant="text" size="small" color="error" @click="updateStatus(item.id, 'rejected')" title="Reject"></v-btn>
          </div>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-10 text-center text-secondary">
            <v-icon size="64" class="mb-4 opacity-40">mdi-account-search-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-1">
              {{ matchTab === 'matched' ? 'No criteria-matched applicants found.' : 'No applications found.' }}
            </h3>
            <p class="text-caption text-secondary">
              {{ matchTab === 'matched' ? 'Switch to "All Applications" to review other candidates, or source students from the talent pool.' : 'Try adjusting your filters.' }}
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Applicant Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="850">
      <v-card v-if="selectedApplicant" color="white" rounded="xl" border class="text-grey-darken-4">
        <v-card-text class="pa-6">
          <!-- Header -->
          <div class="d-flex align-center justify-space-between mb-6 border-b border-opacity-10 pb-4">
            <div class="d-flex align-center">
              <v-avatar size="64" color="primary" class="mr-4 text-h4 font-weight-bold">
                {{ selectedApplicant.user_name ? selectedApplicant.user_name.charAt(0) : (selectedApplicant.user_email ? selectedApplicant.user_email.charAt(0) : 'U') }}
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-black">{{ selectedApplicant.user_name || 'Unknown Student' }}</h2>
                <div class="text-secondary mb-1">
                  {{ selectedApplicant.user_email || 'No Email' }} • 
                  {{ selectedApplicant.user_phone || selectedApplicant.applicant_phone || 'No Phone' }}
                </div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="x-small" color="grey" variant="tonal" class="font-weight-medium">ID: {{ selectedApplicant.student_id }}</v-chip>
                  <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">{{ selectedApplicant.job_title }}</v-chip>
                </div>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
          </div>

          <!-- Match Score Breakdown Banner -->
          <div class="mb-6 pa-4 bg-grey-lighten-4 rounded-xl border">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-subtitle-2 font-weight-bold text-grey-darken-3">
                Job Matching Analysis
              </div>
              <CandidateMatchBadge
                :score="selectedApplicant.matchScore"
                :is-match="selectedApplicant.isMatch"
                :criteria-breakdown="selectedApplicant.criteriaBreakdown"
                :matched-skills="selectedApplicant.matchedSkills"
                :missing-skills="selectedApplicant.missingSkills"
                size="md"
              />
            </div>

            <!-- Matched vs Missing Skills -->
            <div class="d-flex flex-wrap gap-4 pt-2">
              <div v-if="selectedApplicant.matchedSkills?.length" class="flex-grow-1">
                <div class="text-caption font-weight-bold text-success mb-1">✓ Matched Required Skills:</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip v-for="s in selectedApplicant.matchedSkills" :key="s" size="x-small" color="success" variant="flat">
                    {{ s }}
                  </v-chip>
                </div>
              </div>
              <div v-if="selectedApplicant.missingSkills?.length" class="flex-grow-1">
                <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">Missing Skills:</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip v-for="s in selectedApplicant.missingSkills" :key="s" size="x-small" color="grey" variant="outlined">
                    {{ s }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold mb-2">Education & Experience</h4>
              <p><strong>Qualification:</strong> {{ selectedApplicant.qualification || 'N/A' }}</p>
              <p><strong>Institution:</strong> {{ selectedApplicant.institution || 'N/A' }} ({{ selectedApplicant.year_of_passing || 'N/A' }})</p>
              <p><strong>Experience:</strong> {{ selectedApplicant.experience_years || 0 }} years</p>
              <p><strong>Last Role:</strong> {{ selectedApplicant.last_role || 'N/A' }} at {{ selectedApplicant.last_company || 'N/A' }}</p>
              <p><strong>Gender:</strong> <span class="text-capitalize">{{ selectedApplicant.applicant_gender || 'Not specified' }}</span></p>
              <p><strong>Joining Status:</strong> {{ selectedApplicant.joining_status || 'Not specified' }}</p>
              <p><strong>Languages:</strong> {{ parseLanguages(selectedApplicant.language_proficiency) }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold mb-2">All Candidate Skills & Links</h4>
              <div class="mb-3">
                <v-chip v-for="(skill, i) in parseSkills(selectedApplicant.skills_json)" :key="i" size="small" class="mr-1 mb-1" color="indigo" variant="tonal">
                  {{ skill }}
                </v-chip>
                <span v-if="!parseSkills(selectedApplicant.skills_json).length" class="text-grey">No skills listed</span>
              </div>
              <v-btn v-if="selectedApplicant.linkedin" :href="selectedApplicant.linkedin" target="_blank" prepend-icon="mdi-linkedin" variant="tonal" size="small" color="blue" class="mt-2">LinkedIn Profile</v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4 border-opacity-10"></v-divider>

          <h4 class="text-subtitle-1 font-weight-bold mb-2">Cover Note</h4>
          <v-card color="rgba(0,0,0,0.02)" rounded="lg" class="pa-4 text-body-2 border" elevation="0">
            {{ selectedApplicant.cover_note || 'No cover note provided.' }}
          </v-card>

        </v-card-text>
        <v-card-actions class="pa-6 pt-0 d-flex gap-4 border-t border-opacity-10 mt-4">
          <v-btn v-if="selectedApplicant.resume_path" :href="getResumeUrl(selectedApplicant.resume_path)" target="_blank" variant="outlined" color="primary" prepend-icon="mdi-file-pdf-box">
            Download Resume
          </v-btn>
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
          <v-btn @click="interviewDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="interviewLoading" @click="submitInterview">Send Invitation</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import CandidateMatchBadge from '@/components/jobs/CandidateMatchBadge.vue';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();

const applications = ref<any[]>([]);
const loading = ref(false);
const search = ref('');
const matchTab = ref<'matched' | 'all' | 'unmatched'>('matched');
const statusFilter = ref('All');
const genderFilter = ref('All');
const qualificationFilter = ref('All');
const joiningStatusFilter = ref('All');

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

const headers = [
  { title: 'Candidate', key: 'applicant', sortable: true },
  { title: 'Job Match', key: 'match', sortable: true },
  { title: 'Applied Job', key: 'job', sortable: true },
  { title: 'Profile & Exp', key: 'profile', sortable: false },
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
    let url = '/employers/applications?';
    const jobParam = route.query.job || route.query.job_id;
    if (jobParam) url += `job_id=${encodeURIComponent(jobParam as string)}&`;
    if (genderFilter.value !== 'All') url += `gender=${encodeURIComponent(genderFilter.value)}&`;
    if (qualificationFilter.value !== 'All') url += `qualification=${encodeURIComponent(qualificationFilter.value)}&`;
    if (joiningStatusFilter.value !== 'All') url += `joining_status=${encodeURIComponent(joiningStatusFilter.value)}&`;
    
    const res = await api.get(url);
    applications.value = res.data || res || [];
  } catch (error) {
    console.error('Failed to load applications', error);
  } finally {
    loading.value = false;
  }
};

watch([genderFilter, qualificationFilter, joiningStatusFilter, () => route.query.job, () => route.query.job_id], () => {
  loadApplications();
});

const matchedApplicationsCount = computed(() => {
  return applications.value.filter(a => a.isMatch || (a.matchScore || 0) >= 50).length;
});

const unmatchedApplicationsCount = computed(() => {
  return applications.value.filter(a => !a.isMatch && (a.matchScore || 0) < 50).length;
});

const filteredApplications = computed(() => {
  let list = applications.value;

  // 1. Segmentation filter (Matched vs All vs Unmatched)
  if (matchTab.value === 'matched') {
    list = list.filter(a => a.isMatch || (a.matchScore || 0) >= 50);
  } else if (matchTab.value === 'unmatched') {
    list = list.filter(a => !a.isMatch && (a.matchScore || 0) < 50);
  }

  // 2. Status filter
  if (statusFilter.value !== 'All') {
    list = list.filter(a => a.status?.toLowerCase() === statusFilter.value.toLowerCase());
  }

  return list;
});

const parseSkills = (skillsJson: any) => {
  if (!skillsJson) return [];
  if (typeof skillsJson === 'string') {
    try { return JSON.parse(skillsJson); } catch(e) { return []; }
  }
  return skillsJson;
};

const parseLanguages = (langsJson: any) => {
  if (!langsJson) return 'Not specified';
  if (typeof langsJson === 'string') {
    try {
      const arr = JSON.parse(langsJson);
      if (Array.isArray(arr) && arr.length > 0) return arr.join(', ');
    } catch(e) {}
  } else if (Array.isArray(langsJson) && langsJson.length > 0) {
    return langsJson.join(', ');
  }
  return 'Not specified';
};

const getResumeUrl = (path: string) => {
  if (!path) return '#';
  const normalizedPath = path.replace(/\\/g, '/');
  const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${config.public.apiBase.replace('/api', '')}${finalPath}`;
};

const viewApplicant = async (item: any) => {
  if (item.status === 'applied') {
    await updateStatus(item.id, 'viewed', false);
  }
  selectedApplicant.value = item;
  detailDialog.value = true;
};

const updateStatus = async (id: string, status: string, showPrompt = true) => {
  if (showPrompt && !confirm(`Update status to ${status}?`)) return;
  try {
    await api.patch(`/employers/applications/${id}/status`, { status });
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
    
    const app = applications.value.find(a => a.id === interviewData.value.application_id);
    if (app) app.interview_count = (app.interview_count || 0) + 1;
    if (selectedApplicant.value && selectedApplicant.value.id === interviewData.value.application_id) {
      selectedApplicant.value.interview_count = (selectedApplicant.value.interview_count || 0) + 1;
    }

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
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
</style>
