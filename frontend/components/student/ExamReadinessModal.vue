<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="520" persistent>
    <v-card class="rounded-xl pa-2">
      <v-card-title class="d-flex align-center justify-space-between pa-4 border-b">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="36" class="mr-3">
            <v-icon color="white" size="20">mdi-school-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold">{{ editData ? 'Edit Exam Readiness Request' : 'Notify Admin — Ready for Exam' }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>

      <v-form @submit.prevent="submitRequest">
        <v-card-text class="pa-6">
          <p class="text-body-2 text-secondary mb-5">
            {{ editData ? 'Update your submitted exam readiness request details below.' : 'Inform the administration that you are prepared to write your certification exam. The admin will be notified to review your progress and schedule your exam.' }}
          </p>

          <div class="mb-4">
            <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Select Course / Certification *</label>
            <v-select
              v-model="form.course_id"
              :items="courseOptions"
              item-title="title"
              item-value="id"
              placeholder="Choose an enrolled course..."
              variant="outlined"
              density="comfortable"
              :loading="loadingCourses"
              :rules="[v => !!v || 'Please select a course or certification']"
            ></v-select>
          </div>

          <div>
            <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Message / Additional Details (Optional)</label>
            <v-textarea
              v-model="form.notes"
              placeholder="e.g. I have completed all modules and quizzes. I am available for exam on weekdays from 10 AM to 4 PM."
              variant="outlined"
              rows="3"
              density="comfortable"
              hide-details
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 border-t d-flex justify-end gap-3">
          <v-btn variant="text" rounded="lg" class="text-capitalize" @click="$emit('update:modelValue', false)">Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            rounded="lg"
            class="font-weight-bold text-capitalize px-6"
            :loading="submitting"
          >
            <v-icon start>{{ editData ? 'mdi-check' : 'mdi-send' }}</v-icon>
            {{ editData ? 'Update Request' : 'Send Readiness Request' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'submitted']);

const api = useApi();
const loadingCourses = ref(false);
const submitting = ref(false);
const courseOptions = ref<any[]>([]);

const form = reactive({
  course_id: '',
  notes: ''
});

const fetchStudentCourses = async () => {
  loadingCourses.value = true;
  try {
    let enrollments: any[] = [];
    try {
      const res = await api.get('/lms/student/dashboard');
      const data = res.data || res;
      enrollments = data.enrollments || [];
    } catch (e) {
      console.warn('Dashboard fetch failed, trying my-courses:', e);
    }

    if (!enrollments || enrollments.length === 0) {
      const myCoursesRes = await api.get('/lms/student/my-courses');
      const data = myCoursesRes.data || myCoursesRes;
      enrollments = Array.isArray(data) ? data : (data.enrollments || []);
    }

    courseOptions.value = enrollments.map((e: any) => ({
      id: e.course_id || e.courseId || e.id,
      title: `${e.title || e.course_title || 'Course'} (${e.completion_percentage || 0}% Complete)`
    }));

    if (props.editData && props.editData.course_id) {
      form.course_id = props.editData.course_id;
    } else if (courseOptions.value.length > 0 && !form.course_id) {
      form.course_id = courseOptions.value[0].id;
    }
  } catch (err) {
    console.error('Failed to load courses for readiness modal:', err);
  } finally {
    loadingCourses.value = false;
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editData) {
      form.course_id = props.editData.course_id || '';
      form.notes = props.editData.notes || '';
    } else {
      form.course_id = '';
      form.notes = '';
    }
    fetchStudentCourses();
  }
});

const submitRequest = async () => {
  if (submitting.value) return;
  if (!form.course_id) {
    alert('Please select a course or certification.');
    return;
  }

  submitting.value = true;
  try {
    let res: any;
    if (props.editData && props.editData.id) {
      res = await api.put(`/exams/my-readiness-requests/${props.editData.id}`, {
        course_id: form.course_id,
        notes: form.notes
      });
    } else {
      res = await api.post('/exams/readiness-request', {
        course_id: form.course_id,
        notes: form.notes
      });
    }
    alert(res.data?.message || res.message || 'Your request has been submitted successfully!');
    emit('submitted');
    emit('update:modelValue', false);
  } catch (err: any) {
    alert(err.response?.data?.message || err.message || 'Failed to submit request');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (props.modelValue) fetchStudentCourses();
});
</script>

<style scoped>
.gap-3 { gap: 12px; }
</style>
