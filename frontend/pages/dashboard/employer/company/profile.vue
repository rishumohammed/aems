<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1 text-primary">Company Profile</h1>
        <p class="text-blue-grey-300">Manage your company's public branding and details.</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-content-save"
        :loading="loading"
        @click="saveProfile"
        class="font-weight-bold"
      >
        Save Profile
      </v-btn>
    </div>

    <v-card color="white" border rounded="xl" class="pa-6 mb-8 shadow-card">
      <v-form ref="form">
        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Basic Details</h3>
        
        <v-row>
          <v-col cols="12" md="3" class="text-center">
            <v-avatar size="150" color="grey-darken-3" class="mb-4">
              <v-img v-if="formData.logo_url" :src="formData.logo_url" cover></v-img>
              <v-icon v-else size="64" color="grey">mdi-domain</v-icon>
            </v-avatar>
            <v-text-field
              v-model="formData.logo_url"
              label="Logo URL"
              variant="outlined"
              density="compact"
              color="primary"
              hide-details
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="9">
            <v-text-field
              v-model="formData.company_name"
              label="Company Name"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
            ></v-text-field>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.industry"
                  label="Industry"
                  variant="outlined"
                  color="primary"
                  class="mb-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.company_size"
                  :items="['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']"
                  label="Company Size"
                  variant="outlined"
                  color="primary"
                  class="mb-4"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-textarea
              v-model="formData.about_company"
              label="About Company"
              variant="outlined"
              color="primary"
              rows="4"
              class="mb-4"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-divider class="my-6 border-opacity-25" color="white"></v-divider>

        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Links & Contacts</h3>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.website"
              label="Website"
              prepend-inner-icon="mdi-web"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.linkedin_url"
              label="LinkedIn URL"
              prepend-inner-icon="mdi-linkedin"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-textarea
          v-model="formData.address"
          label="Headquarters Address"
          prepend-inner-icon="mdi-map-marker"
          variant="outlined"
          color="primary"
          rows="2"
          class="mb-4"
        ></v-textarea>

        <v-divider class="my-6 border-opacity-25" color="white"></v-divider>

        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Culture & Benefits</h3>
        
        <v-combobox
          v-model="formData.hiring_locations_json"
          label="Hiring Locations"
          multiple
          chips
          variant="outlined"
          color="primary"
          hint="Type and press enter to add"
          persistent-hint
          class="mb-6"
        ></v-combobox>

        <v-combobox
          v-model="formData.benefits_json"
          label="Company Benefits"
          multiple
          chips
          variant="outlined"
          color="primary"
          hint="e.g. Health Insurance, Remote Work, Gym Membership"
          persistent-hint
          class="mb-4"
        ></v-combobox>

      </v-form>
    </v-card>
    
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const api = useApi();
const loading = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const formData = ref({
  company_name: '',
  company_size: '',
  industry: '',
  address: '',
  logo_url: '',
  about_company: '',
  website: '',
  linkedin_url: '',
  social_links_json: [],
  hiring_locations_json: [],
  benefits_json: []
});

onMounted(async () => {
  await loadProfile();
});

const loadProfile = async () => {
  try {
    const res = await api.get('/employers/profile');
    if (res.data) {
      const data = res.data;
      formData.value = {
        ...data,
        social_links_json: typeof data.social_links_json === 'string' ? JSON.parse(data.social_links_json) : data.social_links_json || [],
        hiring_locations_json: typeof data.hiring_locations_json === 'string' ? JSON.parse(data.hiring_locations_json) : data.hiring_locations_json || [],
        benefits_json: typeof data.benefits_json === 'string' ? JSON.parse(data.benefits_json) : data.benefits_json || []
      };
    }
  } catch (error) {
    console.error('Failed to load profile', error);
  }
};

const saveProfile = async () => {
  loading.value = true;
  try {
    await api.put('/employers/profile', formData.value);
    snackbarColor.value = 'success';
    snackbarText.value = 'Profile saved successfully!';
    snackbar.value = true;
  } catch (error: any) {
    console.error('Failed to save profile', error);
    snackbarColor.value = 'error';
    snackbarText.value = error.response?.data?.message || 'Failed to save profile';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.shadow-card {
  border: 1px solid var(--border);
  
}
.max-w-1000 {
  max-width: 1000px;
}
</style>
