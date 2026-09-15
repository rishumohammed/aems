<template>
  <v-card class="assignment-viewer rounded-xl border-0 overflow-hidden" elevation="2">
    <v-card-text class="pa-6 pa-md-10">
      <div class="d-flex align-center mb-6">
        <v-avatar color="warning-lighten-5" size="64" rounded="lg" class="mr-6">
          <v-icon color="warning" size="32">mdi-clipboard-text-outline</v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-black mb-1">{{ assignment?.title || 'Assignment' }}</h2>
          <div class="text-caption text-grey-darken-1 d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
            Due Date: {{ assignment?.due_date ? formatDate(assignment.due_date) : 'No deadline' }}
            <v-divider vertical class="mx-3"></v-divider>
            <v-icon size="14" class="mr-1">mdi-star-outline</v-icon>
            Max Marks: {{ assignment?.max_marks || 100 }}
          </div>
        </div>
      </div>

      <v-divider class="mb-8"></v-divider>

      <v-alert v-if="submission" :type="submissionStatusColor" variant="tonal" class="rounded-xl mb-8">
        <template v-slot:title>
          <span class="font-weight-black">Submission Status: {{ submission.status.toUpperCase() }}</span>
        </template>
        <div v-if="submission.marks_awarded !== null" class="mt-2">
          <span class="font-weight-bold">Grade: {{ submission.marks_awarded }} / {{ assignment.max_marks }}</span>
        </div>
        <div v-if="submission.feedback" class="mt-2">
          <span class="font-weight-bold">Feedback:</span> {{ submission.feedback }}
        </div>
        <div class="mt-4">
          <v-btn
            v-if="submission.submission_url"
            :href="fullSubmissionUrl"
            target="_blank"
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-open-in-new"
            class="text-none"
          >
            View My Submission
          </v-btn>
        </div>
      </v-alert>

      <div v-if="!submission || submission.status === 'rejected'">
        <h3 class="text-subtitle-1 font-weight-bold mb-4">Submit Your Work</h3>
        <v-form @submit.prevent="submitAssignment">
          <v-file-input
            v-model="uploadedFile"
            label="Upload Assignment File (PDF, ZIP, DOCX, Code, Image)"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-paperclip"
            prepend-icon=""
            show-size
            clearable
            class="mb-6"
            hint="Upload file directly (PDF, ZIP, Code, Doc, Image up to 50MB)"
            persistent-hint
          ></v-file-input>

          <v-btn
            color="primary"
            size="large"
            rounded="lg"
            block
            type="submit"
            :loading="submitting"
            :disabled="!hasValidSubmission"
          >
            Submit Assignment
          </v-btn>
        </v-form>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import dayjs from 'dayjs';

const props = defineProps({
  assignmentId: { type: String, required: true },
  courseId: { type: String, required: true },
  enrollmentId: { type: String, required: true }
});

const emit = defineEmits(['complete']);

const api = useApi();
const config = useRuntimeConfig();
const assignment = ref(null);
const submission = ref(null);
const uploadedFile = ref(null);
const submitting = ref(false);

const hasValidSubmission = computed(() => {
  return Array.isArray(uploadedFile.value) ? uploadedFile.value.length > 0 : !!uploadedFile.value;
});

const fullSubmissionUrl = computed(() => {
  if (!submission.value?.submission_url) return '';
  const url = submission.value.submission_url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = config.public.apiBase.replace('/api', '');
  return base + url;
});

const fetchData = async () => {
  try {
    const res = await api.get(`/lms/student/assignments/${props.assignmentId}`);
    const data = res.data || res;
    assignment.value = data.assignment;
    submission.value = data.submission;
  } catch (err) {
    console.error('Failed to fetch assignment:', err);
  }
};

const submitAssignment = async () => {
  if (!hasValidSubmission.value) return;
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('assignment_id', props.assignmentId);

    const file = Array.isArray(uploadedFile.value) ? uploadedFile.value[0] : uploadedFile.value;
    if (file) {
      formData.append('file', file);
    }

    await api.post('/lms/student/assignments/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    uploadedFile.value = null;
    await fetchData();
    emit('complete');
  } catch (err) {
    console.error('Submission failed:', err);
    alert(err.response?.data?.message || err.message || 'Failed to submit assignment');
  } finally {
    submitting.value = false;
  }
};

const submissionStatusColor = computed(() => {
  if (!submission.value) return 'info';
  switch (submission.value.status) {
    case 'submitted': return 'info';
    case 'graded': return 'success';
    case 'rejected': return 'error';
    default: return 'info';
  }
});

const formatDate = (date) => dayjs(date).format('MMM DD, YYYY • h:mm A');

onMounted(fetchData);
watch(() => props.assignmentId, fetchData);
</script>
