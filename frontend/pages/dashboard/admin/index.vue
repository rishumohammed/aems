<template>
  <div class="pa-6 dashboard-page-content">
    <div v-if="loading">
      <v-skeleton-loader type="heading" class="mb-8" width="300"></v-skeleton-loader>
      <v-row class="mb-4">
        <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
          <v-skeleton-loader type="card" class="rounded-xl"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="7">
          <v-skeleton-loader type="image" class="rounded-xl" height="400"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" md="5">
          <v-skeleton-loader type="list-item-three-line" class="rounded-xl" height="400"></v-skeleton-loader>
        </v-col>
      </v-row>
    </div>

    <div v-else-if="errorMsg || !data.kpis || data.kpis.row1.length === 0" class="error-state text-center pa-10 mt-10">
      <v-icon icon="mdi-alert-circle-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
      <h2 class="text-h5 font-weight-bold text-grey-darken-2">Dashboard Data Unavailable</h2>
      <p class="text-grey mb-2">We couldn't load the platform analytics at this moment.</p>
      <p v-if="errorMsg" class="text-error mb-6 font-weight-bold">{{ errorMsg }}</p>
      <v-btn color="primary" @click="fetchData" prepend-icon="mdi-reload" class="text-none">Retry Loading</v-btn>
    </div>

    <div v-else>
    <div class="d-flex align-center mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold">Platform Overview</h1>
        <p class="text-secondary">Comprehensive analytics and system health for AEMS Academy.</p>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex gap-2">
        <v-btn color="primary" rounded="pill" prepend-icon="mdi-account-plus" to="/dashboard/leads">Add Lead</v-btn>
        <v-btn variant="outlined" rounded="pill" prepend-icon="mdi-briefcase-plus" to="/dashboard/admin/jobs">Post Job</v-btn>
      </div>
    </div>

    <!-- KPI Row 1 -->
    <v-row class="mb-8" v-if="data.kpis && data.kpis.row1">
      <v-col cols="12" sm="6" md="3" v-for="stat in data.kpis.row1" :key="stat.title">
        <v-card :color="stat.color" class="kpi-glow-card pa-0 rounded-xl border-0 overflow-hidden" elevation="6">
          <div class="pa-6 text-white h-100 position-relative glass-overlay">
            <div class="position-relative" style="z-index: 2">
              <div class="text-caption font-weight-bold opacity-80 text-uppercase mb-1">{{ stat.title }}</div>
              <div class="text-h4 font-weight-black">{{ stat.value }}</div>
              <div class="text-caption mt-2 font-weight-medium">
                <v-icon size="14">mdi-trending-up</v-icon>
                8% increase
              </div>
            </div>
            <v-icon :icon="stat.icon" class="kpi-icon-bg"></v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPI Row 2 -->
    <div v-if="data.kpis && data.kpis.row2" class="d-flex gap-3 mb-8" style="flex-wrap: nowrap;">
      <v-card
        v-for="stat in data.kpis.row2"
        :key="stat.title"
        class="pa-5 rounded-xl border-0 shadow-sm bg-white"
        style="flex: 1 1 0; min-width: 0;"
      >
        <div class="d-flex align-center">
          <v-avatar :color="stat.color" size="32" class="mr-3">
            <v-icon :icon="stat.icon" color="white" size="18"></v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
            <div class="text-caption text-secondary">{{ stat.title }}</div>
          </div>
        </div>
      </v-card>
    </div>


    <v-row>
      <!-- Lead Funnel Chart -->
      <v-col cols="12" md="7">
        <v-card class="pa-6 rounded-xl border-0 shadow-sm fill-height dashboard-card">
          <div class="text-h6 font-weight-bold mb-6">Lead Pipeline Stage</div>
          <div style="height: 300px" class="d-flex align-center justify-center">
            <client-only>
              <Bar v-if="funnelChartData.datasets[0].data.length > 0" :data="funnelChartData" :options="chartOptions" />
              <div v-else class="text-caption text-grey">No pipeline data available</div>
            </client-only>
          </div>
        </v-card>
      </v-col>

      <!-- System Health -->
      <v-col cols="12" md="5">
        <v-card class="pa-6 rounded-xl border-0 shadow-sm fill-height">
          <div class="text-h6 font-weight-bold mb-6">System Health</div>
          <div class="mb-6">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Disk Usage</span>
              <span class="text-body-2">{{ data.systemHealth?.diskUsage || 0 }}%</span>
            </div>
            <v-progress-linear :model-value="data.systemHealth?.diskUsage || 0" color="primary" rounded height="8"></v-progress-linear>
          </div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item class="px-0">
              <template #prepend><v-icon icon="mdi-database" color="success" class="mr-4"></v-icon></template>
              <v-list-item-title class="font-weight-bold">Database Status</v-list-item-title>
              <template #append><v-chip size="x-small" color="success">{{ data.systemHealth?.dbStatus || 'Unknown' }}</v-chip></template>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend><v-icon icon="mdi-cached" color="success" class="mr-4"></v-icon></template>
              <v-list-item-title class="font-weight-bold">Redis Cache</v-list-item-title>
              <template #append><v-chip size="x-small" color="success">{{ data.systemHealth?.redisStatus || 'Unknown' }}</v-chip></template>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-6"></v-divider>
          <div class="text-subtitle-2 font-weight-bold mb-4">Today's Follow-ups</div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item v-for="f in data.todayFollowups" :key="f.time" class="px-0 mb-2">
              <template #prepend><v-icon icon="mdi-clock-outline" size="18" class="mr-3"></v-icon></template>
              <v-list-item-title class="text-body-2 font-weight-bold">{{ f.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ f.time }} - {{ f.notes }}</v-list-item-subtitle>
            </v-list-item>
            <div v-if="data.todayFollowups.length === 0" class="text-caption text-grey text-center py-4">No follow-ups today</div>
          </v-list>
        </v-card>
      </v-col>

      <!-- Recent Enrollments Table -->
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl border-0 shadow-sm mt-4">
          <div class="d-flex align-center mb-6">
            <div class="text-h6 font-weight-bold">Recent Enrollments</div>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" to="/dashboard/students">View All Students</v-btn>
          </div>
          <v-table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Amount</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in data.recentEnrollments" :key="e.date">
                <td class="font-weight-bold">{{ e.name }}</td>
                <td>{{ e.course }}</td>
                <td class="text-grey">{{ formatDate(e.date) }}</td>
                <td class="font-weight-bold">₹{{ e.amount.toLocaleString() }}</td>
                <td class="text-right">
                  <Badge :color="e.amount > 0 ? 'green' : 'orange'">Paid</Badge>
                  <v-btn icon="mdi-eye-outline" variant="text" size="small" :to="`/dashboard/students/${e.student_id}`"></v-btn>
                </td>
              </tr>
              <tr v-if="data.recentEnrollments.length === 0">
                <td colspan="5" class="text-center py-8 text-grey">No enrollments recorded yet</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useApi } from '@/composables/useApi';
import Badge from '@/components/ui/Badge.vue';
import dayjs from 'dayjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const api = useApi();
const loading = ref(true);

interface KPI {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface FunnelStage {
  status: string;
  count: number;
}

interface Enrollment {
  student_id: number;
  name: string;
  course: string;
  date: string;
  amount: number;
}

interface Followup {
  time: string;
  name: string;
  notes: string;
}

interface SystemHealth {
  diskUsage: number;
  dbStatus: string;
  redisStatus: string;
}

interface AdminDashboardData {
  kpis: {
    row1: KPI[];
    row2: KPI[];
  };
  funnel: FunnelStage[];
  recentEnrollments: Enrollment[];
  todayFollowups: Followup[];
  systemHealth: SystemHealth;
}

const data = ref<AdminDashboardData>({
  kpis: { row1: [], row2: [] },
  funnel: [],
  recentEnrollments: [],
  todayFollowups: [],
  systemHealth: { diskUsage: 0, dbStatus: 'Offline', redisStatus: 'Offline' }
});

const funnelChartData = computed(() => ({
  labels: (data.value.funnel || []).map(f => (f.status || 'unknown').toUpperCase()),
  datasets: [{
    backgroundColor: '#5624D0',
    borderRadius: 8,
    data: (data.value.funnel || []).map(f => f.count || 0)
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { display: false } },
    x: { grid: { display: false } }
  }
};

const errorMsg = ref('');

const fetchData = async () => {
  try {
    errorMsg.value = '';
    const { data: res } = await api.get('/dashboard/admin-master');
    data.value = res;
  } catch (err: any) {
    console.error('Failed to fetch dashboard stats', err);
    errorMsg.value = err.response?.data?.message || err.message || 'Unknown error';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string | Date) => dayjs(date).format('MMM D, YYYY');

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
});

onMounted(fetchData);
</script>

<style scoped>
.kpi-glow-card {
  transition: all 0.3s ease;
}
.kpi-glow-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
}
.kpi-icon-bg {
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 100px !important;
  opacity: 0.15;
  transform: rotate(-15deg);
  z-index: 1;
}
.glass-overlay {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
}
.shadow-sm { box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }

.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
