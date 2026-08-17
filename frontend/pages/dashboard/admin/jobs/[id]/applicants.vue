<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-4 mb-6">
      <AppButton variant="g" icon="mdi-arrow-left" to="/dashboard/admin/jobs"></AppButton>
      <div>
        <h1 class="text-h4 font-weight-bold mb-1" style="color: var(--g7);">Applicants: {{ job?.title }}</h1>
        <p style="color: var(--g4); font-size: 13px; font-weight: 500;">
          <v-icon size="small" class="mr-1">mdi-domain</v-icon> {{ job?.company }} <span class="mx-2">|</span> 
          <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> {{ job?.location }}
        </p>
      </div>
      <v-spacer></v-spacer>
      <AppButton variant="blue" icon="mdi-download" @click="exportCSV">
        Export CSV
      </AppButton>
    </div>

    <div class="apple-table-card">
      <v-data-table
        :headers="headers"
        :items="applicants"
        :loading="loading"
        class="apple-data-table"
      >
        <!-- Applicant Name & Avatar -->
        <template v-slot:item.applicant_name="{ item }">
          <div class="d-flex align-center py-2">
            <div>
              <div class="applicant-name">
                {{ item.applicant_name }}
              </div>
              <div class="applicant-email">
                {{ item.applicant_email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Brixify Progress (Courses & Certs) -->
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
          <div class="exp-text">{{ item.experience_years }} Years • {{ item.qualification }}</div>
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
      </v-data-table>
    </div>

    <!-- Application Details Modal -->
    <AppModal
      v-model="detailsDialog"
      title="Application Details"
      large
    >
      <div v-if="selectedApp">
        <div class="mb-4">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Contact</h4>
          <p style="color: var(--g7); font-weight: 500; font-size: 14px;">{{ selectedApp.applicant_phone }} • {{ selectedApp.city }}</p>
          <a v-if="selectedApp.linkedin" :href="selectedApp.linkedin" target="_blank" style="color: var(--blue); text-decoration: none; font-size: 14px; font-weight: 500;">LinkedIn Profile</a>
        </div>

        <div class="mb-4">
          <h4 class="font-weight-bold mb-1" style="color: var(--g6);">Education Snapshot</h4>
          <p style="color: var(--g7); font-weight: 500; font-size: 14px;">{{ selectedApp.qualification }} in {{ selectedApp.field_of_study }}</p>
          <p style="color: var(--g5); font-size: 13px;">{{ selectedApp.institution }} (Class of {{ selectedApp.year_of_passing }}) • Grade: {{ selectedApp.grade }}</p>
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], roles: ['super_admin'] });

const route = useRoute();
const api = useApi();
const jobId = route.params.id;

const job = ref<any>(null);
const applicants = ref<any[]>([]);
const loading = ref(false);

const detailsDialog = ref(false);
const selectedApp = ref<any>(null);

const headers: any[] = [
  { title: 'Applicant', key: 'applicant_name', sortable: true },
  { title: 'Brixify Progress', key: 'brixify_progress', sortable: false },
  { title: 'Experience/Edu', key: 'experience', sortable: true },
  { title: 'Applied On', key: 'applied_at', sortable: true },
  { title: 'Status', key: 'status', sortable: true, width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
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
});

function getStatusColor(status: string) {
  switch(status) {
    case 'applied': return 'grey';
    case 'viewed': return 'info';
    case 'shortlisted': return 'success';
    case 'selected': return 'primary';
    case 'rejected': return 'error';
    default: return 'grey';
  }
}

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
  // Auto mark as viewed if it was 'applied'
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
  background: #cbd5e1 !important;
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
