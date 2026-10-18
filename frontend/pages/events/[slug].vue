<template>
  <div class="event-detail-page py-8 py-md-12">
    <v-container>
      <!-- Breadcrumbs & Navigation -->
      <div class="mb-6 d-flex align-center justify-space-between flex-wrap gap-3">
        <v-breadcrumbs
          :items="breadcrumbItems"
          density="compact"
          class="pa-0 text-caption font-weight-medium"
        >
          <template #divider>
            <v-icon size="14" color="grey">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <v-btn
          to="/events"
          variant="tonal"
          color="primary"
          size="small"
          rounded="lg"
          prepend-icon="mdi-arrow-left"
          class="text-capitalize font-weight-bold"
        >
          All Events
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
        <v-progress-circular indeterminate color="primary" size="56" width="4"></v-progress-circular>
        <div class="mt-4 text-subtitle-1 text-secondary font-weight-medium">Loading event details...</div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!event" class="text-center py-16 bg-white rounded-2xl border pa-8 max-w-xl mx-auto">
        <v-avatar color="red-lighten-5" size="72" class="mb-4">
          <v-icon size="36" color="error">mdi-calendar-remove-outline</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-slate-800 mb-2">Event Not Found</h2>
        <p class="text-secondary mb-6">
          The event you are looking for does not exist or may have been unpublished.
        </p>
        <v-btn color="primary" rounded="lg" to="/events" class="text-capitalize font-weight-bold">
          Browse Active Events
        </v-btn>
      </div>

      <!-- Main Event Content -->
      <div v-else>
        <v-row>
          <!-- Left Column: Event Overview & Content -->
          <v-col cols="12" lg="7">
            <!-- Event Header Card -->
            <v-card class="rounded-2xl overflow-hidden border bg-white mb-6 elevation-1">
              <!-- Banner Image -->
              <div class="event-hero-banner position-relative overflow-hidden w-100" style="aspect-ratio: 1 / 1;">
                <v-img
                  :src="getImageUrl(event.image_url)"
                  cover
                  width="100%"
                  height="100%"
                  aspect-ratio="1"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                      <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                    </div>
                  </template>
                </v-img>

                <!-- Status Badges Overlay -->
                <div class="position-absolute top-0 left-0 right-0 pa-4 d-flex align-center justify-space-between pointer-events-none">
                  <span
                    class="status-chip text-caption font-weight-bold px-3 py-1 rounded-pill"
                    :class="statusClass"
                  >
                    <span v-if="event.event_status === 'live'" class="live-dot mr-1"></span>
                    {{ statusLabel }}
                  </span>

                  <span class="admission-chip text-caption font-weight-bold px-3 py-1 rounded-pill bg-white text-slate-900 shadow-sm">
                    Free Online Session
                  </span>
                </div>
              </div>

              <!-- Event Title & Key Meta -->
              <div class="pa-6 pa-md-8">
                <h1 class="text-h4 font-weight-bold text-slate-900 mb-4 leading-tight">
                  {{ event.title }}
                </h1>

                <!-- Key Schedule Highlights -->
                <div class="event-meta-grid p-4 rounded-xl border bg-slate-50 mb-6">
                  <v-row dense>
                    <v-col cols="12" sm="4" class="pa-3">
                      <div class="d-flex align-start gap-3">
                        <v-avatar color="indigo-lighten-5" size="40" rounded="lg">
                          <v-icon color="primary" size="20">mdi-calendar-clock</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-caption text-secondary font-weight-medium">Event Schedule</div>
                          <div class="text-body-2 font-weight-bold text-slate-900">
                            {{ formatDateTimeLong(event.event_start) }}
                          </div>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="4" class="pa-3">
                      <div class="d-flex align-start gap-3">
                        <v-avatar color="amber-lighten-5" size="40" rounded="lg">
                          <v-icon color="amber-darken-3" size="20">mdi-account-clock-outline</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-caption text-secondary font-weight-medium">Registration Window</div>
                          <div class="text-body-2 font-weight-bold text-slate-900">
                            {{ formatDateShort(event.registration_start) }} &ndash; {{ formatDateShort(event.registration_end) }}
                          </div>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="4" class="pa-3">
                      <div class="d-flex align-start gap-3">
                        <v-avatar color="deep-purple-lighten-5" size="40" rounded="lg">
                          <v-icon color="deep-purple" size="20">mdi-web</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-caption text-secondary font-weight-medium">Delivery Format</div>
                          <div class="text-body-2 font-weight-bold text-slate-900">
                            Live Interactive Webinar
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <!-- Live Now Meeting Box -->
                <div v-if="event.event_status === 'live'" class="pa-5 rounded-xl border bg-emerald-50 mb-6">
                  <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
                    <div>
                      <div class="d-flex align-center gap-2 text-emerald-800 font-weight-bold mb-1">
                        <span class="live-dot-green"></span>
                        This Event is Live Right Now!
                      </div>
                      <div class="text-caption text-emerald-700">
                        The live meeting room is open. Click below to join the session immediately.
                      </div>
                    </div>
                    <v-btn
                      :href="event.meet_link || '#'"
                      target="_blank"
                      color="success"
                      rounded="lg"
                      height="44"
                      elevation="2"
                      class="text-capitalize font-weight-bold pulse-green flex-shrink-0"
                    >
                      <v-icon start size="18">mdi-video</v-icon>
                      Join Meeting 🚀
                    </v-btn>
                  </div>
                </div>

                <!-- Waiting to Start Meeting Box -->
                <div v-else-if="event.registration_status === 'closed' && event.event_status === 'upcoming'" class="pa-4 rounded-xl border bg-amber-50 mb-6 text-caption text-amber-900">
                  <v-icon start color="amber-darken-3" size="18">mdi-lock-clock</v-icon>
                  <strong>Registration is closed.</strong> The live meeting button will activate here automatically at event start time.
                </div>

                <!-- Event Description Section -->
                <div>
                  <h2 class="text-h6 font-weight-bold text-slate-900 mb-3">About This Event</h2>
                  <div class="text-body-1 text-slate-700 leading-relaxed whitespace-pre-line mb-6">
                    {{ event.description || 'Join this live session to gain expert knowledge and engage in interactive discussions.' }}
                  </div>
                </div>

                <!-- Share Event Section -->
                <v-divider class="my-6"></v-divider>
                <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-3">
                  <div class="text-caption font-weight-bold text-secondary text-uppercase tracking-wider">
                    Share with your colleagues
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      variant="outlined"
                      size="small"
                      rounded="lg"
                      prepend-icon="mdi-content-copy"
                      @click="copyEventLink"
                      class="text-capitalize"
                    >
                      {{ copyButtonText }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      rounded="lg"
                      color="success"
                      prepend-icon="mdi-whatsapp"
                      @click="shareOnWhatsApp"
                      class="text-capitalize"
                    >
                      WhatsApp
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      rounded="lg"
                      color="primary"
                      prepend-icon="mdi-linkedin"
                      @click="shareOnLinkedIn"
                      class="text-capitalize"
                    >
                      LinkedIn
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Right Column: Registration Form Card -->
          <v-col cols="12" lg="5">
            <div class="sticky-registration-card">
              <v-card class="rounded-2xl border bg-white overflow-hidden elevation-2">
                <!-- Registration Card Header -->
                <div class="bg-primary pa-6 text-white">
                  <div class="text-caption font-weight-bold text-uppercase tracking-wider opacity-80 mb-1">
                    Free Event Registration
                  </div>
                  <h2 class="text-h5 font-weight-bold text-white mb-2 leading-tight">
                    Reserve Your Seat
                  </h2>
                  <div class="text-caption text-indigo-lighten-4">
                    {{ event.registration_status === 'open' ? 'Instant seat confirmation via Brevo verification' : 'Registration status update below' }}
                  </div>
                </div>

                <!-- Success Confirmation View -->
                <div v-if="registrationSuccess" class="pa-6 text-center">
                  <v-avatar color="green-lighten-5" size="64" class="mb-4">
                    <v-icon color="success" size="36">mdi-check-decagram</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">Registration Confirmed! 🎉</h3>
                  <p class="text-body-2 text-secondary mb-4">
                    Thank you, <strong>{{ form.name }}</strong>! Your seat for <strong>{{ event.title }}</strong> is officially reserved.
                  </p>

                  <v-alert
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    rounded="lg"
                    class="text-left mb-6"
                  >
                    <div class="text-caption">
                      <strong>Check your inbox!</strong> A confirmation email has been dispatched via Brevo REST API to <strong>{{ form.email }}</strong>. We will also automatically send you a reminder <strong>24 hours before the event starts</strong>.
                    </div>
                  </v-alert>

                  <v-btn
                    block
                    color="primary"
                    rounded="lg"
                    height="44"
                    class="text-capitalize font-weight-bold"
                    @click="resetForm"
                  >
                    Register Another Candidate
                  </v-btn>
                </div>

                <!-- Registration Form (When Open) -->
                <div v-else-if="event.registration_status === 'open'" class="pa-6">
                  <v-form ref="regForm" v-model="isFormValid" @submit.prevent="submitRegistration">
                    <!-- Name -->
                    <div class="mb-3">
                      <v-text-field
                        v-model="form.name"
                        label="Full Name *"
                        placeholder="e.g. Sarah Jenkins"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        prepend-inner-icon="mdi-account"
                        :rules="[v => !!v || 'Name is required']"
                        :disabled="otpSent"
                      ></v-text-field>
                    </div>

                    <!-- Email -->
                    <div class="mb-3">
                      <v-text-field
                        v-model="form.email"
                        label="Email Address *"
                        placeholder="e.g. sarah@example.com"
                        type="email"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        prepend-inner-icon="mdi-email"
                        :rules="[
                          v => !!v || 'Email is required',
                          v => /.+@.+\..+/.test(v) || 'Enter a valid email address'
                        ]"
                        :disabled="otpSent"
                      ></v-text-field>
                    </div>

                    <!-- Phone -->
                    <div class="mb-3">
                      <v-text-field
                        v-model="form.phone"
                        label="Phone Number *"
                        placeholder="e.g. +1 555-0199"
                        type="tel"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        prepend-inner-icon="mdi-phone"
                        :rules="[v => !!v || 'Phone number is required']"
                        :disabled="otpSent"
                      ></v-text-field>
                    </div>

                    <!-- Occupation Selection -->
                    <div class="mb-3">
                      <v-select
                        v-model="form.occupation"
                        label="I am currently a *"
                        :items="occupationOptions"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        prepend-inner-icon="mdi-briefcase-outline"
                        :rules="[v => !!v || 'Please select your occupation']"
                        :disabled="otpSent"
                      ></v-select>
                    </div>

                    <!-- Organization / Detail -->
                    <div class="mb-4">
                      <v-text-field
                        v-model="form.organization"
                        :label="getOrganizationLabel()"
                        :placeholder="getOrganizationPlaceholder()"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        prepend-inner-icon="mdi-domain"
                        :rules="[v => !!v || `${getOrganizationLabel()} is required`]"
                        :disabled="otpSent"
                      ></v-text-field>
                    </div>

                    <!-- STEP 1: Request OTP -->
                    <div v-if="!otpSent">
                      <v-btn
                        block
                        color="primary"
                        rounded="lg"
                        height="46"
                        elevation="1"
                        class="text-capitalize font-weight-bold"
                        :loading="sendingOtp"
                        @click="sendOtp"
                      >
                        <v-icon start size="18">mdi-shield-check-outline</v-icon>
                        Send Verification Code
                      </v-btn>
                      <div class="text-caption text-secondary text-center mt-3">
                        A 6-digit code will be sent to your email to verify your registration.
                      </div>
                    </div>

                    <!-- STEP 2: OTP Verification Field -->
                    <div v-else class="pa-4 rounded-xl border bg-slate-50">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-caption font-weight-bold text-slate-800">
                          Enter 6-Digit Code sent to:
                        </span>
                        <v-btn
                          variant="text"
                          color="primary"
                          density="compact"
                          size="small"
                          class="text-none px-1"
                          @click="changeEmail"
                        >
                          Change Email
                        </v-btn>
                      </div>
                      <div class="text-caption font-weight-bold text-primary mb-3">
                        {{ form.email }}
                      </div>

                      <v-text-field
                        v-model="form.otp"
                        placeholder="123456"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        maxlength="6"
                        class="mb-3 font-mono text-center"
                        hide-details
                      ></v-text-field>

                      <div class="d-flex align-center justify-space-between mb-4">
                        <span v-if="resendCooldown > 0" class="text-caption text-secondary">
                          Resend code in {{ resendCooldown }}s
                        </span>
                        <v-btn
                          v-else
                          variant="text"
                          color="primary"
                          size="small"
                          density="compact"
                          :loading="sendingOtp"
                          @click="sendOtp"
                          class="text-none pa-0"
                        >
                          Resend Code
                        </v-btn>
                      </div>

                      <v-btn
                        block
                        color="success"
                        rounded="lg"
                        height="46"
                        elevation="2"
                        class="text-capitalize font-weight-bold"
                        :loading="submitting"
                        @click="submitRegistration"
                      >
                        <v-icon start size="18">mdi-check-decagram</v-icon>
                        Verify &amp; Confirm Seat
                      </v-btn>
                    </div>
                  </v-form>
                </div>

                <!-- Registration Closed View -->
                <div v-else-if="event.registration_status === 'closed'" class="pa-6 text-center">
                  <v-avatar color="amber-lighten-5" size="56" class="mb-3">
                    <v-icon color="amber-darken-3" size="28">mdi-account-cancel-outline</v-icon>
                  </v-avatar>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Registration Closed</h3>
                  <p class="text-caption text-secondary mb-4">
                    Registration for this event ended on {{ formatDateTimeLong(event.registration_end) }}.
                  </p>
                  <v-btn block variant="outlined" color="primary" rounded="lg" to="/events" class="text-capitalize">
                    Explore Other Events
                  </v-btn>
                </div>

                <!-- Event Concluded View -->
                <div v-else-if="event.event_status === 'completed'" class="pa-6 text-center">
                  <v-avatar color="grey-lighten-4" size="56" class="mb-3">
                    <v-icon color="grey-darken-1" size="28">mdi-calendar-check</v-icon>
                  </v-avatar>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Event Concluded</h3>
                  <p class="text-caption text-secondary mb-4">
                    This session has finished. Check out our upcoming live webinars and masterclasses.
                  </p>
                  <v-btn block variant="outlined" color="primary" rounded="lg" to="/events" class="text-capitalize">
                    View Upcoming Events
                  </v-btn>
                </div>

                <!-- Registration Soon View -->
                <div v-else class="pa-6 text-center">
                  <v-avatar color="indigo-lighten-5" size="56" class="mb-3">
                    <v-icon color="primary" size="28">mdi-clock-outline</v-icon>
                  </v-avatar>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Registration Opens Soon</h3>
                  <p class="text-caption text-secondary mb-4">
                    Registration will open on {{ formatDateTimeLong(event.registration_start) }}.
                  </p>
                  <v-btn block variant="outlined" color="primary" rounded="lg" to="/events" class="text-capitalize">
                    Back to All Events
                  </v-btn>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import confetti from 'canvas-confetti';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'public'
});

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();

// State
const loading = ref(true);
const event = ref<any>(null);
const isFormValid = ref(false);
const regForm = ref<any>(null);
const sendingOtp = ref(false);
const otpSent = ref(false);
const submitting = ref(false);
const registrationSuccess = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: any = null;
const copyButtonText = ref('Copy Link');

// Form Data
const form = ref({
  name: '',
  email: '',
  phone: '',
  occupation: '',
  organization: '',
  otp: ''
});

// Occupation options
const occupationOptions = [
  { title: 'Student', value: 'Student' },
  { title: 'Working Professional', value: 'Working' },
  { title: 'Trainer / Academician', value: 'Trainer' }
];

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showSnackbar = (text: string, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

// Breadcrumbs
const breadcrumbItems = computed(() => [
  { title: 'Home', disabled: false, to: '/' },
  { title: 'Events', disabled: false, to: '/events' },
  { title: event.value?.title || 'Details', disabled: true }
]);

// Organization Label Helpers
const getOrganizationLabel = () => {
  if (form.value.occupation === 'Student') return 'College / University Name *';
  if (form.value.occupation === 'Working') return 'Current Company Name *';
  if (form.value.occupation === 'Trainer') return 'Training Institution / Organization *';
  return 'College / Company / Institution *';
};

const getOrganizationPlaceholder = () => {
  if (form.value.occupation === 'Student') return 'e.g. Oxford Institute of Technology';
  if (form.value.occupation === 'Working') return 'e.g. Google / Microsoft / Nestlé';
  if (form.value.occupation === 'Trainer') return 'e.g. National Skills Academy';
  return 'e.g. Your Organization';
};

// Image URL Resolver
const getImageUrl = (url: string | null) => {
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
const statusLabel = computed(() => {
  if (!event.value) return '';
  if (event.value.event_status === 'live') return 'Live Now';
  if (event.value.registration_status === 'open') return 'Registration Open';
  if (event.value.registration_status === 'closed' && event.value.event_status === 'upcoming') return 'Registration Closed';
  if (event.value.event_status === 'completed') return 'Concluded';
  return 'Coming Soon';
});

const statusClass = computed(() => {
  if (!event.value) return '';
  if (event.value.event_status === 'live') return 'bg-red-600 text-white shadow-md';
  if (event.value.registration_status === 'open') return 'bg-emerald-600 text-white shadow-md';
  if (event.value.registration_status === 'closed' && event.value.event_status === 'upcoming') return 'bg-amber-600 text-white shadow-md';
  if (event.value.event_status === 'completed') return 'bg-slate-600 text-white';
  return 'bg-indigo-600 text-white';
});

// Format Dates
const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTimeLong = (dateStr: string) => {
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

// Fetch Event Details
const fetchEvent = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  loading.value = true;
  try {
    const { data } = await api.get(`/public/events/${slug}`);
    event.value = data;
    if (data?.title) {
      useSeoMeta({
        title: `${data.title} | Events & Masterclasses`,
        description: data.description || 'Register for this exclusive live session.'
      });
    }
  } catch (err: any) {
    console.error('Failed to load event details:', err);
    event.value = null;
  } finally {
    loading.value = false;
  }
};

// Send OTP
const sendOtp = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone || !form.value.occupation || !form.value.organization) {
    showSnackbar('Please complete all registration fields before requesting the code.', 'warning');
    return;
  }

  if (!/.+@.+\..+/.test(form.value.email.trim())) {
    showSnackbar('Please enter a valid email address.', 'warning');
    return;
  }

  sendingOtp.value = true;
  try {
    const { data } = await api.post(`/public/events/${event.value.id}/send-otp`, {
      email: form.value.email.trim(),
      name: form.value.name.trim()
    });

    otpSent.value = true;
    showSnackbar(data.message || 'Verification code sent to your email via Brevo.');

    // 60-second cooldown
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

// Change Email
const changeEmail = () => {
  otpSent.value = false;
  form.value.otp = '';
  if (cooldownTimer) clearInterval(cooldownTimer);
};

// Submit Registration
const submitRegistration = async () => {
  if (!form.value.otp || form.value.otp.trim().length !== 6) {
    showSnackbar('Please enter the 6-digit verification code.', 'warning');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/public/events/${event.value.id}/register`, {
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
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    showSnackbar('Registration confirmed! Check your email inbox.');
    // Refresh count
    fetchEvent();
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Registration failed';
    showSnackbar(msg, 'error');
  } finally {
    submitting.value = false;
  }
};

// Reset Form
const resetForm = () => {
  registrationSuccess.value = false;
  otpSent.value = false;
  form.value = {
    name: '',
    email: '',
    phone: '',
    occupation: '',
    organization: '',
    otp: ''
  };
  if (cooldownTimer) clearInterval(cooldownTimer);
};

// Share Helpers
const copyEventLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyButtonText.value = 'Link Copied! ✓';
    showSnackbar('Event link copied to clipboard!');
    setTimeout(() => {
      copyButtonText.value = 'Copy Link';
    }, 2500);
  } catch (e) {
    showSnackbar('Failed to copy link', 'error');
  }
};

const shareOnWhatsApp = () => {
  const text = encodeURIComponent(`Check out this event: ${event.value?.title} - ${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

const shareOnLinkedIn = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
};

onMounted(() => {
  fetchEvent();
});

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>

<style scoped>
.event-detail-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.sticky-registration-card {
  position: sticky;
  top: 90px;
}

.pointer-events-none {
  pointer-events: none;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.3px;
}

.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
  animation: pulse-live 1.2s infinite;
}

.live-dot-green {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #10b981;
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

.bg-red-600 { background-color: #dc2626 !important; }
.bg-emerald-600 { background-color: #059669 !important; }
.bg-amber-600 { background-color: #d97706 !important; }
.bg-slate-600 { background-color: #475569 !important; }
.bg-indigo-600 { background-color: #4f46e5 !important; }
.text-slate-900 { color: #0f172a !important; }
.text-slate-800 { color: #1e293b !important; }
.text-slate-700 { color: #334155 !important; }

.font-mono {
  font-family: monospace !important;
  font-size: 20px;
  letter-spacing: 6px;
}

.whitespace-pre-line {
  white-space: pre-line;
}
</style>
