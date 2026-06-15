<template>
  <div class="apple-input-group" :class="{ 'fi-lg': large }">
    <label v-if="label" class="apple-label">{{ label }}</label>
    
    <div class="input-wrapper" :class="{ 'has-icon': icon }">
      <v-icon v-if="icon" :icon="icon" size="18" class="leading-icon"></v-icon>
      
      <div v-if="type === 'select'" class="select-container">
        <select
          :value="modelValue"
          class="apple-input apple-select"
          @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in options" :key="opt.value !== undefined ? opt.value : opt" :value="opt.value !== undefined ? opt.value : opt">
            {{ opt.label || opt.title || opt }}
          </option>
        </select>
        <v-icon icon="mdi-chevron-down" size="16" class="select-arrow"></v-icon>
      </div>

      <textarea
        v-else-if="type === 'textarea'"
        :value="modelValue"
        :placeholder="placeholder"
        class="apple-input apple-textarea"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>

      <input
        v-else
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        class="apple-input"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    
    <div v-if="error" class="error-text">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any;
  label?: string;
  type?: string;
  placeholder?: string;
  options?: any[];
  large?: boolean;
  error?: string;
  icon?: string;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.apple-input-group {
  display: flex;
  flex-direction: column;
}

.apple-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--g5);
  margin-bottom: 6px;
  letter-spacing: 0.1px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.apple-input {
  width: 100%;
  height: 34px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--r8);
  padding: 0 12px;
  font-size: 13px;
  color: var(--g7);
  transition: all 0.2s ease;
}

.has-icon .apple-input {
  padding-left: 38px;
}

.leading-icon {
  position: absolute;
  left: 12px;
  color: var(--g4);
  pointer-events: none;
}

.fi-lg .apple-input {
  height: 40px;
  border-radius: var(--r10);
}

.apple-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
}

.apple-input::placeholder {
  color: var(--g3);
}

.apple-textarea {
  height: auto;
  min-height: 80px;
  padding: 10px 12px;
  line-height: 1.5;
  resize: vertical;
}

.select-container {
  position: relative;
  width: 100%;
}

.apple-select {
  appearance: none;
  padding-right: 32px;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--g4);
}

.error-text {
  font-size: 11px;
  color: var(--red);
  margin-top: 4px;
}
</style>
