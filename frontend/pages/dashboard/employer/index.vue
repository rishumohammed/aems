<template>
  <v-container fluid class="pa-6">
    <!-- Dashboard Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Employer Portal</h1>
        <p class="text-secondary">Connect with top-tier graduates and manage your active listings.</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="font-weight-bold"
        to="/dashboard/employer/jobs/create"
      >
        Post Job Listing
      </v-btn>
    </div>

    <!-- Employer Stats -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl" elevation="0" border>
          <div class="d-flex align-center">
            <v-avatar color="blue-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="blue">mdi-briefcase-check</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ jobs.length }}</div>
              <div class="text-caption font-weight-bold text-secondary">Active Jobs</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl" elevation="0" border>
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="green">mdi-file-document-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.totalApplications }}</div>
              <div class="text-caption font-weight-bold text-secondary">Total Applications</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl" elevation="0" border>
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="purple">mdi-calendar-clock</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.interviewsScheduled }}</div>
              <div class="text-caption font-weight-bold text-secondary">Interviews Scheduled</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl" elevation="0" border>
          <div class="d-flex align-center">
            <v-avatar color="amber-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="amber-darken-2">mdi-account-check</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.hiresMade }}</div>
              <div class="text-caption font-weight-bold text-secondary">Hires Made</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Jobs Table -->
    <v-card color="white" rounded="xl" border elevation="0">
      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        class="bg-transparent"
      >
        <template v-slot:item.title="{ item }">
          <div class="font-weight-bold text-subtitle-1">{{ item.title }}</div>
          <div class="text-caption text-secondary d-flex align-center gap-2 mt-1">
            <v-icon size="small">mdi-briefcase-outline</v-icon> {{ item.category_name }}
            <v-icon size="small" class="ml-2">mdi-map-marker-outline</v-icon> {{ item.is_remote ? 'Remote' : item.location }}
          </div>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip size="small" variant="tonal" color="info" class="text-capitalize font-weight-medium">
            {{ item.type.replace('_', ' ') }}
          </v-chip>
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

        <template v-slot:item.created_at="{ item }">
          <span class="text-secondary font-weight-medium">{{ new Date(item.created_at).toLocaleDateString() }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-end">
            <!-- Edit Draft / Rejected -->
            <v-btn 
              v-if="item.status === 'draft' || item.status === 'rejected' || item.status === 'pending_approval'"
              icon="mdi-pencil-outline" 
              variant="text" 
              size="small" 
              color="primary"
              :to="`/dashboard/employer/jobs/${item.id}/edit`"
              title="Edit Job"
            ></v-btn>
            <!-- View Live -->
            <v-btn 
              v-if="item.status === 'approved'"
              icon="mdi-open-in-new" 
              variant="text" 
              size="small" 
              color="success"
              :to="`/jobs/${item.id}`"
              title="View on public board"
            ></v-btn>
          </div>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-10 text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-briefcase-off-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-secondary mb-2">No jobs posted yet.</h3>
            <v-btn color="primary" variant="tonal" size="small" class="font-weight-bold text-none" to="/dashboard/employer/jobs/create">Post your first job</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const authStore = useAuthStore();
const api = useApi();

interface Job {
  id: number;
  title: string;
  category_name: string;
  is_remote: boolean;
  location: string;
  type: string;
  status: string;
  created_at: string;
}

const jobs = ref<Job[]>([]);
const loading = ref(false);
const stats = ref({
  totalApplications: 0,
  interviewsScheduled: 0,
  hiresMade: 0
});

const headers: any[] = [
  { title: 'Job Details', key: 'title', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Posted On', key: 'created_at', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadDashboardData();
});

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const [jobsRes, statsRes] = await Promise.all([
      api.get('/employers/jobs'),
      api.get('/employers/stats')
    ]);
    jobs.value = jobsRes.data || jobsRes;
    stats.value = statsRes.data || statsRes;
  } catch (error) {
    console.error('Failed to load employer dashboard data', error);
  } finally {
    loading.value = false;
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
.stat-pill {
  transition: all 0.2s ease;
  background: white !important;
}
.stat-pill:hover {
  transform: translateY(-2px);
}
</style>
