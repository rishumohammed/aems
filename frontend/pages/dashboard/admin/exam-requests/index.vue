<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Exam Readiness Requests</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-0">
          Review and process student requests indicating they are ready to write certification exams.
        </p>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="fetchRequests"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-amber-lighten-5 border-amber">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-amber-darken-3 text-uppercase">Pending Review</div>
              <div class="text-h4 font-weight-black text-amber-darken-4 mt-1">{{ pendingCount }}</div>
            </div>
            <v-avatar color="amber" size="44" rounded="lg">
              <v-icon color="white" size="24">mdi-clock-alert-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-emerald-lighten-5 border-emerald">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-success text-uppercase">Approved / Ready</div>
              <div class="text-h4 font-weight-black text-success mt-1">{{ approvedCount }}</div>
            </div>
            <v-avatar color="success" size="44" rounded="lg">
              <v-icon color="white" size="24">mdi-check-decagram-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-blue-lighten-5 border-blue">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-info text-uppercase">Scheduled</div>
              <div class="text-h4 font-weight-black text-info mt-1">{{ scheduledCount }}</div>
            </div>
            <v-avatar color="info" size="44" rounded="lg">
              <v-icon color="white" size="24">mdi-calendar-check-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary text-uppercase">Total Requests</div>
              <div class="text-h4 font-weight-black mt-1">{{ requests.length }}</div>
            </div>
            <v-avatar color="grey-darken-1" size="44" rounded="lg">
              <v-icon color="white" size="24">mdi-format-list-bulleted</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters & Search Toolbar -->
    <v-card flat class="pa-4 mb-6 rounded-xl border bg-white">
      <div class="d-flex align-center flex-wrap gap-3">
        <!-- Status Dropdown Select -->
        <v-select
          v-model="filterStatus"
          :items="[
            { title: `All Statuses (${requests.length})`, value: 'all' },
            { title: `Pending Review (${pendingCount})`, value: 'pending' },
            { title: `Approved / Ready (${approvedCount})`, value: 'approved' },
            { title: `Scheduled (${scheduledCount})`, value: 'scheduled' },
            { title: `Rejected`, value: 'rejected' }
          ]"
          label="Status"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          prepend-inner-icon="mdi-filter-variant"
          style="width: 210px;"
        ></v-select>

        <!-- Start Date -->
        <v-text-field
          v-model="startDate"
          type="date"
          label="From"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          clearable
          style="width: 145px;"
        ></v-text-field>

        <!-- End Date -->
        <v-text-field
          v-model="endDate"
          type="date"
          label="To"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          clearable
          style="width: 145px;"
        ></v-text-field>

        <!-- Search input -->
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search student, course..."
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          clearable
          style="width: 220px;"
        ></v-text-field>

        <!-- Reset Filter Button -->
        <v-btn
          v-if="startDate || endDate || filterStatus !== 'all' || search"
          variant="tonal"
          color="error"
          density="comfortable"
          rounded="lg"
          icon="mdi-filter-off"
          title="Reset Filters"
          @click="resetFilters"
        ></v-btn>

        <v-spacer></v-spacer>

        <!-- Result Count Indicator -->
        <div class="text-caption font-weight-medium text-grey">
          Showing <strong>{{ filteredRequests.length }}</strong> of {{ requests.length }} requests
        </div>
      </div>
    </v-card>

    <!-- Data Table Container -->
    <div class="apple-table-card">
      <div v-if="loading" class="pa-12 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="mt-3 text-secondary font-weight-bold">Loading exam readiness requests...</div>
      </div>

      <div v-else-if="filteredRequests.length === 0" class="pa-12 text-center">
        <v-icon size="64" color="grey-lighten-2" class="mb-3">mdi-text-box-search-outline</v-icon>
        <h3 class="text-h6 font-weight-bold text-secondary">No requests found</h3>
        <p class="text-caption text-grey">There are no exam readiness requests matching your filter criteria.</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="filteredRequests"
        class="bg-transparent"
        density="comfortable"
      >
        <template v-slot:item.student_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="36" class="mr-3 font-weight-bold text-white av-sq">
              {{ item.student_name?.charAt(0)?.toUpperCase() || 'S' }}
            </v-avatar>
            <div>
              <div class="font-weight-bold text-subtitle-2 text-grey-darken-3">{{ item.student_name }}</div>
              <div class="text-caption text-secondary">{{ item.student_email }}</div>
              <div v-if="item.student_phone" class="text-caption text-grey"><v-icon size="12" class="mr-1">mdi-phone</v-icon>{{ item.student_phone }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.course_title="{ item }">
          <div class="font-weight-bold text-body-2">
            {{ item.course_title || item.exam_title || item.certification_name || 'General Certification Exam' }}
          </div>
        </template>

        <template v-slot:item.notes="{ item }">
          <div class="text-body-2 text-grey-darken-1 text-truncate" style="max-width: 240px;" :title="item.notes || 'No message provided'">
            {{ item.notes || 'No additional notes provided.' }}
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <div class="text-caption font-weight-medium">{{ formatDate(item.created_at) }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            class="text-capitalize font-weight-bold"
            variant="flat"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-2">
            <v-btn
              color="primary"
              size="small"
              variant="flat"
              rounded="lg"
              class="font-weight-bold text-capitalize px-4"
              @click="openProcessModal(item)"
            >
              <v-icon start size="16">mdi-square-edit-outline</v-icon>
              Process
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Process Dialog Modal -->
    <v-dialog v-model="showModal" max-width="540" persistent>
      <v-card v-if="selectedRequest" class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center justify-space-between pa-4 border-b">
          <span class="text-h6 font-weight-bold">Process Exam Readiness Request</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Student Info -->
          <div class="pa-4 rounded-xl mb-4 bg-grey-lighten-4 border">
            <div class="text-subtitle-2 font-weight-bold mb-1">{{ selectedRequest.student_name }}</div>
            <div class="text-caption text-secondary">{{ selectedRequest.student_email }}</div>
            <v-divider class="my-2"></v-divider>
            <div class="text-caption text-secondary">Course / Exam:</div>
            <div class="text-subtitle-2 font-weight-bold text-primary">
              {{ selectedRequest.course_title || selectedRequest.exam_title || selectedRequest.certification_name || 'Certification Exam' }}
            </div>
            <div v-if="selectedRequest.notes" class="mt-2 text-caption bg-white pa-2 rounded border">
              <strong>Student Notes:</strong> "{{ selectedRequest.notes }}"
            </div>
          </div>

          <div class="mb-4">
            <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Update Request Status</label>
            <v-select
              v-model="modalStatus"
              :items="[
                { title: 'Approve (Student Ready)', value: 'approved' },
                { title: 'Schedule Exam', value: 'scheduled' },
                { title: 'Reject Request', value: 'rejected' },
                { title: 'Keep Pending', value: 'pending' }
              ]"
              variant="outlined"
              density="comfortable"
              hide-details
            ></v-select>
          </div>

          <div>
            <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Admin Notes / Remarks for Student</label>
            <v-textarea
              v-model="modalNotes"
              placeholder="e.g. Approved. Exam is scheduled for Friday at 10 AM. Please log into the Exam Portal..."
              variant="outlined"
              rows="3"
              density="comfortable"
              hide-details
            ></v-textarea>
            <div class="text-caption text-grey mt-1">The student will receive an in-app notification with these notes.</div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 border-t d-flex justify-end gap-3">
          <v-btn variant="text" rounded="lg" class="text-capitalize" @click="showModal = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="font-weight-bold text-capitalize px-6"
            :loading="submitting"
            @click="saveRequest"
          >
            Save Status & Notify Student
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useApi } from '@/composables/useApi';
import { useNavStore } from '@/stores/nav';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'lms_user', 'tutor', 'sub_admin']
});

const api = useApi();
const navStore = useNavStore();
const loading = ref(true);
const submitting = ref(false);
const requests = ref<any[]>([]);
const search = ref('');
const filterStatus = ref('all');
const startDate = ref('');
const endDate = ref('');

const showModal = ref(false);
const selectedRequest = ref<any>(null);
const modalStatus = ref('approved');
const modalNotes = ref('');

const resetFilters = () => {
  startDate.value = '';
  endDate.value = '';
  filterStatus.value = 'all';
  search.value = '';
};

const headers = [
  { title: 'Student', key: 'student_name' },
  { title: 'Course / Certification', key: 'course_title' },
  { title: 'Student Notes', key: 'notes' },
  { title: 'Date Submitted', key: 'created_at' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', align: 'end' as const }
];

const pendingCount = computed(() => requests.value.filter(r => r.status === 'pending').length);
const approvedCount = computed(() => requests.value.filter(r => r.status === 'approved').length);
const scheduledCount = computed(() => requests.value.filter(r => r.status === 'scheduled').length);

const filteredRequests = computed(() => {
  return requests.value.filter(r => {
    // Status Filter
    const matchesStatus = filterStatus.value === 'all' || r.status === filterStatus.value;

    // Search Query Filter
    const q = search.value.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.student_email || '').toLowerCase().includes(q) ||
      (r.course_title || '').toLowerCase().includes(q) ||
      (r.certification_name || '').toLowerCase().includes(q);

    // Date Range Filter
    let matchesDate = true;
    if (r.created_at) {
      const itemDate = dayjs(r.created_at);
      if (startDate.value) {
        matchesDate = matchesDate && (itemDate.isSame(dayjs(startDate.value), 'day') || itemDate.isAfter(dayjs(startDate.value), 'day'));
      }
      if (endDate.value) {
        matchesDate = matchesDate && (itemDate.isSame(dayjs(endDate.value), 'day') || itemDate.isBefore(dayjs(endDate.value), 'day'));
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });
});

const fetchRequests = async () => {
  loading.value = true;
  try {
    const res = await api.get('/exams/admin/readiness-requests');
    requests.value = res.data || res;
    // Refresh sidebar badge count as well
    navStore.fetchBadges();
  } catch (err) {
    console.error('Failed to fetch exam readiness requests:', err);
  } finally {
    loading.value = false;
  }
};

const openProcessModal = (item: any) => {
  selectedRequest.value = item;
  modalStatus.value = item.status === 'pending' ? 'approved' : item.status;
  modalNotes.value = item.admin_notes || '';
  showModal.value = true;
};

const saveRequest = async () => {
  if (!selectedRequest.value) return;
  submitting.value = true;
  try {
    await api.put(`/exams/admin/readiness-requests/${selectedRequest.value.id}`, {
      status: modalStatus.value,
      admin_notes: modalNotes.value
    });
    showModal.value = false;
    await fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || err.message || 'Failed to update request');
  } finally {
    submitting.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'amber';
    case 'approved': return 'success';
    case 'scheduled': return 'info';
    case 'rejected': return 'error';
    default: return 'grey';
  }
};

const formatDate = (date: string) => dayjs(date).format('MMM D, YYYY h:mm A');

onMounted(fetchRequests);
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.border-amber { border-color: rgba(255, 193, 7, 0.4) !important; }
.border-emerald { border-color: rgba(76, 175, 80, 0.4) !important; }
.border-blue { border-color: rgba(33, 150, 243, 0.4) !important; }

.apple-table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.av-sq {
  border-radius: 10px !important;
}
</style>
