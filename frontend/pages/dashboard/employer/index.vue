<template>
  <div class="pa-6">
    <!-- Dashboard Header -->

    <div class="d-flex align-center justify-space-between mb-10">
      <div>
        <h1 class="text-h3 font-weight-black text-grey-darken-4 mb-2">Talent Portal</h1>
        <p class="text-h6 text-blue-grey-200">Connect with top-tier graduates and manage your active listings.</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        rounded="xl"
        prepend-icon="mdi-plus"
        class="font-weight-black px-8 shadow-glow"
        to="/dashboard/employer/jobs/create"
      >
        Post Job Listing
      </v-btn>
    </div>

    <!-- Employer Stats -->
    <v-row class="mb-10">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl border-0" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="blue-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="blue">mdi-briefcase-check</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ jobs.length }}</div>
              <div class="text-caption font-weight-bold text-grey">Active Jobs</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl border-0" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="green-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="green">mdi-file-document-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.totalApplications }}</div>
              <div class="text-caption font-weight-bold text-grey">Total Applications</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl border-0" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="purple-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="purple">mdi-calendar-clock</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.interviewsScheduled }}</div>
              <div class="text-caption font-weight-bold text-grey">Interviews Scheduled</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-pill pa-4 rounded-xl border-0" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="amber-lighten-5" rounded="lg" class="mr-3">
              <v-icon color="amber-darken-2">mdi-account-check</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">{{ stats.hiresMade }}</div>
              <div class="text-caption font-weight-bold text-grey">Hires Made</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Jobs Table -->
    <v-card color="white" rounded="xl" border class="shadow-card">
      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        class="bg-transparent text-grey-darken-4 custom-table"
      >
        <template v-slot:item.title="{ item }">
          <div class="font-weight-bold text-h6">{{ item.title }}</div>
          <div class="text-caption text-blue-grey-300 d-flex align-center gap-2 mt-1">
            <v-icon size="small">mdi-briefcase-outline</v-icon> {{ item.category_name }}
            <v-icon size="small" class="ml-2">mdi-map-marker-outline</v-icon> {{ item.is_remote ? 'Remote' : item.location }}
          </div>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip size="small" variant="tonal" color="info" class="text-capitalize">
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
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
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
          <div class="pa-8 text-center text-blue-grey-300">
            <v-icon size="64" class="mb-4 opacity-50">mdi-briefcase-remove-outline</v-icon>
            <h3>No jobs posted yet.</h3>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
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
.shadow-card {
  
  border: 1px solid rgba(255,255,255,0.05) !important;
}
.stat-pill {
  transition: all 0.3s ease;
  background: white !important;
  color: #1e293b !important;
}
.stat-pill:hover {
  transform: translateY(-5px);
  border: 1px solid var(--border);
  
}
.shadow-glow {
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
  padding: 20px !important;
}
::v-deep(.custom-table td) {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}
</style>
