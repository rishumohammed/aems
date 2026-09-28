<template>
  <v-container fluid class="pa-6">
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div class="d-flex align-center gap-4">
        <AppButton variant="g" icon="mdi-arrow-left" to="/dashboard/admin/jobs"></AppButton>
        <div>
          <div class="d-flex align-center gap-2">
            <h1 class="text-h4 font-weight-bold mb-1" style="color: var(--g7);">Applicants: {{ job?.title }}</h1>
            <Badge color="blue">Admin Portal</Badge>
          </div>
          <p style="color: var(--g4); font-size: 13px; font-weight: 500;" class="mb-0">
            <v-icon size="small" class="mr-1">mdi-domain</v-icon> {{ job?.company }} <span class="mx-2">|</span> 
            <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> {{ job?.location || 'Remote' }}
          </p>
        </div>
      </div>
      
      <div class="d-flex align-center gap-2">
        <AppButton variant="blue" icon="mdi-account-search" @click="openTalentPoolDrawer">
          ✨ Matching Talent Pool
        </AppButton>
        <AppButton variant="g" icon="mdi-download" @click="exportCSV">
          Export CSV
        </AppButton>
      </div>
    </div>

    <!-- Match Segmentation Bar -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4 bg-white pa-3 rounded-lg border">
      <v-btn-toggle
        v-model="matchTab"
        mandatory
        color="primary"
        rounded="lg"
        variant="outlined"
        density="compact"
      >
        <v-btn value="matched" class="text-none font-weight-bold px-3">
          <v-icon start color="success" size="16">mdi-star-check</v-icon>
          Criteria Matched ({{ matchedCount }})
        </v-btn>
        <v-btn value="all" class="text-none font-weight-medium px-3">
          All Applicants ({{ applicants.length }})
        </v-btn>
        <v-btn value="unmatched" class="text-none font-weight-medium px-3">
          Other / Unmatched ({{ unmatchedCount }})
        </v-btn>
      </v-btn-toggle>

      <div class="d-flex align-center gap-2">
        <span class="text-caption text-secondary font-weight-bold">Status:</span>
        <v-select
          v-model="statusFilter"
          :items="['All', 'applied', 'viewed', 'shortlisted', 'selected', 'rejected']"
          density="compact"
          variant="outlined"
          hide-details
          style="min-width: 140px;"
        ></v-select>
      </div>
    </div>

    <div class="apple-table-card">
      <v-data-table
        :headers="headers"
        :items="filteredApplicants"
        :loading="loading"
        class="apple-data-table"
      >
        <!-- Applicant Name & Avatar -->
        <template v-slot:item.applicant_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="34" class="mr-3 font-weight-bold text-caption">
              <v-img v-if="item.avatar_url" :src="item.avatar_url"></v-img>
              <span v-else>{{ (item.applicant_name || item.fallback_name || 'U').charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="applicant-name">
                {{ item.applicant_name || item.fallback_name || 'Student Candidate' }}
              </div>
              <div class="applicant-email">
                {{ item.applicant_email || item.fallback_email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Match Score Badge -->
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

        <!-- Brix Certifications Progress (Courses & Certs) -->
        <template v-slot:item.brixify_progress="{ item }">
          <div class="d-flex flex-column gap-1 align-start justify-center">
            <Badge color="gray">{{ item.courses_completed || 0 }} Courses</Badge>
            <Badge :color="(item.certs_active || 0) > 0 ? 'green' : 'gray'">
              {{ item.certs_active || 0 }} Certs
            </Badge>
          </div>
        </template>

        <!-- Experience & Edu -->
        <template v-slot:item.experience="{ item }">
          <div class="role-text">{{ item.last_role || 'Fresher' }}</div>
          <div class="exp-text">{{ item.experience_years || 0 }} Yrs • {{ item.qualification || 'N/A' }}</div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <div class="status-select">
            <AppInput
              v-model="item.status"
              type="select"
              :options="[
                { label: 'Applied', value: 'applied' },
                { label: 'Viewed', value: 'viewed' },
                { label: 'Shortlisted', value: 'shortlisted' },
                { label: 'Selected', value: 'selected' },
                { label: 'Rejected', value: 'rejected' }
              ]"
              @update:modelValue="updateStatus(item.id, $event)"
            />
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn icon="mdi-file-document-outline" variant="text" size="small" color="grey-darken-1" @click="viewApplication(item)" title="View Application Details"></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center text-secondary">
            <v-icon size="48" class="mb-2 opacity-50">mdi-account-search-outline</v-icon>
            <div class="font-weight-bold">No applicants found in this view.</div>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Application Details Modal -->
    <AppModal
      v-model="detailsDialog"
      title="Application Details"
      large
    >
      <div v-if="selectedApp">
        <!-- Match Breakdown Header -->
        <div class="mb-4 pa-3 bg-grey-lighten-4 rounded-lg border d-flex align-center justify-space-between">
          <div>
            <div class="text-caption font-weight-bold text-secondary text-uppercase">Criteria Match Score</div>
            <div class="text-subtitle-2 font-weight-bold text-grey-darken-4">Evaluated for {{ job?.title }}</div>
          </div>
          <CandidateMatchBadge
            :score="selectedApp.matchScore"
            :is-match="selectedApp.isMatch"
            :criteria-breakdown="selectedApp.criteriaBreakdown"
            :matched-skills="selectedApp.matchedSkills"
            :missing-skills="selectedApp.missingSkills"
            size="md"
          />
        </div>

        <!-- Personal & Contact -->
        <div class="mb-4">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Personal & Contact</h4>
          <p style="color: var(--g7); font-weight: 500; font-size: 14px; line-height: 1.6;">
            <strong>Email:</strong> {{ selectedApp.applicant_email || selectedApp.fallback_email }} <br>
            <strong>Phone:</strong> {{ selectedApp.applicant_phone || 'N/A' }} <br>
            <strong>Location:</strong> {{ selectedApp.city || 'N/A' }} <br>
            <strong>Gender:</strong> {{ selectedApp.applicant_gender || selectedApp.gender || 'N/A' }} <br>
            <strong>Joining Status:</strong> {{ selectedApp.joining_status || 'N/A' }}
          </p>
          <a v-if="selectedApp.linkedin" :href="selectedApp.linkedin" target="_blank" style="color: var(--blue); text-decoration: none; font-size: 14px; font-weight: 500;">LinkedIn Profile</a>
        </div>

        <!-- Education Snapshot -->
        <div class="mb-4">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Education</h4>
          <p style="color: var(--g7); font-weight: 500; font-size: 14px;">{{ selectedApp.qualification }} <span v-if="selectedApp.field_of_study">in {{ selectedApp.field_of_study }}</span></p>
          <p style="color: var(--g5); font-size: 13px;">{{ selectedApp.institution || 'N/A' }} (Class of {{ selectedApp.year_of_passing || 'N/A' }})</p>
        </div>

        <!-- Experience Snapshot -->
        <div class="mb-4">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Experience & Skills</h4>
          <p style="color: var(--g7); font-weight: 500; font-size: 14px;">
            {{ selectedApp.experience_years || 0 }} Years of Experience
          </p>
          <div v-if="getSkills(selectedApp.skills_json).length" class="mt-2 d-flex flex-wrap gap-2">
            <v-chip 
              v-for="skill in getSkills(selectedApp.skills_json)" 
              :key="skill" 
              size="small" 
              :color="selectedApp.matchedSkills?.includes(skill) ? 'success' : 'primary'" 
              variant="flat"
            >
              {{ selectedApp.matchedSkills?.includes(skill) ? '✓ ' : '' }}{{ skill }}
            </v-chip>
          </div>
        </div>

        <!-- Platform Courses & Certs -->
        <div class="mb-4" v-if="selectedApp.completed_course_names">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Platform Courses Completed</h4>
          <div class="mt-2 d-flex flex-wrap gap-2">
            <v-chip v-for="course in selectedApp.completed_course_names.split('||')" :key="course" size="small" color="success" variant="flat">
              <v-icon start size="small">mdi-check-circle</v-icon>
              {{ course }}
            </v-chip>
          </div>
        </div>

        <div class="mb-4" v-if="selectedApp.cover_note">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Cover Note</h4>
          <div class="bg-white pa-4 rounded-lg text-body-2" style="border: 1px solid var(--border); color: var(--g7);">
            {{ selectedApp.cover_note }}
          </div>
        </div>

        <AppButton block size="lg" variant="g" class="mt-4" v-if="selectedApp.resume_path" @click="downloadResume(selectedApp.resume_path)">
          Download Resume
        </AppButton>
      </div>
      <template #footer>
        <AppButton variant="g" @click="detailsDialog = false">Close</AppButton>
      </template>
    </AppModal>

    <!-- Talent Pool Sourcing Modal -->
    <v-dialog v-model="talentPoolDialog" max-width="900" scrollable>
      <v-card color="white" rounded="xl" border class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="d-flex align-center gap-2">
              <h2 class="text-h5 font-weight-bold text-grey-darken-4 mb-0">Matching Talent Pool</h2>
              <Badge color="green">Candidate Sourcing</Badge>
            </div>
            <div class="text-caption text-secondary">
              Registered platform students matching criteria for <strong>{{ job?.title }}</strong>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="talentPoolDialog = false"></v-btn>
        </div>

        <v-divider class="mb-4 border-opacity-10"></v-divider>

        <div class="mb-4 d-flex gap-4 align-center">
          <v-text-field
            v-model="talentSearch"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search matching talent..."
            variant="outlined"
            density="compact"
            hide-details
            class="flex-grow-1"
          ></v-text-field>
        </div>

        <v-card-text style="max-height: 500px;" class="pa-0">
          <div v-if="talentLoading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <div class="mt-2 text-caption text-secondary">Calculating match scores...</div>
          </div>

          <div v-else-if="filteredTalentPool.length === 0" class="pa-8 text-center text-secondary">
            <v-icon size="48" class="mb-2 opacity-50">mdi-account-off-outline</v-icon>
            <div>No matching students found in the talent pool.</div>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div
              v-for="candidate in filteredTalentPool"
              :key="candidate.id"
              class="pa-4 rounded-xl border d-flex flex-wrap align-center justify-space-between gap-3"
            >
              <div class="d-flex align-center gap-3">
                <v-avatar color="primary" size="42" class="font-weight-bold text-caption">
                  {{ candidate.name?.charAt(0) || 'U' }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-subtitle-2 text-grey-darken-4">
                    {{ candidate.name }}
                  </div>
                  <div class="text-caption text-secondary">
                    {{ candidate.education_level || candidate.qualification || 'Student' }}
                    <span v-if="candidate.college_name"> • {{ candidate.college_name }}</span>
                    <span v-if="candidate.experience_years"> • {{ candidate.experience_years }} Yrs Exp</span>
                  </div>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    <v-chip
                      v-for="skill in (candidate.matchedSkills || []).slice(0, 3)"
                      :key="skill"
                      size="x-small"
                      color="success"
                      variant="flat"
                    >
                      ✓ {{ skill }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <div class="d-flex align-center gap-3">
                <CandidateMatchBadge
                  :score="candidate.matchScore"
                  :is-match="candidate.isMatch"
                  :criteria-breakdown="candidate.criteriaBreakdown"
                  :matched-skills="candidate.matchedSkills"
                  :missing-skills="candidate.missingSkills"
                  size="md"
                />

                <div v-if="candidate.has_applied">
                  <Badge color="blue">Applied</Badge>
                </div>
                <AppButton
                  v-else
                  size="sm"
                  variant="blue"
                  icon="mdi-send"
                  @click="inviteCandidate(candidate)"
                >
                  Invite
                </AppButton>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import CandidateMatchBadge from '@/components/jobs/CandidateMatchBadge.vue';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], roles: ['super_admin'] });

const route = useRoute();
const api = useApi();
const jobId = route.params.id as string;

const job = ref<any>(null);
const applicants = ref<any[]>([]);
const loading = ref(false);
const matchTab = ref<'matched' | 'all' | 'unmatched'>('matched');
const statusFilter = ref('All');

const detailsDialog = ref(false);
const selectedApp = ref<any>(null);

const talentPoolDialog = ref(false);
const talentLoading = ref(false);
const talentPool = ref<any[]>([]);
const talentSearch = ref('');

const headers: any[] = [
  { title: 'Applicant', key: 'applicant_name', sortable: true },
  { title: 'Job Match', key: 'match', sortable: true },
  { title: 'Brix Credentials', key: 'brixify_progress', sortable: false },
  { title: 'Experience/Edu', key: 'experience', sortable: true },
  { title: 'Applied On', key: 'applied_at', sortable: true },
  { title: 'Status', key: 'status', sortable: true, width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadApplicants();
});

const loadApplicants = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/admin/jobs/${jobId}/applicants`);
    job.value = data?.job;
    applicants.value = (data?.applicants || []).map((a: any) => ({ ...a, status: a.status || 'applied' }));
  } catch (error) {
    console.error('Failed to load applicants', error);
  } finally {
    loading.value = false;
  }
};

const matchedCount = computed(() => {
  return applicants.value.filter(a => a.isMatch || (a.matchScore || 0) >= 50).length;
});

const unmatchedCount = computed(() => {
  return applicants.value.filter(a => !a.isMatch && (a.matchScore || 0) < 50).length;
});

const filteredApplicants = computed(() => {
  let list = applicants.value;

  if (matchTab.value === 'matched') {
    list = list.filter(a => a.isMatch || (a.matchScore || 0) >= 50);
  } else if (matchTab.value === 'unmatched') {
    list = list.filter(a => !a.isMatch && (a.matchScore || 0) < 50);
  }

  if (statusFilter.value !== 'All') {
    list = list.filter(a => a.status?.toLowerCase() === statusFilter.value.toLowerCase());
  }

  return list;
});

const openTalentPoolDrawer = async () => {
  talentPoolDialog.value = true;
  talentLoading.value = true;
  try {
    const res = await api.get(`/admin/jobs/${jobId}/matched-candidates`);
    talentPool.value = res.data?.candidates || res.candidates || [];
  } catch (error) {
    console.error('Failed to load talent pool', error);
  } finally {
    talentLoading.value = false;
  }
};

const filteredTalentPool = computed(() => {
  if (!talentSearch.value.trim()) return talentPool.value;
  const q = talentSearch.value.toLowerCase().trim();
  return talentPool.value.filter(c => 
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.college_name?.toLowerCase().includes(q) ||
    (c.matchedSkills || []).some((s: string) => s.toLowerCase().includes(q))
  );
});

const inviteCandidate = async (candidate: any) => {
  if (!confirm(`Invite ${candidate.name} to apply for this job?`)) return;
  try {
    await api.post(`/admin/jobs/${jobId}/invite-candidate`, {
      student_id: candidate.id
    });
    alert(`Invitation sent to ${candidate.name}!`);
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to send invitation');
  }
};

async function updateStatus(id: string, newStatus: string) {
  try {
    await api.put(`/admin/job-applications/${id}/status`, { status: newStatus });
  } catch (e) {
    alert('Failed to update status');
  }
}

function viewApplication(app: any) {
  selectedApp.value = app;
  detailsDialog.value = true;
  if (app.status === 'applied') {
    app.status = 'viewed';
    updateStatus(app.id, 'viewed');
  }
}

function exportCSV() {
  alert('Exporting CSV...');
}

function downloadResume(path: string) {
  if (!path) return;
  if (path.startsWith('http')) {
    window.open(path, '_blank');
    return;
  }
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase as string) || '';
  const rootUrl = apiBase.replace(/\/api(\/v1)?\/?$/, '');
  const cleanPath = path.replace(/\\/g, '/');
  const fullUrl = `${rootUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  window.open(fullUrl, '_blank');
}

function getSkills(skillsStr: any): string[] {
  if (!skillsStr) return [];
  if (Array.isArray(skillsStr)) return skillsStr;
  try {
    const parsed = JSON.parse(skillsStr);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    if (typeof skillsStr === 'string') {
      return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
}
</script>

<style scoped>
.apple-table-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.apple-data-table {
  background: transparent !important;
}

:deep(.v-data-table-header th) {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  color: var(--g4) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  background: #f8fafc !important;
}

:deep(.v-data-table__td) {
  font-size: 13px !important;
  color: var(--g6) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
  vertical-align: middle !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.applicant-name {
  font-weight: 700;
  color: var(--g7);
  line-height: 1.2;
}

.applicant-email {
  font-size: 11px;
  color: var(--g4);
}

.role-text {
  font-weight: 600;
  color: var(--g6);
}

.exp-text {
  font-size: 11px;
  color: var(--g4);
}

.status-select {
  min-width: 140px;
}
</style>
