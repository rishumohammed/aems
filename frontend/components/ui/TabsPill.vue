<template>
  <div class="tabs-pill">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-item"
      :class="{ 'tab-active': modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  tabs: { label: string; value: string }[];
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.tabs-pill {
  display: inline-flex;
  background: var(--g1);
  border-radius: var(--r12);
  padding: 3px;
  gap: 2px;
}

.tab-item {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--g5);
  border-radius: var(--r10);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.tab-item:hover:not(.tab-active) {
  color: var(--g7);
}

.tab-active {
  background: white;
  color: var(--blue);
  font-weight: 700;
  box-shadow: var(--s1);
}
</style>
