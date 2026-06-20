<template>
  <div class="pa-6" v-if="employer">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div class="d-flex align-center gap-4">
        <v-btn icon="mdi-arrow-left" variant="tonal" to="/dashboard/admin/employers" size="small"></v-btn>
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-4 mb-1">Company Profile</h1>
          <p class="text-blue-grey-300">Detailed job posting and application statistics</p>
        </div>
      </div>
      <div class="d-flex gap-3">
        <v-btn v-if="employer.status === 'pending_verification'" color="success" prepend-icon="mdi-check" @click="updateStatus('active')">Verify Employer</v-btn>
        <v-btn v-if="employer.status === 'active'" color="error" variant="tonal" prepend-icon="mdi-cancel" @click="updateStatus('suspended')">Suspend Employer</v-btn>
        <v-btn v-if="employer.status === 'suspended'" color="success" variant="tonal" prepend-icon="mdi-check" @click="updateStatus('active')">Re-activate Employer</v-btn>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-lock-reset" @click="resetPassword">Reset Password</v-btn>
      </div>
    </div>

    <!-- Password Reset Success Card -->
    <v-expand-transition>
      <v-card v-if="newPassword" color="success-lighten-5" class="mb-6 border-success pa-4 rounded-xl shadow-soft" border>
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex align-start gap-4">
            <v-icon color="success" size="32" class="mt-1">mdi-check-circle</v-icon>
            <div>
              <h3 class="text-h6 font-weight-bold text-success-darken-2 mb-1">Password Reset Successfully!</h3>
              <div class="text-body-1 text-grey-darken-3 d-flex align-center gap-2">
                New Temporary Password: 
                <span class="font-weight-black text-h6 font-mono px-3 py-1 bg-white rounded-lg border">{{ newPassword }}</span>
                <v-btn icon="mdi-content-copy" variant="text" size="small" color="success" @click="copyPassword" title="Copy to clipboard"></v-btn>
              </div>
              <div class="text-caption text-grey mt-1">This password has been emailed to the user.</div>
            </div>
          </div>
          <v-btn variant="text" color="grey" @click="newPassword = ''">Close</v-btn>
        </div>
      </v-card>
    </v-expand-transition>

    <v-row>
      <!-- Left Column: Profile Card -->
      <v-col cols="12" md="4">
        <v-card rounded="xl" border class="shadow-card text-center pa-6">
          <v-avatar size="120" class="mb-4 shadow-soft">
            <v-img v-if="employer.logo_url" :src="employer.logo_url" cover></v-img>
            <span v-else class="text-h2 text-teal font-weight-bold">{{ employer.company_name?.substring(0,1).toUpperCase() || 'C' }}</span>
          </v-avatar>
          <h2 class="text-h5 font-weight-black mb-1">{{ employer.company_name || 'Unknown Company' }}</h2>
          <p class="text-blue-grey text-body-2 mb-4">{{ employer.industry || 'Industry not specified' }}</p>
          
          <v-chip :color="getStatusColor(employer.status)" size="small" class="text-uppercase font-weight-bold mb-6">
            {{ employer.status?.replace('_', ' ') }}
          </v-chip>

          <v-divider class="mb-6"></v-divider>

          <div class="text-left">
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Contact Person</div>
              <div class="font-weight-medium">
                <v-icon size="small" class="mr-2 text-teal">mdi-account</v-icon> {{ employer.contact_person || 'N/A' }}
                <span v-if="employer.employer_role" class="text-caption text-grey text-uppercase ml-1">({{ employer.employer_role.replace('_', ' ') }})</span>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Email</div>
              <div class="font-weight-medium"><v-icon size="small" class="mr-2 text-teal">mdi-email</v-icon> {{ employer.email || 'N/A' }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Phone</div>
              <div class="font-weight-medium"><v-icon size="small" class="mr-2 text-teal">mdi-phone</v-icon> {{ employer.phone || 'N/A' }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Company Size</div>
              <div class="font-weight-medium"><v-icon size="small" class="mr-2 text-teal">mdi-account-group</v-icon> {{ employer.company_size || 'N/A' }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Website</div>
              <div class="font-weight-medium">
                <a v-if="employer.website" :href="employer.website" target="_blank" class="text-teal text-decoration-none d-flex align-center gap-2">
                  <v-icon size="small">mdi-web</v-icon> {{ employer.website }}
                </a>
                <span v-else>N/A</span>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">LinkedIn Profile</div>
              <div class="font-weight-medium">
                <a v-if="employer.linkedin_url" :href="employer.linkedin_url" target="_blank" class="text-teal text-decoration-none d-flex align-center gap-2">
                  <v-icon size="small">mdi-linkedin</v-icon> View Profile
                </a>
                <span v-else>N/A</span>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Address</div>
              <div class="font-weight-medium text-body-2"><v-icon size="small" class="mr-2 text-teal">mdi-map-marker</v-icon> {{ employer.address || 'N/A' }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">About Company</div>
              <div class="font-weight-medium text-body-2 text-blue-grey-600 line-clamp-4">{{ employer.description || 'No description provided.' }}</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Right Column: Stats & Jobs -->
      <v-col cols="12" md="8">
        <!-- Stats Grid -->
        <v-row class="mb-4">
          <v-col cols="12" sm="3">
            <v-card rounded="xl" border class="shadow-card pa-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-2">Total Jobs</div>
              <div class="text-h4 font-weight-black text-blue-grey-800">{{ employer.total_jobs || 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card rounded="xl" border class="shadow-card pa-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-2">Active Jobs</div>
              <div class="text-h4 font-weight-black text-success">{{ employer.active_jobs || 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card rounded="xl" border class="shadow-card pa-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-2">Pending Approval</div>
              <div class="text-h4 font-weight-black text-warning">{{ employer.pending_approval_jobs || 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card rounded="xl" border class="shadow-card pa-4">
              <div class="text-caption text-grey text-uppercase font-weight-bold mb-2">Applications</div>
              <div class="text-h4 font-weight-black text-info">{{ employer.total_applications || 0 }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Jobs Table -->
        <v-card rounded="xl" border class="shadow-card overflow-hidden">
          <v-card-title class="pa-6 pb-2 border-b">
            <h3 class="text-h6 font-weight-bold">Posted Jobs</h3>
          </v-card-title>
          <v-data-table
            :headers="jobHeaders"
            :items="jobs"
            :loading="loading"
            class="bg-transparent text-grey-darken-4 custom-table"
          >
            <!-- Title -->
            <template v-slot:item.title="{ item }">
              <div class="font-weight-bold">{{ item.title }}</div>
            </template>
            <!-- Status -->
            <template v-slot:item.status="{ item }">
              <v-chip size="small" :color="getJobStatusColor(item.status)" class="font-weight-bold text-uppercase" variant="flat">
                {{ item.status?.replace('_', ' ') }}
              </v-chip>
            </template>
            <!-- Date -->
            <template v-slot:item.created_at="{ item }">
              <div class="text-caption font-weight-medium">
                {{ new Date(item.created_at).toLocaleDateString() }}
              </div>
            </template>

            <template v-slot:no-data>
              <div class="pa-6 text-center text-grey">No jobs posted yet.</div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['super_admin', 'placement_coordinator'] });

const api = useApi();
const route = useRoute();
const loading = ref(false);
const newPassword = ref('');

const employer = ref<any>(null);
const jobs = ref<any[]>([]);

const jobHeaders: any[] = [
  { title: 'Job Title', key: 'title', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Applications', key: 'application_count', sortable: true, align: 'center' },
  { title: 'Posted Date', key: 'created_at', sortable: true }
];

onMounted(() => {
  loadEmployerDetails();
});

const loadEmployerDetails = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/admin/employers/${route.params.id}`);
    employer.value = res.data.employer;
    jobs.value = res.data.jobs;
  } catch (err) {
    console.error('Failed to load employer details', err);
    alert('Failed to load employer details.');
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    pending_verification: 'warning',
    suspended: 'error'
  };
  return map[status] || 'grey';
};

const getJobStatusColor = (status: string) => {
  const map: Record<string, string> = {
    approved: 'success',
    pending_approval: 'warning',
    draft: 'grey',
    rejected: 'error',
    closed: 'black'
  };
  return map[status] || 'info';
};

const updateStatus = async (status: string) => {
  if (!confirm(`Are you sure you want to mark this employer as ${status}?`)) return;
  try {
    await api.put(`/admin/users/${route.params.id}/status`, { status });
    
    // Also we need to hit the employer approval API to change approval_status
    if (status === 'active') {
      await api.patch(`/admin/employer-approve/${route.params.id}`, { status: 'approved' });
    } else if (status === 'suspended') {
      await api.patch(`/admin/employer-approve/${route.params.id}`, { status: 'suspended', notes: 'Suspended by admin' });
    }
    
    alert(`Employer status updated to ${status}`);
    await loadEmployerDetails();
  } catch (err) {
    console.error('Failed to update status', err);
    alert('Failed to update status');
  }
};

const resetPassword = async () => {
  if (!confirm(`Generate a new temporary password for ${employer.value.company_name || 'this employer'}?`)) return;
  try {
    const { data } = await api.post(`/admin/users/${route.params.id}/reset-password`);
    newPassword.value = data.temp_password;
  } catch (err) {
    console.error('Failed to reset password', err);
    alert('Failed to reset password');
  }
};

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(newPassword.value);
  } catch (e) {
    console.error('Failed to copy', e);
  }
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
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
