<template>
  <div>
    <NuxtLayout>
      <NuxtPage :page-key="route => route.fullPath" />
    </NuxtLayout>
    <!-- YouTube IFrame API -->
    <script src="https://www.youtube.com/iframe_api" async></script>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme();
const config = useRuntimeConfig();
const instituteName = useState('instituteName', () => 'AEMS Academy');
const instituteTagline = useState('instituteTagline', () => '');

onMounted(async () => {
  try {
    const data: any = await $fetch(`${config.public.apiBase}/public/config`);
    if (data) {
      if (data.brand_primary_color) {
        (theme.global.current.value.colors as any).primary = data.brand_primary_color;
        document.documentElement.style.setProperty('--brand', data.brand_primary_color);
        document.documentElement.style.setProperty('--blue', data.brand_primary_color);
      }
      if (data.brand_secondary_color) {
        (theme.global.current.value.colors as any).secondary = data.brand_secondary_color;
      }
      if (data.institute_name) {
        instituteName.value = data.institute_name;
      }
      if (data.tagline) {
        instituteTagline.value = data.tagline;
      }
    }
  } catch (err) {
    console.error('Failed to fetch public config', err);
  }
});
</script>
