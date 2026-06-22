<template>
  <div class="pa-6 fade-in">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title mb-1">Manage Expenses</h1>
        <p class="text-subtitle-1 text-secondary">Record, categorize, and track organizational expenditures.</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn color="secondary" variant="tonal" rounded="lg" prepend-icon="mdi-format-list-bulleted" @click="openManageCategories">
          Manage Categories
        </v-btn>
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openForm()">
          Record Expense
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="filters.category"
          :items="categories"
          item-title="title"
          item-value="value"
          label="Category"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="fetchExpenses"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="filters.type"
          :items="[{title: 'Debit', value: 'debit'}, {title: 'Credit', value: 'credit'}]"
          item-title="title"
          item-value="value"
          label="Type"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="fetchExpenses"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4" md="4">
        <v-text-field
          v-model="filters.search"
          label="Search description or reference..."
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @update:model-value="debouncedFetch"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card variant="outlined" rounded="xl" class="overflow-hidden">
      <div v-if="loading" class="pa-12 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="mt-4 text-grey">Loading expenses...</div>
      </div>

      <div v-else-if="expenses.length === 0" class="pa-16 text-center">
        <v-icon size="80" color="grey-lighten-3">mdi-cash-remove</v-icon>
        <h3 class="text-h6 font-weight-bold mt-4 text-grey">No expenses found</h3>
        <p class="text-body-2 text-grey">No records match the current filters.</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="expenses"
        class="bg-transparent"
        items-per-page="15"
      >
        <template v-slot:item.date="{ item }">
          <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
        </template>

        <template v-slot:item.category="{ item }">
          <v-chip size="small" variant="tonal" :color="categoryColor(item.category)">
            {{ categoryLabel(item.category) }}
          </v-chip>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip size="small" variant="flat" :color="item.type === 'credit' ? 'success' : 'error'" class="text-uppercase font-weight-bold">
            {{ item.type }}
          </v-chip>
        </template>

        <template v-slot:item.amount="{ item }">
          <div class="font-weight-black" :class="item.type === 'credit' ? 'text-success' : 'text-error'">
            {{ item.type === 'credit' ? '+' : '-' }}₹{{ Number(item.amount).toLocaleString() }}
          </div>
        </template>

        <template v-slot:item.payment_mode="{ item }">
          <div class="text-caption text-capitalize">{{ item.payment_mode.replace('_', ' ') }}</div>
          <div class="text-caption text-grey" v-if="item.reference_number">{{ item.reference_number }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-2">
            <!-- View Receipt -->
            <v-btn
              v-if="item.receipt_path"
              icon="mdi-paperclip"
              size="small"
              variant="tonal"
              color="primary"
              :href="apiBase.replace('/api', '') + item.receipt_path"
              target="_blank"
              title="View Receipt"
            ></v-btn>

            <!-- Edit -->
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="flat"
              color="grey-lighten-3"
              title="Edit Expense"
              @click="openForm(item)"
            ></v-btn>

            <!-- Delete -->
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="flat"
              color="error"
              title="Delete Expense"
              @click="openDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Expense Form Dialog -->
    <v-dialog v-model="formDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
          <span class="text-h6 font-weight-black">{{ formItem.id ? 'Edit' : 'Record' }} Expense</span>
          <v-btn icon="mdi-close" variant="text" @click="closeForm"></v-btn>
        </v-card-title>
        
        <v-card-text class="px-6 pb-6">
          <v-form ref="form" v-model="formValid" @submit.prevent="saveExpense">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formItem.type"
                  :items="[{title: 'Debit (Money Out)', value: 'debit'}, {title: 'Credit (Money In)', value: 'credit'}]"
                  label="Transaction Type *"
                  variant="outlined"
                  :rules="[v => !!v || 'Type is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formItem.category"
                  :items="categories"
                  item-title="title"
                  item-value="value"
                  label="Category *"
                  variant="outlined"
                  :rules="[v => !!v || 'Category is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formItem.amount"
                  label="Amount (₹) *"
                  type="number"
                  variant="outlined"
                  :rules="[v => !!v || 'Amount is required', v => v > 0 || 'Must be greater than 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formItem.date"
                  label="Date *"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Date is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formItem.description"
                  label="Description"
                  variant="outlined"
                  rows="2"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formItem.payment_mode"
                  :items="['bank_transfer', 'cash', 'card', 'cheque']"
                  label="Payment Mode *"
                  variant="outlined"
                  class="text-capitalize"
                  :rules="[v => !!v || 'Payment Mode is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formItem.reference_number"
                  label="Reference Number (Optional)"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="formReceipt"
                  label="Upload Receipt/Invoice (Optional)"
                  variant="outlined"
                  accept="image/png, image/jpeg, application/pdf"
                  prepend-icon="mdi-paperclip"
                  :hint="formItem.receipt_path ? 'A receipt is already attached. Uploading a new one will replace it.' : ''"
                  persistent-hint
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeForm">Cancel</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="actionLoading" :disabled="!formValid" @click="saveExpense">
            Save Expense
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="d-flex align-center justify-space-between pb-2">
          <span class="text-h6 font-weight-black text-error">Delete Expense</span>
          <v-btn icon="mdi-close" variant="text" @click="deleteDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-2">
          <p class="text-body-1">Are you sure you want to delete this expense record?</p>
          <div class="mt-4 pa-3 bg-grey-lighten-5 rounded-lg">
            <div class="text-body-2 text-grey">Amount</div>
            <div class="font-weight-bold">₹{{ Number(deleteItem?.amount || 0).toLocaleString() }}</div>
            <div class="text-body-2 text-grey mt-2">Description</div>
            <div class="font-weight-bold">{{ deleteItem?.description || 'N/A' }}</div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="actionLoading" @click="doDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Manage Categories Dialog -->
    <v-dialog v-model="categoriesDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
          <span class="text-h6 font-weight-black">Manage Categories</span>
          <v-btn icon="mdi-close" variant="text" @click="categoriesDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="px-6 pb-6">
          <v-form @submit.prevent="saveCategory" class="mb-6">
            <div class="d-flex gap-2 align-center">
              <v-text-field
                v-model="categoryForm.name"
                :label="categoryForm.id ? 'Edit Category Name' : 'New Category Name'"
                variant="outlined"
                density="compact"
                hide-details
              ></v-text-field>
              <v-btn v-if="categoryForm.id" color="grey" variant="text" @click="cancelEditCategory">
                Cancel
              </v-btn>
              <v-btn color="primary" variant="flat" type="submit" :loading="actionLoading" :disabled="!categoryForm.name">
                {{ categoryForm.id ? 'Update' : 'Add' }}
              </v-btn>
            </div>
          </v-form>

          <v-list class="bg-grey-lighten-5 rounded-lg pa-2">
            <v-list-item v-for="cat in dynamicCategories" :key="cat.id" class="rounded-lg mb-1" :class="{'opacity-50': !cat.is_active}">
              <template v-slot:title>
                <div class="font-weight-bold">{{ cat.name }}</div>
              </template>
              <template v-slot:append>
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" class="mr-1" @click="editCategory(cat)"></v-btn>
                <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="deleteCategory(cat)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
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
  role: ['super_admin', 'finance_staff']
});

import { useApi } from '@/composables/useApi';

const api = useApi();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const loading = ref(false);
const expenses = ref<any[]>([]);

// Filters
const filters = ref({
  category: null,
  type: null,
  search: ''
});

const dynamicCategories = ref<any[]>([]);

const categories = computed(() => {
  return dynamicCategories.value
    .filter(c => c.is_active)
    .map(c => ({ title: c.name, value: c.slug }));
});

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Category', key: 'category' },
  { title: 'Type', key: 'type', align: 'center' as const },
  { title: 'Description', key: 'description' },
  { title: 'Payment Mode', key: 'payment_mode' },
  { title: 'Amount', key: 'amount', align: 'end' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const }
];

const fetchExpenses = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.category) params.append('category', filters.value.category);
    if (filters.value.type) params.append('type', filters.value.type);
    if (filters.value.search) params.append('search', filters.value.search);

    const res = await api.get(`/admin/finance/expenses?${params.toString()}`);
    expenses.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Failed to fetch expenses', e);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.get('/admin/finance/expense-categories');
    dynamicCategories.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Failed to fetch categories', e);
  }
};

let searchTimeout: any = null;
const debouncedFetch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchExpenses(), 500);
};

onMounted(() => {
  fetchCategories();
  fetchExpenses();
});

// Category Management
const categoriesDialog = ref(false);
const categoryForm = ref({ id: null, name: '' });

const openManageCategories = () => {
  cancelEditCategory();
  categoriesDialog.value = true;
};

const editCategory = (cat: any) => {
  categoryForm.value = { id: cat.id, name: cat.name };
};

const cancelEditCategory = () => {
  categoryForm.value = { id: null, name: '' };
};

const saveCategory = async () => {
  if (!categoryForm.value.name) return;
  actionLoading.value = true;
  try {
    if (categoryForm.value.id) {
      await api.put(`/admin/finance/expense-categories/${categoryForm.value.id}`, { name: categoryForm.value.name });
      showSnackbar('Category updated successfully');
    } else {
      await api.post('/admin/finance/expense-categories', { name: categoryForm.value.name });
      showSnackbar('Category added successfully');
    }
    cancelEditCategory();
    await fetchCategories();
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || 'Failed to save category', 'error');
  } finally {
    actionLoading.value = false;
  }
};

const deleteCategory = async (cat: any) => {
  if (!confirm(`Are you sure you want to delete the category '${cat.name}'?`)) return;
  actionLoading.value = true;
  try {
    const res = await api.delete(`/admin/finance/expense-categories/${cat.id}`);
    showSnackbar(res.data.message || 'Category deleted');
    await fetchCategories();
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || 'Failed to delete category', 'error');
  } finally {
    actionLoading.value = false;
  }
};

// Form Management
const formDialog = ref(false);
const formValid = ref(false);
const form = ref();
const actionLoading = ref(false);
const formReceipt = ref<File[]>([]);
const formItem = ref({
  id: '',
  type: 'debit',
  category: '',
  amount: null as number | null,
  date: new Date().toISOString().split('T')[0],
  description: '',
  payment_mode: 'bank_transfer',
  reference_number: '',
  receipt_path: ''
});

const openForm = (item?: any) => {
  if (item) {
    formItem.value = {
      ...item,
      amount: Number(item.amount),
      date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
    };
  } else {
    formItem.value = {
      id: '',
      type: 'debit',
      category: '',
      amount: null,
      date: new Date().toISOString().split('T')[0],
      description: '',
      payment_mode: 'bank_transfer',
      reference_number: '',
      receipt_path: ''
    };
  }
  formReceipt.value = [];
  formDialog.value = true;
};

const closeForm = () => {
  formDialog.value = false;
};

const saveExpense = async () => {
  if (!form.value) return;
  const { valid } = await form.value.validate();
  if (!valid) return;

  actionLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('type', formItem.value.type);
    formData.append('category', formItem.value.category);
    formData.append('amount', String(formItem.value.amount));
    formData.append('date', formItem.value.date);
    formData.append('description', formItem.value.description || '');
    formData.append('payment_mode', formItem.value.payment_mode);
    formData.append('reference_number', formItem.value.reference_number || '');
    
    if (formReceipt.value && formReceipt.value.length > 0) {
      formData.append('receipt', formReceipt.value[0]);
    }

    if (formItem.value.id) {
      await api.put(`/admin/finance/expenses/${formItem.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar('Expense updated successfully');
    } else {
      await api.post(`/admin/finance/expenses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar('Expense recorded successfully');
    }

    closeForm();
    fetchExpenses();
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || 'Failed to save expense', 'error');
  } finally {
    actionLoading.value = false;
  }
};

// Delete Management
const deleteDialog = ref(false);
const deleteItem = ref<any>(null);

const openDelete = (item: any) => {
  deleteItem.value = item;
  deleteDialog.value = true;
};

const doDelete = async () => {
  if (!deleteItem.value) return;
  actionLoading.value = true;
  try {
    await api.delete(`/admin/finance/expenses/${deleteItem.value.id}`);
    showSnackbar('Expense deleted successfully');
    deleteDialog.value = false;
    fetchExpenses();
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || 'Failed to delete expense', 'error');
  } finally {
    actionLoading.value = false;
  }
};

// Utilities
const snackbar = ref(false);
const snackbarMsg = ref('');
const snackbarColor = ref('success');

const showSnackbar = (msg: string, color = 'success') => {
  snackbarMsg.value = msg;
  snackbarColor.value = color;
  snackbar.value = true;
};

const formatDate = (d: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const categoryLabel = (val: string) => categories.find(c => c.value === val)?.title || val;

const categoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    operations: 'blue',
    marketing: 'purple',
    infrastructure: 'orange',
    salaries: 'teal',
    tutor_payouts: 'indigo',
    miscellaneous: 'grey'
  };
  return colors[cat] || 'primary';
};
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
