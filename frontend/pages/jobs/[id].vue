<template>
  <div class="job-detail-page-wrapper">
    <div v-if="job" class="job-detail-page bg-background min-h-screen py-12">
      <v-container>
        <!-- Breadcrumbs -->
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-8"></v-breadcrumbs>

        <v-row>
          <v-col cols="12" md="8">
            <!-- Header Card -->
            <v-card flat border class="pa-6 pa-md-8 rounded-xl mb-8 bg-white header-card">
              <div class="d-flex align-center gap-6 mb-6">
                <v-avatar color="grey-lighten-4" size="80" rounded="xl" class="border">
                  <v-icon v-if="job.hide_company_name" color="primary" size="40">mdi-shield-lock-outline</v-icon>
                  <img v-else-if="job.company_logo" :src="job.company_logo" :alt="job.company" style="width: 100%; height: 100%; object-fit: cover;" />
                  <v-icon v-else color="grey-darken-1" size="40">mdi-office-building</v-icon>
                </v-avatar>
                <div>
                  <h1 class="text-h4 text-md-h3 font-weight-black tracking-tight mb-2">{{ job.title }}</h1>
                  <div class="text-h6 text-primary font-weight-bold d-flex align-center gap-2">
                    <span v-if="job.hide_company_name">Confidential Organization</span>
                    <span v-else-if="job.company">{{ job.company }}</span>
                    <v-chip v-if="job.category_name" size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                      {{ job.category_name }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Badges / Highlights -->
              <div class="d-flex flex-wrap gap-3 mb-8">
                <v-chip v-if="job.is_remote" color="blue" variant="flat" rounded="lg" prepend-icon="mdi-laptop">
                  Remote
                </v-chip>
                <v-chip v-if="job.location" prepend-icon="mdi-map-marker-outline" variant="outlined" rounded="lg">
                  {{ job.location }}
                </v-chip>
                <v-chip prepend-icon="mdi-briefcase-outline" variant="outlined" rounded="lg" class="text-capitalize">
                  {{ job.type?.replace('_', ' ') }}
                </v-chip>
                <v-chip v-if="job.salary_range" prepend-icon="mdi-currency-inr" variant="outlined" rounded="lg">
                  {{ job.salary_range }}
                </v-chip>
                <v-chip v-if="experienceLevel" prepend-icon="mdi-school-outline" variant="outlined" rounded="lg">
                  {{ experienceLevel }}
                </v-chip>
                <v-chip v-if="numberOfOpenings" prepend-icon="mdi-account-group-outline" variant="outlined" rounded="lg">
                  {{ numberOfOpenings }} {{ numberOfOpenings === 1 ? 'Opening' : 'Openings' }}
                </v-chip>
                <v-chip v-if="job.deadline" prepend-icon="mdi-calendar-alert" variant="outlined" rounded="lg" color="error">
                  Apply by {{ formatDate(job.deadline) }}
                </v-chip>
                <v-chip prepend-icon="mdi-calendar-clock" variant="outlined" rounded="lg">
                  Posted {{ formatDate(job.created_at) }}
                </v-chip>
              </div>

              <div class="d-flex flex-wrap align-center gap-4">
                <v-btn
                  v-if="job.apply_url"
                  color="primary"
                  size="x-large"
                  rounded="lg"
                  class="px-10 font-weight-bold"
                  elevation="0"
                  append-icon="mdi-open-in-new"
                  @click="handleApply"
                >
                  Apply on Company Site
                </v-btn>
                <v-btn
                  v-else
                  color="primary"
                  size="x-large"
                  rounded="lg"
                  class="px-12 font-weight-bold"
                  elevation="0"
                  @click="handleApply"
                >
                  Apply Now
                </v-btn>
              </div>
            </v-card>

            <!-- Eligibility & Candidate Requirements Card -->
            <v-card v-if="hasEligibilityDetails" flat border class="pa-6 pa-md-8 rounded-xl bg-white mb-8">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center gap-2">
                <v-icon color="primary" size="24">mdi-account-check-outline</v-icon>
                Candidate Eligibility &amp; Criteria
              </h2>
              
              <v-row dense>
                <v-col v-if="job.qualification_req" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase">Minimum Qualification</div>
                  <div class="text-body-1 font-weight-medium text-grey-darken-3">{{ job.qualification_req }}</div>
                </v-col>

                <v-col v-if="job.specialization_req" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase">Field / Specialization</div>
                  <div class="text-body-1 font-weight-medium text-grey-darken-3">{{ job.specialization_req }}</div>
                </v-col>

                <v-col v-if="experienceLevel" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase">Experience Level</div>
                  <div class="text-body-1 font-weight-medium text-grey-darken-3">{{ experienceLevel }}</div>
                </v-col>

                <v-col v-if="job.joining_status_req" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase">Expected Joining Status</div>
                  <div class="text-body-1 font-weight-medium text-grey-darken-3">{{ job.joining_status_req }}</div>
                </v-col>

                <v-col v-if="job.gender_preference && job.gender_preference !== 'any'" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase">Gender Preference</div>
                  <div class="text-body-1 font-weight-medium text-grey-darken-3 text-capitalize">{{ job.gender_preference }}</div>
                </v-col>

                <v-col v-if="parsedLanguages.length > 0" cols="12" sm="6" class="mb-4">
                  <div class="text-caption text-grey font-weight-bold text-uppercase mb-1">Required Languages</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip v-for="lang in parsedLanguages" :key="lang" size="small" variant="tonal" color="primary">
                      {{ lang }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <!-- Skills Card -->
            <v-card v-if="requiredSkills.length > 0 || niceToHaveSkills.length > 0" flat border class="pa-6 pa-md-8 rounded-xl bg-white mb-8">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center gap-2">
                <v-icon color="primary" size="24">mdi-star-outline</v-icon>
                Skills &amp; Competencies
              </h2>

              <div v-if="requiredSkills.length > 0" class="mb-6">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-3">Required Skills</div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="skill in requiredSkills" :key="skill" color="primary" variant="tonal" rounded="lg" class="font-weight-medium">
                    <v-icon start size="16">mdi-check</v-icon>
                    {{ skill }}
                  </v-chip>
                </div>
              </div>

              <div v-if="niceToHaveSkills.length > 0">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-3">Nice-to-Have Skills</div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="skill in niceToHaveSkills" :key="skill" color="grey-darken-1" variant="outlined" rounded="lg">
                    <v-icon start size="16">mdi-plus</v-icon>
                    {{ skill }}
                  </v-chip>
                </div>
              </div>
            </v-card>

            <!-- Description -->
            <v-card flat border class="pa-6 pa-md-8 rounded-xl bg-white mb-8">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center gap-2">
                <v-icon color="primary" size="24">mdi-text-box-outline</v-icon>
                Job Description
              </h2>
              <div class="text-body-1 text-grey-darken-3 leading-relaxed job-html-content" v-html="job.description"></div>
            </v-card>

            <!-- Related Jobs -->
            <div v-if="job.related && job.related.length > 0" class="mt-8">
              <h2 class="text-h5 font-weight-bold mb-6">Related Jobs</h2>
              <v-row>
                <v-col v-for="rel in job.related" :key="rel.id" cols="12" sm="6">
                  <v-card border flat class="pa-4 rounded-xl hover-card" @click="navigateTo(`/jobs/${rel.id}`)">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ rel.title }}</h4>
                    <div class="text-caption text-grey mb-2">{{ rel.company }} • {{ rel.location }}</div>
                    <div class="d-flex justify-space-between align-center">
                      <v-chip size="x-small" variant="tonal" color="primary">{{ rel.type }}</v-chip>
                      <v-btn icon="mdi-arrow-right" variant="text" size="small" density="comfortable"></v-btn>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" md="4">
            <div class="sticky-sidebar">
              <!-- Summary Card -->
              <v-card flat border class="pa-6 rounded-xl bg-white mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">Job Overview</h3>
                <v-list density="compact" class="pa-0">
                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-calendar-clock</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Date Posted</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ formatDate(job.created_at) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="job.deadline" class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-calendar-alert</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Application Deadline</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ formatDate(job.deadline) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-map-marker-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Location</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">
                      {{ job.is_remote ? 'Remote' : (job.location || 'Not Specified') }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-currency-inr</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Offered Salary</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ job.salary_range || 'Not Disclosed' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="numberOfOpenings" class="px-0 py-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-account-group-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Total Openings</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ numberOfOpenings }} Position(s)</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Confidential Organization Notice -->
              <v-card v-if="job.hide_company_name" flat border class="pa-6 rounded-xl bg-white mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">Hiring Organization</h3>
                <div class="d-flex align-center gap-4 mb-3">
                  <v-avatar color="blue-lighten-5" size="48" rounded="lg">
                    <v-icon color="primary">mdi-shield-lock-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Confidential Organization</div>
                    <div class="text-caption text-grey">Identity Protected</div>
                  </div>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  This employer has chosen to keep their organization name and profile confidential for this position.
                </p>
              </v-card>

              <!-- Company Info (Only when company profile exists and is not hidden) -->
              <v-card v-else-if="job.company_bio || job.company_website || job.poster_role === 'employer'" flat border class="pa-6 rounded-xl bg-white mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">Company Profile</h3>
                <div class="d-flex align-center gap-4 mb-4">
                  <v-avatar color="grey-lighten-4" size="48" rounded="lg">
                    <img v-if="job.company_logo" :src="job.company_logo" :alt="job.company" style="width: 100%; height: 100%; object-fit: cover;" />
                    <v-icon v-else color="grey-darken-1">mdi-office-building</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">{{ job.company }}</div>
                    <div v-if="job.category_name" class="text-caption text-grey">{{ job.category_name }}</div>
                  </div>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-4">
                  {{ job.company_bio || 'Leading organization focused on excellence, innovation, and career development.' }}
                </p>
                <v-btn v-if="job.company_website" variant="outlined" block rounded="lg" class="text-capitalize font-weight-bold" @click="openCompanyWebsite">
                  Visit Website
                </v-btn>
              </v-card>

              <!-- Share Job -->
              <v-card flat border class="pa-6 rounded-xl bg-primary-lighten-5 border-primary">
                <h3 class="text-h6 font-weight-bold mb-3">Share this Job</h3>
                <p class="text-caption text-grey-darken-1 mb-4">Know someone who would be a great fit? Share this opportunity with them.</p>
                <div class="d-flex gap-2">
                  <v-btn icon variant="tonal" density="comfortable" color="primary" @click="shareOnLinkedIn"><v-icon size="18">mdi-linkedin</v-icon></v-btn>
                  <v-btn icon variant="tonal" density="comfortable" color="primary" @click="shareOnTwitter"><v-icon size="18">mdi-twitter</v-icon></v-btn>
                  <v-btn icon variant="tonal" density="comfortable" color="primary" @click="shareOnWhatsApp"><v-icon size="18">mdi-whatsapp</v-icon></v-btn>
                  <v-btn icon variant="tonal" density="comfortable" color="primary" @click="copyLink"><v-icon size="18">mdi-link-variant</v-icon></v-btn>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Application Modal Component -->
      <JobApplicationModal v-model="applyModal" :job="job" @submitted="handleApplySuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';
import JobApplicationModal from '@/components/jobs/JobApplicationModal.vue';

definePageMeta({
  layout: 'public'
});

const route = useRoute();
const authStore = useAuthStore();
const api = useApi();

const job = ref<any>(null);
const applyModal = ref(false);

const requiredSkills = ref<string[]>([]);
const niceToHaveSkills = ref<string[]>([]);
const experienceLevel = ref<string>('');
const numberOfOpenings = ref<number | null>(null);
const parsedLanguages = ref<string[]>([]);

onMounted(async () => {
  try {
    const res = await api.get(`/jobs/${route.params.id}`);
    job.value = res.data || res;

    // Parse Requirements JSON
    if (job.value?.requirements_json) {
      try {
        const parsed = typeof job.value.requirements_json === 'string' 
          ? JSON.parse(job.value.requirements_json) 
          : job.value.requirements_json;

        requiredSkills.value = Array.isArray(parsed.required) ? parsed.required : [];
        niceToHaveSkills.value = Array.isArray(parsed.nice_to_have) ? parsed.nice_to_have : [];
        experienceLevel.value = parsed.experience_level || '';
        numberOfOpenings.value = parsed.number_of_openings || null;
      } catch (e) {
        console.error('Error parsing requirements_json:', e);
      }
    }

    // Parse Language Requirements
    if (job.value?.language_req) {
      try {
        const langs = typeof job.value.language_req === 'string'
          ? JSON.parse(job.value.language_req)
          : job.value.language_req;
        parsedLanguages.value = Array.isArray(langs) ? langs : [];
      } catch (e) {
        parsedLanguages.value = [];
      }
    }
  } catch (error) {
    console.error('Failed to load job', error);
  }
});

const hasEligibilityDetails = computed(() => {
  if (!job.value) return false;
  return !!(
    job.value.qualification_req ||
    job.value.specialization_req ||
    experienceLevel.value ||
    job.value.joining_status_req ||
    (job.value.gender_preference && job.value.gender_preference !== 'any') ||
    parsedLanguages.value.length > 0
  );
});

const breadcrumbs = [
  { title: 'Home', disabled: false, to: '/' },
  { title: 'Job Portal', disabled: false, to: '/jobs' },
  { title: 'Job Detail', disabled: true }
];

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const handleApply = () => {
  if (job.value?.apply_url) {
    let targetUrl = job.value.apply_url.trim();
    if (targetUrl.includes('@') && !targetUrl.startsWith('mailto:') && !targetUrl.startsWith('http')) {
      targetUrl = `mailto:${targetUrl}`;
    } else if (!targetUrl.startsWith('http') && !targetUrl.startsWith('mailto:')) {
      targetUrl = `https://${targetUrl}`;
    }
    window.open(targetUrl, '_blank');
    return;
  }

  if (!authStore.isAuthenticated) {
    navigateTo(`/login?redirect=${route.fullPath}`);
  } else {
    applyModal.value = true;
  }
};

const handleApplySuccess = () => {
  alert('Your application has been successfully submitted! The employer will review it soon.');
};

const openCompanyWebsite = () => {
  if (job.value?.company_website) {
    let url = job.value.company_website;
    if (!url.startsWith('http')) url = 'https://' + url;
    window.open(url, '_blank');
  } else {
    alert('Company website is not available.');
  }
};

const shareOnLinkedIn = () => {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
};

const shareOnTwitter = () => {
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this job opportunity: ' + (job.value?.title || ''))}`, '_blank');
};

const shareOnWhatsApp = () => {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this job: ' + (job.value?.title || '') + ' - ' + window.location.href)}`, '_blank');
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  alert('Job link copied to clipboard!');
};

useSeoMeta({
  title: () => `${job.value?.title || 'Job Detail'} - ${job.value?.company || 'Brix Certifications'}`,
  description: () => job.value?.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || 'Job detail and application.'
});
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.04em; }
.leading-relaxed { line-height: 1.7; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.sticky-sidebar { position: sticky; top: 100px; }
.bg-primary-lighten-5 { background-color: rgba(0, 122, 255, 0.05) !important; }
.border-primary { border-color: rgba(0, 122, 255, 0.2) !important; }
.hover-card:hover { border-color: var(--color-brand) !important; cursor: pointer; }

.job-html-content :deep(p) {
  margin-bottom: 1em;
}

.job-html-content :deep(ul),
.job-html-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1em;
}

.job-html-content :deep(li) {
  margin-bottom: 0.4em;
}
</style>
