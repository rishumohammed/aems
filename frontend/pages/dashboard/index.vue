<template>
  <div class="d-flex align-center justify-center fill-height">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
});

onMounted(() => {
  // Middleware handles redirection
});
</script>
