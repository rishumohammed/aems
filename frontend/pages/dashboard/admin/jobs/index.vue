<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Job Approvals</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">Review employer submissions and manage live jobs.</p>
      </div>
      <div class="d-flex align-center gap-3">
        <TabsPill
          v-model="activeTab"
          :tabs="[
            { label: 'All', value: 'all' },
            { label: 'Live', value: 'approved' }
          ]"
        />
        <AppButton icon="mdi-plus" to="/dashboard/employer/jobs/create">
          Post Job
        </AppButton>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="mb-6 overflow-x-auto no-scrollbar d-flex gap-2">
      <SegmentControl
        v-model="activeCategory"
        :options="[{ label: 'All Categories', value: 'all', icon: 'mdi-apps' }, ...categories.map(c => ({ label: c.name, value: c.id }))]"
      />
    </div>

    <div class="apple-table-card">
      <v-data-table
        :headers="headers"
        :items="filteredJobs"
        :loading="loading"
        class="apple-data-table"
      >
        <template v-slot:item.title="{ item }">
          <div class="d-flex align-center py-2">
            <div class="company-logo mr-3">
              <v-icon icon="mdi-domain" color="blue" size="20"></v-icon>
            </div>
            <div>
              <div class="job-title">{{ item.title }}</div>
              <div class="company-name">{{ item.company }} • {{ item.category_name }}</div>
            </div>
          </div>
</template>

        <template v-slot:item.location="{ item }">
          <Badge :color="item.is_remote ? 'blue' : 'gray'">
            {{ item.is_remote ? 'Remote' : item.location }}
          </Badge>
        </template>

        <template v-slot:item.applicant_count="{ item }">
          <AppButton 
            v-if="item.status === 'approved'"
            size="xs"
            variant="g"
            :to="`/dashboard/admin/jobs/${item.id}/applicants`"
          >
            {{ item.applicant_count }} Applicants
          </AppButton>
          <span v-else class="text-caption text-secondary">-</span>
        </template>

        <template v-slot:item.status="{ item }">
          <Badge :color="getStatusColor(item.status)">
            {{ item.status }}
          </Badge>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <template v-if="item.status === 'pending'">
              <AppButton size="xs" variant="success" icon="mdi-check" @click="approveJob(item)">Approve</AppButton>
              <AppButton size="xs" variant="danger" icon="mdi-close" @click="openRejectModal(item)">Reject</AppButton>
            </template>
            <AppButton size="xs" variant="g" icon="mdi-eye-outline" :to="`/jobs/${item.id}`"></AppButton>
            <AppButton size="xs" variant="g" icon="mdi-trash-can-outline" @click="deleteJob(item)"></AppButton>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Reject Modal -->
    <AppModal
      v-model="rejectDialog"
      title="Reject Job Submission"
      action-label="Reject Job"
      @submit="confirmReject"
      :loading="saving"
    >
      <p class="text-caption text-secondary mb-4">Provide a reason for rejection. This will be emailed to the employer.</p>
      <AppInput
        v-model="rejectReason"
        label="Rejection Reason"
        type="textarea"
        placeholder="Reason for rejection..."
        large
      />
    </AppModal>
  </v-container>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['super_admin', 'sub_admin', 'placement_coordinator'] });

const api = useApi();
const activeTab = ref('all');
const activeCategory = ref('all');
const categories = ref<any[]>([]);
const jobs = ref<any[]>([]);
const loading = ref(false);

const rejectDialog = ref(false);
const rejectReason = ref('');
const rejectingJob = ref<any>(null);
const saving = ref(false);

const headers: any[] = [
  { title: 'Job / Company', key: 'title', sortable: true, align: 'start' },
  { title: 'Location', key: 'location', sortable: true, align: 'start' },
  { title: 'Applicants', key: 'applicant_count', sortable: true, align: 'start' },
  { title: 'Submitted', key: 'created_at', sortable: true, align: 'start' },
  { title: 'Status', key: 'status', sortable: true, align: 'start' },
  { title: '', key: 'actions', sortable: false, align: 'end' }
];

const filteredJobs = computed(() => {
  let filtered = jobs.value;
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(j => j.category === activeCategory.value);
  }
  return filtered;
});

onMounted(async () => {
  await Promise.all([loadCategories(), loadJobs()]);
});

watch(activeTab, loadJobs);

async function loadCategories() {
  try {
    const { data } = await api.get('/admin/job-categories');
    categories.value = data;
  } catch (e) {
    console.error(e);
  }
}

async function loadJobs() {
  loading.value = true;
  try {
    const status = activeTab.value === 'all' ? 'all' : activeTab.value;
    const { data } = await api.get(`/admin/jobs?status=${status}`);
    jobs.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function getStatusColor(status: string) {
  switch(status) {
    case 'approved': return 'green';
    case 'pending': return 'warning';
    case 'rejected': return 'red';
    default: return 'gray';
  }
}

async function approveJob(job: any) {
  if (!confirm(`Approve job "${job.title}"?`)) return;
  try {
    await api.put(`/admin/jobs/${job.id}/approve`);
    await loadJobs();
  } catch (e) {
    alert('Failed to approve');
  }
}

function openRejectModal(job: any) {
  rejectingJob.value = job;
  rejectReason.value = '';
  rejectDialog.value = true;
}

async function confirmReject() {
  if (!rejectReason.value) return alert('Provide a reason');
  saving.value = true;
  try {
    await api.put(`/admin/jobs/${rejectingJob.value?.id}/reject`, { reason: rejectReason.value });
    rejectDialog.value = false;
    await loadJobs();
  } catch (e) {
    alert('Failed to reject');
  } finally {
    saving.value = false;
  }
}

async function deleteJob(job: any) {
  if (!confirm(`Are you sure you want to delete job "${job.title}"?`)) return;
  try {
    await api.delete(`/admin/jobs/${job.id}`);
    await loadJobs();
  } catch (e) {
    alert('Failed to delete job');
  }
}
</script>

<style scoped>


.apple-table-card {
  background: white;
  border-radius: var(--radius-lg);
  
  overflow: hidden;
  border: 1px solid var(--border);
}

.apple-data-table {
  background: transparent !important;
}

:deep(.v-data-table-header th) {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  color: var(--g4) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-data-table__td) {
  font-size: 13px !important;
  color: var(--g6) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
}

.job-title {
  font-weight: 700;
  color: var(--g7);
  line-height: 1.2;
}

.company-name {
  font-size: 11px;
  color: var(--g4);
}

.company-logo {
  width: 36px;
  height: 36px;
  background: var(--blue-l);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
