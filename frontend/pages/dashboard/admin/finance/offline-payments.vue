<template>
  <div class="pa-6 fade-in">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title mb-1">Offline Payments</h1>
        <p class="text-subtitle-1 text-secondary">Review, approve, or reject student offline payment submissions.</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <v-tabs v-model="filterStatus" color="primary" class="mb-6 border-b">
      <v-tab value="">All</v-tab>
      <v-tab value="pending">
        <v-badge :content="pendingCount" color="warning" inline>Pending</v-badge>
      </v-tab>
      <v-tab value="approved">Approved</v-tab>
      <v-tab value="rejected">Rejected</v-tab>
    </v-tabs>

    <!-- Data Table -->
    <v-card variant="outlined" rounded="xl" class="overflow-hidden">
      <div v-if="loading" class="pa-12 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="mt-4 text-grey">Loading payments...</div>
      </div>

      <div v-else-if="filteredPayments.length === 0" class="pa-16 text-center">
        <v-icon size="80" color="grey-lighten-3">mdi-bank-off-outline</v-icon>
        <h3 class="text-h6 font-weight-bold mt-4 text-grey">No offline payments found</h3>
        <p class="text-body-2 text-grey">{{ filterStatus ? `No ${filterStatus} payments at this time.` : 'No offline payment submissions yet.' }}</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="filteredPayments"
        class="bg-transparent"
        items-per-page="15"
      >
        <template v-slot:item.student_name="{ item }">
          <div class="py-3">
            <div class="font-weight-bold">{{ item.student_name }}</div>
            <div class="text-caption text-grey">{{ item.student_email }}</div>
          </div>
        </template>

        <template v-slot:item.course_title="{ item }">
          <div class="text-truncate font-weight-medium" style="max-width: 200px;">{{ item.course_title }}</div>
        </template>

        <template v-slot:item.amount="{ item }">
          <div class="font-weight-black text-primary">₹{{ Number(item.amount).toLocaleString() }}</div>
          <div class="text-caption text-grey">of ₹{{ Number(item.total_fee).toLocaleString() }}</div>
        </template>

        <template v-slot:item.mode="{ item }">
          <v-chip size="small" variant="tonal" :color="modeColor(item.mode)">
            {{ modeLabel(item.mode) }}
          </v-chip>
        </template>

        <template v-slot:item.paid_at="{ item }">
          <div class="text-caption">{{ formatDate(item.paid_at) }}</div>
        </template>

        <template v-slot:item.payment_status="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="statusColor(item.payment_status)"
            class="font-weight-bold text-uppercase"
          >
            {{ item.payment_status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-2 py-2">
            <!-- View Proof -->
            <v-btn
              v-if="item.proof_path"
              icon="mdi-eye-outline"
              size="small"
              variant="tonal"
              color="primary"
              :href="apiBase.replace('/api', '') + item.proof_path"
              target="_blank"
              title="View Payment Proof"
            ></v-btn>

            <!-- Approve -->
            <v-btn
              v-if="item.payment_status === 'pending'"
              icon="mdi-check-circle-outline"
              size="small"
              variant="flat"
              color="success"
              title="Approve Payment"
              @click="openApprove(item)"
            ></v-btn>

            <!-- Reject -->
            <v-btn
              v-if="item.payment_status === 'pending'"
              icon="mdi-close-circle-outline"
              size="small"
              variant="flat"
              color="error"
              title="Reject Payment"
              @click="openReject(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Approve Dialog -->
    <v-dialog v-model="approveDialog" max-width="400" persistent>
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="d-flex align-center justify-space-between pb-2">
          <span class="text-h6 font-weight-black">Approve Payment</span>
          <v-btn icon="mdi-close" variant="text" @click="approveDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-2">
          <div class="mb-4 pa-3 bg-grey-lighten-5 rounded-lg">
            <div class="text-body-2 text-grey">Student</div>
            <div class="font-weight-bold">{{ selectedPayment?.student_name }}</div>
            <div class="text-body-2 text-grey mt-2">Course</div>
            <div class="font-weight-bold">{{ selectedPayment?.course_title }}</div>
            <div class="text-body-2 text-grey mt-2">Submitted Amount</div>
            <div class="text-h6 font-weight-black text-success">₹{{ Number(selectedPayment?.amount || 0).toLocaleString() }}</div>
          </div>
          <v-text-field
            v-model.number="approveAmount"
            label="Approved Amount (₹)"
            type="number"
            prefix="₹"
            variant="outlined"
            density="comfortable"
            hint="Leave as-is or adjust if needed"
            persistent-hint
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="approveDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" rounded="lg" :loading="actionLoading" @click="doApprove">
            Confirm Approval
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="400" persistent>
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="d-flex align-center justify-space-between pb-2">
          <span class="text-h6 font-weight-black">Reject Payment</span>
          <v-btn icon="mdi-close" variant="text" @click="rejectDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-2">
          <p class="text-body-2 text-grey mb-4">
            Rejecting the payment will notify the student with the reason provided below.
          </p>
          <v-textarea
            v-model="rejectReason"
            label="Rejection Reason *"
            variant="outlined"
            rows="3"
            :rules="[v => !!v || 'Reason is required']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="rejectDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="actionLoading" :disabled="!rejectReason" @click="doReject">
            Confirm Rejection
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" rounded="lg" timeout="3000">
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

import { useApi } from '@/composables/useApi';

const api = useApi();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const loading = ref(false);
const payments = ref<any[]>([]);
const filterStatus = ref('');
const approveDialog = ref(false);
const rejectDialog = ref(false);
const selectedPayment = ref<any>(null);
const approveAmount = ref<number>(0);
const rejectReason = ref('');
const actionLoading = ref(false);
const snackbar = ref(false);
const snackbarMsg = ref('');
const snackbarColor = ref('success');

const filteredPayments = computed(() => {
  if (!filterStatus.value) return payments.value;
  return payments.value.filter(p => p.payment_status === filterStatus.value);
});

const pendingCount = computed(() => payments.value.filter(p => p.payment_status === 'pending').length);

const headers = [
  { title: 'Student', key: 'student_name' },
  { title: 'Course', key: 'course_title' },
  { title: 'Amount', key: 'amount' },
  { title: 'Method', key: 'mode' },
  { title: 'Reference', key: 'reference', sortable: false },
  { title: 'Date', key: 'paid_at' },
  { title: 'Status', key: 'payment_status', align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const }
];

const fetchPayments = async () => {
  loading.value = true;
  try {
    const res = await api.get('/admin/finance/offline-payments');
    payments.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Failed to fetch offline payments', e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPayments);

const openApprove = (item: any) => {
  selectedPayment.value = item;
  approveAmount.value = Number(item.amount);
  approveDialog.value = true;
};

const openReject = (item: any) => {
  selectedPayment.value = item;
  rejectReason.value = '';
  rejectDialog.value = true;
};

const doApprove = async () => {
  actionLoading.value = true;
  try {
    await api.put(`/admin/finance/offline-payments/${selectedPayment.value.payment_id}/approve`, {
      adjustedAmount: approveAmount.value
    });
    snackbarMsg.value = 'Payment approved and enrollment activated!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    approveDialog.value = false;
    fetchPayments();
  } catch (e: any) {
    snackbarMsg.value = e.response?.data?.message || 'Approval failed';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const doReject = async () => {
  actionLoading.value = true;
  try {
    await api.put(`/admin/finance/offline-payments/${selectedPayment.value.payment_id}/reject`, {
      reason: rejectReason.value
    });
    snackbarMsg.value = 'Payment rejected and student notified.';
    snackbarColor.value = 'warning';
    snackbar.value = true;
    rejectDialog.value = false;
    fetchPayments();
  } catch (e: any) {
    snackbarMsg.value = e.response?.data?.message || 'Rejection failed';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const modeLabel = (mode: string) => ({
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  cash: 'Cash',
  cheque: 'Cheque',
  card: 'Card'
}[mode] || mode);

const modeColor = (mode: string) => ({
  bank_transfer: 'blue',
  upi: 'purple',
  cash: 'green',
  cheque: 'warning',
  card: 'indigo'
}[mode] || 'grey');

const statusColor = (status: string) => ({
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
}[status] || 'grey');
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: var(--g7);
}
.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
