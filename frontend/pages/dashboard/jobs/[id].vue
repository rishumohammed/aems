<template>
  <v-container fluid class="pa-6">
    <div v-if="job">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4 text-capitalize font-weight-bold" @click="$router.back()">Back to Jobs</v-btn>
      
      <v-row>
        <v-col cols="12" md="8">
          <v-card rounded="xl" border flat class="pa-8 mb-6 shadow-sm">
            <div class="d-flex align-center gap-6 mb-8">
              <v-avatar 
                size="80" 
                rounded="xl" 
                color="grey-lighten-4" 
                class="border flex-shrink-0"
                :class="{ 'cursor-pointer hover-shadow': !job.hide_company_name && job.company }"
                @click="goToEmployer"
                :title="!job.hide_company_name && job.company ? (canAccessAdminEmployers ? 'View Employer Profile' : 'Visit Company') : ''"
              >
                <v-icon v-if="job.hide_company_name" color="primary" size="40">mdi-shield-lock-outline</v-icon>
                <img v-else-if="job.company_logo" :src="getImageUrl(job.company_logo)" :alt="job.company" style="width: 100%; height: 100%; object-fit: cover;" />
                <v-icon v-else color="grey-darken-1" size="40">mdi-office-building</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold mb-1">{{ job.title }}</h1>
                <div class="d-flex align-center gap-4 text-subtitle-1 text-secondary">
                  <a
                    v-if="!job.hide_company_name && job.company"
                    href="javascript:void(0)"
                    class="font-weight-bold text-primary text-decoration-none company-link d-inline-flex align-center gap-1"
                    @click="goToEmployer"
                    :title="canAccessAdminEmployers ? 'View Employer in Admin' : (job.employer_website || job.company_website ? 'Visit Website' : '')"
                  >
                    <span>{{ job.company }}</span>
                    <v-icon size="16" class="company-link-icon">mdi-open-in-new</v-icon>
                  </a>
                  <span v-else class="font-weight-bold text-primary">{{ job.company }}</span>
                  <v-divider vertical inset class="mx-1"></v-divider>
                  <span>{{ job.location }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-3 mb-8">
              <v-chip prepend-icon="mdi-briefcase-outline" rounded="lg" color="blue" variant="tonal" class="font-weight-bold">{{ job.type.replace('_', ' ') }}</v-chip>
              <v-chip prepend-icon="mdi-currency-inr" rounded="lg" color="green" variant="tonal" class="font-weight-bold">{{ job.salary_range }}</v-chip>
              <v-chip prepend-icon="mdi-calendar" rounded="lg" color="orange" variant="tonal" class="font-weight-bold">Posted {{ formatDate(job.created_at) }}</v-chip>
            </div>

            <v-divider class="mb-8"></v-divider>

            <h3 class="text-h6 font-weight-bold mb-4">Job Description</h3>
            <div class="text-body-1 text-grey-darken-1 leading-relaxed" v-html="job.description"></div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card rounded="xl" border flat class="pa-6 mb-6 shadow-sm sticky-top">
            <v-btn 
              block 
              :color="hasApplied ? 'grey' : 'primary'" 
              size="x-large" 
              rounded="lg" 
              class="font-weight-bold text-capitalize mb-4" 
              :disabled="hasApplied"
              @click="showApplyModal = true"
            >
              {{ hasApplied ? 'Already Applied' : 'Apply for this Job' }}
            </v-btn>
            <v-btn block variant="tonal" size="x-large" rounded="lg" class="font-weight-bold text-capitalize" @click="openCompanyWebsite">Visit Website</v-btn>
            
            <v-divider class="my-6"></v-divider>

            <div class="text-subtitle-2 font-weight-bold mb-4 uppercase text-secondary">Job Overview</div>
            <v-list density="compact" class="pa-0">
              <v-list-item class="pa-0 mb-3">
                <template v-slot:prepend><v-icon color="primary" class="mr-3">mdi-calendar-check</v-icon></template>
                <div class="text-caption text-grey">Expiration Date</div>
                <div class="text-body-2 font-weight-bold">{{ job.expiration_date ? new Date(job.expiration_date).toLocaleDateString() : 'Open' }}</div>
              </v-list-item>
              <v-list-item class="pa-0 mb-3">
                <template v-slot:prepend><v-icon color="primary" class="mr-3">mdi-tag-outline</v-icon></template>
                <div class="text-caption text-grey">Category</div>
                <div class="text-body-2 font-weight-bold">{{ job.category_name }}</div>
              </v-list-item>
              <v-list-item class="pa-0">
                <template v-slot:prepend><v-icon color="primary" class="mr-3">mdi-account-group-outline</v-icon></template>
                <div class="text-caption text-grey">Applications</div>
                <div class="text-body-2 font-weight-bold">{{ job.application_count || 0 }} Applicants</div>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <JobApplicationModal 
        v-if="showApplyModal" 
        v-model="showApplyModal"
        :job="job"
        @submitted="onApplySuccess"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import JobApplicationModal from '@/components/jobs/JobApplicationModal.vue';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const route = useRoute();
const config = useRuntimeConfig();
const { getImageUrl } = useImageUrl();
const apiBase = config.public.apiBase;
const showApplyModal = ref(false);
const hasApplied = ref(false);
const api = useApi();
const authStore = useAuthStore();

const { data: job } = await useFetch<any>(`${apiBase}/public/jobs/${route.params.id}`);

const canAccessAdminEmployers = computed(() => {
  const role = authStore.userRole || authStore.user?.role;
  return ['super_admin', 'sub_admin', 'placement_coordinator', 'admin'].includes(role);
});

const goToEmployer = () => {
  if (job.value?.hide_company_name) return;

  if (canAccessAdminEmployers.value) {
    if (job.value?.employer_id) {
      navigateTo(`/dashboard/admin/employers/${job.value.employer_id}`);
    } else if (job.value?.company) {
      navigateTo({
        path: '/dashboard/admin/employers',
        query: { search: job.value.company }
      });
    }
  } else if (job.value?.employer_website || job.value?.company_website) {
    openCompanyWebsite();
  }
};

onMounted(async () => {
  try {
    const res = await api.get(`/jobs/${route.params.id}/check-application`);
    if (res.data && res.data.hasApplied) {
      hasApplied.value = true;
    }
  } catch (error) {
    console.error('Failed to check application status:', error);
  }
});

const openCompanyWebsite = () => {
  const website = job.value?.employer_website || job.value?.company_website;
  if (website) {
    let url = website;
    if (!url.startsWith('http')) url = 'https://' + url;
    window.open(url, '_blank');
  } else {
    alert('No website listed for this employer.');
  }
};

const formatDate = (date: string) => dayjs(date).format('MMM D, YYYY');

const onApplySuccess = () => {
  showApplyModal.value = false;
  hasApplied.value = true;
};
</script>

<style scoped>
.leading-relaxed { line-height: 1.8; }
.sticky-top { position: sticky; top: 20px; }
.gap-6 { gap: 24px; }
.gap-4 { gap: 16px; }
.gap-3 { gap: 12px; }
.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }

.cursor-pointer {
  cursor: pointer;
}
.hover-shadow {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}

.company-link {
  transition: all 0.2s ease;
  border-radius: 4px;
}
.company-link:hover {
  text-decoration: underline !important;
  color: #1976d2 !important;
  opacity: 0.9;
}
.company-link-icon {
  opacity: 0.7;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.company-link:hover .company-link-icon {
  opacity: 1;
  transform: translate(1px, -1px);
}
</style>
