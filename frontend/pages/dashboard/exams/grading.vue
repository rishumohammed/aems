<template>
  <div class="pa-6 fade-in">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="page-title mb-1">Results & Grading</h1>
        <p class="text-subtitle-1 text-secondary">Review and manually grade exam submissions</p>
      </div>
      <div class="filter-pill">
        <AppInput
          v-model="statusFilter"
          type="select"
          :options="statusOptions"
          @update:model-value="fetchAttempts"
        />
      </div>
    </div>

    <div class="apple-table-card">
      <v-data-table
        :headers="headers"
        :items="attempts"
        :loading="loading"
        hover
        class="apple-data-table"
      >
        <template #item.student_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" class="mr-3 av-sq">
              <v-img :src="`https://ui-avatars.com/api/?name=${item.student_name}&background=EBF5FF&color=007AFF`"></v-img>
            </v-avatar>
            <div class="font-weight-bold">{{ item.student_name }}</div>
          </div>
        </template>

        <template #item.status="{ item }">
          <Badge :color="statusColor(item.status)">
            {{ item.status.replace('_',' ') }}
          </Badge>
        </template>

        <template #item.score="{ item }">
          <div v-if="item.score !== null && item.status !== 'in_progress'" class="d-flex align-center gap-2">
            <span class="font-weight-bold">{{ item.score }}%</span>
            <Badge :color="item.passed ? 'green' : 'red'">
              {{ item.passed ? 'PASS' : 'FAIL' }}
            </Badge>
          </div>
          <span v-else class="text-secondary">—</span>
        </template>

        <template #item.submitted_at="{ item }">
          <span class="text-caption text-secondary font-weight-medium">
            {{ item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '—' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <AppButton
              size="xs"
              :variant="item.status === 'pending_manual_review' ? 'blue' : 'g'"
              :to="`/exam/${item.id}/results`"
              :icon="item.status === 'pending_manual_review' ? 'mdi-pencil-outline' : 'mdi-eye-outline'"
            >
              {{ item.status === 'pending_manual_review' ? 'Grade' : 'View' }}
            </AppButton>
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi';

definePageMeta({ 
  layout: 'dashboard', 
  middleware: ['auth', 'role'],
  role: ['super_admin', 'tutor'] 
});

const api = useApi();
const loading = ref(true);
const attempts = ref<any[]>([]);
const statusFilter = ref('');

const statusOptions = [
  { title: 'Pending Review', value: 'pending_manual_review' },
  { title: 'Graded', value: 'graded' },
  { title: 'Submitted', value: 'submitted' },
  { title: 'All Attempts', value: '' },
];

const headers: any[] = [
  { title: 'Student', key: 'student_name' },
  { title: 'Exam', key: 'exam_title' },
  { title: 'Course', key: 'course_title' },
  { title: 'Score', key: 'score' },
  { title: 'Submitted', key: 'submitted_at' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
];

const statusColor = (s: string) => ({
  graded: 'green', pending_manual_review: 'orange',
  submitted: 'blue', in_progress: 'gray', scheduled: 'gray'
}[s] || 'gray');

const fetchAttempts = async () => {
  loading.value = true;
  try {
    const params = statusFilter.value ? `?status=${statusFilter.value}` : '';
    const { data } = await api.get(`/exams/attempts${params}`);
    attempts.value = data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAttempts);
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

.av-sq {
  border-radius: 10px !important;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
