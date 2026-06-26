<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <v-btn icon="mdi-arrow-left" variant="text" class="mr-4" @click="goBack"></v-btn>
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Applicant Profile</h1>
          <p class="text-blue-grey-300">Detailed ATS view for candidate assessment</p>
        </div>
      </div>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="applicant">
      <!-- Interview Timeline -->
      <v-card color="white" rounded="xl" border class="mb-6 shadow-card overflow-hidden">
        <v-card-text class="pa-6 bg-grey-lighten-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-4 text-grey-darken-2">Application Timeline</h3>
          <v-timeline direction="horizontal" density="compact" line-color="primary">
            <v-timeline-item dot-color="success" size="small" icon="mdi-check">
              <div class="text-caption font-weight-bold">Applied</div>
              <div class="text-xs text-grey">{{ formatDate(applicant.applied_at) }}</div>
            </v-timeline-item>
            
            <v-timeline-item :dot-color="applicant.status === 'applied' || applicant.status === 'viewed' ? 'grey' : 'success'" size="small" :icon="applicant.status === 'applied' || applicant.status === 'viewed' ? '' : 'mdi-check'">
              <div class="text-caption font-weight-bold">Shortlisted</div>
            </v-timeline-item>

            <v-timeline-item :dot-color="applicant.interviews?.length ? 'success' : 'grey'" size="small" :icon="applicant.interviews?.length ? 'mdi-check' : ''">
              <div class="text-caption font-weight-bold">Interview Scheduled</div>
            </v-timeline-item>
            
            <v-timeline-item :dot-color="hasCompletedInterview ? 'success' : 'grey'" size="small" :icon="hasCompletedInterview ? 'mdi-check' : ''">
              <div class="text-caption font-weight-bold">Interview Completed</div>
            </v-timeline-item>

            <v-timeline-item :dot-color="getFinalDecisionColor(applicant.status)" size="small">
              <div class="text-caption font-weight-bold">Final Decision</div>
              <div class="text-xs font-weight-bold text-uppercase" :class="`text-${getFinalDecisionColor(applicant.status)}`">{{ getFinalDecisionText(applicant.status) }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <v-row>
        <!-- Left Sidebar: Personal Info -->
        <v-col cols="12" md="4">
          <v-card color="white" rounded="xl" border class="shadow-card text-center mb-6">
            <v-card-text class="pa-6">
              <v-avatar size="100" color="primary" class="text-h3 font-weight-bold mb-4">
                {{ applicant.user_name ? applicant.user_name.charAt(0) : (applicant.user_email ? applicant.user_email.charAt(0) : 'U') }}
              </v-avatar>
              <h2 class="text-h5 font-weight-black mb-1">{{ applicant.user_name || 'Unknown Student' }}</h2>
              <div class="text-body-1 text-grey-darken-1 mb-4">{{ applicant.job_title }}</div>
              
              <v-divider class="my-4"></v-divider>
              
              <div class="d-flex align-center mb-3">
                <v-icon color="grey" class="mr-3">mdi-email</v-icon>
                <span class="text-body-2">{{ applicant.user_email || 'No email' }}</span>
              </div>
              <div class="d-flex align-center mb-3">
                <v-icon color="grey" class="mr-3">mdi-phone</v-icon>
                <span class="text-body-2">{{ applicant.user_phone || applicant.applicant_phone || 'No phone' }}</span>
              </div>
              <div class="d-flex align-center mb-3">
                <v-icon color="grey" class="mr-3">mdi-map-marker</v-icon>
                <span class="text-body-2">{{ applicant.city || 'Location unknown' }}</span>
              </div>
              
              <v-btn v-if="applicant.resume_path" :href="getResumeUrl(applicant.resume_path)" target="_blank" color="info" variant="flat" block class="mt-4" prepend-icon="mdi-file-pdf-box">
                View Resume
              </v-btn>
              <v-btn v-if="applicant.linkedin || applicant.student_linkedin" :href="applicant.linkedin || applicant.student_linkedin" target="_blank" color="blue" variant="tonal" block class="mt-3" prepend-icon="mdi-linkedin">
                LinkedIn Profile
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Content Area -->
        <v-col cols="12" md="8">
          <v-card color="white" rounded="xl" border class="shadow-card mb-6">
            <v-tabs v-model="tab" color="primary" class="border-b">
              <v-tab value="profile">Profile & Experience</v-tab>
              <v-tab value="lms">LMS Performance</v-tab>
              <v-tab value="interviews">Interviews</v-tab>
            </v-tabs>

            <v-card-text class="pa-6">
              <v-window v-model="tab">
                <!-- Profile Tab -->
                <v-window-item value="profile">
                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Cover Letter</h3>
                  <v-card color="grey-lighten-4" variant="flat" class="pa-4 mb-6 text-body-2">
                    {{ applicant.cover_note || 'No cover letter provided.' }}
                  </v-card>

                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Experience</h3>
                  <v-row class="mb-6">
                    <v-col cols="6"><div class="text-caption text-grey">Total Experience</div><div class="font-weight-medium">{{ applicant.experience_years || 0 }} years</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Last Role</div><div class="font-weight-medium">{{ applicant.last_role || 'N/A' }}</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Last Company</div><div class="font-weight-medium">{{ applicant.last_company || 'N/A' }}</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Employment Status</div><div class="font-weight-medium text-capitalize">{{ applicant.employment_status || 'Unknown' }}</div></v-col>
                  </v-row>

                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Education</h3>
                  <v-row class="mb-6">
                    <v-col cols="6"><div class="text-caption text-grey">Qualification</div><div class="font-weight-medium">{{ applicant.qualification || 'N/A' }}</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Institution</div><div class="font-weight-medium">{{ applicant.institution || 'N/A' }}</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Field of Study</div><div class="font-weight-medium">{{ applicant.field_of_study || 'N/A' }}</div></v-col>
                    <v-col cols="6"><div class="text-caption text-grey">Year of Passing</div><div class="font-weight-medium">{{ applicant.year_of_passing || 'N/A' }}</div></v-col>
                  </v-row>

                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Skills</h3>
                  <div>
                    <v-chip v-for="skill in parsedSkills" :key="skill" color="indigo" variant="tonal" size="small" class="mr-2 mb-2">{{ skill }}</v-chip>
                    <span v-if="!parsedSkills.length" class="text-grey text-body-2">No skills listed</span>
                  </div>
                </v-window-item>

                <!-- LMS Tab -->
                <v-window-item value="lms">
                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Enrolled Courses</h3>
                  <v-list v-if="applicant.enrollments?.length" lines="two" class="bg-transparent border rounded-lg mb-6">
                    <v-list-item v-for="en in applicant.enrollments" :key="en.id" :title="en.course_title">
                      <template v-slot:subtitle>
                        <div class="d-flex align-center mt-1" style="max-width: 150px;">
                          <UiProgressFraction
                            :current="en.completed_lessons || 0"
                            :total="en.total_lessons || 100"
                          />
                        </div>
</template>
                      <template v-slot:append>
                        <v-chip size="small" :color="en.status === 'completed' ? 'success' : 'info'">{{ en.status }}</v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-grey mb-6">No courses enrolled.</p>

                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Certificates Earned</h3>
                  <div v-if="applicant.certificates?.length" class="d-flex flex-wrap gap-2 mb-6">
                    <v-chip v-for="c in applicant.certificates" :key="c.cert_number" color="amber-darken-3" variant="flat" prepend-icon="mdi-certificate">
                      {{ c.course_title }}
                    </v-chip>
                  </div>
                  <p v-else class="text-grey mb-6">No certificates earned.</p>

                  <h3 class="text-subtitle-1 font-weight-bold mb-3">Exam Results</h3>
                  <v-table v-if="applicant.exams?.length" class="border rounded-lg" density="compact">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="ex in applicant.exams" :key="ex.id">
                        <td class="font-weight-medium">{{ ex.exam_title }}</td>
                        <td>{{ ex.score }}%</td>
                        <td>
                          <v-chip size="x-small" :color="ex.passed ? 'success' : 'error'">{{ ex.passed ? 'Passed' : 'Failed' }}</v-chip>
                        </td>
                        <td class="text-caption">{{ ex.submitted_at ? formatDate(ex.submitted_at) : 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                  <p v-else class="text-grey">No exams taken.</p>
                </v-window-item>

                <!-- Interviews Tab -->
                <v-window-item value="interviews">
                  <div v-if="applicant.interviews?.length">
                    <v-timeline density="compact" align="start" truncate-line="both">
                      <v-timeline-item v-for="(intv, idx) in applicant.interviews" :key="intv.id" :dot-color="intv.status === 'completed' ? 'success' : 'primary'" size="small">
                        <template v-slot:opposite>
                          <div class="text-caption font-weight-bold">{{ formatDate(intv.scheduled_at) }}</div>
                        </template>
                        <v-card class="elevation-1 border">
                          <v-card-text class="pa-3">
                            <div class="d-flex justify-space-between align-center mb-2">
                              <span class="font-weight-bold text-subtitle-2">{{ intv.round_name }} - {{ intv.type }}</span>
                              <v-chip size="x-small" :color="intv.status === 'completed' ? 'success' : 'info'">{{ intv.status }}</v-chip>
                            </div>
                            <div class="text-body-2 mb-1"><v-icon size="small" class="mr-1">mdi-clock-outline</v-icon> Duration: {{ intv.duration }} mins</div>
                            <div v-if="intv.meeting_link" class="text-body-2 mb-1"><v-icon size="small" class="mr-1">mdi-link</v-icon> <a :href="intv.meeting_link" target="_blank">Meeting Link</a></div>
                            <div v-if="intv.location" class="text-body-2 mb-1"><v-icon size="small" class="mr-1">mdi-map-marker</v-icon> {{ intv.location }}</div>
                            <div v-if="intv.notes" class="text-caption text-grey mt-2 border-t pt-2">Notes: {{ intv.notes }}</div>
                          </v-card-text>
                        </v-card>
                      </v-timeline-item>
                    </v-timeline>
                  </div>
                  <div v-else class="text-center py-8">
                    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-calendar-blank</v-icon>
                    <p class="text-grey">No interviews scheduled yet.</p>
                  </div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <div v-else class="text-center py-12 text-error">
      Applicant data could not be loaded.
    </div>

    <!-- Final Decision Bottom Bar -->
    <v-footer v-if="applicant && !['selected', 'rejected'].includes(applicant.status)" app border color="white" class="px-6 py-4 elevation-10 d-flex justify-center gap-4" style="z-index: 100;">
      <div class="text-subtitle-1 font-weight-bold mr-4">Final Decision:</div>
      <v-btn color="error" variant="outlined" prepend-icon="mdi-account-remove" @click="openRejectModal">Reject</v-btn>
      <v-btn color="warning" variant="outlined" prepend-icon="mdi-pause-circle" @click="openHoldModal">Hold</v-btn>
      <v-btn color="info" variant="flat" prepend-icon="mdi-calendar-clock" @click="openNextRoundModal">Schedule Interview</v-btn>
      <v-btn color="success" variant="flat" prepend-icon="mdi-account-check" @click="openSelectModal" class="px-8 font-weight-black">Hire / Select</v-btn>
    </v-footer>

    <v-footer v-else-if="applicant && ['selected', 'rejected'].includes(applicant.status)" app border color="white" class="px-6 py-4 elevation-10 d-flex justify-center gap-4 bg-grey-lighten-4" style="z-index: 100;">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon :color="applicant.status === 'selected' ? 'success' : 'error'" class="mr-2">
          {{ applicant.status === 'selected' ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
        This candidate has been {{ applicant.status === 'selected' ? 'Hired' : 'Rejected' }}.
      </div>
    </v-footer>

    <!-- Modals -->

    <!-- Reject Modal -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-error font-weight-bold">Reject Candidate</v-card-title>
        <v-card-text>
          <p class="mb-4">Are you sure you want to reject this candidate? Please provide a reason.</p>
          <v-textarea v-model="decisionNotes" label="Reason for rejection" variant="outlined" rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  @click="rejectDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="error"  @click="submitDecision('rejected')" :loading="actionLoading" :disabled="!decisionNotes.trim()" class="px-6" variant="flat" rounded="lg">Confirm Reject</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Hold Modal -->
    <v-dialog v-model="holdDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-warning font-weight-bold">Put Candidate on Hold</v-card-title>
        <v-card-text>
          <p class="mb-4">You can place this candidate on hold for future review.</p>
          <v-textarea v-model="decisionNotes" label="Reason for hold" variant="outlined" rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  @click="holdDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="warning"  @click="submitDecision('hold')" :loading="actionLoading" :disabled="!decisionNotes.trim()" class="px-6" variant="flat" rounded="lg">Confirm Hold</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Select Modal -->
    <v-dialog v-model="selectDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-success font-weight-bold">Select Candidate</v-card-title>
        <v-card-text>
          <v-alert type="success" variant="tonal" class="mb-4">
            You are about to select this candidate for the position.
          </v-alert>
          <v-textarea v-model="decisionNotes" label="Internal Notes (Optional)" variant="outlined" rows="2"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  @click="selectDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="success"  @click="submitDecision('selected')" :loading="actionLoading" class="px-6" variant="flat" rounded="lg">Confirm Hire</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Next Round / Schedule Modal -->
    <v-dialog v-model="scheduleDialog" max-width="500">
      <v-card color="white" rounded="xl" border class="text-grey-darken-4 pa-4">
        <v-card-title class="font-weight-bold text-info">Schedule Next Round</v-card-title>
        <v-card-text>
          <v-form ref="scheduleForm">
            <v-text-field
              v-model="scheduleData.round_name"
              label="Round Name (e.g., HR Screening)"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4 mt-2"
            ></v-text-field>

            <v-text-field
              v-model="scheduleData.scheduled_at"
              label="Date & Time"
              type="datetime-local"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4 mt-2"
            ></v-text-field>
            
            <v-select
              v-model="scheduleData.type"
              :items="['Online', 'In-Person', 'Phone']"
              label="Interview Type"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model.number="scheduleData.duration"
              label="Duration (minutes)"
              type="number"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="scheduleData.type === 'Online'"
              v-model="scheduleData.meeting_link"
              label="Meeting Link (Google Meet, Zoom, etc.)"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-if="scheduleData.type === 'In-Person'"
              v-model="scheduleData.location"
              label="Office Location / Address"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="scheduleData.notes"
              label="Message / Notes for Candidate"
              variant="outlined"
              color="primary"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn  @click="scheduleDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="actionLoading" @click="submitSchedule">Schedule Interview</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useRuntimeConfig } from '#app';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const route = useRoute();
const router = useRouter();
const api = useApi();
const config = useRuntimeConfig();

const applicantId = route.params.id as string;
const applicant = ref<any>(null);
const loading = ref(true);
const tab = ref('profile');

// Modal States
const rejectDialog = ref(false);
const holdDialog = ref(false);
const selectDialog = ref(false);
const scheduleDialog = ref(false);

const actionLoading = ref(false);
const decisionNotes = ref('');

const scheduleForm = ref<any>(null);
const scheduleData = ref({
  application_id: applicantId,
  round_name: '',
  scheduled_at: '',
  type: 'Online',
  duration: 60,
  meeting_link: '',
  location: '',
  notes: ''
});

onMounted(async () => {
  await loadApplicant();
});

const loadApplicant = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/employers/applications/${applicantId}`);
    applicant.value = res.data || res;
  } catch (error: any) {
    console.error('Error fetching applicant', error);
    alert('Applicant not found.');
    router.back();
  } finally {
    loading.value = false;
  }
};

const parsedSkills = computed(() => {
  if (!applicant.value) return [];
  const skills = applicant.value.skills_json || applicant.value.student_skills;
  if (!skills) return [];
  if (typeof skills === 'string') {
    try { return JSON.parse(skills); } catch(e) { return []; }
  }
  return skills;
});

const hasCompletedInterview = computed(() => {
  if (!applicant.value?.interviews) return false;
  return applicant.value.interviews.some((i: any) => i.status === 'completed');
});

const getFinalDecisionColor = (status: string) => {
  switch (status) {
    case 'selected': return 'success';
    case 'rejected': return 'error';
    case 'hold': return 'warning';
    case 'next_round': return 'info';
    default: return 'grey-lighten-2';
  }
};

const getFinalDecisionText = (status: string) => {
  switch (status) {
    case 'selected': return 'Selected';
    case 'rejected': return 'Rejected';
    case 'hold': return 'On Hold';
    case 'next_round': return 'Next Round';
    default: return 'Pending';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const getResumeUrl = (path: string) => {
  if (!path) return '#';
  const normalizedPath = path.replace(/\\/g, '/');
  const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${config.public.apiBase.replace('/api', '')}${finalPath}`;
};

const goBack = () => {
  router.back();
};

const openRejectModal = () => { decisionNotes.value = ''; rejectDialog.value = true; };
const openHoldModal = () => { decisionNotes.value = ''; holdDialog.value = true; };
const openSelectModal = () => { decisionNotes.value = ''; selectDialog.value = true; };
const openNextRoundModal = () => {
  scheduleData.value = {
    application_id: applicantId,
    round_name: '',
    scheduled_at: '',
    type: 'Online',
    duration: 60,
    meeting_link: '',
    location: '',
    notes: ''
  };
  scheduleDialog.value = true;
};

const submitDecision = async (status: string) => {
  actionLoading.value = true;
  try {
    // Optionally save decisionNotes via another endpoint if needed in the future,
    // currently we'll just update the status.
    await api.patch(`/employers/applications/${applicantId}/status`, { status });
    applicant.value.status = status;
    rejectDialog.value = false;
    holdDialog.value = false;
    selectDialog.value = false;
    alert(`Candidate marked as ${status}.`);
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to update status.');
  } finally {
    actionLoading.value = false;
  }
};

const submitSchedule = async () => {
  const { valid } = await scheduleForm.value?.validate() || { valid: false };
  if (!valid) return;
  
  actionLoading.value = true;
  try {
    await api.post('/interviews', scheduleData.value);
    // Mark application as next_round or shortlisted automatically if scheduling
    if (!['selected', 'hold', 'rejected'].includes(applicant.value.status)) {
      await api.patch(`/employers/applications/${applicantId}/status`, { status: 'next_round' });
    }
    scheduleDialog.value = false;
    alert('Interview scheduled successfully!');
    await loadApplicant(); // Reload to fetch new interview
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to schedule interview.');
  } finally {
    actionLoading.value = false;
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
.gap-4 {
  gap: 16px;
}
</style>
