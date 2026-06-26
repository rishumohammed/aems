<template>
  <v-container fluid class="pa-6">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
    <span class="ml-4">Redirecting to Job Post form...</span>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from '#imports';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin']
});

const router = useRouter();

onMounted(() => {
  router.replace('/dashboard/employer/jobs/create');
});
</script>
