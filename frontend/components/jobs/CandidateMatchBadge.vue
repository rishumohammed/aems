<template>
  <div class="candidate-match-wrapper d-inline-block">
    <v-menu
      v-if="showBreakdown && (criteriaBreakdown || (matchedSkills && matchedSkills.length))"
      open-on-hover
      open-on-click
      :close-on-content-click="false"
      location="top center"
      offset="8"
    >
      <template v-slot:activator="{ props: menuProps }">
        <div
          v-bind="menuProps"
          class="match-pill cursor-pointer"
          :class="[badgeTone, `size-${size}`]"
        >
          <v-icon :size="iconSize" class="mr-1">{{ badgeIcon }}</v-icon>
          <span class="score-text">{{ Math.round(score || 0) }}%</span>
          <span v-if="size !== 'sm'" class="match-label ml-1">Match</span>
          <v-icon size="12" class="ml-1 opacity-60">mdi-information-outline</v-icon>
        </div>
      </template>

      <!-- Match Breakdown Card Popover -->
      <v-card class="match-popover-card" rounded="xl" elevation="4" width="320">
        <div class="popover-header pa-4" :class="headerBgClass">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-icon :color="badgeColor" size="22">{{ badgeIcon }}</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-bold" style="color: var(--g7);">
                  {{ matchHeadline }}
                </div>
                <div class="text-caption text-secondary">
                  Job Match Evaluation
                </div>
              </div>
            </div>
            <div class="score-circle font-weight-black" :style="{ borderColor: badgeColor, color: badgeColor }">
              {{ Math.round(score || 0) }}%
            </div>
          </div>
        </div>

        <v-divider class="border-opacity-10"></v-divider>

        <div class="pa-4">
          <!-- 5 Criteria Breakdowns -->
          <div class="criteria-list d-flex flex-column gap-3">
            <!-- 1. Qualification -->
            <div v-if="criteriaBreakdown?.qualification" class="criteria-item d-flex align-start gap-2">
              <v-icon 
                size="18" 
                :color="criteriaBreakdown.qualification.matched ? 'success' : (criteriaBreakdown.qualification.score > 0 ? 'warning' : 'grey')"
                class="mt-0.5"
              >
                {{ criteriaBreakdown.qualification.matched ? 'mdi-check-circle' : (criteriaBreakdown.qualification.score > 0 ? 'mdi-alert-circle' : 'mdi-close-circle') }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold text-grey-darken-3">Qualification</span>
                  <span class="text-caption font-weight-bold" :class="criteriaBreakdown.qualification.matched ? 'text-success' : 'text-secondary'">
                    {{ criteriaBreakdown.qualification.score }}/{{ criteriaBreakdown.qualification.maxScore }}
                  </span>
                </div>
                <div class="text-caption text-secondary font-weight-medium" style="font-size: 11px !important;">
                  {{ criteriaBreakdown.qualification.note }}
                </div>
              </div>
            </div>

            <!-- 2. Experience -->
            <div v-if="criteriaBreakdown?.experience" class="criteria-item d-flex align-start gap-2">
              <v-icon 
                size="18" 
                :color="criteriaBreakdown.experience.matched ? 'success' : (criteriaBreakdown.experience.score > 0 ? 'warning' : 'grey')"
                class="mt-0.5"
              >
                {{ criteriaBreakdown.experience.matched ? 'mdi-check-circle' : (criteriaBreakdown.experience.score > 0 ? 'mdi-alert-circle' : 'mdi-close-circle') }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold text-grey-darken-3">Experience</span>
                  <span class="text-caption font-weight-bold" :class="criteriaBreakdown.experience.matched ? 'text-success' : 'text-secondary'">
                    {{ criteriaBreakdown.experience.score }}/{{ criteriaBreakdown.experience.maxScore }}
                  </span>
                </div>
                <div class="text-caption text-secondary font-weight-medium" style="font-size: 11px !important;">
                  {{ criteriaBreakdown.experience.note }}
                </div>
              </div>
            </div>

            <!-- 3. Skills -->
            <div v-if="criteriaBreakdown?.skills" class="criteria-item d-flex align-start gap-2">
              <v-icon 
                size="18" 
                :color="criteriaBreakdown.skills.matchedRatio >= 0.7 ? 'success' : (criteriaBreakdown.skills.matchedRatio >= 0.3 ? 'warning' : 'grey')"
                class="mt-0.5"
              >
                {{ criteriaBreakdown.skills.matchedRatio >= 0.7 ? 'mdi-check-circle' : (criteriaBreakdown.skills.matchedRatio >= 0.3 ? 'mdi-alert-circle' : 'mdi-close-circle') }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold text-grey-darken-3">Skills Alignment</span>
                  <span class="text-caption font-weight-bold" :class="criteriaBreakdown.skills.matchedRatio >= 0.5 ? 'text-success' : 'text-secondary'">
                    {{ criteriaBreakdown.skills.score }}/{{ criteriaBreakdown.skills.maxScore }}
                  </span>
                </div>
                <div class="text-caption text-secondary font-weight-medium" style="font-size: 11px !important;">
                  {{ criteriaBreakdown.skills.note }}
                </div>
              </div>
            </div>

            <!-- 4. Certifications -->
            <div v-if="criteriaBreakdown?.certifications" class="criteria-item d-flex align-start gap-2">
              <v-icon 
                size="18" 
                :color="criteriaBreakdown.certifications.score > 0 ? 'success' : 'grey'"
                class="mt-0.5"
              >
                {{ criteriaBreakdown.certifications.score > 0 ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold text-grey-darken-3">Certifications & LMS</span>
                  <span class="text-caption font-weight-bold" :class="criteriaBreakdown.certifications.score > 0 ? 'text-success' : 'text-secondary'">
                    {{ criteriaBreakdown.certifications.score }}/{{ criteriaBreakdown.certifications.maxScore }}
                  </span>
                </div>
                <div class="text-caption text-secondary font-weight-medium" style="font-size: 11px !important;">
                  {{ criteriaBreakdown.certifications.note }}
                </div>
              </div>
            </div>

            <!-- 5. Preferences -->
            <div v-if="criteriaBreakdown?.preferences" class="criteria-item d-flex align-start gap-2">
              <v-icon 
                size="18" 
                :color="criteriaBreakdown.preferences.score >= 5 ? 'success' : 'grey'"
                class="mt-0.5"
              >
                {{ criteriaBreakdown.preferences.score >= 5 ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold text-grey-darken-3">Preferences</span>
                  <span class="text-caption font-weight-bold text-secondary">
                    {{ criteriaBreakdown.preferences.score }}/{{ criteriaBreakdown.preferences.maxScore }}
                  </span>
                </div>
                <div class="text-caption text-secondary font-weight-medium" style="font-size: 11px !important;">
                  {{ criteriaBreakdown.preferences.note }}
                </div>
              </div>
            </div>
          </div>

          <!-- Matched & Missing Skills Tags -->
          <div v-if="matchedSkills?.length || missingSkills?.length" class="mt-4 pt-3 border-t border-opacity-10">
            <div v-if="matchedSkills?.length" class="mb-2">
              <div class="text-caption font-weight-bold text-success mb-1">
                ✓ Matched Required Skills:
              </div>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="skill in matchedSkills" :key="skill" class="skill-tag skill-matched">
                  {{ skill }}
                </span>
              </div>
            </div>

            <div v-if="missingSkills?.length">
              <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">
                Missing Required Skills:
              </div>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="skill in missingSkills" :key="skill" class="skill-tag skill-missing">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </v-menu>

    <!-- Static Pill (when breakdown is disabled) -->
    <div
      v-else
      class="match-pill"
      :class="[badgeTone, `size-${size}`]"
    >
      <v-icon :size="iconSize" class="mr-1">{{ badgeIcon }}</v-icon>
      <span class="score-text">{{ Math.round(score || 0) }}%</span>
      <span v-if="size !== 'sm'" class="match-label ml-1">Match</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  score?: number;
  isMatch?: boolean;
  criteriaBreakdown?: any;
  matchedSkills?: string[];
  missingSkills?: string[];
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}>(), {
  score: 0,
  isMatch: false,
  criteriaBreakdown: null,
  matchedSkills: () => [],
  missingSkills: () => [],
  size: 'md',
  showBreakdown: true
});

const numScore = computed(() => Number(props.score) || 0);

const badgeTone = computed(() => {
  if (numScore.value >= 75) return 'tone-emerald';
  if (numScore.value >= 50) return 'tone-blue';
  if (numScore.value >= 30) return 'tone-amber';
  return 'tone-slate';
});

const badgeColor = computed(() => {
  if (numScore.value >= 75) return '#10b981';
  if (numScore.value >= 50) return '#3b82f6';
  if (numScore.value >= 30) return '#f59e0b';
  return '#64748b';
});

const headerBgClass = computed(() => {
  if (numScore.value >= 75) return 'bg-emerald-50';
  if (numScore.value >= 50) return 'bg-blue-50';
  if (numScore.value >= 30) return 'bg-amber-50';
  return 'bg-slate-50';
});

const badgeIcon = computed(() => {
  if (numScore.value >= 80) return 'mdi-star-check';
  if (numScore.value >= 60) return 'mdi-check-decagram';
  if (numScore.value >= 40) return 'mdi-check-circle-outline';
  return 'mdi-circle-medium';
});

const matchHeadline = computed(() => {
  if (numScore.value >= 80) return 'Strong Match';
  if (numScore.value >= 60) return 'Qualified Candidate';
  if (numScore.value >= 40) return 'Partial Match';
  return 'Low / Unmatched';
});

const iconSize = computed(() => {
  if (props.size === 'sm') return 13;
  if (props.size === 'lg') return 18;
  return 15;
});
</script>

<style scoped>
.candidate-match-wrapper {
  vertical-align: middle;
}

.match-pill {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  border-radius: 9999px;
  transition: all 0.15s ease;
  user-select: none;
}

.match-pill.size-sm {
  font-size: 11px;
  padding: 2px 8px;
}

.match-pill.size-md {
  font-size: 12px;
  padding: 4px 10px;
}

.match-pill.size-lg {
  font-size: 14px;
  padding: 6px 14px;
}

/* Tones */
.tone-emerald {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.tone-emerald:hover {
  background: #d1fae5;
}

.tone-blue {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}
.tone-blue:hover {
  background: #dbeafe;
}

.tone-amber {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}
.tone-amber:hover {
  background: #fef3c7;
}

.tone-slate {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.tone-slate:hover {
  background: #f1f5f9;
}

/* Popover Card */
.match-popover-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.popover-header {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.bg-emerald-50 {
  background-color: #f0fdf4;
}
.bg-blue-50 {
  background-color: #f0f9ff;
}
.bg-amber-50 {
  background-color: #fffbeb;
}
.bg-slate-50 {
  background-color: #f8fafc;
}

.score-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  background: #ffffff;
}

.criteria-list {
  gap: 12px;
}

.skill-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.skill-matched {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.skill-missing {
  background: #f8fafc;
  color: #64748b;
  border: 1px dashed #cbd5e1;
}
</style>
