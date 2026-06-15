<template>
  <div class="pa-6 d-flex justify-center align-center h-100">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
    <span class="ml-4">Redirecting to Job Post form...</span>
  </div>
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
