<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1 text-primary">Job Management</h1>
        <p class="text-blue-grey-300">Manage all your job postings across the platform.</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-plus"
        to="/dashboard/employer/jobs/create"
        class="font-weight-bold"
      >
        Post New Job
      </v-btn>
    </div>

    <v-card color="white" rounded="xl" border class="shadow-card">
      <div class="d-flex align-center pa-4 border-b border-opacity-10">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search jobs..."
          variant="solo-filled"
          flat
          hide-details
          bg-color="rgba(255,255,255,0.05)"
          class="mr-4 max-w-300"
          density="compact"
        ></v-text-field>
      </div>

      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        :search="search"
        class="bg-transparent text-grey-darken-4 custom-table"
      >
        <template v-slot:item.title="{ item }">
          <div class="font-weight-bold text-h6">{{ item.title }}</div>
          <div class="text-caption text-blue-grey-300 d-flex align-center gap-2 mt-1">
            <v-icon size="small">mdi-map-marker-outline</v-icon> {{ item.is_remote ? 'Remote' : item.location }}
            <v-icon size="small" class="ml-2">mdi-clock-outline</v-icon> {{ item.type.replace('_', ' ') }}
          </div>
</template>

        <template v-slot:item.status="{ item }">
          <v-chip 
            size="small" 
            variant="flat" 
            :color="getStatusColor(item.status)"
            class="text-uppercase font-weight-bold"
          >
            {{ item.status.replace('_', ' ') }}
          </v-chip>
        </template>
        
        <template v-slot:item.stats="{ item }">
          <div class="d-flex align-center gap-4 text-caption font-weight-bold">
            <div class="text-center" title="Total Applications">
              <v-icon size="small" color="blue" class="mb-1">mdi-account-group</v-icon>
              <div>{{ item.application_count || 0 }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" color="grey-lighten-1"></v-btn>
            </template>
            <v-list bg-color="white" class="text-grey-darken-4 border border-opacity-10" rounded="lg">
              <v-list-item prepend-icon="mdi-eye" title="View Applications" :to="`/dashboard/employer/applications?job=${item.id}`"></v-list-item>
              <v-list-item v-if="item.status === 'draft' || item.status === 'rejected' || item.status === 'pending_approval'" prepend-icon="mdi-pencil" title="Edit Job" :to="`/dashboard/employer/jobs/${item.id}/edit`"></v-list-item>
              <v-list-item v-if="item.status === 'draft' || item.status === 'rejected'" prepend-icon="mdi-send-check" title="Submit for Approval" @click="submitForApproval(item.id)"></v-list-item>
              <!-- For approved jobs, maybe employer can close them? -->
              <v-list-item v-if="item.status === 'approved'" prepend-icon="mdi-close-circle" title="Close Job" @click="updateJobStatus(item.id, 'closed')"></v-list-item>
            </v-list>
          </v-menu>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-8 text-center text-blue-grey-300">
            <v-icon size="64" class="mb-4 opacity-50">mdi-briefcase-remove-outline</v-icon>
            <h3>No jobs found.</h3>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const api = useApi();
const jobs = ref<any[]>([]);
const loading = ref(false);
const search = ref('');

const headers: any[] = [
  { title: 'Job Title', key: 'title', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Performance', key: 'stats', sortable: false, align: 'center' },
  { title: 'Posted On', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadJobs();
});

const loadJobs = async () => {
  loading.value = true;
  try {
    const res = await api.get('/employers/jobs');
    jobs.value = res.data || res;
  } catch (error) {
    console.error('Failed to load employer jobs', error);
  } finally {
    loading.value = false;
  }
};

const updateJobStatus = async (id: string, status: string) => {
  if (!confirm(`Are you sure you want to mark this job as ${status}?`)) return;
  try {
    // Note: this endpoint might need to be created or updated if it doesn't exist to allow archiving
    await api.patch(`/employers/jobs/${id}/status`, { status });
    await loadJobs();
  } catch (error) {
    console.error('Failed to update status', error);
    alert('Failed to update job status.');
  }
};

const submitForApproval = async (id: string) => {
  if (!confirm('Submit this job for admin review?')) return;
  try {
    await api.patch(`/employers/jobs/${id}/submit-approval`);
    alert('Job submitted for admin review!');
    await loadJobs();
  } catch (error) {
    console.error('Failed to submit job', error);
    alert('Failed to submit job.');
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'approved': return 'success';
    case 'pending_approval': return 'warning';
    case 'rejected': return 'error';
    case 'draft': return 'grey';
    case 'closed': return 'grey-darken-2';
    default: return 'grey';
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
.max-w-300 {
  max-width: 300px;
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
