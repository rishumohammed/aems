<template>
  <div class="cert-detail-page-wrapper">
    <div v-if="standard" class="cert-detail-page bg-background min-h-screen py-10">
      <v-container>
        <!-- Breadcrumbs -->
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-6"></v-breadcrumbs>

        <!-- Hero Card -->
        <div 
          class="hero-card position-relative rounded-2xl overflow-hidden mb-8 shadow-card"
          :style="heroStyle"
        >
          <div class="hero-overlay"></div>
          <div class="position-relative pa-8 pa-md-12 text-white d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-6" style="z-index: 2;">
            <div class="d-flex align-center gap-6">
              <v-avatar :color="standard.color || 'primary'" size="88" rounded="xl" class="elevation-3 border">
                <v-icon size="48" color="white">{{ standard.icon || 'mdi-certificate-outline' }}</v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center gap-2 mb-2">
                  <v-chip size="small" color="white" variant="flat" class="font-weight-bold text-uppercase text-primary">
                    Global Certification Standard
                  </v-chip>
                </div>
                <h1 class="text-h3 text-md-h2 font-weight-black tracking-tight mb-1">{{ standard.name }}</h1>
                <p class="text-h6 opacity-90 font-weight-medium mb-0">{{ standard.sub }}</p>
              </div>
            </div>

            <div class="d-flex flex-wrap align-center gap-3">
              <a :href="generateWALink(`Hi, I would like to inquire about ${standard.name} (${standard.sub}) Certification.`)" target="_blank" class="wa-inquiry-btn">
                <v-icon size="20">mdi-whatsapp</v-icon>
                Inquire on WhatsApp
              </a>
              <v-btn color="white" variant="outlined" size="large" rounded="lg" class="font-weight-bold text-none" to="/courses">
                View Related Courses
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Quick Info Highlights Bar -->
        <v-row class="mb-8" v-if="highlights && highlights.length">
          <v-col cols="6" sm="3" v-for="item in highlights" :key="item.title">
            <v-card flat border class="pa-4 rounded-xl bg-white text-center h-100">
              <v-icon size="28" color="primary" class="mb-2">{{ item.icon || 'mdi-star-outline' }}</v-icon>
              <div class="text-subtitle-2 font-weight-bold text-grey-darken-4">{{ item.title }}</div>
              <div class="text-caption text-grey">{{ item.sub }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main Content & Sidebar -->
        <v-row>
          <!-- Left Column: Rich Content -->
          <v-col cols="12" md="8">
            <v-card flat border class="pa-6 pa-md-10 rounded-xl bg-white mb-8">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center gap-2 text-grey-darken-4">
                <v-icon color="primary" size="28">mdi-book-open-page-variant-outline</v-icon>
                Overview &amp; Standard Requirements
              </h2>

              <div 
                v-if="standard.description" 
                class="text-body-1 text-grey-darken-3 leading-relaxed cert-html-content" 
                v-html="standard.description"
              ></div>

              <div v-else class="py-8 text-center text-grey">
                <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-information-outline</v-icon>
                <p class="text-body-1">Detailed documentation for {{ standard.name }} is being updated. Please contact our team for complete guidelines.</p>
              </div>
            </v-card>

            <!-- Key Benefits Section -->
            <v-card flat border class="pa-6 pa-md-8 rounded-xl bg-white mb-8" v-if="benefits && benefits.length">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center gap-2">
                <v-icon color="primary" size="28">mdi-star-check-outline</v-icon>
                Key Benefits of {{ standard.name }} Certification
              </h2>

              <v-row>
                <v-col cols="12" sm="6" v-for="benefit in benefits" :key="benefit.title">
                  <div class="d-flex align-start gap-3">
                    <v-avatar color="primary-lighten-5" size="36" rounded="lg" class="flex-shrink-0">
                      <v-icon color="primary" size="20">mdi-check</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">{{ benefit.title }}</div>
                      <div class="text-body-2 text-grey-darken-1">{{ benefit.desc }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- Right Sidebar -->
          <v-col cols="12" md="4">
            <div class="sticky-sidebar">
              <!-- Fast Facts Card -->
              <v-card flat border class="pa-6 rounded-xl bg-white mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">Framework Summary</h3>
                <v-list density="compact" class="pa-0">
                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-certificate-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Standard Name</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ standard.name }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-tag-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Focus Area</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ standard.sub }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-earth</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Scope</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ standard.scope || 'International Standard' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0 py-2">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-check-decagram-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-caption text-grey">Audit Compliance</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-medium text-grey-darken-3">{{ standard.compliance_info || 'GFSI & ISO Aligned' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Enquire Form Card -->
              <v-card flat border class="pa-6 rounded-xl bg-white mb-6">
                <h3 class="text-h6 font-weight-bold mb-2">Request Certification Info</h3>
                <p class="text-caption text-grey-darken-1 mb-4">Get custom guidance and enrollment details from our experts.</p>
                <DynamicLeadForm form-id="certification-inquiry" :source="`certification_${standard.slug || standard.id}`" />
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- 404 Loading / Empty State -->
    <div v-else-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      <p class="text-grey mt-4">Loading certification guidelines...</p>
    </div>

    <div v-else class="text-center py-16">
      <v-avatar color="grey-lighten-4" size="100" class="mb-4">
        <v-icon size="48" color="grey">mdi-certificate-alert-outline</v-icon>
      </v-avatar>
      <h2 class="text-h5 font-weight-bold mb-2">Certification Standard Not Found</h2>
      <p class="text-grey mb-6">The certification standard you are looking for does not exist or has been archived.</p>
      <v-btn color="primary" rounded="lg" to="/">Return to Homepage</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import DynamicLeadForm from '@/components/DynamicLeadForm.vue';

definePageMeta({
  layout: 'public'
});

const route = useRoute();
const api = useApi();
const { generateWALink } = useWhatsApp();

const standard = ref<any>(null);
const loading = ref(true);

const slugParam = computed(() => route.params.slug as string);

onMounted(async () => {
  try {
    const res = await api.get(`/public/standards/${slugParam.value}`);
    standard.value = res.data || res;
  } catch (error) {
    console.error('Failed to load certification standard details:', error);
  } finally {
    loading.value = false;
  }
});

const heroStyle = computed(() => {
  if (standard.value?.banner_image) {
    let img = standard.value.banner_image;
    if (!img.startsWith('http')) {
      const config = useRuntimeConfig();
      img = config.public.apiBase.replace('/api', '') + img;
    }
    return `background-image: url('${img}'); background-size: cover; background-position: center;`;
  }
  return `background: linear-gradient(135deg, #1B1B3A 0%, #2a2a5c 100%);`;
});

const breadcrumbs = computed(() => [
  { title: 'Home', disabled: false, to: '/' },
  { title: 'Certifications', disabled: false, to: '/#standards' },
  { title: standard.value?.name || 'Standard Detail', disabled: true }
]);

const defaultHighlights = [
  { icon: 'mdi-earth', title: 'Global Standard', sub: 'Worldwide Acceptance' },
  { icon: 'mdi-shield-check', title: 'Audit Ready', sub: 'GFSI Benchmarked' },
  { icon: 'mdi-school', title: 'Expert Training', sub: 'Certified Lead Auditors' },
  { icon: 'mdi-file-document-check', title: 'Verifiable Certs', sub: 'Online Validation' }
];

const defaultBenefits = [
  { title: 'Global Market Access', desc: 'Fulfill compliance expectations required by international retailers and buyers.' },
  { title: 'Risk Reduction', desc: 'Identify critical control points to minimize food safety and operational hazards.' },
  { title: 'Process Efficiency', desc: 'Standardize management procedures to improve productivity and quality.' },
  { title: 'Brand Trust & Recognition', desc: 'Demonstrate commitment to international food safety and quality standards.' }
];

const highlights = computed(() => {
  if (!standard.value?.highlights_json) return defaultHighlights;
  if (typeof standard.value.highlights_json === 'object') return standard.value.highlights_json;
  try {
    const parsed = JSON.parse(standard.value.highlights_json);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultHighlights;
  } catch (e) {
    return defaultHighlights;
  }
});

const benefits = computed(() => {
  if (!standard.value?.benefits_json) return defaultBenefits;
  if (typeof standard.value.benefits_json === 'object') return standard.value.benefits_json;
  try {
    const parsed = JSON.parse(standard.value.benefits_json);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultBenefits;
  } catch (e) {
    return defaultBenefits;
  }
});

useSeoMeta({
  title: () => standard.value ? `${standard.value.name} (${standard.value.sub}) Certification - Brix Certifications` : 'Certification Standard',
  description: () => standard.value?.meta_description || standard.value?.sub || 'Globally recognized certification standard explanation and guidelines.'
});
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.04em; }
.leading-relaxed { line-height: 1.75; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.sticky-sidebar { position: sticky; top: 100px; }

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(2px);
  z-index: 1;
}

.shadow-card {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12) !important;
}

.wa-inquiry-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  background: #25D366;
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.wa-inquiry-btn:hover {
  background: #1ebe5c;
  transform: translateY(-2px);
}

.cert-html-content :deep(h2) {
  font-size: 1.4rem;
  font-weight: 800;
  margin-top: 1.5em;
  margin-bottom: 0.6em;
  color: #0f172a;
}

.cert-html-content :deep(h3) {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 1.2em;
  margin-bottom: 0.4em;
  color: #1e293b;
}

.cert-html-content :deep(p) {
  margin-bottom: 1em;
}

.cert-html-content :deep(ul),
.cert-html-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1em;
}

.cert-html-content :deep(li) {
  margin-bottom: 0.4em;
}
</style>
