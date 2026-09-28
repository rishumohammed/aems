<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Job Management</h1>
        <p class="text-secondary">Manage all your job postings across the platform.</p>
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

    <v-card color="white" rounded="xl" border elevation="0">
      <div class="d-flex align-center pa-4 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search jobs..."
          variant="outlined"
          hide-details
          class="mr-4 max-w-300"
          density="compact"
        ></v-text-field>
      </div>

      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        :search="search"
        class="bg-transparent"
      >
        <template v-slot:item.title="{ item }">
          <div class="font-weight-bold text-subtitle-1">{{ item.title }}</div>
          <div class="text-caption text-secondary d-flex align-center gap-2 mt-1">
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
          <div class="d-flex align-center" style="gap: 6px;">
            <v-icon size="small" color="blue">mdi-account-group</v-icon>
            <span class="font-weight-bold" style="color: var(--g7);">{{ item.application_count || 0 }}</span>
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <span class="text-secondary font-weight-medium">{{ new Date(item.created_at).toLocaleDateString() }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end align-center gap-1">
            <v-btn 
              size="small" 
              variant="tonal" 
              color="primary" 
              class="font-weight-bold text-none mr-1" 
              prepend-icon="mdi-account-search" 
              :to="`/dashboard/employer/jobs/${item.id}/candidates`"
            >
              Matched Talent
            </v-btn>
            <v-btn icon="mdi-account-multiple-outline" variant="text" size="small" color="info" :to="`/dashboard/employer/applications?job=${item.id}`" title="View Applicants"></v-btn>
            <v-btn v-if="item.status === 'draft' || item.status === 'rejected' || item.status === 'pending_approval'" icon="mdi-pencil-outline" variant="text" size="small" color="grey-darken-1" :to="`/dashboard/employer/jobs/${item.id}/edit`" title="Edit Job"></v-btn>
            <v-btn v-if="item.status === 'draft' || item.status === 'rejected'" icon="mdi-send-check-outline" variant="text" size="small" color="success" @click="submitForApproval(item.id)" title="Submit for Approval"></v-btn>
            <v-btn v-if="item.status === 'approved'" icon="mdi-close-circle-outline" variant="text" size="small" color="error" @click="updateJobStatus(item.id, 'closed')" title="Close Job"></v-btn>
          </div>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-10 text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-briefcase-off-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-secondary mb-2">No jobs found.</h3>
            <v-btn color="primary" variant="tonal" size="small" class="font-weight-bold text-none" to="/dashboard/employer/jobs/create">Post your first job</v-btn>
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
.max-w-300 {
  max-width: 300px;
}
</style>
