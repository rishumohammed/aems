<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1 text-primary">Proctoring Logs</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">Review proctoring violations and integrity checks grouped by exam.</p>
      </div>
    </div>

    <!-- Dashboard Statistics -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-0 shadow-sm bg-white h-100">
          <div class="d-flex align-center">
            <v-avatar color="blue" size="32" class="mr-3">
              <v-icon icon="mdi-shield-check" color="white" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ stats.totalExamsMonitored }}</div>
              <div class="text-caption text-secondary">Exams Monitored</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-0 shadow-sm bg-white h-100">
          <div class="d-flex align-center">
            <v-avatar color="warning" size="32" class="mr-3">
              <v-icon icon="mdi-alert" color="white" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ stats.totalViolations }}</div>
              <div class="text-caption text-secondary">Total Violations</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-0 shadow-sm bg-white h-100">
          <div class="d-flex align-center">
            <v-avatar color="red" size="32" class="mr-3">
              <v-icon icon="mdi-alert-octagon" color="white" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ stats.highSeverityViolations }}</div>
              <div class="text-caption text-secondary">High Severity</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-0 shadow-sm bg-white h-100">
          <div class="d-flex align-center">
            <v-avatar color="purple" size="32" class="mr-3">
              <v-icon icon="mdi-account-alert" color="white" size="18"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ stats.studentsFlagged }}</div>
              <div class="text-caption text-secondary">Students Flagged</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-6 rounded-xl filter-card" elevation="0">
      <v-card-text class="d-flex flex-wrap gap-4 align-center">
        <v-text-field
          v-model="filters.exam"
          label="Filter by Exam"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1"
          style="min-width: 200px"
        ></v-text-field>
        <v-text-field
          v-model="filters.student"
          label="Filter by Student"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1"
          style="min-width: 200px"
        ></v-text-field>
        <v-select
          v-model="filters.severity"
          :items="['All', 'High', 'Medium', 'Low']"
          label="Severity"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 150px"
        ></v-select>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="d-flex justify-center pa-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Collapsible Exam Groups -->
    <v-expansion-panels v-else v-model="expandedPanels" multiple class="exam-panels">
      <v-expansion-panel v-for="(exam, index) in filteredExams" :key="exam.id" :value="index" class="mb-4 rounded-xl overflow-hidden exam-panel">
        <v-expansion-panel-title class="pa-4 exam-panel-title">
          <div class="d-flex flex-column w-100">
            <h2 class="text-h6 font-weight-bold mb-2">{{ exam.title }} <span class="text-subtitle-2 text-secondary ml-2" v-if="exam.course_title">({{ exam.course_title }})</span></h2>
            <div class="d-flex gap-6 text-body-2 text-secondary">
              <span class="d-flex align-center"><v-icon size="small" class="mr-1">mdi-account-multiple</v-icon> Attempts: <strong class="ml-1 text-black">{{ exam.attempts }}</strong></span>
              <span class="d-flex align-center"><v-icon size="small" class="mr-1">mdi-alert</v-icon> Violations: <strong class="ml-1 text-black">{{ exam.totalViolations }}</strong></span>
              <span class="d-flex align-center"><v-icon size="small" color="error" class="mr-1">mdi-alert-octagon</v-icon> High Severity: <strong class="ml-1 text-error">{{ exam.highSeverity }}</strong></span>
              <span class="d-flex align-center"><v-icon size="small" class="mr-1">mdi-calendar</v-icon> Exam Date: <strong class="ml-1 text-black">{{ new Date(exam.date).toLocaleDateString() }}</strong></span>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <v-data-table
            :headers="headers"
            :items="filterViolations(exam.violations)"
            hover
            class="apple-data-table"
            items-per-page="-1"
          >
            <template v-slot:bottom></template> <!-- Hide pagination -->

            <template v-slot:item.student_name="{ item }">
              <div class="font-weight-bold text-black">{{ item.student_name }}</div>
</template>
            
            <template v-slot:item.student_id="{ item }">
              <span class="text-caption text-secondary">#{{ String(item.student_id).substring(0,6) }}</span>
            </template>

            <template v-slot:item.violation_type="{ item }">
              <span class="text-capitalize">{{ item.violation_type.replace(/_/g, ' ') }}</span>
            </template>

            <template v-slot:item.severity="{ item }">
              <Badge :color="getSeverityColor(item.severity)">
                <span class="d-flex align-center gap-1">
                  <span class="severity-dot" :class="'bg-' + getSeverityColor(item.severity)"></span>
                  {{ item.severity }}
                </span>
              </Badge>
            </template>

            <template v-slot:item.timestamp="{ item }">
              <span class="text-caption text-secondary font-weight-medium">
                {{ new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                <br>
                {{ new Date(item.timestamp).toLocaleDateString() }}
              </span>
            </template>

            <template v-slot:item.has_screenshot="{ item }">
              <v-btn
                v-if="item.has_screenshot"
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-image"
                @click="openEvidenceModal(item, exam)"
              >
                View Evidence
              </v-btn>
              <span v-else class="text-caption text-grey">No Evidence</span>
            </template>

            <template v-slot:item.actions="{ item }">
              <AppButton
                size="xs"
                variant="g"
                icon="mdi-eye"
                @click="navigateTo(`/dashboard/admin/proctoring/${item.attempt_id}`)"
              >
                View Details
              </AppButton>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Evidence Modal -->
    <v-dialog v-model="evidenceModal.show" max-width="600px">
      <v-card rounded="xl" class="pa-4 bg-white">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Violation Evidence</span>
          <v-btn icon="mdi-close" variant="text" @click="evidenceModal.show = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="evidenceModal.item" class="d-flex flex-column gap-3">
            <div class="evidence-image-container rounded-lg overflow-hidden border mb-4">
              <v-img :src="backendUrl(evidenceModal.item.screenshot_url)" max-height="400" contain class="bg-grey-lighten-4"></v-img>
            </div>
            
            <div class="d-flex flex-column gap-2 text-body-2">
              <div><strong>Violation Type:</strong> <span class="text-capitalize">{{ evidenceModal.item.violation_type.replace(/_/g, ' ') }}</span></div>
              <div><strong>Severity:</strong> <span class="font-weight-bold" :class="evidenceModal.item.severity === 'High' ? 'text-error' : 'text-warning'">{{ evidenceModal.item.severity }}</span></div>
              <div><strong>Time:</strong> {{ new Date(evidenceModal.item.timestamp).toLocaleString() }}</div>
              <div><strong>Student:</strong> {{ evidenceModal.item.student_name }}</div>
              <div><strong>Exam:</strong> {{ evidenceModal.examTitle }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import Badge from '@/components/ui/Badge.vue';
import AppButton from '@/components/ui/AppButton.vue';

definePageMeta({ 
  layout: 'dashboard', 
  middleware: ['auth', 'role'], 
  role: ['super_admin', 'lms_user', 'tutor'] 
});

const api = useApi();
const loading = ref(true);
const exams = ref<any[]>([]);
const stats = ref({
  totalExamsMonitored: 0,
  totalViolations: 0,
  highSeverityViolations: 0,
  studentsFlagged: 0
});
const expandedPanels = ref<number[]>([]);

const filters = ref({
  exam: '',
  student: '',
  severity: 'All'
});

const evidenceModal = ref({
  show: false,
  item: null as any,
  examTitle: ''
});

const backendUrl = (path: string) => {
  if (!path) return '';
  const config = useRuntimeConfig();
  return `${config.public.apiBase.replace('/api', '')}${path}`;
};

const openEvidenceModal = (item: any, exam: any) => {
  evidenceModal.value = {
    show: true,
    item,
    examTitle: exam.title
  };
};

const headers: any[] = [
  { title: 'Student', key: 'student_name' },
  { title: 'Violation Type', key: 'violation_type' },
  { title: 'Timestamp', key: 'timestamp' },
  { title: 'Severity', key: 'severity' },
  { title: 'Evidence Image', key: 'has_screenshot', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

onMounted(async () => {
  await loadViolations();
});

const loadViolations = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/proctoring/admin/violations');
    if (data) {
      exams.value = data.exams || [];
      stats.value = data.stats || {
        totalExamsMonitored: 0,
        totalViolations: 0,
        highSeverityViolations: 0,
        studentsFlagged: 0
      };
      // Expand all by default
      expandedPanels.value = exams.value.map((_, i) => i);
    }
  } catch (err) {
    console.error('Failed to load proctoring violations', err);
  } finally {
    loading.value = false;
  }
};

const filteredExams = computed(() => {
  return exams.value.filter(exam => {
    // Check if exam matches exam filter
    if (filters.value.exam && !exam.title.toLowerCase().includes(filters.value.exam.toLowerCase())) {
      return false;
    }
    
    // Check if any violation inside this exam matches student and severity filters
    const validViolations = filterViolations(exam.violations);
    return validViolations.length > 0;
  });
});

const filterViolations = (violations: any[]) => {
  return violations.filter(v => {
    if (filters.value.student && !v.student_name.toLowerCase().includes(filters.value.student.toLowerCase())) {
      return false;
    }
    if (filters.value.severity !== 'All' && v.severity !== filters.value.severity) {
      return false;
    }
    return true;
  });
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'High': return 'red';
    case 'Medium': return 'warning';
    case 'Low': return 'green';
    default: return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'graded': return 'green';
    case 'submitted': return 'blue';
    case 'pending_manual_review': return 'warning';
    case 'in_progress': return 'gray';
    default: return 'gray';
  }
};
</script>

<style scoped>


.filter-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
}

.exam-panel {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  
}

.exam-panel-title {
  background: #fafbfc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.gap-6 {
  gap: 24px;
}

.gap-1 {
  gap: 4px;
}

.severity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
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
  background: white !important;
}

:deep(.v-data-table__td) {
  font-size: 13px !important;
  color: var(--g6) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
  background: white !important;
}
</style>
