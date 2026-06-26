<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1 text-primary">Interviews</h1>
        <p class="text-blue-grey-300">Manage your scheduled interviews with candidates.</p>
      </div>
    </div>

    <v-card color="white" rounded="xl" border class="shadow-card">
      <v-data-table
        :headers="headers"
        :items="interviews"
        :loading="loading"
        class="bg-transparent text-grey-darken-4 custom-table"
      >
        <template v-slot:item.candidate="{ item }">
          <div class="font-weight-bold text-h6">{{ item.applicant_name || 'Anonymous' }}</div>
          <div class="text-caption text-blue-grey-300">{{ item.applicant_email }}</div>
</template>

        <template v-slot:item.job="{ item }">
          <div class="font-weight-bold">{{ item.job_title }}</div>
          <div class="text-caption text-blue-grey-300">{{ item.round_name || 'Interview' }}</div>
        </template>

        <template v-slot:item.scheduled_at="{ item }">
          <div class="font-weight-bold text-primary">{{ new Date(item.scheduled_at).toLocaleString() }}</div>
        </template>
        
        <template v-slot:item.details="{ item }">
          <div v-if="item.meeting_link">
            <v-btn size="small" color="primary" variant="tonal" :href="item.meeting_link" target="_blank" prepend-icon="mdi-video">Join Meeting</v-btn>
          </div>
          <div v-else-if="item.location" class="text-caption">
            <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> {{ item.location }}
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip 
            size="small" 
            variant="flat" 
            :color="getStatusColor(item.status)"
            class="text-uppercase font-weight-bold"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn 
            variant="tonal" 
            color="primary" 
            size="small" 
            prepend-icon="mdi-eye"
            :to="`/dashboard/employer/applicants/${item.application_id}`"
          >
            View Applicant
          </v-btn>
        </template>
        
        <template v-slot:no-data>
          <div class="pa-8 text-center text-blue-grey-300">
            <v-icon size="64" class="mb-4 opacity-50">mdi-calendar-blank</v-icon>
            <h3>No interviews scheduled.</h3>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit / Reschedule Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card color="white" rounded="xl" border class="text-grey-darken-4 pa-4">
        <v-card-title class="font-weight-bold">Edit / Reschedule Interview</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editData.scheduled_at"
              label="Date & Time"
              type="datetime-local"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4 mt-2"
            ></v-text-field>
            
            <v-select
              v-model="editData.type"
              :items="['Online', 'In-Person', 'Phone']"
              label="Interview Type"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model.number="editData.duration"
              label="Duration (minutes)"
              type="number"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="editData.type === 'Online'"
              v-model="editData.meeting_link"
              label="Meeting Link (Google Meet, Zoom, etc.)"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="editData.type === 'In-Person'"
              v-model="editData.location"
              label="Office Location / Address"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="editData.reschedule_reason"
              label="Reason for Rescheduling (if changing date/time)"
              variant="outlined"
              color="primary"
              rows="2"
              class="mb-4"
            ></v-textarea>

            <v-textarea
              v-model="editData.notes"
              label="Message / Notes for Candidate"
              variant="outlined"
              color="primary"
              rows="2"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn  @click="editDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="primary"  :loading="editLoading" @click="submitEdit" class="px-6" variant="flat" rounded="lg">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const api = useApi();
const interviews = ref<any[]>([]);
const loading = ref(false);

const editDialog = ref(false);
const editLoading = ref(false);
const editForm = ref<any>(null);
const editData = ref({
  id: '',
  scheduled_at: '',
  type: 'Online',
  duration: 60,
  meeting_link: '',
  location: '',
  notes: '',
  reschedule_reason: ''
});

const headers: any[] = [
  { title: 'Candidate', key: 'candidate', sortable: true },
  { title: 'Job', key: 'job', sortable: true },
  { title: 'Date & Time', key: 'scheduled_at', sortable: true },
  { title: 'Details', key: 'details', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadInterviews();
});

const loadInterviews = async () => {
  loading.value = true;
  try {
    const res = await api.get('/interviews');
    interviews.value = res.data || res;
  } catch (error) {
    console.error('Failed to load interviews', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id: string, status: string) => {
  if (!confirm(`Update interview status to ${status}?`)) return;
  try {
    await api.patch(`/interviews/${id}/status`, { status });
    await loadInterviews();
  } catch (error) {
    console.error('Failed to update status', error);
  }
};

const openEditDialog = (item: any) => {
  // Format date to datetime-local
  const dateObj = new Date(item.scheduled_at);
  const formattedDate = dateObj.toISOString().slice(0, 16);

  editData.value = {
    id: item.id,
    scheduled_at: formattedDate,
    type: item.type || 'Online',
    duration: item.duration || 60,
    meeting_link: item.meeting_link || '',
    location: item.location || '',
    notes: item.notes || '',
    reschedule_reason: ''
  };
  editDialog.value = true;
};

const submitEdit = async () => {
  const { valid } = await editForm.value?.validate() || { valid: false };
  if (!valid) return;

  editLoading.value = true;
  try {
    await api.patch(`/interviews/${editData.value.id}`, editData.value);
    alert('Interview updated successfully!');
    editDialog.value = false;
    await loadInterviews();
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to update interview');
  } finally {
    editLoading.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'scheduled': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    case 'rescheduled': return 'warning';
    default: return 'grey';
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
::v-deep(.custom-table) {
  background: transparent !important;
}
::v-deep(.custom-table th) {
  background: rgba(255,255,255,0.03) !important;
  color: #94a3b8 !important;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  padding: 16px !important;
}
::v-deep(.custom-table td) {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}
</style>
