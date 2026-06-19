<template>
  <div class="verify-page-wrapper position-relative overflow-hidden bg-surface-light min-h-screen">
    <!-- Minimalist Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <div class="verify-page py-16 position-relative z-1">
      <v-container>
        <div class="text-center mb-12">
          <v-chip size="small" color="primary" variant="flat" class="mb-4 font-weight-bold text-uppercase tracking-widest">Official Credentials</v-chip>
          <h1 class="text-h2 font-weight-black mb-4 tracking-tight" style="color: var(--g7);">Verify Certificate</h1>
          <p class="text-body-1 text-grey-darken-1 mx-auto" style="max-width: 600px; line-height: 1.8;">
            Ensure the authenticity of any AEMS Academy certificate by entering its unique identification number below.
          </p>
        </div>

        <v-card class="mx-auto pa-6 rounded-xl border mb-12 bg-white" elevation="2" max-width="600" style="box-shadow: 0 12px 32px rgba(0,0,0,0.04) !important;">
          <v-form @submit.prevent="verifyCert" class="d-flex align-center flex-column flex-sm-row gap-4">
            <v-text-field
              v-model="certId"
              label="Enter Certificate ID"
              variant="outlined"
              hide-details
              rounded="lg"
              class="flex-grow-1"
              placeholder="e.g. AEMS-2026-XXXX"
            ></v-text-field>
            <v-btn
              color="primary"
              size="x-large"
              rounded="lg"
              class="px-8 font-weight-bold w-100 w-sm-auto"
              :loading="loading"
              type="submit"
            >
              Verify
            </v-btn>
          </v-form>
        </v-card>

        <!-- Result Area -->
        <div v-if="verifiedCert" class="mt-8 animate-fade-in">
          <div class="d-flex justify-center mb-8 gap-4">
            <v-btn
              prepend-icon="mdi-printer"
              variant="outlined"
              rounded="lg"
              class="font-weight-bold"
              @click="printCert"
            >
              Print Certificate
            </v-btn>
            <v-btn
              prepend-icon="mdi-share-variant"
              variant="outlined"
              rounded="lg"
              class="font-weight-bold"
              @click="copyLink"
            >
              Copy Verification Link
            </v-btn>
          </div>
          
          <CertificateCard :cert="verifiedCert" />
        </div>

        <!-- Error State -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="max-width-600 mx-auto rounded-xl"
          icon="mdi-alert-circle-outline"
        >
          {{ error }}
        </v-alert>

        <!-- Placeholder -->
        <div v-if="!verifiedCert && !error && !loading" class="text-center py-16">
          <v-avatar size="100" color="primary-lighten-4" class="mb-6">
            <v-icon size="48" color="primary">mdi-shield-check-outline</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold text-g6 mb-2">Ready to Verify</div>
          <p class="text-body-2 text-grey">Enter a certificate ID above to view the credentials.</p>
        </div>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
});

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const route = useRoute();

const certId = ref(route.query.id as string || '');
const loading = ref(false);
const verifiedCert = ref<any>(null);
const error = ref('');

const verifyCert = async () => {
  if (!certId.value) return;
  
  loading.value = true;
  error.value = '';
  verifiedCert.value = null;
  
  try {
    const data = await $fetch<any>(`${apiBase}/public/verify-certificate/${certId.value}`);
    verifiedCert.value = data;
  } catch (err: any) {
    if (err.statusCode === 404 || err.status === 404 || err.response?.status === 404) {
      error.value = 'Invalid Certificate ID. We could not find any record matching this ID.';
    } else {
      error.value = 'An error occurred during verification. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

const printCert = () => {
  window.print();
};

const copyLink = () => {
  const url = `${window.location.origin}/verify-certificate?id=${certId.value}`;
  navigator.clipboard.writeText(url);
  alert('Verification link copied to clipboard!');
};

// Auto-verify if ID is in query
onMounted(() => {
  if (certId.value) {
    verifyCert();
  }
});

useSeoMeta({
  title: 'Verify Certificate',
  description: 'Public verification portal for AEMS Academy certificates and credentials.'
});
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.04em; }
.tracking-widest { letter-spacing: 0.15em; }
.gap-4 { gap: 16px; }
.max-width-600 { max-width: 600px; }

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
}
.shape-1 {
  width: 400px;
  height: 400px;
  background: rgba(33, 29, 113, 0.05); /* Primary */
  top: -100px;
  right: -100px;
}
.shape-2 {
  width: 500px;
  height: 500px;
  background: rgba(246, 130, 31, 0.04); /* Secondary */
  bottom: -150px;
  left: -150px;
}
.text-g6 { color: var(--g6); }
</style>
