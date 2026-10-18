<template>
  <div class="events-public-page">
    <!-- Hero Banner -->
    <section class="events-hero py-12 py-md-16">
      <v-container>
        <div class="text-center max-w-3xl mx-auto">
          <v-chip color="primary" variant="flat" size="small" class="font-weight-bold text-uppercase tracking-wider mb-4 px-3">
            <v-icon start size="16">mdi-calendar-star</v-icon>
            Live Sessions &amp; Masterclasses
          </v-chip>
          <h1 class="text-h3 text-md-h2 font-weight-black text-slate-900 tracking-tight mb-4">
            Connect, Learn &amp; Grow with Exclusive Events
          </h1>
          <p class="text-body-1 text-md-h6 text-secondary font-weight-regular max-w-2xl mx-auto mb-8">
            Join interactive webinars, technical summits, and career workshops led by industry leaders. Register for free to reserve your seat.
          </p>

          <!-- Search & Filter Bar -->
          <div class="filter-bar-wrapper mx-auto max-w-xl bg-white rounded-pill pa-2 d-flex align-center shadow-lg border">
            <v-icon icon="mdi-magnify" color="primary" class="ml-3 mr-2" size="22"></v-icon>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events by topic, name or speaker..."
              class="search-input flex-grow-1"
            />
            <v-btn
              v-if="searchQuery"
              icon="mdi-close-circle"
              variant="text"
              size="small"
              color="grey"
              @click="searchQuery = ''"
            ></v-btn>
          </div>

          <!-- Quick Filter Tabs -->
          <div class="d-flex flex-wrap align-center justify-center gap-2 mt-6">
            <v-btn
              v-for="tab in filterTabs"
              :key="tab.value"
              :variant="activeTab === tab.value ? 'flat' : 'outlined'"
              :color="activeTab === tab.value ? 'primary' : 'grey-lighten-1'"
              rounded="pill"
              size="small"
              class="text-capitalize font-weight-bold px-4"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <v-badge
                v-if="getTabCount(tab.value) > 0"
                :content="getTabCount(tab.value)"
                inline
                color="secondary"
                class="ml-1"
              ></v-badge>
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>

    <!-- Events Grid Section -->
    <section class="events-grid-section py-8 py-md-12 bg-slate-50 min-h-[500px]">
      <v-container>
        <!-- Loading State -->
        <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
          <v-progress-circular indeterminate color="primary" size="56" width="4"></v-progress-circular>
          <div class="mt-4 text-subtitle-1 text-secondary font-weight-medium">Discovering upcoming events...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEvents.length === 0" class="text-center py-16">
          <v-avatar color="indigo-lighten-5" size="84" class="mb-4">
            <v-icon size="40" color="primary">mdi-calendar-blank-outline</v-icon>
          </v-avatar>
          <h3 class="text-h5 font-weight-bold text-slate-800 mb-2">No Events Found</h3>
          <p class="text-secondary max-w-md mx-auto mb-6">
            {{ searchQuery ? 'No events matched your search term.' : 'There are currently no events listed in this category.' }}
          </p>
          <v-btn v-if="searchQuery || activeTab !== 'all'" color="primary" variant="outlined" rounded="lg" @click="resetFilters">
            Reset Filters
          </v-btn>
        </div>

        <!-- Event Cards Grid -->
        <div v-else>
          <v-row>
            <v-col
              v-for="event in filteredEvents"
              :key="event.id"
              cols="12"
              sm="6"
              lg="4"
              class="d-flex"
            >
              <v-card
                class="event-card rounded-2xl w-100 d-flex flex-column bg-white border elevation-1 transition-all overflow-hidden"
              >
                <!-- Thumbnail Container -->
                <div class="event-image-container position-relative overflow-hidden w-100" style="aspect-ratio: 1 / 1;">
                  <v-img
                    :src="getEventImageUrl(event.image_url)"
                    cover
                    width="100%"
                    height="100%"
                    aspect-ratio="1"
                    class="event-img-zoom"
                  >
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                      </div>
                    </template>
                  </v-img>

                  <!-- Status Overlay Badges -->
                  <div class="position-absolute top-0 left-0 right-0 pa-3 d-flex align-center justify-space-between pointer-events-none">
                    <span
                      class="status-chip text-caption font-weight-bold px-3 py-1 rounded-pill"
                      :class="getStatusClass(event)"
                    >
                      <span v-if="event.event_status === 'live'" class="live-dot mr-1"></span>
                      {{ getStatusLabel(event) }}
                    </span>

                    <span class="admission-chip text-caption font-weight-bold px-3 py-1 rounded-pill bg-white text-dark shadow-sm">
                      Free Online Event
                    </span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="pa-5 flex-grow-1 d-flex flex-column">
                  <!-- Event Title -->
                  <NuxtLink :to="`/events/${event.slug || event.id}`" class="text-decoration-none">
                    <h3 class="text-h6 font-weight-bold text-slate-900 mb-2 line-clamp-2 leading-snug hover-primary">
                      {{ event.title }}
                    </h3>
                  </NuxtLink>

                  <!-- Event Description -->
                  <p class="text-body-2 text-secondary mb-4 line-clamp-2">
                    {{ event.description || 'Join this live session to gain expert knowledge and engage in interactive discussions.' }}
                  </p>

                  <v-divider class="mb-4 opacity-10"></v-divider>

                  <!-- Timing Information -->
                  <div class="event-meta-info mb-4">
                    <!-- Registration Window -->
                    <div class="d-flex align-center text-caption text-secondary mb-2">
                      <v-icon size="16" color="indigo" class="mr-2">mdi-account-clock-outline</v-icon>
                      <div>
                        <span class="font-weight-medium">Registration:</span>
                        {{ formatDateShort(event.registration_start) }} &ndash; {{ formatDateShort(event.registration_end) }}
                      </div>
                    </div>

                    <!-- Event Start Timing -->
                    <div class="d-flex align-center text-caption text-slate-800 font-weight-medium">
                      <v-icon size="16" color="red-darken-1" class="mr-2">mdi-calendar-clock</v-icon>
                      <div>
                        <span class="font-weight-bold text-slate-900">Event Time:</span>
                        {{ formatEventDateTime(event.event_start) }}
                      </div>
                    </div>
                  </div>

                  <v-spacer></v-spacer>

                  <!-- Dynamic Action Button Section -->
                  <div class="action-button-wrapper mt-auto">
                    <!-- Case 1: Registration Open -> Register Now Button -->
                    <template v-if="event.registration_status === 'open'">
                      <v-btn
                        block
                        color="primary"
                        rounded="lg"
                        height="44"
                        elevation="0"
                        class="text-capitalize font-weight-bold"
                        :to="`/events/${event.slug || event.id}`"
                      >
                        <v-icon start size="18">mdi-account-plus</v-icon>
                        Register Now
                      </v-btn>
                    </template>

                    <!-- Case 2: Registration Over, But Event Not Started Yet -> Disabled Button -->
                    <template v-else-if="event.registration_status === 'closed' && event.event_status === 'upcoming'">
                      <v-tooltip location="top" text="Registration is closed. The Join Event button will activate automatically once the event start time arrives.">
                        <template #activator="{ props }">
                          <div v-bind="props" class="w-100">
                            <v-btn
                              block
                              disabled
                              variant="flat"
                              color="grey-lighten-3"
                              rounded="lg"
                              height="44"
                              class="text-capitalize font-weight-bold text-grey-darken-1"
                            >
                              <v-icon start size="18">mdi-lock-clock</v-icon>
                              Join Event (Opens at Event Time)
                            </v-btn>
                          </div>
                        </template>
                      </v-tooltip>
                      <div class="text-center text-caption text-amber-darken-3 font-weight-medium mt-1">
                        Opens {{ formatRelativeTime(event.event_start) }}
                      </div>
                    </template>

                    <!-- Case 3: Event Time Started (Live) -> Active Enabled Join Event Button -->
                    <template v-else-if="event.event_status === 'live'">
                      <v-btn
                        block
                        :href="event.meet_link || '#'"
                        target="_blank"
                        color="success"
                        rounded="lg"
                        height="44"
                        elevation="2"
                        class="text-capitalize font-weight-bold pulse-green"
                      >
                        <v-icon start size="18">mdi-video</v-icon>
                        Join Event 🚀
                      </v-btn>
                    </template>

                    <!-- Case 4: Event Concluded -->
                    <template v-else-if="event.event_status === 'completed'">
                      <v-btn
                        block
                        disabled
                        variant="outlined"
                        color="grey"
                        rounded="lg"
                        height="44"
                        class="text-capitalize font-weight-medium"
                      >
                        <v-icon start size="18">mdi-check-circle-outline</v-icon>
                        Event Concluded
                      </v-btn>
                    </template>

                    <!-- Case 5: Registration Not Started Yet -->
                    <template v-else>
                      <v-btn
                        block
                        disabled
                        variant="tonal"
                        color="grey"
                        rounded="lg"
                        height="44"
                        class="text-capitalize font-weight-medium"
                      >
                        Registration Opens Soon
                      </v-btn>
                    </template>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- Registration Dialog (With Brevo OTP Verification) -->
    <v-dialog v-model="registerDialog" max-width="560" persistent scrollable>
      <v-card class="rounded-2xl overflow-hidden">
        <!-- Dialog Header -->
        <div class="dialog-header bg-primary pa-6 text-white position-relative">
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            class="position-absolute top-3 right-3"
            @click="closeRegisterDialog"
          ></v-btn>
          <div class="text-caption font-weight-bold text-uppercase tracking-wider opacity-80 mb-1">
            Free Event Registration
          </div>
          <h2 class="text-h6 font-weight-bold text-white mb-2 leading-tight">
            {{ selectedEvent?.title }}
          </h2>
          <div class="d-flex align-center text-caption text-indigo-lighten-4">
            <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
            {{ formatEventDateTime(selectedEvent?.event_start) }}
          </div>
        </div>

        <v-card-text class="pa-6">
          <!-- Step 1: Form Inputs & OTP Verification -->
          <template v-if="!registrationSuccess">
            <v-form ref="regForm" v-model="isFormValid" @submit.prevent="submitRegistration">
              <!-- Name -->
              <v-text-field
                v-model="form.name"
                label="Full Name"
                placeholder="Enter your full name"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                :rules="[v => !!v || 'Name is required']"
                class="mb-3"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="form.email"
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                :disabled="otpSent"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Enter a valid email'
                ]"
                class="mb-3"
              ></v-text-field>

              <!-- Phone -->
              <v-text-field
                v-model="form.phone"
                label="Phone Number"
                placeholder="+91 98765 43210"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="mdi-phone-outline"
                :rules="[v => !!v || 'Phone number is required']"
                class="mb-3"
              ></v-text-field>

              <!-- Occupation Dropdown -->
              <v-select
                v-model="form.occupation"
                label="I am currently a..."
                :items="['Student', 'Working', 'Trainer']"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="mdi-briefcase-account-outline"
                :rules="[v => !!v || 'Please select your occupation']"
                class="mb-3"
              ></v-select>

              <!-- Dynamic Next Column / Field based on selection -->
              <v-fade-transition>
                <div v-if="form.occupation">
                  <!-- Case 1: Student -> College Name -->
                  <v-text-field
                    v-if="form.occupation === 'Student'"
                    v-model="form.organization"
                    label="College Name"
                    placeholder="Enter your college or university name"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-school-outline"
                    :rules="[v => !!v || 'College name is required']"
                    class="mb-3"
                  ></v-text-field>

                  <!-- Case 2: Working -> Working Company -->
                  <v-text-field
                    v-else-if="form.occupation === 'Working'"
                    v-model="form.organization"
                    label="Working Company"
                    placeholder="Enter your current company or organization"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-office-building-outline"
                    :rules="[v => !!v || 'Company name is required']"
                    class="mb-3"
                  ></v-text-field>

                  <!-- Case 3: Trainer -> Institution -->
                  <v-text-field
                    v-else-if="form.occupation === 'Trainer'"
                    v-model="form.organization"
                    label="Institution"
                    placeholder="Enter your institution or academy name"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-domain"
                    :rules="[v => !!v || 'Institution name is required']"
                    class="mb-3"
                  ></v-text-field>
                </div>
              </v-fade-transition>

              <!-- OTP Verification Section -->
              <v-divider class="my-4"></v-divider>

              <div class="otp-verification-box rounded-xl pa-4 bg-slate-50 border mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="text-subtitle-2 font-weight-bold text-slate-800">
                    <v-icon size="18" color="primary" class="mr-1">mdi-shield-check-outline</v-icon>
                    Email Verification (OTP)
                  </div>
                  <div v-if="otpSent" class="text-caption text-success font-weight-medium">
                    Code sent via Brevo
                  </div>
                </div>

                <p class="text-caption text-secondary mb-3">
                  We verify your email via one-time passcode to ensure you receive the confirmation and 24-hour reminder email.
                </p>

                <!-- Trigger Send OTP Button -->
                <div v-if="!otpSent">
                  <v-btn
                    block
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    height="40"
                    :loading="sendingOtp"
                    :disabled="!isEmailValidForOtp"
                    @click="sendOtp"
                  >
                    <v-icon start size="16">mdi-send</v-icon>
                    Send Verification Code
                  </v-btn>
                </div>

                <!-- OTP Input Area -->
                <div v-else class="otp-input-container">
                  <v-text-field
                    v-model="form.otp"
                    label="Enter 6-Digit Code"
                    placeholder="123456"
                    maxlength="6"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    class="text-center font-mono font-weight-bold"
                    prepend-inner-icon="mdi-key-outline"
                    :rules="[
                      v => !!v || 'Verification code is required',
                      v => (v && v.length === 6) || 'Must be exactly 6 digits'
                    ]"
                  ></v-text-field>

                  <div class="d-flex align-center justify-space-between text-caption mt-1">
                    <span v-if="resendCooldown > 0" class="text-secondary">
                      Resend code in {{ resendCooldown }}s
                    </span>
                    <v-btn
                      v-else
                      variant="text"
                      color="primary"
                      density="compact"
                      size="small"
                      :loading="sendingOtp"
                      @click="sendOtp"
                    >
                      Resend Code
                    </v-btn>

                    <v-btn
                      variant="text"
                      color="grey"
                      density="compact"
                      size="small"
                      @click="otpSent = false"
                    >
                      Change Email
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <v-btn
                block
                color="primary"
                rounded="lg"
                height="48"
                type="submit"
                :loading="submitting"
                :disabled="!otpSent || !form.otp || form.otp.length !== 6"
                class="text-capitalize font-weight-bold text-subtitle-2 shadow-md"
              >
                Verify &amp; Confirm Registration
              </v-btn>
            </v-form>
          </template>

          <!-- Step 2: Success Screen -->
          <template v-else>
            <div class="text-center py-6">
              <v-avatar color="green-lighten-5" size="80" class="mb-4">
                <v-icon size="44" color="success">mdi-check-circle</v-icon>
              </v-avatar>

              <h2 class="text-h5 font-weight-bold text-slate-900 mb-2">Registration Confirmed! 🎉</h2>
              <p class="text-body-2 text-secondary mb-6 max-w-md mx-auto">
                Thank you, <strong>{{ form.name }}</strong>! Your seat for <strong>{{ selectedEvent?.title }}</strong> has been confirmed.
              </p>

              <!-- Details Summary Box -->
              <div class="bg-slate-50 border rounded-xl pa-4 text-left mb-6 text-caption">
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-secondary">Event Date:</span>
                  <span class="font-weight-bold text-slate-800">{{ formatEventDateTime(selectedEvent?.event_start) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-secondary">Registered Email:</span>
                  <span class="font-weight-bold text-slate-800">{{ form.email }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-secondary">Category:</span>
                  <span class="font-weight-bold text-slate-800">{{ form.occupation }} ({{ form.organization }})</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-secondary">Join Link:</span>
                  <span class="font-weight-bold text-indigo">Active at Event Time</span>
                </div>
              </div>

              <!-- Brevo Confirmation Notification Notice -->
              <v-alert
                type="success"
                variant="tonal"
                rounded="lg"
                density="comfortable"
                class="text-left text-caption mb-6"
              >
                <strong>Check your inbox!</strong> A confirmation email has been dispatched via Brevo REST API. We will also automatically send you a reminder email <strong>24 hours before the event starts</strong>.
              </v-alert>

              <!-- Actions -->
              <div class="d-flex gap-3">
                <v-btn
                  block
                  color="primary"
                  rounded="lg"
                  height="44"
                  class="text-capitalize font-weight-bold"
                  @click="closeRegisterDialog"
                >
                  Done
                </v-btn>
              </div>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Global Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import confetti from 'canvas-confetti';

definePageMeta({
  layout: 'public'
});

const api = useApi();
const config = useRuntimeConfig();

// State
const loading = ref(true);
const events = ref<any[]>([]);
const searchQuery = ref('');
const activeTab = ref('all');

// Registration Dialog State
const registerDialog = ref(false);
const selectedEvent = ref<any>(null);
const isFormValid = ref(false);
const regForm = ref<any>(null);
const sendingOtp = ref(false);
const otpSent = ref(false);
const submitting = ref(false);
const registrationSuccess = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: any = null;

// Form Data
const form = ref({
  name: '',
  email: '',
  phone: '',
  occupation: '',
  organization: '',
  otp: ''
});

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showSnackbar = (text: string, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

// Filter Tabs
const filterTabs = [
  { label: 'All Events', value: 'all' },
  { label: 'Registration Open', value: 'open_registration' },
  { label: 'Live Now', value: 'live' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past Events', value: 'past' }
];

// Tab Count Helper
const getTabCount = (tab: string) => {
  if (tab === 'all') return events.value.length;
  if (tab === 'open_registration') return events.value.filter(e => e.registration_status === 'open').length;
  if (tab === 'live') return events.value.filter(e => e.event_status === 'live').length;
  if (tab === 'upcoming') return events.value.filter(e => e.event_status === 'upcoming').length;
  if (tab === 'past') return events.value.filter(e => e.event_status === 'completed').length;
  return 0;
};

// Filtered Events
const filteredEvents = computed(() => {
  let list = events.value;

  // Tab filter
  if (activeTab.value === 'open_registration') {
    list = list.filter(e => e.registration_status === 'open');
  } else if (activeTab.value === 'live') {
    list = list.filter(e => e.event_status === 'live');
  } else if (activeTab.value === 'upcoming') {
    list = list.filter(e => e.event_status === 'upcoming');
  } else if (activeTab.value === 'past') {
    list = list.filter(e => e.event_status === 'completed');
  }

  // Search filter
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(e =>
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  }

  return list;
});

const isEmailValidForOtp = computed(() => {
  return form.value.email && /.+@.+\..+/.test(form.value.email.trim());
});

// Fetch Events
const fetchEvents = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/public/events');
    events.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    showSnackbar('Failed to load events. Please try again later.', 'error');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  activeTab.value = 'all';
};

// Open Register Dialog
const openRegisterDialog = (event: any) => {
  selectedEvent.value = event;
  form.value = {
    name: '',
    email: '',
    phone: '',
    occupation: '',
    organization: '',
    otp: ''
  };
  otpSent.value = false;
  registrationSuccess.value = false;
  registerDialog.value = true;
};

const closeRegisterDialog = () => {
  registerDialog.value = false;
  selectedEvent.value = null;
  otpSent.value = false;
  registrationSuccess.value = false;
  if (cooldownTimer) clearInterval(cooldownTimer);
};

// Send OTP
const sendOtp = async () => {
  if (!isEmailValidForOtp.value) {
    showSnackbar('Please enter a valid email address first.', 'warning');
    return;
  }

  sendingOtp.value = true;
  try {
    const { data } = await api.post(`/public/events/${selectedEvent.value.id}/send-otp`, {
      email: form.value.email.trim(),
      name: form.value.name.trim()
    });

    otpSent.value = true;
    showSnackbar(data.message || 'Verification code sent to your email.');

    // Start 60s cooldown
    resendCooldown.value = 60;
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
      resendCooldown.value--;
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownTimer);
      }
    }, 1000);
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Failed to send verification code';
    showSnackbar(msg, 'error');
  } finally {
    sendingOtp.value = false;
  }
};

// Submit Registration
const submitRegistration = async () => {
  if (!regForm.value) return;
  const { valid } = await regForm.value.validate();
  if (!valid) return;

  if (!form.value.otp || form.value.otp.trim().length !== 6) {
    showSnackbar('Please enter the 6-digit verification code.', 'warning');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/public/events/${selectedEvent.value.id}/register`, {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      occupation: form.value.occupation,
      organization: form.value.organization.trim(),
      otp: form.value.otp.trim()
    });

    registrationSuccess.value = true;
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    showSnackbar('Registration confirmed successfully!');
    // Refresh events count
    fetchEvents();
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Registration failed';
    showSnackbar(msg, 'error');
  } finally {
    submitting.value = false;
  }
};

// Image URL helper
const getEventImageUrl = (url: string | null) => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = config.public.apiBase ? config.public.apiBase.replace('/api', '') : '';
  return baseUrl + url;
};

// Status Helpers
const getStatusLabel = (event: any) => {
  if (event.event_status === 'live') return 'Live Now';
  if (event.registration_status === 'open') return 'Registration Open';
  if (event.registration_status === 'closed' && event.event_status === 'upcoming') return 'Registration Closed';
  if (event.event_status === 'completed') return 'Concluded';
  return 'Coming Soon';
};

const getStatusClass = (event: any) => {
  if (event.event_status === 'live') return 'bg-red-600 text-white shadow-md';
  if (event.registration_status === 'open') return 'bg-emerald-600 text-white shadow-md';
  if (event.registration_status === 'closed' && event.event_status === 'upcoming') return 'bg-amber-600 text-white shadow-md';
  if (event.event_status === 'completed') return 'bg-slate-600 text-white';
  return 'bg-indigo-600 text-white';
};

// Format Date Helpers
const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatEventDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '';
  const now = new Date().getTime();
  const target = new Date(dateStr).getTime();
  const diffMs = target - now;

  if (diffMs <= 0) return 'shortly';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins} mins`;
};

const route = useRoute();

const checkRouteQueryForRegistration = () => {
  if (route.query.register && events.value.length > 0) {
    const target = events.value.find(e => e.id === route.query.register || e.slug === route.query.register);
    if (target && target.registration_status === 'open') {
      openRegisterDialog(target);
    }
  }
};

watch(() => route.query.register, () => {
  checkRouteQueryForRegistration();
});

onMounted(async () => {
  await fetchEvents();
  checkRouteQueryForRegistration();
});
</script>

<style scoped>
.events-public-page {
  background-color: #fafbfc;
  min-height: 100vh;
}

.events-hero {
  background: radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 0.9) 70%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #1e293b;
}

.event-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-color: #e2e8f0 !important;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.1) !important;
}

.event-img-zoom {
  transition: transform 0.4s ease;
}

.event-card:hover .event-img-zoom {
  transform: scale(1.05);
}

.pointer-events-none {
  pointer-events: none;
}

.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
  animation: pulse-live 1.2s infinite;
}

@keyframes pulse-live {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.8; }
}

.pulse-green {
  animation: pulse-border 1.8s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.font-mono {
  font-family: monospace !important;
  letter-spacing: 4px;
  font-size: 18px;
}
</style>
