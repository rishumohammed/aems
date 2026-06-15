<template>
  <div class="pa-6 fade-in">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title mb-1">Financial Reports</h1>
        <p class="text-subtitle-1 text-secondary">Analyze revenue trends, P&L performance, and outstanding dues.</p>
      </div>
      <AppButton variant="g" icon="mdi-download-outline" @click="exportFullReport">
        Export Report
      </AppButton>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-8">
      <v-col v-for="card in summaryCards" :key="card.title" cols="12" sm="6" md="3">
        <KpiCard
          :title="card.title"
          :value="`₹${card.value.toLocaleString()}`"
          :icon="card.icon"
          :color="card.color"
          :trend="card.trend"
        />
      </v-col>
    </v-row>

    <!-- Main Chart -->
    <div class="apple-table-card pa-6 mb-8">
      <div class="d-flex align-center justify-space-between mb-6">
        <h3 class="text-h6 font-weight-bold">Revenue Performance</h3>
        <SegmentControl
          v-model="chartRange"
          :options="[
            { label: '6M', value: '6m' },
            { label: '12M', value: '12m' }
          ]"
        />
      </div>
      
      <div class="chart-container" style="height: 350px;">
        <Bar v-if="!loading" :data="chartData" :options="chartOptions" />
        <div v-else class="d-flex align-center justify-center h-100">
          <v-progress-circular indeterminate color="blue" size="40"></v-progress-circular>
        </div>
      </div>
    </div>

    <v-row>
      <!-- Outstanding Dues -->
      <v-col cols="12" md="7">
        <div class="apple-table-card h-100">
          <div class="pa-6 border-b d-flex align-center justify-space-between">
            <h3 class="text-h6 font-weight-bold">Outstanding Dues</h3>
            <AppButton variant="g" size="xs" to="/dashboard/admin/invoices">View All</AppButton>
          </div>
          <AppTable
            :headers="headers"
            :items="outstandingDues"
          >
            <template #item.student_name="{ item }">
              <div>
                <div class="font-weight-bold">{{ item.student_name }}</div>
                <div class="text-caption text-secondary">{{ item.invoice_number }}</div>
              </div>
            </template>
            <template #item.balance_due="{ item }">
              <span class="font-weight-bold text-red">₹{{ item.balance_due.toLocaleString() }}</span>
            </template>
            <template #item.due_date="{ item }">
              <span class="text-caption text-secondary font-weight-medium">{{ formatDate(item.due_date) }}</span>
            </template>
          </AppTable>
        </div>
      </v-col>

      <!-- P&L Breakdown -->
      <v-col cols="12" md="5">
        <div class="apple-table-card h-100 pa-6">
          <h3 class="text-h6 font-weight-bold mb-6">Current Month P&L</h3>
          <div class="d-flex justify-space-between mb-4">
            <span class="text-secondary font-weight-medium">Gross Revenue</span>
            <span class="font-weight-bold">₹{{ summary.monthly_revenue?.toLocaleString() || 0 }}</span>
          </div>
          <div class="d-flex justify-space-between mb-4">
            <span class="text-secondary font-weight-medium">Direct Expenses</span>
            <span class="font-weight-bold text-red">- ₹{{ summary.monthly_expenses?.toLocaleString() || 0 }}</span>
          </div>
          <v-divider class="mb-4 opacity-50"></v-divider>
          <div class="profit-box pa-4 rounded-xl d-flex justify-space-between align-center mb-6">
            <span class="font-weight-bold">Net Profit</span>
            <span :class="['font-weight-black text-h5', netProfit >= 0 ? 'text-green' : 'text-red']">
              ₹{{ netProfit.toLocaleString() }}
            </span>
          </div>
          
          <div class="mt-6">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption text-secondary font-weight-bold text-uppercase">Profit Margin</span>
              <span class="text-caption font-weight-bold text-green">{{ profitMargin }}%</span>
            </div>
            <div class="margin-bar">
              <div class="margin-fill" :style="{ width: profitMargin + '%' }"></div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useApi } from '@/composables/useApi';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

const api = useApi();
const loading = ref(true);
const chartRange = ref('12m');
const summary = ref<any>({});
const monthlyRevenue = ref<any[]>([]);
const outstandingDues = ref<any[]>([]);

const headers = [
  { title: 'Student', key: 'student_name' },
  { title: 'Course', key: 'course_title' },
  { title: 'Balance', key: 'balance_due', align: 'end' },
  { title: 'Due Date', key: 'due_date' },
];

const summaryCards = computed(() => [
  { 
    title: 'Total Revenue', 
    value: summary.value.total_revenue || 0, 
    icon: 'mdi-cash-multiple', 
    color: 'blue', 
    trend: summary.value.revenue_trend || { value: 0, label: 'vs last month', positive: true } 
  },
  { 
    title: 'Total Expenses', 
    value: summary.value.monthly_expenses || 0, 
    icon: 'mdi-trending-down', 
    color: 'red', 
    trend: summary.value.expense_trend || { value: 0, label: 'vs last month', positive: false } 
  },
  { 
    title: 'Net Profit', 
    value: netProfit.value, 
    icon: 'mdi-chart-line', 
    color: 'green', 
    trend: summary.value.profit_trend || { value: 0, label: 'vs last month', positive: true } 
  },
  { 
    title: 'Outstanding', 
    value: summary.value.total_outstanding || 0, 
    icon: 'mdi-clock-outline', 
    color: 'orange', 
    trend: { value: 0, label: 'receivables', positive: false } 
  }
]);

const netProfit = computed(() => {
  return (summary.value.monthly_revenue || 0) - (summary.value.monthly_expenses || 0);
});

const profitMargin = computed(() => {
  if (!summary.value.monthly_revenue) return 0;
  return Math.round((netProfit.value / summary.value.monthly_revenue) * 100);
});

const chartData = computed(() => ({
  labels: monthlyRevenue.value.map(r => r.month).reverse(),
  datasets: [{
    label: 'Revenue',
    data: monthlyRevenue.value.map(r => r.revenue).reverse(),
    backgroundColor: '#007AFF',
    borderRadius: 6,
    barThickness: 32,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1D1D1F',
      bodyColor: '#1D1D1F',
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: false,
    }
  },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: 'rgba(0, 0, 0, 0.03)', drawBorder: false },
      ticks: { font: { size: 10 }, color: '#8E8E93' }
    },
    x: { 
      grid: { display: false },
      ticks: { font: { size: 10 }, color: '#8E8E93' }
    }
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [sumRes, revRes, outRes] = await Promise.all([
      api.get('/admin/finance/summary'),
      api.get('/admin/finance/monthly-revenue'),
      api.get('/admin/finance/outstanding')
    ]);
    summary.value = sumRes.data || sumRes;
    monthlyRevenue.value = revRes.data || revRes;
    outstandingDues.value = outRes.data || outRes;
  } catch (error) {
    console.error('Failed to fetch finance data', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const exportFullReport = () => {
  alert('Generating detailed PDF report...');
};
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: var(--g7);
}

.apple-table-card {
  background: white;
  border-radius: var(--r16);
  box-shadow: var(--s2);
  overflow: hidden;
}

.chart-container {
  width: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.profit-box {
  background: var(--g1);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.margin-bar {
  height: 8px;
  background: var(--g1);
  border-radius: 4px;
  overflow: hidden;
}

.margin-fill {
  height: 100%;
  background: var(--blue);
  border-radius: 4px;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
