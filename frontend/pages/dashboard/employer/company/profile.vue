<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Company Profile</h1>
        <p class="text-secondary">Manage your company's public branding, profile picture, and hiring details.</p>
      </div>
      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-content-save"
        :loading="loading"
        @click="saveProfile"
        class="font-weight-bold text-none shadow-sm"
      >
        Save Profile
      </v-btn>
    </div>

    <v-card color="white" border rounded="xl" elevation="0" class="pa-6 mb-8 shadow-card">
      <v-form ref="form">
        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-6 d-flex align-center gap-2">
          <v-icon color="primary" size="22">mdi-domain</v-icon>
          Company Branding & Details
        </h3>
        
        <v-row>
          <!-- Employer Profile Picture / Logo Section -->
          <v-col cols="12" md="4" lg="3" class="text-center border-e-md pr-md-6 mb-6 mb-md-0">
            <div class="profile-picture-container pa-4 rounded-xl bg-grey-lighten-5 border mb-4">
              <div class="position-relative d-inline-block mb-3">
                <v-avatar size="140" color="white" rounded="xl" class="border shadow-sm elevation-1 overflow-hidden">
                  <v-img
                    v-if="formData.logo_url"
                    :src="getImageUrl(formData.logo_url)"
                    cover
                    alt="Company Logo"
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                      </div>
                    </template>
                  </v-img>
                  <div v-else class="d-flex flex-column align-center justify-center fill-height text-grey-darken-1">
                    <v-icon size="56" color="grey-darken-1">mdi-domain</v-icon>
                    <span class="text-caption font-weight-bold mt-1 text-grey">No Logo</span>
                  </div>
                </v-avatar>

                <!-- Overlay upload indicator if uploading -->
                <v-fade-transition>
                  <div
                    v-if="uploadingLogo"
                    class="upload-overlay rounded-xl d-flex flex-column align-center justify-center"
                  >
                    <v-progress-circular indeterminate color="white" size="32"></v-progress-circular>
                    <span class="text-caption text-white font-weight-bold mt-2">Uploading...</span>
                  </div>
                </v-fade-transition>
              </div>

              <!-- Status Chip -->
              <div class="mb-3">
                <v-chip
                  v-if="formData.logo_url"
                  size="x-small"
                  color="success"
                  variant="flat"
                  class="font-weight-bold"
                  prepend-icon="mdi-check-circle"
                >
                  Profile Picture Set
                </v-chip>
                <v-chip
                  v-else
                  size="x-small"
                  color="grey"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  No Picture Uploaded
                </v-chip>
              </div>

              <!-- Hidden File Input -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                class="d-none"
                @change="handleFileSelected"
              />

              <!-- Action Buttons -->
              <div class="d-flex flex-column gap-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  block
                  class="text-none font-weight-bold mb-1"
                  :loading="uploadingLogo"
                  :prepend-icon="formData.logo_url ? 'mdi-camera-flip-outline' : 'mdi-camera-plus-outline'"
                  @click="triggerFileInput"
                >
                  {{ formData.logo_url ? 'Change Picture' : 'Upload Picture' }}
                </v-btn>

                <div v-if="formData.logo_url" class="d-flex gap-2">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    rounded="lg"
                    size="small"
                    class="flex-grow-1 text-none font-weight-bold"
                    prepend-icon="mdi-eye-outline"
                    @click="viewDialog = true"
                  >
                    View
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    color="error"
                    rounded="lg"
                    size="small"
                    class="flex-grow-1 text-none font-weight-bold"
                    prepend-icon="mdi-delete-outline"
                    :loading="removingLogo"
                    @click="removeDialog = true"
                  >
                    Remove
                  </v-btn>
                </div>
              </div>

              <div class="text-caption text-grey mt-3" style="font-size: 0.75rem; line-height: 1.3;">
                PNG, JPG, WEBP, or SVG.<br />Max size: 5MB.
              </div>
            </div>

            <!-- Optional Direct URL Toggle -->
            <v-btn
              variant="text"
              size="x-small"
              color="primary"
              class="text-none font-weight-bold mt-1"
              @click="showUrlInput = !showUrlInput"
            >
              {{ showUrlInput ? 'Hide URL input' : 'Or enter image URL directly' }}
              <v-icon end size="14">{{ showUrlInput ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>

            <v-expand-transition>
              <div v-if="showUrlInput" class="mt-3">
                <v-text-field
                  v-model="formData.logo_url"
                  label="Logo Image URL"
                  placeholder="https://example.com/logo.png"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  hide-details
                  prepend-inner-icon="mdi-link"
                  clearable
                ></v-text-field>
              </div>
            </v-expand-transition>
          </v-col>

          <!-- Company Details Inputs -->
          <v-col cols="12" md="8" lg="9" class="pl-md-6">
            <v-text-field
              v-model="formData.company_name"
              label="Company Name *"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'Company name is required']"
              class="mb-4"
              prepend-inner-icon="mdi-domain"
            ></v-text-field>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.industry"
                  label="Industry / Domain"
                  placeholder="e.g. Information Technology, Healthcare, Finance"
                  variant="outlined"
                  color="primary"
                  class="mb-4"
                  prepend-inner-icon="mdi-briefcase-outline"
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
                  prepend-inner-icon="mdi-account-group-outline"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-textarea
              v-model="formData.about_company"
              label="About Company"
              placeholder="Introduce your company culture, mission, and why candidates should join you..."
              variant="outlined"
              color="primary"
              rows="4"
              class="mb-4"
              prepend-inner-icon="mdi-text-box-outline"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-divider class="my-6 border-opacity-25"></v-divider>

        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4 d-flex align-center gap-2">
          <v-icon color="primary" size="22">mdi-link-variant</v-icon>
          Links & Contact Details
        </h3>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.phone"
              label="Contact Phone"
              prepend-inner-icon="mdi-phone"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.website"
              label="Website URL"
              placeholder="https://yourcompany.com"
              prepend-inner-icon="mdi-web"
              variant="outlined"
              color="primary"
              class="mb-4"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.linkedin_url"
              label="LinkedIn Company URL"
              placeholder="https://linkedin.com/company/..."
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
          placeholder="Building, Street, City, State, Country"
          prepend-inner-icon="mdi-map-marker-outline"
          variant="outlined"
          color="primary"
          rows="2"
          class="mb-4"
        ></v-textarea>

        <v-divider class="my-6 border-opacity-25"></v-divider>

        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-4 d-flex align-center gap-2">
          <v-icon color="primary" size="22">mdi-heart-outline</v-icon>
          Culture, Locations & Benefits
        </h3>
        
        <v-combobox
          v-model="formData.hiring_locations_json"
          label="Hiring Locations"
          multiple
          chips
          closable-chips
          variant="outlined"
          color="primary"
          prepend-inner-icon="mdi-map-marker-multiple-outline"
          hint="Type city/country and press enter to add"
          persistent-hint
          class="mb-6"
        ></v-combobox>

        <v-combobox
          v-model="formData.benefits_json"
          label="Company Benefits & Perks"
          multiple
          chips
          closable-chips
          variant="outlined"
          color="primary"
          prepend-inner-icon="mdi-gift-outline"
          hint="e.g. Health Insurance, Flexible Hours, Remote Work, Gym Membership"
          persistent-hint
          class="mb-4"
        ></v-combobox>

      </v-form>
    </v-card>

    <!-- View Profile Picture Modal -->
    <v-dialog v-model="viewDialog" max-width="500">
      <v-card rounded="xl" class="overflow-hidden">
        <v-card-title class="d-flex align-center justify-space-between pa-4 bg-grey-lighten-4 border-b">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary" size="20">mdi-image-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Employer Profile Picture</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="viewDialog = false"></v-btn>
        </v-card-title>
        
        <div class="pa-6 text-center bg-white">
          <div class="image-viewer-frame border rounded-xl overflow-hidden pa-2 mx-auto mb-4 bg-grey-lighten-5 d-flex align-center justify-center" style="max-height: 360px;">
            <img
              :src="getImageUrl(formData.logo_url)"
              :alt="formData.company_name"
              style="max-width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px;"
            />
          </div>
          <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-1">
            {{ formData.company_name || 'Employer Profile' }}
          </div>
          <div class="text-caption text-secondary">
            Displayed on your job postings, candidate matching, and employer portal.
          </div>
        </div>

        <v-card-actions class="pa-4 bg-grey-lighten-4 border-t d-flex justify-space-between">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-camera-flip-outline"
            class="text-none font-weight-bold"
            @click="viewDialog = false; triggerFileInput();"
          >
            Change Image
          </v-btn>
          <v-btn
            variant="flat"
            color="grey-darken-2"
            class="text-none font-weight-bold"
            @click="viewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remove Profile Picture Confirmation Dialog -->
    <v-dialog v-model="removeDialog" max-width="420">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="error-lighten-5" size="48" class="mr-3" rounded="lg">
            <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold">Remove Picture?</h3>
            <p class="text-caption text-secondary mb-0">This will remove your current company logo.</p>
          </div>
        </div>
        <p class="text-body-2 text-grey-darken-1 mb-6">
          Your job listings will display the default company icon until a new profile picture is uploaded.
        </p>
        <div class="d-flex gap-3 justify-end">
          <v-btn variant="text" color="grey" class="text-none font-weight-bold" @click="removeDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-none font-weight-bold rounded-lg"
            :loading="removingLogo"
            @click="executeRemoveLogo"
          >
            Yes, Remove
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
    
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3500">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useImageUrl } from '@/composables/useImageUrl';
import { useAuthStore } from '@/stores/auth';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], role: ['employer'] });

const api = useApi();
const authStore = useAuthStore();
const { getImageUrl } = useImageUrl();

const loading = ref(false);
const uploadingLogo = ref(false);
const removingLogo = ref(false);
const viewDialog = ref(false);
const removeDialog = ref(false);
const showUrlInput = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

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
  phone: '',
  social_links_json: [] as string[],
  hiring_locations_json: [] as string[],
  benefits_json: [] as string[]
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

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    snackbarColor.value = 'error';
    snackbarText.value = 'Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).';
    snackbar.value = true;
    target.value = '';
    return;
  }

  // Validate size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    snackbarColor.value = 'error';
    snackbarText.value = 'Image size must be less than 5MB.';
    snackbar.value = true;
    target.value = '';
    return;
  }

  uploadingLogo.value = true;
  try {
    const uploadData = new FormData();
    uploadData.append('logo', file);

    const res = await api.post('/employers/profile/logo', uploadData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data?.logo_url) {
      formData.value.logo_url = res.data.logo_url;
      if (authStore.user) {
        authStore.user.avatar_url = res.data.logo_url;
      }
      snackbarColor.value = 'success';
      snackbarText.value = 'Profile picture uploaded successfully!';
      snackbar.value = true;
    }
  } catch (error: any) {
    console.error('Failed to upload logo', error);
    snackbarColor.value = 'error';
    snackbarText.value = error.response?.data?.message || 'Failed to upload profile picture';
    snackbar.value = true;
  } finally {
    uploadingLogo.value = false;
    target.value = '';
  }
};

const executeRemoveLogo = async () => {
  removingLogo.value = true;
  try {
    await api.delete('/employers/profile/logo');
    formData.value.logo_url = '';
    if (authStore.user) {
      authStore.user.avatar_url = null;
    }
    removeDialog.value = false;
    snackbarColor.value = 'success';
    snackbarText.value = 'Profile picture removed successfully!';
    snackbar.value = true;
  } catch (error: any) {
    console.error('Failed to remove logo', error);
    snackbarColor.value = 'error';
    snackbarText.value = error.response?.data?.message || 'Failed to remove profile picture';
    snackbar.value = true;
  } finally {
    removingLogo.value = false;
  }
};

const saveProfile = async () => {
  loading.value = true;
  try {
    await api.put('/employers/profile', formData.value);
    snackbarColor.value = 'success';
    snackbarText.value = 'Company profile saved successfully!';
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

.profile-picture-container {
  background-color: #fafbfc;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 5;
}

.image-viewer-frame {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
</style>
