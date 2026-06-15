<template>
  <v-app theme="appleLight">
    <AppHeader />
    <AppSidebar v-if="!isPending" />
    <v-main class="dashboard-main">
      <div class="dashboard-content position-relative">
        <PendingApprovalBlocker v-if="isPending" />
        <slot v-else />
      </div>
    </v-main>

    <!-- Global Floating Action Button -->
    <QuickActionsFab v-if="canShowFab" />
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import QuickActionsFab from '@/components/layout/QuickActionsFab.vue';
import PendingApprovalBlocker from '@/components/layout/PendingApprovalBlocker.vue';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { computed, onMounted } from 'vue';

const authStore = useAuthStore();
const uiStore = useUIStore();

const isPending = computed(() => 
  authStore.user?.status === 'pending_review' || 
  authStore.user?.approval_status === 'pending_approval' ||
  authStore.user?.status === 'rejected' ||
  authStore.user?.approval_status === 'rejected'
);

const canShowFab = computed(() => {
  const role = authStore.userRole;
  return role === 'super_admin' || role === 'crm_agent';
});

onMounted(() => {
  uiStore.fetchCounts();
});
</script>

<style scoped>
.dashboard-main {
  background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%) !important;
  min-height: 100vh;
  padding-top: 64px !important; /* Matches AppHeader height */
}

.dashboard-content {
  padding: 0;
  min-height: calc(100vh - 64px);
}
</style>
