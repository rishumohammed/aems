<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-4 mb-6">
      <v-btn icon="mdi-arrow-left" variant="tonal" class="rounded-lg bg-grey-lighten-4 text-grey-darken-3" to="/dashboard/admin/jobs"></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black mb-1 text-grey-darken-4">Applicants: {{ job?.title }}</h1>
        <p class="text-grey-darken-1 font-weight-medium">
          <v-icon size="small" class="mr-1">mdi-domain</v-icon> {{ job?.company }} <span class="mx-2">|</span> 
          <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> {{ job?.location }}
        </p>
      </div>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="tonal" class="rounded-lg bg-blue-lighten-5 font-weight-bold px-6" prepend-icon="mdi-download" @click="exportCSV">
        Export CSV
      </v-btn>
    </div>

    <v-card rounded="xl" border class="shadow-card overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="applicants"
        :loading="loading"
        class="bg-transparent text-grey-darken-3 custom-table"
      >
        <!-- Applicant Name & Avatar -->
      <template v-slot:item.applicant_name="{ item }">
  <div class="d-flex align-center gap-3">
    <v-avatar
      size="40"
      :image="item.avatar_url || '/placeholder-avatar.png'"
      color="grey-darken-3"
    ></v-avatar>

    <div>
      <div class="font-weight-bold text-grey-darken-4">
        {{ item.applicant_name }}
      </div>
      <div class="text-caption text-grey">
        {{ item.applicant_email }}
      </div>
    </div>
  </div>
</template>

        <!-- AEMS Progress (Courses & Certs) -->
        <template v-slot:item.aems_progress="{ item }">
          <div class="d-flex flex-column gap-1">
            <v-chip size="x-small" color="primary" variant="tonal">{{ item.courses_completed || 0 }} Courses</v-chip>
            <v-chip size="x-small" :color="(item.certs_active || 0) > 0 ? 'success' : 'grey'" variant="tonal">
              {{ item.certs_active || 0 }} Certs
            </v-chip>
          </div>
        </template>

        <!-- Experience & Edu -->
        <template v-slot:item.experience="{ item }">
          <div class="font-weight-medium text-grey-darken-3">{{ item.last_role || 'Fresher' }}</div>
          <div class="text-caption text-grey">{{ item.experience_years }} Years • {{ item.qualification }}</div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-select
            v-model="item.status"
            :items="['applied', 'viewed', 'shortlisted', 'rejected']"
            density="compact"
            variant="outlined"
            hide-details
            class="status-select"
            :color="getStatusColor(item.status)"
            @update:modelValue="updateStatus(item.id, $event)"
          >
            <template v-slot:selection="{ item }">
              <span class="text-uppercase font-weight-bold" :class="`text-${getStatusColor(item.value)}`">
                {{ item.title }}
              </span>
            </template>
          </v-select>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-end">
            <v-btn icon="mdi-file-document-outline" size="small" variant="text" color="primary" @click="viewApplication(item)" title="View Cover Note & Details"></v-btn>
            <v-btn icon="mdi-account-details-outline" size="small" variant="text" color="info" :to="`/dashboard/admin/students/${item.student_id}`" title="Full AEMS Profile"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Application Details Modal -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card rounded="xl" class="pa-6 border bg-white" v-if="selectedApp">
        <div class="d-flex align-center justify-space-between mb-4 border-b pb-4">
          <h2 class="text-h5 font-weight-bold text-grey-darken-4">Application Details</h2>
          <v-btn icon="mdi-close" variant="tonal" color="grey" size="small" class="rounded-lg" @click="detailsDialog = false"></v-btn>
        </div>
        
        <div class="mb-4">
          <h4 class="text-grey-darken-1 mb-1 font-weight-bold">Contact</h4>
          <p class="text-grey-darken-4 font-weight-medium">{{ selectedApp.applicant_phone }} • {{ selectedApp.city }}</p>
          <a v-if="selectedApp.linkedin" :href="selectedApp.linkedin" target="_blank" class="text-primary text-decoration-none font-weight-medium">LinkedIn Profile</a>
        </div>

        <div class="mb-4">
          <h4 class="text-grey-darken-1 mb-1 font-weight-bold">Education Snapshot</h4>
          <p class="text-grey-darken-4 font-weight-medium">{{ selectedApp.qualification }} in {{ selectedApp.field_of_study }}</p>
          <p class="text-grey text-body-2">{{ selectedApp.institution }} (Class of {{ selectedApp.year_of_passing }}) • Grade: {{ selectedApp.grade }}</p>
        </div>

        <div class="mb-4" v-if="selectedApp.cover_note">
          <h4 class="text-grey-darken-1 mb-1 font-weight-bold">Cover Note</h4>
          <div class="bg-grey-lighten-4 pa-4 rounded-lg border text-body-2 text-grey-darken-3">
            {{ selectedApp.cover_note }}
          </div>
        </div>

        <v-btn block color="primary" size="large" variant="tonal" class="mt-4" v-if="selectedApp.resume_path">
          Download Resume
        </v-btn>
      </v-card>
    </v-dialog>
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
  { title: 'AEMS Progress', key: 'aems_progress', sortable: false },
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
    applicants.value = data?.applicants || [];
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
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
::v-deep(.custom-table) {
  background: transparent !important;
}
::v-deep(.custom-table th) {
  background: #cbd5e1 !important;
  color: #64748b !important;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 16px !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
::v-deep(.custom-table td) {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}
.status-select {
  min-width: 140px;
}
::v-deep(.status-select .v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}
</style>
