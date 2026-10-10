<template>
  <div class="payments-tab">
    <!-- KPIs -->
    <v-row class="mb-6">
      <v-col v-for="kpi in kpis" :key="kpi.label" cols="12" sm="6" md="3">
        <KpiCard
          :title="kpi.label"
          :value="'INR ' + kpi.value"
          :icon="kpi.icon || 'mdi-currency-inr'"
          :color="kpi.color"
        />
      </v-col>
    </v-row>

    <!-- Invoices Table -->
    <v-data-table
      :headers="headers"
      :items="invoices"
      :loading="loading"
      class="elevation-0 rounded-xl border"
    >
      <template v-slot:item.amount="{ item }">
        <span class="font-weight-bold">INR {{ Number(item.amount || 0).toLocaleString() }}</span>
      </template>

      <template v-slot:item.amount_paid="{ item }">
        <span class="font-weight-bold text-success">INR {{ Number(item.amount_paid || 0).toLocaleString() }}</span>
      </template>

      <template v-slot:item.balance_due="{ item }">
        <span :class="Number(item.balance_due || 0) > 0 ? 'font-weight-bold text-error' : 'text-grey'">
          INR {{ Number(item.balance_due || 0).toLocaleString() }}
        </span>
      </template>

      <template v-slot:item.payment_status="{ item }">
        <v-chip
          :color="getStatusColor(item.payment_status)"
          size="x-small"
          class="text-uppercase font-weight-bold"
        >
          {{ item.payment_status }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center gap-1">
          <!-- Record Payment Button -->
          <v-btn 
            v-if="item.balance_due > 0" 
            color="success" 
            size="small" 
            variant="flat" 
            class="text-capitalize px-3"
            @click="openPaymentModal(item)"
          >
            Record Payment
          </v-btn>

          <!-- Adjust Price Button -->
          <v-btn
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            color="amber-darken-3"
            title="Adjust Total Course Price"
            @click="openAdjustPriceModal(item)"
          ></v-btn>

          <!-- PDF Invoice Download -->
          <v-btn
            icon="mdi-file-pdf-box"
            size="small"
            variant="text"
            color="error"
            title="Download Invoice PDF"
            :href="getPdfUrl(item.pdf_path)"
            target="_blank"
            :disabled="!item.pdf_path"
          ></v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Record Payment Modal -->
    <v-dialog v-model="paymentModal" max-width="450px">
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="success" flat>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Record Payment</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="paymentModal = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <div class="mb-4 text-center">
            <div class="text-caption text-grey">Balance Due for Invoice #{{ selectedInvoice?.invoice_number || selectedInvoice?.id?.slice(0,8) }}</div>
            <div class="text-h5 font-weight-black text-error">INR {{ Number(selectedInvoice?.balance_due || 0).toLocaleString() }}</div>
          </div>
          <v-text-field v-model="paymentForm.amount" label="Amount Paid" type="number" variant="outlined" prefix="INR"></v-text-field>
          <v-select v-model="paymentForm.mode" :items="['cash', 'bank_transfer', 'cheque']" label="Payment Mode" variant="outlined"></v-select>
          <v-text-field v-model="paymentForm.reference" label="Reference Number" variant="outlined" placeholder="Transaction ID / Cheque No"></v-text-field>
          <v-text-field v-model="paymentForm.date" label="Payment Date" type="date" variant="outlined" persistent-placeholder></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn @click="paymentModal = false" variant="text">Cancel</v-btn>
          <v-btn color="success" @click="submitPayment" :loading="submitting" elevation="0" class="px-8 px-6 font-weight-bold" variant="flat" rounded="lg">Confirm Payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Adjust Price Modal -->
    <v-dialog v-model="priceModal" max-width="480px">
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="amber-darken-3" flat>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Adjust Invoiced Course Price</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="priceModal = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-black">{{ selectedInvoice?.course_title || 'Course Fee' }}</div>
            <div class="text-caption text-grey">Invoice #{{ selectedInvoice?.invoice_number || selectedInvoice?.id?.slice(0,8) }}</div>
          </div>
          <v-text-field
            v-model="priceForm.price"
            label="Total Course Fee (INR)"
            variant="outlined"
            type="number"
            min="0"
            prefix="INR"
            class="mb-4"
          ></v-text-field>
          
          <v-card variant="tonal" color="amber-darken-4" class="rounded-lg pa-4 mb-2" flat>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Adjusted Price:</span>
              <span class="font-weight-bold">INR {{ Number(priceForm.price || 0).toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Amount Paid:</span>
              <span class="font-weight-bold text-success">INR {{ Number(selectedInvoice?.amount_paid || 0).toLocaleString() }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-subtitle-2 font-weight-black">
              <span>New Balance Due:</span>
              <span :class="calculatedAdjustedBalance > 0 ? 'text-error' : 'text-success'">
                INR {{ calculatedAdjustedBalance.toLocaleString() }}
              </span>
            </div>
          </v-card>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn @click="priceModal = false" variant="text">Cancel</v-btn>
          <v-btn color="amber-darken-3" @click="submitAdjustPrice" :loading="adjustingPrice" elevation="0" class="px-6 font-weight-bold text-white" variant="flat" rounded="lg">Update Price</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  invoices: { type: Array, required: true },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['refresh']);

const { $api } = useNuxtApp();
const config = useRuntimeConfig();
const paymentModal = ref(false);
const submitting = ref(false);
const selectedInvoice = ref(null);

const priceModal = ref(false);
const adjustingPrice = ref(false);
const priceForm = ref({ price: 0 });

const calculatedAdjustedBalance = computed(() => {
  const newP = parseFloat(priceForm.value.price) || 0;
  const paid = parseFloat(selectedInvoice.value?.amount_paid) || 0;
  return Math.max(0, newP - paid);
});

const openAdjustPriceModal = (invoice) => {
  selectedInvoice.value = invoice;
  priceForm.value.price = parseFloat(invoice.amount || 0);
  priceModal.value = true;
};

const submitAdjustPrice = async () => {
  if (!selectedInvoice.value?.id) return;
  adjustingPrice.value = true;
  try {
    await $api.put(`/admin/students/invoices/${selectedInvoice.value.id}/adjust-price`, {
      price: parseFloat(priceForm.value.price) || 0
    });
    priceModal.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Failed to adjust price:', error);
    alert(error.response?.data?.message || 'Failed to adjust price');
  } finally {
    adjustingPrice.value = false;
  }
};

const paymentForm = ref({
  amount: 0,
  mode: 'bank_transfer',
  reference: '',
  date: new Date().toISOString().split('T')[0]
});

const headers = [
  { title: 'Invoice #', key: 'id', align: 'start', value: v => v.invoice_number || v.id.slice(0,8).toUpperCase() },
  { title: 'Course', key: 'course_title' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Paid', key: 'amount_paid', align: 'end' },
  { title: 'Balance', key: 'balance_due', align: 'end' },
  { title: 'Status', key: 'payment_status', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
];

const kpis = computed(() => {
  const total = props.invoices.reduce((acc, i) => acc + parseFloat(i.amount || 0), 0);
  const paid = props.invoices.reduce((acc, i) => acc + parseFloat(i.amount_paid || 0), 0);
  const due = props.invoices.reduce((acc, i) => acc + parseFloat(i.balance_due || 0), 0);
  
  return [
    { label: 'Total Billed', value: total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'Total Paid', value: paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), color: 'success' },
    { label: 'Balance Due', value: due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), color: 'error' },
    { label: 'Payment Status', value: due > 0 ? 'Partial' : (total > 0 ? 'Paid' : 'N/A') }
  ];
});

const getStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'pending': return 'error';
    default: return 'grey';
  }
};

const getPdfUrl = (path) => {
  if (!path) return '';
  const base = config.public.apiBase.replace('/api', '');
  return base + path;
};

const openPaymentModal = (invoice) => {
  selectedInvoice.value = invoice;
  paymentForm.value.amount = invoice.balance_due;
  paymentModal.value = true;
};

const submitPayment = async () => {
  submitting.value = true;
  try {
    await $api.post(`/admin/students/invoices/${selectedInvoice.value.id}/record-payment`, paymentForm.value);
    paymentModal.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Failed to record payment:', error);
  } finally {
    submitting.value = false;
  }
};
</script>
