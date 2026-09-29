<template>
  <v-container fluid class="pa-6">
    <!-- Top Bar Navigation -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-4">
        <v-btn
          icon="mdi-arrow-left"
          variant="tonal"
          color="grey-darken-2"
          to="/dashboard/employer/jobs"
          title="Back to Jobs"
        ></v-btn>
        <div>
          <div class="d-flex align-center gap-2">
            <h1 class="text-h4 font-weight-bold mb-1">
              Matching Talent Pool
            </h1>
            <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">
              AI Powered
            </v-chip>
          </div>
          <p class="text-secondary mb-0" v-if="job">
            Auto-matched candidates for <strong class="text-grey-darken-3">{{ job.title }}</strong> 
            <span v-if="job.location">• {{ job.is_remote ? 'Remote' : job.location }}</span>
          </p>
        </div>
      </div>

      <div class="d-flex align-center gap-3">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-account-group"
          :to="`/dashboard/employer/applications?job=${jobId}`"
        >
          View Applied Applicants
        </v-btn>
      </div>
    </div>

    <!-- Job Criteria Summary Banner -->
    <v-card color="white" rounded="xl" border elevation="0" class="pa-5 mb-6">
      <div class="d-flex flex-wrap align-center justify-space-between gap-4">
        <div>
          <div class="text-caption font-weight-bold text-secondary text-uppercase mb-1">
            Job Matching Requirements
          </div>
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip size="small" variant="tonal" color="indigo" prepend-icon="mdi-school">
              {{ job?.qualification_req || 'Any Qualification' }}
            </v-chip>
            <v-chip size="small" variant="tonal" color="teal" prepend-icon="mdi-briefcase-outline">
              {{ job?.experience_level || 'Any Exp' }}
            </v-chip>
            <v-chip v-if="job?.specialization_req" size="small" variant="tonal" color="purple" prepend-icon="mdi-book-education">
              {{ job.specialization_req }}
            </v-chip>
            <v-chip v-if="job?.joining_status_req" size="small" variant="tonal" color="orange" prepend-icon="mdi-clock-fast">
              {{ job.joining_status_req }}
            </v-chip>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="d-flex gap-6">
          <div class="text-center px-3 border-s">
            <div class="text-h5 font-weight-black text-primary">{{ candidates.length }}</div>
            <div class="text-caption text-secondary font-weight-medium">Evaluated</div>
          </div>
          <div class="text-center px-3 border-s">
            <div class="text-h5 font-weight-black text-success">{{ topMatchesCount }}</div>
            <div class="text-caption text-secondary font-weight-medium">Top Matches (70%+)</div>
          </div>
          <div class="text-center px-3 border-s">
            <div class="text-h5 font-weight-black text-info">{{ alreadyAppliedCount }}</div>
            <div class="text-caption text-secondary font-weight-medium">Already Applied</div>
          </div>
        </div>
      </div>

      <!-- Skills Required chips -->
      <div v-if="requiredSkillsList.length" class="mt-4 pt-3 border-t border-opacity-10 d-flex flex-wrap align-center gap-2">
        <span class="text-caption font-weight-bold text-secondary">Target Skills:</span>
        <v-chip
          v-for="skill in requiredSkillsList"
          :key="skill"
          size="x-small"
          color="primary"
          variant="outlined"
          class="font-weight-medium"
        >
          {{ skill }}
        </v-chip>
      </div>
    </v-card>

    <!-- Filter & Search Controls -->
    <v-card color="white" rounded="xl" border elevation="0" class="pa-4 mb-6">
      <v-row align="center" dense>
        <v-col cols="12" md="5">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search candidates by name, email, skills, college..."
            variant="outlined"
            density="compact"
            hide-details
            color="primary"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-btn-toggle
            v-model="scoreFilter"
            mandatory
            color="primary"
            variant="outlined"
            density="compact"
            rounded="lg"
            class="w-100"
          >
            <v-btn value="all" class="text-none flex-grow-1">All ({{ candidates.length }})</v-btn>
            <v-btn value="top" class="text-none flex-grow-1">Top 75%+ ({{ topMatchesCount }})</v-btn>
            <v-btn value="good" class="text-none flex-grow-1">50%+ ({{ goodMatchesCount }})</v-btn>
          </v-btn-toggle>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="applicationStatusFilter"
            :items="[
              { title: 'All Candidates', value: 'all' },
              { title: 'Not Yet Applied', value: 'not_applied' },
              { title: 'Already Applied', value: 'applied' }
            ]"
            item-title="title"
            item-value="value"
            label="Application Status"
            variant="outlined"
            density="compact"
            hide-details
            color="primary"
          ></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Candidates Table / List -->
    <v-card color="white" rounded="xl" border elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredCandidates"
        :loading="loading"
        class="bg-transparent"
        :items-per-page="15"
      >
        <!-- Candidate info -->
        <template v-slot:item.candidate="{ item }">
          <div 
            class="d-flex align-center py-2 cursor-pointer candidate-link" 
            @click="openCandidateDetails(item)"
            title="Click to view candidate details"
          >
            <v-avatar color="primary" class="mr-3 text-uppercase font-weight-bold" size="40">
              <v-img v-if="item.avatar_url" :src="item.avatar_url"></v-img>
              <span v-else>{{ item.name ? item.name.charAt(0) : 'U' }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-subtitle-1 text-grey-darken-4 candidate-name-hover d-flex align-center">
                {{ item.name }}
                <v-icon size="14" class="ml-1 text-primary candidate-hover-icon">mdi-open-in-new</v-icon>
              </div>
              <div class="text-caption text-secondary">
                {{ item.email }} <span v-if="item.phone">• {{ item.phone }}</span>
              </div>
              <div v-if="item.college_name" class="text-caption text-grey-darken-1 font-weight-medium">
                <v-icon size="12">mdi-school-outline</v-icon> {{ item.college_name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Match Score Badge -->
        <template v-slot:item.match="{ item }">
          <div class="py-2">
            <CandidateMatchBadge
              :score="item.matchScore"
              :is-match="item.isMatch"
              :criteria-breakdown="item.criteriaBreakdown"
              :matched-skills="item.matchedSkills"
              :missing-skills="item.missingSkills"
              size="md"
            />
          </div>
        </template>

        <!-- Education & Exp -->
        <template v-slot:item.profile="{ item }">
          <div class="py-1">
            <div class="font-weight-bold text-caption text-grey-darken-3">
              {{ item.education_level || item.qualification || 'Qualification N/A' }}
              <span v-if="item.specialization || item.field_of_study" class="text-grey">
                ({{ item.specialization || item.field_of_study }})
              </span>
            </div>
            <div class="text-caption text-secondary">
              {{ item.experience_years ? `${item.experience_years} Years Exp` : 'Fresher' }}
              <span v-if="item.joining_status">• {{ item.joining_status }}</span>
            </div>
          </div>
        </template>

        <!-- Skills Breakdown -->
        <template v-slot:item.skills="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1 max-w-280">
            <!-- Matched Skills -->
            <v-chip
              v-for="s in (item.matchedSkills || []).slice(0, 4)"
              :key="s"
              size="x-small"
              color="success"
              variant="flat"
              class="font-weight-bold"
            >
              ✓ {{ s }}
            </v-chip>

            <!-- Other student skills -->
            <v-chip
              v-for="s in (item.otherSkills || []).slice(0, 2)"
              :key="s"
              size="x-small"
              color="grey"
              variant="tonal"
            >
              {{ s }}
            </v-chip>

            <span v-if="((item.matchedSkills?.length || 0) + (item.otherSkills?.length || 0)) > 6" class="text-caption text-secondary align-self-center">
              +{{ (item.matchedSkills?.length || 0) + (item.otherSkills?.length || 0) - 6 }} more
            </span>
          </div>
        </template>

        <!-- Certifications & LMS -->
        <template v-slot:item.brix_credentials="{ item }">
          <div class="d-flex flex-column gap-1 align-start">
            <v-chip
              size="x-small"
              :color="(item.certs_active || 0) > 0 ? 'emerald' : 'grey'"
              :variant="(item.certs_active || 0) > 0 ? 'flat' : 'tonal'"
              class="font-weight-bold"
            >
              <v-icon start size="12">mdi-certificate-outline</v-icon>
              {{ item.certs_active || 0 }} Verified Certs
            </v-chip>
            <div class="text-caption text-secondary" style="font-size: 11px !important;">
              {{ item.courses_completed || 0 }} Courses Completed
            </div>
          </div>
        </template>

        <!-- Sourcing Action (Invite or View) -->
        <template v-slot:item.action="{ item }">
          <div class="d-flex justify-end align-center gap-2">
            <!-- If already applied -->
            <div v-if="item.has_applied">
              <v-chip size="small" color="info" variant="tonal" class="font-weight-bold">
                <v-icon start size="14">mdi-check</v-icon>
                Applied
              </v-chip>
            </div>

            <!-- If invitation already sent -->
            <v-btn
              v-else
              color="primary"
              variant="flat"
              size="small"
              rounded="lg"
              prepend-icon="mdi-email-fast-outline"
              class="font-weight-bold text-none"
              @click="openInviteModal(item)"
            >
              Invite to Apply
            </v-btn>

            <v-btn
              icon="mdi-account-box-outline"
              variant="text"
              size="small"
              color="grey-darken-1"
              @click="openCandidateDetails(item)"
              title="View Full Profile"
            ></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-10 text-center text-secondary">
            <v-icon size="56" color="grey-lighten-1" class="mb-3">mdi-account-search-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-1">
              No matching candidates found
            </h3>
            <p class="text-caption text-secondary">
              Try adjusting your search query or minimum score filter.
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Invite Candidate Modal -->
    <v-dialog v-model="inviteDialog" max-width="540">
      <v-card color="white" rounded="xl" border class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="44" class="font-weight-bold">
              {{ selectedCandidate?.name?.charAt(0) || 'U' }}
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-0">
                Invite {{ selectedCandidate?.name }}
              </h3>
              <div class="text-caption text-secondary">
                {{ selectedCandidate?.matchScore }}% Match for {{ job?.title }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="inviteDialog = false"></v-btn>
        </div>

        <v-divider class="mb-4 border-opacity-10"></v-divider>

        <p class="text-body-2 text-secondary mb-3">
          An automated email and platform notification will be sent to the candidate with direct application link.
        </p>

        <v-textarea
          v-model="inviteMessage"
          label="Personalized Message (Optional)"
          variant="outlined"
          color="primary"
          rows="4"
          placeholder="Hi, we reviewed your profile and noticed your background matches our open position..."
          class="mb-4"
        ></v-textarea>

        <div class="d-flex justify-end gap-2">
          <v-btn variant="tonal" color="grey" @click="inviteDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="font-weight-bold px-6"
            :loading="inviteSending"
            prepend-icon="mdi-send"
            @click="sendInvitation"
          >
            Send Invitation
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Candidate Quick Profile Modal -->
    <v-dialog v-model="profileDialog" max-width="700">
      <v-card v-if="selectedCandidate" color="white" rounded="xl" border class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="52" class="font-weight-bold text-h6">
              {{ selectedCandidate.name?.charAt(0) || 'U' }}
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold text-grey-darken-4 mb-0">
                {{ selectedCandidate.name }}
              </h2>
              <div class="text-secondary text-caption">
                {{ selectedCandidate.email }} • {{ selectedCandidate.phone || 'No phone' }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="profileDialog = false"></v-btn>
        </div>

        <v-divider class="mb-4 border-opacity-10"></v-divider>

        <div class="mb-4">
          <CandidateMatchBadge
            :score="selectedCandidate.matchScore"
            :is-match="selectedCandidate.isMatch"
            :criteria-breakdown="selectedCandidate.criteriaBreakdown"
            :matched-skills="selectedCandidate.matchedSkills"
            :missing-skills="selectedCandidate.missingSkills"
            size="lg"
          />
        </div>

        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <h4 class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2">Education & Bio</h4>
            <div class="text-body-2 text-secondary mb-1">
              <strong>Degree:</strong> {{ selectedCandidate.education_level || selectedCandidate.qualification || 'N/A' }}
            </div>
            <div class="text-body-2 text-secondary mb-1">
              <strong>Specialization:</strong> {{ selectedCandidate.specialization || selectedCandidate.field_of_study || 'General' }}
            </div>
            <div class="text-body-2 text-secondary mb-1">
              <strong>Institution:</strong> {{ selectedCandidate.college_name || selectedCandidate.institution || 'N/A' }}
            </div>
            <div class="text-body-2 text-secondary mb-1">
              <strong>Experience:</strong> {{ selectedCandidate.experience_years || 0 }} Years
            </div>
            <div class="text-body-2 text-secondary mb-1">
              <strong>Joining Status:</strong> {{ selectedCandidate.joining_status || 'Not specified' }}
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <h4 class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2">All Registered Skills</h4>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="skill in allCandidateSkills"
                :key="skill"
                size="small"
                :color="selectedCandidate.matchedSkills?.includes(skill) ? 'success' : 'grey'"
                :variant="selectedCandidate.matchedSkills?.includes(skill) ? 'flat' : 'tonal'"
              >
                {{ selectedCandidate.matchedSkills?.includes(skill) ? '✓ ' : '' }}{{ skill }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <div class="d-flex justify-end gap-2 border-t pt-4">
          <v-btn variant="tonal" color="grey" @click="profileDialog = false">Close</v-btn>
          <v-btn
            v-if="!selectedCandidate.has_applied"
            color="primary"
            variant="flat"
            prepend-icon="mdi-email-fast-outline"
            @click="profileDialog = false; openInviteModal(selectedCandidate)"
          >
            Invite Candidate
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import CandidateMatchBadge from '@/components/jobs/CandidateMatchBadge.vue';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const route = useRoute();
const api = useApi();
const jobId = route.params.id as string;

const job = ref<any>(null);
const candidates = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const scoreFilter = ref('all');
const applicationStatusFilter = ref('all');

const inviteDialog = ref(false);
const inviteSending = ref(false);
const inviteMessage = ref('');
const selectedCandidate = ref<any>(null);

const profileDialog = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const headers: any[] = [
  { title: 'Candidate', key: 'candidate', sortable: true },
  { title: 'Match Score', key: 'match', sortable: true },
  { title: 'Profile & Exp', key: 'profile', sortable: false },
  { title: 'Matched Skills', key: 'skills', sortable: false },
  { title: 'Brix Credentials', key: 'brix_credentials', sortable: false },
  { title: 'Action', key: 'action', sortable: false, align: 'end' }
];

onMounted(async () => {
  await fetchMatchedCandidates();
});

const fetchMatchedCandidates = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/employers/jobs/${jobId}/matched-candidates`);
    job.value = data?.job;
    candidates.value = data?.candidates || [];
  } catch (error: any) {
    console.error('Failed to load matched candidates', error);
    snackbarText.value = error.response?.data?.message || 'Failed to load matched candidates';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const requiredSkillsList = computed(() => {
  if (!job.value?.requirements_json) return [];
  try {
    const parsed = typeof job.value.requirements_json === 'string' 
      ? JSON.parse(job.value.requirements_json) 
      : job.value.requirements_json;
    return parsed.required || [];
  } catch (e) {
    return [];
  }
});

const topMatchesCount = computed(() => candidates.value.filter(c => (c.matchScore || 0) >= 70).length);
const goodMatchesCount = computed(() => candidates.value.filter(c => (c.matchScore || 0) >= 50).length);
const alreadyAppliedCount = computed(() => candidates.value.filter(c => c.has_applied).length);

const filteredCandidates = computed(() => {
  return candidates.value.filter(c => {
    // Score filter
    if (scoreFilter.value === 'top' && (c.matchScore || 0) < 70) return false;
    if (scoreFilter.value === 'good' && (c.matchScore || 0) < 50) return false;

    // Application status filter
    if (applicationStatusFilter.value === 'not_applied' && c.has_applied) return false;
    if (applicationStatusFilter.value === 'applied' && !c.has_applied) return false;

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchCollege = c.college_name?.toLowerCase().includes(q);
      const matchSkill = (c.matchedSkills || []).some((s: string) => s.toLowerCase().includes(q)) ||
                         (c.otherSkills || []).some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchCollege && !matchSkill) return false;
    }

    return true;
  });
});

const allCandidateSkills = computed(() => {
  if (!selectedCandidate.value) return [];
  const matched = selectedCandidate.value.matchedSkills || [];
  const other = selectedCandidate.value.otherSkills || [];
  return [...matched, ...other];
});

const openInviteModal = (candidate: any) => {
  selectedCandidate.value = candidate;
  inviteMessage.value = `Hello ${candidate.name}, based on your matching profile and skills, we would like to invite you to apply for our position "${job.value?.title}".`;
  inviteDialog.value = true;
};

const openCandidateDetails = (candidate: any) => {
  selectedCandidate.value = candidate;
  profileDialog.value = true;
};

const sendInvitation = async () => {
  if (!selectedCandidate.value) return;
  inviteSending.value = true;
  try {
    await api.post(`/employers/jobs/${jobId}/invite-candidate`, {
      student_id: selectedCandidate.value.id,
      message: inviteMessage.value
    });

    snackbarText.value = `Invitation sent to ${selectedCandidate.value.name}!`;
    snackbarColor.value = 'success';
    snackbar.value = true;
    inviteDialog.value = false;
  } catch (error: any) {
    snackbarText.value = error.response?.data?.message || 'Failed to send invitation';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    inviteSending.value = false;
  }
};
</script>

<style scoped>
.max-w-280 {
  max-width: 280px;
}
.candidate-link {
  cursor: pointer;
  border-radius: 6px;
  transition: opacity 0.2s ease;
}
.candidate-link:hover {
  opacity: 0.85;
}
.candidate-name-hover {
  transition: color 0.2s ease;
}
.candidate-link:hover .candidate-name-hover {
  color: #1976d2 !important;
  text-decoration: underline;
}
.candidate-hover-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.candidate-link:hover .candidate-hover-icon {
  opacity: 1;
}
</style>
