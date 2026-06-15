<template>
  <v-card class="student-hero-card rounded-xl overflow-hidden border-0" elevation="10">
    <div class="hero-bg"></div>
    <v-card-text class="position-relative z-1 pa-6 pa-md-8 text-white">
      <v-row align="center">
        <v-col cols="12" md="auto" class="text-center">
          <v-avatar size="120" :color="avatarColor" class="border-4 border-white elevation-5">
            <span class="text-h3 font-weight-bold">{{ initials }}</span>
          </v-avatar>
        </v-col>
        
        <v-col class="text-center text-md-left mt-4 mt-md-0">
          <div class="d-flex align-center justify-center justify-md-start flex-wrap gap-2 mb-2">
            <h1 class="text-h4 font-weight-black">{{ student.name }}</h1>
            <v-chip size="small" :color="statusColor" class="text-uppercase font-weight-bold ml-2">
              {{ student.status }}
            </v-chip>
          </div>
          
          <div class="d-flex align-center justify-center justify-md-start flex-wrap gap-x-4 gap-y-2 opacity-90">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-1">mdi-email-outline</v-icon>
              <span class="text-body-2">{{ student.email }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-1">mdi-phone-outline</v-icon>
              <span class="text-body-2">{{ student.phone || 'N/A' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-1">mdi-calendar-range</v-icon>
              <span class="text-body-2">Joined {{ formatDate(student.created_at) }}</span>
            </div>
          </div>

          <div class="mt-6 d-flex flex-wrap justify-center justify-md-start gap-3">
            <v-btn color="white" variant="flat" rounded="lg" class="text-primary font-weight-bold" prepend-icon="mdi-pencil" @click="$emit('edit')">
              Edit Profile
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="lg" class="font-weight-bold" prepend-icon="mdi-plus-circle" @click="$emit('enroll')">
              Enroll in Course
            </v-btn>
            <v-btn color="error" variant="tonal" rounded="lg" class="font-weight-bold" prepend-icon="mdi-account-cancel" v-if="student.status !== 'suspended'" @click="$emit('suspend')">
              Suspend
            </v-btn>
            <v-btn color="success" variant="tonal" rounded="lg" class="font-weight-bold" prepend-icon="mdi-account-check" v-else @click="$emit('reactivate')">
              Reactivate
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <v-card color="white-opacity-10" flat class="rounded-xl pa-4 border border-white-opacity-20 backdrop-blur">
            <div class="text-overline opacity-70">Payment Status</div>
            <div class="d-flex align-center justify-space-between mt-1">
              <span class="text-h6 font-weight-bold">{{ paymentStatusLabel }}</span>
              <v-icon :color="paymentStatusColor">{{ paymentStatusIcon }}</v-icon>
            </div>
            <v-divider class="my-3 border-white-opacity-20"></v-divider>
            <div class="text-overline opacity-70">Enrolled Courses</div>
            <div class="text-h5 font-weight-black mt-1">{{ enrollmentCount }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  student: { type: Object, required: true },
  enrollmentCount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'pending' }
});

defineEmits(['edit', 'enroll', 'suspend', 'reactivate']);

const initials = computed(() => {
  return props.student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
});

const avatarColor = computed(() => {
  const colors = ['#007AFF', '#AF52DE', '#FF9500', '#34C759', '#FF3B30'];
  const charCode = props.student.name?.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
});

const statusColor = computed(() => {
  switch (props.student.status) {
    case 'active': return 'success';
    case 'suspended': return 'error';
    default: return 'grey';
  }
});

const paymentStatusLabel = computed(() => {
  switch (props.paymentStatus) {
    case 'paid': return 'Fully Paid';
    case 'partial': return 'Partial Due';
    case 'pending': return 'Payment Pending';
    default: return 'Unknown';
  }
});

const paymentStatusColor = computed(() => {
  switch (props.paymentStatus) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'pending': return 'error';
    default: return 'white';
  }
});

const paymentStatusIcon = computed(() => {
  switch (props.paymentStatus) {
    case 'paid': return 'mdi-check-decagram';
    case 'partial': return 'mdi-alert-circle';
    case 'pending': return 'mdi-clock-outline';
    default: return 'mdi-help-circle';
  }
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' });
};
</script>

<style scoped>
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #007AFF 0%, #AF52DE 100%);
  z-index: 0;
}
.white-opacity-10 {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
.white-opacity-20 {
  border-color: rgba(255, 255, 255, 0.2) !important;
}
.backdrop-blur {
  backdrop-filter: blur(10px);
}
.border-4 {
  border-width: 4px !important;
}
</style>
