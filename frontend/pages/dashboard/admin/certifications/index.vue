<template>
  <div class="admin-certifications-page">
    <CertificationsTab />
  </div>
</template>

<script setup lang="ts">
import CertificationsTab from '@/components/admin/settings/CertificationsTab.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'lms_user']
});
</script>
