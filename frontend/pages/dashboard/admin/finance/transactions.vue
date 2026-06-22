<template>
  <div class="pa-6 fade-in">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title mb-1">Transactions Ledger</h1>
        <p class="text-subtitle-1 text-secondary">A consolidated view of all cash inflows and outflows.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-6 rounded-lg shadow-sm border-t-green">
          <div class="d-flex align-center">
            <v-avatar color="success" size="48" variant="tonal" class="mr-4">
              <v-icon size="24">mdi-arrow-bottom-left-thick</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 text-secondary text-uppercase font-weight-bold">Total Cash In (Credits)</div>
              <div class="text-h4 font-weight-black text-success">₹{{ totalCashIn.toLocaleString() }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 rounded-lg shadow-sm border-t-red">
          <div class="d-flex align-center">
            <v-avatar color="error" size="48" variant="tonal" class="mr-4">
              <v-icon size="24">mdi-arrow-top-right-thick</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 text-secondary text-uppercase font-weight-bold">Total Cash Out (Debits)</div>
              <div class="text-h4 font-weight-black text-error">₹{{ totalCashOut.toLocaleString() }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4" dense>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="filters.flow_type"
          :items="[{title: 'All Flow Types', value: ''}, {title: 'Money In (Credit)', value: 'credit'}, {title: 'Money Out (Debit)', value: 'debit'}]"
          item-title="title"
          item-value="value"
          label="Flow Type"
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="filters.source"
          :items="[{title: 'All Sources', value: ''}, {title: 'Revenue / Invoices', value: 'revenue'}, {title: 'Expenses', value: 'expense'}]"
          item-title="title"
          item-value="value"
          label="Source"
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-text-field
          v-model="filters.startDate"
          label="Start Date"
          type="date"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-text-field
          v-model="filters.endDate"
          label="End Date"
          type="date"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.search"
          label="Search description or reference..."
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card variant="outlined" rounded="xl" class="overflow-hidden">
      <div v-if="loading" class="pa-12 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="mt-4 text-grey">Loading transactions...</div>
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="pa-16 text-center">
        <v-icon size="80" color="grey-lighten-3">mdi-text-box-search-outline</v-icon>
        <h3 class="text-h6 font-weight-bold mt-4 text-grey">No transactions found</h3>
        <p class="text-body-2 text-grey">No records match the current filters.</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="filteredTransactions"
        class="bg-transparent"
        items-per-page="20"
        :sort-by="[{ key: 'transaction_date', order: 'desc' }]"
      >
        <template v-slot:item.transaction_date="{ item }">
          <div class="font-weight-medium text-no-wrap">{{ formatDate(item.transaction_date) }}</div>
        </template>

        <template v-slot:item.source="{ item }">
          <v-chip size="small" variant="tonal" :color="item.source === 'revenue' ? 'primary' : 'warning'" class="text-capitalize font-weight-bold">
            {{ item.source }}
          </v-chip>
        </template>

        <template v-slot:item.flow_type="{ item }">
          <v-chip size="small" variant="flat" :color="item.flow_type === 'credit' ? 'success' : 'error'" class="text-uppercase font-weight-bold px-4">
            {{ item.flow_type }}
          </v-chip>
        </template>

        <template v-slot:item.amount="{ item }">
          <div class="font-weight-black text-right" :class="item.flow_type === 'credit' ? 'text-success' : 'text-error'">
            {{ item.flow_type === 'credit' ? '+' : '-' }}₹{{ Number(item.amount).toLocaleString() }}
          </div>
        </template>

        <template v-slot:item.payment_mode="{ item }">
          <div class="text-caption text-capitalize">{{ item.payment_mode ? item.payment_mode.replace('_', ' ') : 'Unknown' }}</div>
          <div class="text-caption text-grey" v-if="item.reference_number">{{ item.reference_number }}</div>
        </template>

        <template v-slot:item.description="{ item }">
          <div style="max-width: 250px" class="text-truncate" :title="item.description || 'N/A'">
            {{ item.description || 'N/A' }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'finance_staff']
});

import { useApi } from '@/composables/useApi';

const api = useApi();
const loading = ref(false);
const transactions = ref<any[]>([]);

// Filters
const filters = ref({
  flow_type: '',
  source: '',
  search: '',
  startDate: '',
  endDate: ''
});

const headers = [
  { title: 'Date', key: 'transaction_date' },
  { title: 'Source', key: 'source' },
  { title: 'Type', key: 'flow_type', align: 'center' as const },
  { title: 'Description', key: 'description' },
  { title: 'Mode / Ref', key: 'payment_mode' },
  { title: 'Amount', key: 'amount', align: 'end' as const }
];

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/admin/finance/transactions`);
    transactions.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Failed to fetch transactions', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTransactions();
});

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    if (filters.value.flow_type && t.flow_type !== filters.value.flow_type) return false;
    if (filters.value.source && t.source !== filters.value.source) return false;
    if (filters.value.startDate) {
      if (new Date(t.transaction_date) < new Date(filters.value.startDate)) return false;
    }
    if (filters.value.endDate) {
      const end = new Date(filters.value.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(t.transaction_date) > end) return false;
    }
    if (filters.value.search) {
      const q = filters.value.search.toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const ref = (t.reference_number || '').toLowerCase();
      if (!desc.includes(q) && !ref.includes(q)) return false;
    }
    return true;
  });
});

const totalCashIn = computed(() => {
  return filteredTransactions.value
    .filter(t => t.flow_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const totalCashOut = computed(() => {
  return filteredTransactions.value
    .filter(t => t.flow_type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

// Utilities
const formatDate = (d: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: var(--g7);
}
.shadow-sm { border: 1px solid var(--border); }
.border-t-green { border-top: 4px solid rgb(var(--v-theme-success)) !important; }
.border-t-red { border-top: 4px solid rgb(var(--v-theme-error)) !important; }
.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
