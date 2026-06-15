<template>
  <div class="pa-6 fade-in">
    <div class="mb-8">
      <h1 class="page-title mb-1">System Settings</h1>
      <p class="text-subtitle-1 text-secondary">Configure branding, integrations, and global parameters.</p>
    </div>

    <div class="settings-layout">
      <!-- Internal Sidebar -->
      <div class="settings-sidebar pa-2">
        <v-list v-model:selected="activeTab" color="primary" mandatory class="settings-list">
          <v-list-item 
            v-for="tab in tabs" 
            :key="tab.value" 
            :value="tab.value" 
            :prepend-icon="tab.icon" 
            :title="tab.label"
            rounded="lg"
            class="mb-1"
          ></v-list-item>
        </v-list>
      </div>

      <!-- Main Content -->
      <div class="settings-content pa-8">
        <v-form @submit.prevent="save">
          <!-- Branding Tab -->
          <div v-if="activeTab[0] === 'branding'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">Branding & Identity</h2>
            <div class="fr2 mb-4">
              <AppInput v-model="form.institute_name" label="Institution Name" placeholder="AEMS Academy" large />
              <AppInput v-model="form.tagline" label="Tagline" placeholder="Learn the future" large />
            </div>
            <div class="fr2">
              <AppInput v-model="form.brand_primary_color" label="Primary Color" type="color" large />
              <AppInput v-model="form.brand_secondary_color" label="Secondary Color" type="color" large />
            </div>
          </div>

          <!-- Email Tab -->
          <div v-if="activeTab[0] === 'email'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">Email Settings (SMTP)</h2>
            <div class="fr2 mb-4" style="grid-template-columns: 2fr 1fr;">
              <AppInput v-model="form.smtp_host" label="SMTP Host" placeholder="smtp.gmail.com" large />
              <AppInput v-model="form.smtp_port" label="Port" placeholder="587" large />
            </div>
            <div class="fr2 mb-4">
              <AppInput v-model="form.smtp_user" label="Username" placeholder="user@example.com" large />
              <AppInput v-model="form.smtp_pass" label="Password" type="password" placeholder="••••••••" large />
            </div>
            <div class="fr2 mb-6">
              <AppInput v-model="form.smtp_from_name" label="From Name" placeholder="AEMS Team" large />
              <AppInput v-model="form.smtp_from_email" label="From Email" placeholder="noreply@aems.local" large />
            </div>
            <AppButton variant="g" icon="mdi-send-outline" @click="testEmail">Send Test Email</AppButton>
          </div>

          <!-- Contact Info Tab -->
          <div v-if="activeTab[0] === 'contact'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">Contact Information</h2>
            <div class="fr2 mb-4">
              <AppInput v-model="form.contact_email" label="Contact Email" placeholder="contact@aems.local" large />
              <AppInput v-model="form.contact_phone" label="Contact Phone" placeholder="+1234567890" large />
            </div>
            <div class="mb-6">
              <AppInput v-model="form.contact_address" label="Institution Address" placeholder="123 AEMS Campus" large />
            </div>
          </div>


          <!-- Payments Tab -->
          <div v-if="activeTab[0] === 'payments'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">Payment Gateway (Razorpay)</h2>
            <div class="mb-4">
              <AppInput v-model="form.razorpay_key_id" label="Key ID" placeholder="rzp_live_..." large />
            </div>
            <div class="mb-4">
              <AppInput v-model="form.razorpay_key_secret" label="Key Secret" type="password" placeholder="••••••••" large />
            </div>
            <div class="mb-6">
              <AppInput v-model="form.razorpay_webhook_secret" label="Webhook Secret" type="password" placeholder="••••••••" large />
            </div>

            <v-divider class="my-6"></v-divider>

            <h2 class="text-h6 font-weight-bold mb-6">Course Access Rules</h2>
            <div class="mb-4">
              <AppInput 
                v-model="form.payment_allow_partial_access" 
                label="Option A: Allow course access after partial payment" 
                type="select" 
                :options="[{label: 'Yes, allow access', value: 'true'}, {label: 'No, restrict until fully paid', value: 'false'}]" 
                large 
              />
            </div>
            <div class="mb-4">
              <AppInput 
                v-model="form.payment_restrict_certificate" 
                label="Option B: Restrict certificate generation until fully paid" 
                type="select" 
                :options="[{label: 'Yes, restrict certificate', value: 'true'}, {label: 'No, allow certificate', value: 'false'}]" 
                large 
              />
            </div>
            <div class="mb-6">
              <AppInput 
                v-model="form.payment_restrict_exam" 
                label="Option C: Restrict final exam until fully paid" 
                type="select" 
                :options="[{label: 'Yes, restrict exam', value: 'true'}, {label: 'No, allow exam', value: 'false'}]" 
                large 
              />
            </div>
          </div>

          <!-- WhatsApp Tab -->
          <div v-if="activeTab[0] === 'whatsapp'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">WhatsApp Cloud API</h2>
            <div class="fr2 mb-4">
              <AppInput v-model="form.whatsapp_app_id" label="App ID" placeholder="123456789" large />
              <AppInput v-model="form.whatsapp_phone_number_id" label="Phone Number ID" placeholder="987654321" large />
            </div>
            <div class="mb-4">
              <AppInput v-model="form.whatsapp_access_token" label="System Access Token" type="password" placeholder="EAAB..." large />
            </div>
            <div class="mb-6">
              <AppInput v-model="form.whatsapp_verify_token" label="Webhook Verify Token" placeholder="my_token" large />
            </div>
          </div>

          <!-- Terms & Privacy Tab -->
          <div v-if="activeTab[0] === 'terms_privacy'" class="fade-in">
            <h2 class="text-h6 font-weight-bold mb-6">Terms &amp; Privacy Configuration</h2>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.terms_content" label="Terms &amp; Conditions Content" rows="8" variant="outlined" auto-grow class="mb-3" />
                <AppInput v-model="form.terms_version" label="Terms &amp; Conditions Version" placeholder="1.0" large />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.privacy_content" label="Privacy Policy Content" rows="8" variant="outlined" auto-grow class="mb-3" />
                <AppInput v-model="form.privacy_version" label="Privacy Policy Version" placeholder="1.0" large />
              </v-col>
            </v-row>

            <v-divider class="my-8"></v-divider>

            <h2 class="text-h6 font-weight-bold mb-4">Candidate Consent &amp; Acceptance History</h2>
            <v-data-table
              :headers="historyHeaders"
              :items="acceptanceHistory"
              hover
              class="border rounded-xl"
            >
              <template v-slot:item.accepted_at="{ item }">
                <span>{{ new Date(item.accepted_at).toLocaleString() }}</span>
              </template>
            </v-data-table>
          </div>

          <!-- Social Platforms Tab -->
          <div v-if="activeTab[0] === 'social'" class="fade-in">
            <SocialPlatformsTab />
          </div>

          <div class="d-flex justify-end gap-3 mt-12 pt-6 border-t" v-if="activeTab[0] !== 'social'">
            <AppButton variant="g" size="lg" icon="mdi-refresh" @click="fetchData">
              Reset Changes
            </AppButton>
            <AppButton type="submit" :loading="saving" size="lg" icon="mdi-check" @click.prevent="save">
              Save All Settings
            </AppButton>
          </div>
        </v-form>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" rounded="lg" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import SocialPlatformsTab from '@/components/admin/settings/SocialPlatformsTab.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

const api = useApi();
const activeTab = ref(['branding']);
const saving = ref(false);
const form = ref<any>({});
const acceptanceHistory = ref<any[]>([]);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const tabs = [
  { label: 'Branding', value: 'branding', icon: 'mdi-palette-outline' },
  { label: 'Contact Info', value: 'contact', icon: 'mdi-map-marker-outline' },
  { label: 'Email (SMTP)', value: 'email', icon: 'mdi-email-outline' },
  { label: 'WhatsApp API', value: 'whatsapp', icon: 'mdi-whatsapp' },
  { label: 'Payments', value: 'payments', icon: 'mdi-credit-card-outline' },
  { label: 'Terms & Privacy', value: 'terms_privacy', icon: 'mdi-shield-lock-outline' },
  { label: 'Social Platforms', value: 'social', icon: 'mdi-account-group-outline' },
];

const historyHeaders = [
  { title: 'Candidate', key: 'candidate_name' },
  { title: 'Email', key: 'candidate_email' },
  { title: 'Exam', key: 'exam_name' },
  { title: 'Terms Version', key: 'accepted_terms_version' },
  { title: 'Privacy Version', key: 'accepted_privacy_version' },
  { title: 'Accepted At', key: 'accepted_at' },
  { title: 'IP Address', key: 'ip_address' }
];

const fetchAcceptanceHistory = async () => {
  try {
    const { data } = await api.get('/admin/config/terms-privacy-acceptances');
    acceptanceHistory.value = data || [];
  } catch (err) {
    console.error('Failed to fetch acceptance history', err);
  }
};

watch(activeTab, (newVal) => {
  if (newVal[0] === 'terms_privacy') {
    fetchAcceptanceHistory();
  }
});

const fetchData = async () => {
  try {
    const { data } = await api.get('/admin/config');
    const configMap: any = {};
    data.forEach((item: any) => {
      configMap[item.key] = item.value;
    });
    form.value = configMap;
  } catch (err) {
    console.error('Failed to fetch config');
  }
};

const save = async () => {
  saving.value = true;
  try {
    await api.put('/admin/config', form.value);
    snackbarMessage.value = 'Settings saved successfully. Reloading to apply changes...';
    snackbarColor.value = 'success';
    snackbar.value = true;
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    console.error('Failed to save config');
    snackbarMessage.value = 'Failed to save settings';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    saving.value = false;
  }
};

const testEmail = async () => {
  try {
    await api.post('/admin/config/test-email');
    snackbarMessage.value = 'Test email sent successfully';
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (err) {
    snackbarMessage.value = 'Failed to send test email';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: var(--g7);
}

.settings-layout {
  display: flex;
  background: white;
  border-radius: var(--r16);
  box-shadow: var(--s2);
  min-height: 600px;
  overflow: hidden;
}

.settings-sidebar {
  width: 260px;
  background: var(--g1);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-content {
  flex: 1;
}

.settings-list {
  background: transparent !important;
}

:deep(.v-list-item--selected) {
  background-color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.fr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.border-t { border-top: 1px solid rgba(0, 0, 0, 0.05); }
</style>
