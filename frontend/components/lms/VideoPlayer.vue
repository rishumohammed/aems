<template>
  <div class="video-player-wrapper">
    <div class="video-player-container rounded-t-xl overflow-hidden bg-black aspect-video relative">
      <div v-if="source === 'youtube'" :key="videoId" class="absolute inset-0 w-full h-full">
        <iframe
          id="youtube-player"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          :src="`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&iv_load_policy=3&start=${Math.floor(lastWatchedSeconds)}`"
        ></iframe>
        <!-- Invisible overlay to block title details & sharing button clicks at the top -->
        <div class="absolute" style="top: 0; left: 0; width: 100%; height: 50px; z-index: 1; cursor: default;" @click.stop.prevent></div>
        <!-- Invisible overlay to block 'More Videos' overlay menu trigger button (sits above the bottom seek/control bar) -->
        <div class="absolute" style="bottom: 35px; right: 10px; width: 180px; height: 60px; z-index: 1; cursor: default;" @click.stop.prevent></div>
        
        <!-- Custom Pause Overlay to hide YouTube native related videos / more videos menu -->
        <div
          v-if="isPaused"
          class="absolute inset-0 d-flex align-center justify-center bg-black-opacity-60 cursor-pointer"
          style="z-index: 2;"
          @click="resumeVideo"
        >
          <v-avatar color="primary" size="80" class="elevation-4">
            <v-icon size="48" color="white">mdi-play</v-icon>
          </v-avatar>
        </div>

        <!-- Custom Ended Overlay to hide YouTube related recommendations -->
        <div
          v-if="isEnded"
          class="absolute inset-0 d-flex flex-column align-center justify-center bg-black-opacity-80 text-white"
          style="z-index: 2;"
        >
          <v-avatar color="success" size="70" class="mb-4">
            <v-icon size="40" color="white">mdi-check-bold</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold mb-1">Lesson Completed!</h3>
          <p class="text-caption text-grey-lighten-1 mb-4">You have finished watching this video.</p>
          <v-btn color="white" variant="outlined" size="small" rounded="pill" class="text-none font-weight-bold" @click="replayVideo">
            <v-icon start>mdi-replay</v-icon> Replay Video
          </v-btn>
        </div>
      </div>
      <div v-else-if="source === 'vimeo'" ref="vimeoContainer" class="absolute inset-0 w-full h-full"></div>
      <video
        v-else-if="source === 'mp4' || source === 'external'"
        ref="nativePlayer"
        class="absolute inset-0 w-full h-full"
        controls
        :src="getVideoSrc"
        @play="onNativePlay"
        @pause="onNativePause"
        @ended="onNativeEnded"
        @loadedmetadata="onNativeMetadata"
        @volumechange="onNativeVolumeChange"
      ></video>
      
      <!-- Floating Volume HUD Indicator -->
      <transition name="hud-fade">
        <div
          v-if="showVolumeToast"
          class="volume-hud-indicator absolute top-4 right-4 z-10 px-4 py-2 rounded-pill bg-black-opacity-80 text-white d-flex align-center gap-2 elevation-6 pointer-events-none"
        >
          <v-icon size="20" :color="isMuted ? 'error' : 'primary'">{{ volumeIcon }}</v-icon>
          <span class="text-caption font-weight-bold">{{ volumeStatusText }}</span>
          <div v-if="!isMuted" class="volume-hud-bar rounded-pill bg-grey-darken-3 overflow-hidden ml-1">
            <div class="volume-hud-fill bg-primary h-100" :style="{ width: `${volume}%` }"></div>
          </div>
        </div>
      </transition>

      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 d-flex align-center justify-center bg-black-opacity-50">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </div>

    <!-- Audio & Video Management Toolbar -->
    <div class="video-controls-bar rounded-b-xl px-4 py-2-5 text-white d-flex align-center justify-space-between flex-wrap gap-3">
      <!-- Left: Audio Volume Management -->
      <div class="d-flex align-center flex-wrap gap-3">
        <!-- Mute / Unmute Button -->
        <v-btn
          icon
          variant="tonal"
          size="small"
          :color="isMuted ? 'error' : 'primary'"
          class="rounded-lg volume-mute-btn"
          :title="isMuted ? 'Unmute (M)' : 'Mute (M)'"
          @click="toggleMute"
        >
          <v-icon size="20">{{ volumeIcon }}</v-icon>
        </v-btn>

        <!-- Volume Slider & Text Readout -->
        <div class="d-flex align-center gap-2 volume-slider-group">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="isMuted ? 0 : volume"
            @input="onSliderInput($event.target.value)"
            class="custom-volume-slider"
            aria-label="Volume Slider"
          />
          <span class="text-caption font-weight-bold tabular-nums min-w-45 text-grey-lighten-1">
            {{ volumeStatusText }}
          </span>
        </div>

        <!-- Quick Volume Presets -->
        <div class="d-none d-sm-flex align-center gap-1 ml-1">
          <v-chip
            size="x-small"
            variant="tonal"
            :color="isMuted ? 'error' : 'grey-lighten-2'"
            class="font-weight-bold cursor-pointer preset-chip"
            @click="toggleMute"
          >
            Mute
          </v-chip>
          <v-chip
            v-for="preset in [25, 50, 75, 100]"
            :key="preset"
            size="x-small"
            variant="tonal"
            :color="!isMuted && volume === preset ? 'primary' : 'grey-lighten-2'"
            class="font-weight-bold cursor-pointer preset-chip"
            @click="setVolume(preset)"
          >
            {{ preset }}%
          </v-chip>
        </div>
      </div>

      <!-- Right: Playback Speed & Shortcuts Tooltip -->
      <div class="d-flex align-center gap-2">
        <!-- Playback Speed Menu -->
        <v-menu location="top end">
          <template v-slot:activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              variant="tonal"
              size="small"
              rounded="lg"
              color="grey-lighten-2"
              prepend-icon="mdi-speedometer"
              class="text-none font-weight-bold text-caption"
            >
              {{ playbackSpeed }}x Speed
            </v-btn>
          </template>
          <v-list density="compact" class="playback-menu-list rounded-lg" elevation="8">
            <v-list-item
              v-for="speed in [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]"
              :key="speed"
              :active="playbackSpeed === speed"
              color="primary"
              @click="setPlaybackSpeed(speed)"
            >
              <v-list-item-title class="text-caption font-weight-bold">
                {{ speed === 1.0 ? '1.0x (Normal)' : `${speed}x` }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Shortcuts Guide Tooltip -->
        <v-tooltip text="Shortcuts: [M] Mute/Unmute • [+] Vol Up • [-] Vol Down" location="top">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-keyboard-outline"
              variant="text"
              size="x-small"
              color="grey-lighten-1"
            ></v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import VimeoPlayer from '@vimeo/player';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

useHead({
  script: [
    { src: 'https://www.youtube.com/iframe_api', async: true, defer: true }
  ]
});

const props = defineProps({
  source: { type: String, required: true }, // 'youtube' | 'vimeo' | 'mp4' | 'external'
  videoId: { type: String, required: true },
  lastWatchedSeconds: { type: Number, default: 0 },
  enrollmentId: { type: String, required: true },
  lessonId: { type: String, required: true }
});

const emit = defineEmits(['complete', 'progress']);

const loading = ref(true);
const vimeoContainer = ref(null);
const nativePlayer = ref(null);
const isPaused = ref(false);
const isEnded = ref(false);
let ytPlayer = null;
let vimeoPlayer = null;
let progressInterval = null;

// Volume & Audio Management State
const volume = ref(100);
const isMuted = ref(false);
const playbackSpeed = ref(1.0);
const showVolumeToast = ref(false);
let volumeToastTimer = null;

const api = useApi();
const config = useRuntimeConfig();

// Direct file path helper
const getVideoSrc = computed(() => {
  if (props.source === 'mp4' && props.videoId?.startsWith('/uploads/')) {
    return config.public.apiBase.replace('/api', '') + props.videoId;
  }
  return props.videoId;
});

// Dynamic Volume Icon
const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'mdi-volume-off';
  if (volume.value <= 35) return 'mdi-volume-low';
  if (volume.value <= 70) return 'mdi-volume-medium';
  return 'mdi-volume-high';
});

// Formatted Volume Text
const volumeStatusText = computed(() => {
  if (isMuted.value || volume.value === 0) return 'Muted';
  return `${volume.value}%`;
});

// Trigger Floating HUD Feedback
const triggerVolumeHUD = () => {
  showVolumeToast.value = true;
  if (volumeToastTimer) clearTimeout(volumeToastTimer);
  volumeToastTimer = setTimeout(() => {
    showVolumeToast.value = false;
  }, 1500);
};

// Apply Audio & Playback settings across all player backends
const applyAudioSettings = () => {
  const effectiveVol = isMuted.value ? 0 : volume.value;

  // 1. YouTube IFrame API
  if (ytPlayer) {
    try {
      if (typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(effectiveVol);
      }
      if (isMuted.value || effectiveVol === 0) {
        if (typeof ytPlayer.mute === 'function') ytPlayer.mute();
      } else {
        if (typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
      }
      if (typeof ytPlayer.setPlaybackRate === 'function') {
        ytPlayer.setPlaybackRate(playbackSpeed.value);
      }
    } catch (e) {
      console.warn('YouTube audio settings warning:', e);
    }
  }

  // 2. Vimeo Player API
  if (vimeoPlayer) {
    try {
      if (typeof vimeoPlayer.setVolume === 'function') {
        vimeoPlayer.setVolume(effectiveVol / 100);
      }
      if (typeof vimeoPlayer.setMuted === 'function') {
        vimeoPlayer.setMuted(isMuted.value || effectiveVol === 0);
      }
      if (typeof vimeoPlayer.setPlaybackRate === 'function') {
        vimeoPlayer.setPlaybackRate(playbackSpeed.value);
      }
    } catch (e) {
      console.warn('Vimeo audio settings warning:', e);
    }
  }

  // 3. HTML5 Video Element
  if (nativePlayer.value) {
    try {
      nativePlayer.value.volume = effectiveVol / 100;
      nativePlayer.value.muted = isMuted.value || effectiveVol === 0;
      nativePlayer.value.playbackRate = playbackSpeed.value;
    } catch (e) {
      console.warn('Native player audio settings warning:', e);
    }
  }
};

// Set Volume Level (0 - 100)
const setVolume = (newVal) => {
  const parsed = Math.max(0, Math.min(100, parseInt(newVal, 10) || 0));
  volume.value = parsed;

  if (parsed === 0) {
    isMuted.value = true;
  } else if (isMuted.value) {
    isMuted.value = false;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_student_player_volume', volume.value.toString());
    localStorage.setItem('lms_student_player_muted', isMuted.value ? 'true' : 'false');
  }

  applyAudioSettings();
  triggerVolumeHUD();
};

const onSliderInput = (val) => {
  setVolume(val);
};

// Toggle Mute / Unmute
const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (!isMuted.value && volume.value === 0) {
    volume.value = 50;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_student_player_volume', volume.value.toString());
    localStorage.setItem('lms_student_player_muted', isMuted.value ? 'true' : 'false');
  }

  applyAudioSettings();
  triggerVolumeHUD();
};

// Set Playback Speed
const setPlaybackSpeed = (speed) => {
  playbackSpeed.value = speed;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_student_player_speed', speed.toString());
  }
  applyAudioSettings();
};

// Step Volume (e.g. +5% or -5%)
const stepVolume = (delta) => {
  const current = isMuted.value ? 0 : volume.value;
  setVolume(current + delta);
};

// Keyboard listener for shortcuts
const handleKeyDown = (e) => {
  const tag = e.target?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
    return;
  }

  if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    toggleMute();
  } else if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    stepVolume(5);
  } else if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    stepVolume(-5);
  }
};

// Progress Tracking
const saveProgress = async (seconds, completed = false) => {
  try {
    await api.post('/lms/student/progress', {
      enrollment_id: props.enrollmentId,
      lesson_id: props.lessonId,
      watched_seconds: Math.floor(seconds),
      completed
    });
    emit('progress', { seconds, completed });
    if (completed) emit('complete');
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

const startProgressTracking = (getCurrentTime) => {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    const time = getCurrentTime();
    if (time > 0) saveProgress(time);
  }, 20000); // Every 20 seconds
};

// YouTube Integration
const initYouTube = () => {
  if (!window.YT || !window.YT.Player) {
    setTimeout(initYouTube, 500);
    return;
  }

  ytPlayer = new window.YT.Player('youtube-player', {
    events: {
      onReady: (event) => {
        loading.value = false;
        applyAudioSettings();
        if (props.lastWatchedSeconds > 0) {
          ytPlayer.seekTo(props.lastWatchedSeconds);
        }
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
          isPaused.value = false;
          isEnded.value = false;
          applyAudioSettings();
          startProgressTracking(() => ytPlayer.getCurrentTime());
        } else if (event.data === window.YT.PlayerState.ENDED) {
          isPaused.value = false;
          isEnded.value = true;
          if (progressInterval) clearInterval(progressInterval);
          saveProgress(ytPlayer.getDuration(), true);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
          isPaused.value = true;
          if (progressInterval) clearInterval(progressInterval);
        } else {
          if (progressInterval) clearInterval(progressInterval);
        }
      }
    }
  });
};

// Vimeo Integration
const initVimeo = () => {
  if (!vimeoContainer.value) return;
  vimeoContainer.value.innerHTML = '';

  vimeoPlayer = new VimeoPlayer(vimeoContainer.value, {
    id: props.videoId,
    width: '100%',
    autopause: false
  });

  vimeoPlayer.on('loaded', () => {
    loading.value = false;
    applyAudioSettings();
    if (props.lastWatchedSeconds > 0) {
      vimeoPlayer.setCurrentTime(props.lastWatchedSeconds);
    }
  });

  vimeoPlayer.on('play', () => {
    applyAudioSettings();
    startProgressTracking(async () => {
      const time = await vimeoPlayer.getCurrentTime();
      return time;
    });
  });

  vimeoPlayer.on('pause', () => {
    if (progressInterval) clearInterval(progressInterval);
  });

  vimeoPlayer.on('ended', async () => {
    if (progressInterval) clearInterval(progressInterval);
    const duration = await vimeoPlayer.getDuration();
    saveProgress(duration, true);
  });
};

// HTML5 Video Handlers
const onNativePlay = () => {
  applyAudioSettings();
  startProgressTracking(() => nativePlayer.value?.currentTime || 0);
};

const onNativePause = () => {
  if (progressInterval) clearInterval(progressInterval);
};

const onNativeEnded = () => {
  if (progressInterval) clearInterval(progressInterval);
  saveProgress(nativePlayer.value?.duration || 0, true);
};

const onNativeMetadata = () => {
  loading.value = false;
  applyAudioSettings();
  if (props.lastWatchedSeconds > 0 && nativePlayer.value) {
    nativePlayer.value.currentTime = props.lastWatchedSeconds;
  }
};

const onNativeVolumeChange = () => {
  if (nativePlayer.value) {
    const isM = nativePlayer.value.muted;
    const v = Math.round(nativePlayer.value.volume * 100);
    if (v !== volume.value || isM !== isMuted.value) {
      volume.value = v;
      isMuted.value = isM;
    }
  }
};

const initPlayer = () => {
  loading.value = true;
  if (props.source === 'youtube') {
    initYouTube();
  } else if (props.source === 'vimeo') {
    initVimeo();
  } else {
    // Native HTML5 video loadedmetadata handles loading status
    loading.value = false;
    applyAudioSettings();
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedVol = localStorage.getItem('lms_student_player_volume');
    const savedMuted = localStorage.getItem('lms_student_player_muted');
    const savedSpeed = localStorage.getItem('lms_student_player_speed');

    if (savedVol !== null) {
      const parsed = parseInt(savedVol, 10);
      if (!isNaN(parsed)) volume.value = Math.max(0, Math.min(100, parsed));
    }
    if (savedMuted !== null) {
      isMuted.value = savedMuted === 'true';
    }
    if (savedSpeed !== null) {
      const parsedSpeed = parseFloat(savedSpeed);
      if (!isNaN(parsedSpeed)) playbackSpeed.value = parsedSpeed;
    }

    window.addEventListener('keydown', handleKeyDown);
  }

  initPlayer();
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  if (volumeToastTimer) clearTimeout(volumeToastTimer);
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
  if (vimeoPlayer) vimeoPlayer.destroy();
  if (ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
});

const resumeVideo = () => {
  if (ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
    isPaused.value = false;
  }
};

const replayVideo = () => {
  if (ytPlayer && ytPlayer.seekTo && ytPlayer.playVideo) {
    ytPlayer.seekTo(0);
    ytPlayer.playVideo();
    isEnded.value = false;
  }
};

// Handle video change
watch(() => [props.videoId, props.source], () => {
  isPaused.value = false;
  isEnded.value = false;
  initPlayer();
});
</script>

<style scoped>
.video-player-wrapper {
  position: relative;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
}

.video-player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  background-color: #000;
}

.video-controls-bar {
  background: linear-gradient(180deg, #18181b 0%, #09090b 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.absolute {
  position: absolute;
}
.inset-0 {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.top-4 {
  top: 1rem;
}
.right-4 {
  right: 1rem;
}
.z-10 {
  z-index: 10;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
.min-w-45 {
  min-width: 45px;
}
.pointer-events-none {
  pointer-events: none;
}

.bg-black-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}
.bg-black-opacity-60 {
  background-color: rgba(0, 0, 0, 0.6);
}
.bg-black-opacity-80 {
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}

/* Custom Range Slider */
.volume-slider-group {
  user-select: none;
}
.custom-volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 6px;
  border-radius: 9999px;
  background: #3f3f46;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}
.custom-volume-slider:hover {
  background: #52525b;
}
.custom-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  transition: transform 0.15s, background 0.15s;
}
.custom-volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
  background: #60a5fa;
}
.custom-volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.volume-hud-bar {
  width: 50px;
  height: 6px;
}
.volume-hud-fill {
  transition: width 0.15s ease-out;
}

.hud-fade-enter-active,
.hud-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.hud-fade-enter-from,
.hud-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.playback-menu-list {
  background-color: #18181b !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.preset-chip {
  transition: all 0.15s ease;
}
.preset-chip:hover {
  filter: brightness(1.2);
}
</style>
