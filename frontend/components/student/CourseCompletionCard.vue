<template>
  <v-card class="completion-card overflow-hidden d-flex flex-column" elevation="10" :class="{ 'celebrate': showCelebration, 'dark-theme': isDark }" max-height="85vh">
    <div class="card-bg-gradient"></div>
    
    <!-- Decorative background elements -->
    <div class="circle-decor circle-1"></div>
    <div class="circle-decor circle-2"></div>
    <div class="circle-decor circle-3"></div>
    
    <v-card-text class="text-center pa-6 pa-md-10 position-relative content-wrapper flex-grow-1 overflow-y-auto custom-scrollbar">
      
      <!-- 1. Profile Section -->
      <div class="profile-section mb-6 d-flex flex-column align-center">
        <div class="profile-avatar-container position-relative mb-4">
          <div class="avatar-glow"></div>
          <v-avatar size="110" class="profile-main-avatar elevation-10">
            <v-img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" cover></v-img>
            <span v-else class="text-h3 font-weight-black text-white user-pill-avatar d-flex align-center justify-center w-100 h-100">{{ userInitials }}</span>
          </v-avatar>
        </div>
        
        <h3 class="text-h5 font-weight-black text-white text-shadow mb-1">{{ authStore.user?.name || 'Student Name' }}</h3>
        <div class="text-caption text-white-80 d-flex align-center justify-center gap-2 mb-2">
          <span class="font-weight-medium">Student ID: {{ studentId }}</span>
          <span class="opacity-50 px-1">•</span>
          <span class="font-weight-medium">Learning Since: {{ learningSince }}</span>
        </div>
      </div>

      <!-- 2. Achievement Header -->
      <div class="text-overline font-weight-black text-uppercase text-primary mb-6 tracking-wide glass-pill d-inline-block px-5 py-2 shadow-lg">
        🎉 Congratulations {{ authStore.user?.name?.split(' ')[0] || '' }}!
      </div>
      
      <!-- 3. Course Details -->
      <div v-if="course" class="text-white">
        <p class="text-body-1 mb-8 text-white-80 font-weight-medium">
          You successfully completed:<br>
          <strong class="text-h5 text-white d-block mt-2">{{ course.title || 'Mastering Vue 3 & Nuxt' }}</strong>
        </p>

        <!-- 4. Stats Row -->
        <v-row class="stats-grid mb-6 mx-0" no-gutters>
          <v-col cols="4" class="pa-1">
            <div class="stat-box glass-panel pa-3 h-100 d-flex flex-column justify-center align-center">
              <v-icon size="24" color="info" class="mb-2 opacity-80">mdi-book-check</v-icon>
              <div class="text-subtitle-1 font-weight-black line-height-1">48 / 48</div>
              <div class="text-caption text-white-70 mt-1 uppercase-tiny">Lessons</div>
            </div>
          </v-col>
          <v-col cols="4" class="pa-1">
            <div class="stat-box glass-panel pa-3 h-100 d-flex flex-column justify-center align-center">
              <v-icon size="24" color="success" class="mb-2 opacity-80">mdi-target</v-icon>
              <div class="text-subtitle-1 font-weight-black line-height-1">92%</div>
              <div class="text-caption text-white-70 mt-1 uppercase-tiny">Score</div>
            </div>
          </v-col>
          <v-col cols="4" class="pa-1">
            <div class="stat-box glass-panel pa-3 h-100 d-flex flex-column justify-center align-center">
              <v-icon size="24" color="purple-lighten-3" class="mb-2 opacity-80">mdi-calendar-check</v-icon>
              <div class="text-subtitle-2 font-weight-black line-height-1 mt-1">{{ formattedShortDate }}</div>
              <div class="text-caption text-white-70 mt-1 uppercase-tiny">Date</div>
            </div>
          </v-col>
        </v-row>

        <!-- 5. Course Graduate Badge -->
        <v-chip color="warning" variant="elevated" elevation="4" class="font-weight-black px-6 py-5 mb-8 text-subtitle-1 badge-chip" prepend-icon="mdi-medal">
          🏆 Course Graduate
        </v-chip>

        <!-- 6. Progress Ring -->
        <div class="progress-section mb-10">
          <div class="progress-ring-container d-inline-block position-relative">
            <v-progress-circular
              :model-value="100"
              color="warning"
              size="100"
              width="6"
              class="progress-ring"
            >
              <span class="text-h5 font-weight-black text-white">100%</span>
            </v-progress-circular>
            <div class="text-caption text-white-80 font-weight-bold mt-2 uppercase-tiny">Completed</div>
          </div>
        </div>
      </div>

      <div v-else class="text-white mb-8">
        <p class="text-body-1 text-white-80">
          Complete remaining requirements to finish this course.
        </p>
      </div>

      <!-- 7. Action Buttons -->
      <div class="action-buttons d-flex flex-column gap-3 max-w-400 mx-auto">
        <v-btn 
          v-if="course?.certificate_generated !== false" 
          color="white" 
          variant="elevated" 
          size="x-large"
          block
          rounded="xl"
          class="font-weight-black text-primary shadow-lg hover-lift"
          prepend-icon="mdi-download"
          @click="$emit('download-certificate')"
        >
          Download Certificate
        </v-btn>
        
        <v-btn 
          v-if="course?.certificate_generated !== false" 
          color="rgba(255,255,255,0.2)" 
          variant="flat" 
          size="large"
          block
          rounded="xl"
          class="font-weight-bold text-white border-white-10 hover-lift backdrop-blur mt-1"
          prepend-icon="mdi-eye"
          to="/dashboard/certificates"
        >
          View Certificate
        </v-btn>
        
        <v-btn 
          color="rgba(255,255,255,0.15)" 
          variant="flat" 
          size="large"
          block
          rounded="xl"
          class="font-weight-bold text-white border-white-10 hover-lift backdrop-blur mt-2"
          to="/dashboard/student"
        >
          Explore More Courses
        </v-btn>

        <v-btn 
          variant="text" 
          color="white"
          block
          rounded="xl"
          class="font-weight-bold mt-2 opacity-80 hover-opacity-100"
          prepend-icon="mdi-share-variant"
          @click="$emit('share-achievement')"
        >
          Share Achievement
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';

const authStore = useAuthStore();
const theme = useTheme();

const isDark = computed(() => theme.global.name.value === 'dark');

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'ST';
  const parts = authStore.user.name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
});

const studentId = computed(() => {
  if (authStore.user?.id) {
    return 'STU-' + authStore.user.id.substring(0, 4).toUpperCase();
  }
  return 'STU-1024';
});

const learningSince = computed(() => {
  if (authStore.user?.created_at) {
    return new Date(authStore.user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }
  return 'Jan 2026';
});

const props = defineProps({
  course: {
    type: Object,
    default: null
  },
  showCelebration: {
    type: Boolean,
    default: false
  }
});

defineEmits(['download-certificate', 'share-achievement']);

const formattedShortDate = computed(() => {
  if (!props.course || !props.course.completed_at) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return new Date(props.course.completed_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short'
  });
});

onMounted(() => {
  if (props.showCelebration) {
    triggerConfetti();
  }
});

const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ffffff', '#fde047', '#a855f7', '#3b82f6', '#10b981'],
      zIndex: 10000
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ffffff', '#fde047', '#a855f7', '#3b82f6', '#10b981'],
      zIndex: 10000
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};
</script>

<style scoped>
.completion-card {
  position: relative;
  background: #1e1b4b; /* Fallback for older browsers */
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.4) !important;
}

.card-bg-gradient {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  z-index: 0;
}

.dark-theme .card-bg-gradient {
  background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
}

.content-wrapper {
  z-index: 10;
}

/* Decorative Circles */
.circle-decor {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  z-index: 1;
  opacity: 0.6;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: #ec4899;
  top: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 250px;
  height: 250px;
  background: #3b82f6;
  bottom: -80px;
  right: -80px;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #fde047;
  top: 40%;
  right: -20px;
  opacity: 0.3;
  animation: float 12s ease-in-out infinite 2s;
}

@keyframes float {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}

/* Glassmorphism */
.glass-pill {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: #4f46e5 !important;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  transition: transform 0.2s ease, background 0.2s ease;
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Typography & Helpers */
.text-shadow {
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.text-white-80 { color: rgba(255, 255, 255, 0.8) !important; }
.text-white-70 { color: rgba(255, 255, 255, 0.7) !important; }
.line-height-1 { line-height: 1; }
.uppercase-tiny {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.65rem;
}
.border-white-10 { border: 1px solid rgba(255,255,255,0.1); }
.border-white-thick { border: 3px solid #ffffff; }

.max-w-400 { max-width: 400px; }
.hover-lift { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.hover-lift:hover { transform: translateY(-3px); }
.opacity-80 { opacity: 0.8; }
.hover-opacity-100:hover { opacity: 1; }
.gap-3 { gap: 12px; }

.user-pill-avatar {
  background: linear-gradient(135deg, #4f46e5, #ec4899);
}

/* Animations */
.completion-card.celebrate {
  animation: cardEntry 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

.completion-card.celebrate .trophy-icon {
  animation: trophyBounce 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards;
  transform: scale(0);
}

.completion-card.celebrate .badge-chip {
  animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
  opacity: 0;
  transform: scale(0.8);
}

@keyframes cardEntry {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-15deg); }
  50% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes popIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Trophy & Ring */
.trophy-container {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
}

.progress-ring {
  filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.6));
}

.glow-effect {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 120%; height: 120%;
  background: radial-gradient(circle, rgba(253,224,71,0.4) 0%, rgba(253,224,71,0) 70%);
  z-index: 0;
}

.user-badge {
  bottom: 5px !important;
  right: 5px !important;
  z-index: 10;
}

/* Profile Avatar Glow */
.profile-avatar-container {
  display: inline-block;
  border-radius: 50%;
}
.profile-main-avatar {
  border: 4px solid rgba(255, 255, 255, 0.8);
}
.avatar-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 130%; height: 130%;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  border-radius: 50%;
  animation: pulseGlow 2s infinite alternate;
}
@keyframes pulseGlow {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

/* Custom Scrollbar for Modal */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
