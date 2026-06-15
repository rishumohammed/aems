<template>
  <div class="verify-page-wrapper">
    <div class="verify-page py-16 bg-background min-h-screen">
      <v-container>
        <div class="text-center mb-12">
          <h1 class="text-h3 font-weight-black mb-4 tracking-tight">Verify Certificate</h1>
          <p class="text-h6 text-grey-darken-1 mx-auto" style="max-width: 600px;">
            Verify the authenticity of any AEMS Academy certificate by entering its unique identification number.
          </p>
        </div>

        <v-card class="mx-auto pa-4 rounded-xl shadow-xl border mb-12" max-width="600">
          <v-form @submit.prevent="verifyCert" class="d-flex align-center gap-4">
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
              class="px-8 font-weight-bold"
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
        <div v-if="!verifiedCert && !error && !loading" class="text-center py-16 opacity-25">
          <v-icon size="120">mdi-certificate-outline</v-icon>
          <div class="text-h6 mt-4">Verification results will appear here</div>
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
  title: 'Verify Certificate | AEMS Academy',
  description: 'Public verification portal for AEMS Academy certificates and credentials.'
});
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.04em; }
.gap-4 { gap: 16px; }
.max-width-600 { max-width: 600px; }

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
