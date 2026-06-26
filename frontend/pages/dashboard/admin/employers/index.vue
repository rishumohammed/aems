<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Employers</h1>
        <p class="text-blue-grey-300">Manage all registered companies and their job postings.</p>
      </div>
      <v-btn icon="mdi-refresh" variant="tonal" color="primary" @click="loadEmployers" :loading="loading"></v-btn>
    </div>

    <v-card rounded="xl" border class="shadow-card overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="employers"
        :loading="loading"
        class="bg-transparent text-grey-darken-4 custom-table"
      >
        <!-- Company Column -->
        <template v-slot:item.company="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar color="teal-lighten-5" size="40">
              <v-img v-if="item.logo_url" :src="item.logo_url"></v-img>
              <span v-else class="text-teal font-weight-bold">{{ item.company_name?.substring(0,1).toUpperCase() || 'C' }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1">{{ item.company_name || 'Unknown' }}</div>
              <div class="text-caption text-grey">{{ item.industry || 'Not specified' }}</div>
            </div>
          </div>
</template>

        <!-- Contact Column -->
        <template v-slot:item.contact="{ item }">
          <div class="font-weight-medium">{{ item.contact_person || 'N/A' }}</div>
          <div class="text-caption text-grey">{{ item.email }}</div>
        </template>

        <!-- Jobs -->
        <template v-slot:item.jobs="{ item }">
          <div class="d-flex align-center gap-2">
            <span class="font-weight-bold">{{ item.total_jobs || 0 }}</span> Total
            <v-chip v-if="item.pending_jobs > 0" size="x-small" color="warning" class="font-weight-bold ml-1">
              {{ item.pending_jobs }} pending
            </v-chip>
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip size="small" :color="getStatusColor(item.approval_status)" class="font-weight-bold text-uppercase" variant="flat">
            {{ item.approval_status?.replace('_', ' ') || 'Unknown' }}
          </v-chip>
        </template>

        <!-- Joined Date -->
        <template v-slot:item.created_at="{ item }">
          <div class="text-caption font-weight-medium text-grey-darken-1">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn variant="tonal" size="small" color="info" :to="`/dashboard/admin/employers/${item.id}`" class="font-weight-bold px-4 rounded-pill text-none">View Details</v-btn>
        </template>

        <template v-slot:no-data>
          <div class="pa-10 text-center text-blue-grey-300">
            <v-icon size="64" class="mb-4 opacity-50">mdi-domain</v-icon>
            <h3 class="text-h6 font-weight-bold">No employers found</h3>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Password Reset Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="400">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          Password Reset
        </v-card-title>
        <v-card-text>
          <p class="mb-4">The password has been reset successfully. It has also been emailed to the user.</p>
          <div class="text-caption text-grey mb-1">New Temporary Password:</div>
          <v-sheet color="grey-lighten-4" class="pa-3 rounded d-flex align-center justify-space-between mb-4">
            <span class="text-h6 font-weight-medium" style="font-family: monospace;">{{ tempPassword }}</span>
            <v-btn icon="mdi-content-copy" variant="text" size="small" color="primary" @click="copyPassword"></v-btn>
          </v-sheet>
          <v-alert v-if="copied" type="success" density="compact" variant="tonal" class="mb-0">Copied to clipboard!</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn   @click="showPasswordDialog = false" class=" rounded-pill" variant="text">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['super_admin', 'placement_coordinator'] });

const api = useApi();
const employers = ref<any[]>([]);
const loading = ref(false);

const showPasswordDialog = ref(false);
const tempPassword = ref('');
const copied = ref(false);

const headers: any[] = [
  { title: 'Company', key: 'company', sortable: false },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Jobs', key: 'jobs', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Registered', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(() => {
  loadEmployers();
});

const loadEmployers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/admin/employers');
    employers.value = res.data || [];
  } catch (err) {
    console.error('Failed to load employers', err);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    approved: 'success',
    pending_approval: 'warning',
    rejected: 'error',
    suspended: 'error'
  };
  return map[status] || 'grey';
};

const toggleEmployerStatus = async (employer: any) => {
  const newStatus = employer.approval_status === 'approved' ? 'suspended' : 'approved';
  if (!confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this employer?`)) return;
  try {
    // We update the user status
    await api.put(`/admin/users/${employer.id}/status`, { status: newStatus === 'approved' ? 'active' : 'suspended' });
    
    // Also we need to hit the employer approval API to change approval_status
    if (newStatus === 'approved') {
      await api.patch(`/admin/employer-approve/${employer.id}`, { status: 'approved' });
    } else {
      await api.patch(`/admin/employer-approve/${employer.id}`, { status: 'suspended', notes: 'Suspended by admin' });
    }
    
    alert(`Employer status updated successfully`);
    loadEmployers();
  } catch (err) {
    console.error('Failed to update employer status', err);
    alert('Failed to update employer status');
  }
};

const resetPassword = async (employer: any) => {
  if (!confirm(`Generate a new temporary password for ${employer.company_name || 'this employer'}?`)) return;
  try {
    const { data } = await api.post(`/admin/users/${employer.id}/reset-password`);
    tempPassword.value = data.temp_password || data.tempPassword;
    copied.value = false;
    showPasswordDialog.value = true;
    loadEmployers();
  } catch (err) {
    console.error('Failed to reset password', err);
    alert('Failed to reset password');
  }
};

const copyPassword = () => {
  navigator.clipboard.writeText(tempPassword.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 3000);
};
</script>

<style scoped>
.shadow-card {
  
  border-color: rgba(0,0,0,0.05) !important;
  border: 1px solid var(--border);
}
::v-deep(.custom-table th) {
  background: #f8fafc !important;
  color: #64748b !important;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 16px !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
::v-deep(.custom-table td) {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
</style>
