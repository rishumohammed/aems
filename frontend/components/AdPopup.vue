<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card class="pa-0 overflow-hidden bg-transparent" elevation="0">
      <div class="position-relative">
        <v-btn icon="mdi-close" variant="text" color="white" class="close-btn" @click="closeAd"></v-btn>
        
        <v-img :src="imageUrl" alt="Special Offer" cover height="400" class="rounded-xl elevation-10">
          <div class="d-flex fill-height flex-column align-center justify-end pb-8">
            <v-btn 
              color="primary" 
              size="x-large" 
              rounded="pill" 
              elevation="8" 
              class="font-weight-bold text-uppercase px-8 overlap-btn" 
              @click="exploreOffer"
            >
              {{ buttonText }}
            </v-btn>
          </div>
        </v-img>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const show = ref(false);
const popupTriggered = ref(false);
const router = useRouter();

const config = useRuntimeConfig();
const baseUrl = computed(() => config.public.apiBase.replace('/api', ''));

const adEnabled    = useState('ad_popup_enabled',     () => false);
const adImage      = useState('ad_popup_image',       () => '');
const adLink       = useState('ad_popup_link',        () => '/#courses');
const adButtonText = useState('ad_popup_button_text', () => 'Claim Offer Now');

const imageUrl = computed(() => {
  if (adImage.value) {
    return adImage.value.startsWith('/') ? baseUrl.value + adImage.value : adImage.value;
  }
  return '/ad_banner.png';
});

const buttonText = computed(() => adButtonText.value || 'Claim Offer Now');

// Watch for adEnabled to become true (async config load from app.vue)
watch(adEnabled, (enabled) => {
  if (!enabled || popupTriggered.value) return;
  const adShown = sessionStorage.getItem('adPopupShown');
  if (!adShown) {
    popupTriggered.value = true;
    setTimeout(() => {
      show.value = true;
      sessionStorage.setItem('adPopupShown', 'true');
    }, 1500);
  }
}, { immediate: true });

const closeAd = () => {
  show.value = false;
};

const exploreOffer = () => {
  show.value = false;
  if (adLink.value && adLink.value.startsWith('http')) {
    window.location.href = adLink.value;
  } else {
    router.push(adLink.value || '/#courses');
  }
};
</script>

<style scoped>
.position-relative {
  position: relative;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.4);
}
.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.6);
}
.overlap-btn {
  transition: transform 0.2s;
}
.overlap-btn:hover {
  transform: scale(1.05);
}
</style>
