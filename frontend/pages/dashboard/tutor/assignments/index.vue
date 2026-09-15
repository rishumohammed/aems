<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4 mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Assignments & Grading</h1>
        <p class="text-subtitle-1 text-grey-darken-1 mb-0">Manage course assignments, review student submissions, and grade work.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        rounded="lg"
        class="font-weight-bold text-capitalize shadow-soft"
        @click="openCreateModal"
      >
        Create Assignment
      </v-btn>
    </div>

    <!-- Overview Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card flat border rounded="xl" class="pa-4 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-bold text-uppercase">Total Assignments</div>
              <div class="text-h4 font-weight-black mt-1">{{ assignments.length }}</div>
            </div>
            <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
              <v-icon color="primary" size="28">mdi-file-document-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat border rounded="xl" class="pa-4 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-bold text-uppercase">Total Submissions</div>
              <div class="text-h4 font-weight-black mt-1">{{ totalSubmissions }}</div>
            </div>
            <v-avatar color="info" variant="tonal" rounded="lg" size="48">
              <v-icon color="info" size="28">mdi-tray-full</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat border rounded="xl" class="pa-4 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-bold text-uppercase">Pending Grading</div>
              <div class="text-h4 font-weight-black mt-1 text-warning">{{ totalPending }}</div>
            </div>
            <v-avatar color="warning" variant="tonal" rounded="lg" size="48">
              <v-icon color="warning" size="28">mdi-clock-alert-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat border rounded="xl" class="pa-4 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-bold text-uppercase">Graded Work</div>
              <div class="text-h4 font-weight-black mt-1 text-success">{{ totalGraded }}</div>
            </div>
            <v-avatar color="success" variant="tonal" rounded="lg" size="48">
              <v-icon color="success" size="28">mdi-check-decagram-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters & Table -->
    <v-card flat border rounded="xl" class="bg-white">
      <div class="pa-6 border-b d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search assignments..."
          variant="outlined"
          density="comfortable"
          hide-details
          class="max-width-300"
        ></v-text-field>

        <v-select
          v-model="selectedCourseFilter"
          :items="courseOptions"
          item-title="title"
          item-value="id"
          label="Filter by Course"
          variant="outlined"
          density="comfortable"
          hide-details
          class="max-width-300"
        ></v-select>
      </div>

      <!-- Assignments Table -->
      <v-data-table
        :headers="headers"
        :items="filteredAssignments"
        :loading="loading"
        hover
        class="elevation-0"
      >
        <template v-slot:item.title="{ item }">
          <div>
            <div class="font-weight-bold text-body-1">{{ item.title }}</div>
            <div class="text-caption text-grey">{{ item.course_title }}</div>
          </div>
        </template>

        <template v-slot:item.max_marks="{ item }">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            {{ item.max_marks || 100 }} Marks
          </v-chip>
        </template>

        <template v-slot:item.due_date="{ item }">
          <span class="text-body-2" :class="{ 'text-error font-weight-bold': isPastDue(item.due_date) }">
            {{ item.due_date ? formatDate(item.due_date) : 'No due date' }}
          </span>
        </template>

        <template v-slot:item.submissions="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip size="small" color="info" variant="flat" class="font-weight-bold">
              {{ item.total_submissions || 0 }} Total
            </v-chip>
            <v-chip v-if="item.pending_submissions > 0" size="small" color="warning" variant="flat" class="font-weight-bold">
              {{ item.pending_submissions }} Pending
            </v-chip>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              rounded="lg"
              class="text-capitalize font-weight-bold"
              prepend-icon="mdi-format-list-checks"
              @click="openSubmissionsDrawer(item)"
            >
              Submissions ({{ item.total_submissions || 0 }})
            </v-btn>

            <v-btn
              icon="mdi-pencil-outline"
              variant="text"
              color="grey-darken-1"
              size="small"
              @click="openEditModal(item)"
            ></v-btn>

            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              color="error"
              size="small"
              @click="deleteAssignment(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Assignment Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card rounded="xl">
        <v-card-title class="pa-6 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">{{ isEditing ? 'Edit Assignment' : 'Create Assignment' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="saveAssignment">
            <v-select
              v-model="form.course_id"
              :items="courses"
              item-title="title"
              item-value="id"
              label="Select Course *"
              variant="outlined"
              :rules="[v => !!v || 'Course is required']"
              class="mb-4"
              :disabled="isEditing"
            ></v-select>

            <v-text-field
              v-model="form.title"
              label="Assignment Title *"
              variant="outlined"
              :rules="[v => !!v || 'Title is required']"
              class="mb-4"
              placeholder="e.g. Build a Responsive Landing Page"
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Description & Instructions"
              variant="outlined"
              rows="4"
              class="mb-4"
              placeholder="Provide clear instructions for students..."
            ></v-textarea>

            <v-row class="mb-2">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.max_marks"
                  label="Total Marks"
                  type="number"
                  variant="outlined"
                  min="1"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.due_date"
                  label="Due Date"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 border-t d-flex justify-end gap-3">
          <v-btn variant="text" class="text-capitalize font-weight-bold" @click="showModal = false">Cancel</v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            class="px-6 font-weight-bold text-capitalize"
            :loading="saving"
            @click="saveAssignment"
          >
            {{ isEditing ? 'Update Assignment' : 'Save Assignment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Student Submissions Drawer / Dialog -->
    <v-dialog v-model="showSubmissions" max-width="900px">
      <v-card rounded="xl">
        <v-card-title class="pa-6 border-b d-flex align-center justify-space-between">
          <div>
            <div class="text-h6 font-weight-bold">Submissions: {{ selectedAssignment?.title }}</div>
            <div class="text-caption text-grey">Max Marks: {{ selectedAssignment?.max_marks || 100 }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showSubmissions = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="loadingSubmissions" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>

          <div v-else-if="submissions.length === 0" class="text-center pa-8 text-grey">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-tray-arrow-down</v-icon>
            <div class="text-subtitle-1 font-weight-bold">No submissions yet</div>
            <p class="text-body-2 text-grey">Students have not submitted work for this assignment yet.</p>
          </div>

          <v-list v-else variant="flat" class="pa-0">
            <v-card
              v-for="sub in submissions"
              :key="sub.id"
              flat
              border
              rounded="xl"
              class="mb-4 pa-4"
            >
              <div class="d-flex flex-column flex-sm-row justify-space-between gap-4 mb-3">
                <div class="d-flex align-center gap-3">
                  <v-avatar color="primary" variant="tonal" size="40">
                    <span class="font-weight-bold">{{ sub.student_name ? sub.student_name.charAt(0).toUpperCase() : 'S' }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-body-1">{{ sub.student_name }}</div>
                    <div class="text-caption text-grey">{{ sub.student_email }} • Submitted: {{ formatDate(sub.submitted_at) }}</div>
                  </div>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="getSubmissionStatusColor(sub.status)"
                    size="small"
                    class="font-weight-bold text-uppercase"
                    variant="flat"
                  >
                    {{ sub.status }}
                  </v-chip>
                  
                  <v-chip v-if="sub.marks_awarded !== null" size="small" color="primary" variant="tonal" class="font-weight-bold">
                    Score: {{ sub.marks_awarded }} / {{ sub.max_marks || 100 }}
                  </v-chip>

                  <v-btn
                    color="primary"
                    size="small"
                    rounded="lg"
                    class="font-weight-bold text-capitalize"
                    @click="openGradeModal(sub)"
                  >
                    {{ sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission' }}
                  </v-btn>
                </div>
              </div>

              <!-- Student Submission Text / Link -->
              <div class="pa-3 rounded-lg bg-grey-lighten-4 text-body-2 mb-2">
                <div class="font-weight-bold text-caption text-grey mb-2">Student Submitted Work:</div>
                <div v-if="sub.submission_url" class="d-flex align-center flex-wrap gap-2">
                  <v-btn
                    :href="getSubmissionUrl(sub.submission_url)"
                    target="_blank"
                    color="primary"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-open-in-new"
                    class="text-none font-weight-bold"
                  >
                    View Submitted File / Link
                  </v-btn>
                  <span class="text-caption text-grey text-truncate max-width-300" :title="sub.submission_url">{{ sub.submission_url }}</span>
                </div>
                <div v-else class="text-caption text-grey italic">No submission file or link provided.</div>
              </div>

              <!-- Feedback preview if graded -->
              <div v-if="sub.feedback" class="text-caption text-grey-darken-1 italic">
                <strong>Tutor Feedback:</strong> {{ sub.feedback }}
              </div>
            </v-card>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Grading Modal -->
    <v-dialog v-model="showGradeModal" max-width="500px">
      <v-card rounded="xl">
        <v-card-title class="pa-6 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Grade Student Work</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showGradeModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-bold">{{ activeSubmission?.student_name }}</div>
            <div class="text-caption text-grey">Assignment: {{ activeSubmission?.assignment_title }}</div>
          </div>

          <v-text-field
            v-model.number="gradeForm.marks_awarded"
            label="Marks Awarded *"
            type="number"
            variant="outlined"
            min="0"
            :max="activeSubmission?.max_marks || 100"
            :suffix="'/ ' + (activeSubmission?.max_marks || 100)"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="gradeForm.status"
            :items="[
              { title: 'Graded (Accepted)', value: 'graded' },
              { title: 'Rejected (Needs Revision)', value: 'rejected' }
            ]"
            item-title="title"
            item-value="value"
            label="Status *"
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-textarea
            v-model="gradeForm.feedback"
            label="Feedback & Comments"
            variant="outlined"
            rows="3"
            placeholder="Write constructive feedback for the student..."
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-6 border-t d-flex justify-end gap-3">
          <v-btn variant="text" class="text-capitalize font-weight-bold" @click="showGradeModal = false">Cancel</v-btn>
          <v-btn
            color="success"
            rounded="lg"
            class="px-6 font-weight-bold text-capitalize"
            :loading="grading"
            @click="submitGrade"
          >
            Submit Grade
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'dashboard'
});

const api = useApi();
const config = useRuntimeConfig();

const getSubmissionUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = config.public.apiBase.replace('/api', '');
  return base + url;
};
const loading = ref(false);
const saving = ref(false);
const grading = ref(false);
const searchQuery = ref('');
const selectedCourseFilter = ref('all');

const assignments = ref<any[]>([]);
const courses = ref<any[]>([]);

const showModal = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const formRef = ref<any>(null);

const form = ref({
  id: '',
  course_id: '',
  title: '',
  description: '',
  due_date: '',
  max_marks: 100
});

// Submissions drawer
const showSubmissions = ref(false);
const loadingSubmissions = ref(false);
const selectedAssignment = ref<any>(null);
const submissions = ref<any[]>([]);

// Grading modal
const showGradeModal = ref(false);
const activeSubmission = ref<any>(null);
const gradeForm = ref({
  marks_awarded: 0,
  status: 'graded',
  feedback: ''
});

const headers: any[] = [
  { title: 'Assignment Title', key: 'title', sortable: true },
  { title: 'Max Marks', key: 'max_marks', sortable: true },
  { title: 'Due Date', key: 'due_date', sortable: true },
  { title: 'Submissions', key: 'submissions', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const totalSubmissions = computed(() => {
  return assignments.value.reduce((acc, a) => acc + (Number(a.total_submissions) || 0), 0);
});

const totalGraded = computed(() => {
  return assignments.value.reduce((acc, a) => acc + (Number(a.graded_submissions) || 0), 0);
});

const totalPending = computed(() => {
  return assignments.value.reduce((acc, a) => acc + (Number(a.pending_submissions) || 0), 0);
});

const courseOptions = computed(() => {
  return [{ id: 'all', title: 'All Courses' }, ...courses.value];
});

const filteredAssignments = computed(() => {
  return assignments.value.filter(a => {
    const matchesSearch = !searchQuery.value || a.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCourse = selectedCourseFilter.value === 'all' || a.course_id === selectedCourseFilter.value;
    return matchesSearch && matchesCourse;
  });
});

const loadData = async () => {
  loading.value = true;

  // 1. Load Courses for dropdown
  try {
    const courseRes = await api.get('/lms/courses');
    let fetchedCourses = Array.isArray(courseRes?.data) ? courseRes.data : (Array.isArray(courseRes) ? courseRes : []);
    
    if (!fetchedCourses || fetchedCourses.length === 0) {
      const pubRes = await api.get('/public/courses');
      fetchedCourses = pubRes.data?.courses || (Array.isArray(pubRes.data) ? pubRes.data : []);
    }

    courses.value = fetchedCourses;
  } catch (error) {
    console.error('Failed to load courses for dropdown:', error);
    try {
      const pubRes = await api.get('/public/courses');
      courses.value = pubRes.data?.courses || (Array.isArray(pubRes.data) ? pubRes.data : []);
    } catch (e) {
      console.error('Fallback course fetch failed:', e);
    }
  }

  // 2. Load Assignments
  try {
    const assignRes = await api.get('/lms/assignments');
    assignments.value = Array.isArray(assignRes?.data) ? assignRes.data : (Array.isArray(assignRes) ? assignRes : []);
  } catch (error) {
    console.error('Failed to load assignments:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    id: '',
    course_id: courses.value[0]?.id || '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 100
  };
  showModal.value = true;
};

const openEditModal = (item: any) => {
  isEditing.value = true;
  form.value = {
    id: item.id,
    course_id: item.course_id,
    title: item.title,
    description: item.description || '',
    due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
    max_marks: item.max_marks || 100
  };
  showModal.value = true;
};

const saveAssignment = async () => {
  if (!form.value.title || !form.value.course_id) return;
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/lms/assignments/${form.value.id}`, form.value);
    } else {
      await api.post(`/lms/courses/${form.value.course_id}/assignments`, form.value);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error('Failed to save assignment:', error);
  } finally {
    saving.value = false;
  }
};

const deleteAssignment = async (item: any) => {
  if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
  try {
    await api.delete(`/lms/assignments/${item.id}`);
    await loadData();
  } catch (error) {
    console.error('Failed to delete assignment:', error);
  }
};

const openSubmissionsDrawer = async (item: any) => {
  selectedAssignment.value = item;
  showSubmissions.value = true;
  loadingSubmissions.value = true;
  submissions.value = [];
  try {
    const res = await api.get(`/lms/assignments/${item.id}/submissions`);
    const fetchedData = res.data || res;
    submissions.value = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.submissions || []);
  } catch (error) {
    console.error('Failed to load submissions:', error);
    submissions.value = [];
  } finally {
    loadingSubmissions.value = false;
  }
};

const openGradeModal = (submission: any) => {
  activeSubmission.value = submission;
  gradeForm.value = {
    marks_awarded: submission.marks_awarded !== null ? submission.marks_awarded : submission.max_marks || 100,
    status: submission.status === 'rejected' ? 'rejected' : 'graded',
    feedback: submission.feedback || ''
  };
  showGradeModal.value = true;
};

const submitGrade = async () => {
  if (!activeSubmission.value) return;
  grading.value = true;
  try {
    await api.put(`/lms/assignments/submissions/${activeSubmission.value.id}/grade`, gradeForm.value);
    showGradeModal.value = false;
    await openSubmissionsDrawer(selectedAssignment.value);
    await loadData();
  } catch (error) {
    console.error('Failed to grade submission:', error);
  } finally {
    grading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const isPastDue = (dueStr: string) => {
  if (!dueStr) return false;
  return new Date(dueStr).getTime() < new Date().getTime();
};

const getSubmissionStatusColor = (status: string) => {
  switch (status) {
    case 'graded': return 'success';
    case 'rejected': return 'error';
    case 'submitted': return 'warning';
    default: return 'grey';
  }
};

onMounted(loadData);
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.shadow-soft {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}
</style>
