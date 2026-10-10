<template>
  <div class="course-sidebar h-100 border-s bg-white d-flex flex-column">
    <div class="pa-4 border-b">
      <v-btn
        variant="tonal"
        color="primary"
        block
        prepend-icon="mdi-arrow-left"
        class="text-none font-weight-bold rounded-lg mb-4"
        to="/dashboard/student"
      >
        Back to Dashboard
      </v-btn>
      <h3 class="text-subtitle-1 font-weight-bold">Course Content</h3>
      <UiProgressFraction
        :current="completedCount"
        :total="totalLessons"
        class="mt-2 mb-4"
      />

      <v-btn
        v-if="isCompleted && hasExam && !passedExam"
        color="warning"
        block
        class="text-none font-weight-black rounded-lg shadow-glow mb-2"
        to="/dashboard/exams"
      >
        Take Exam 📝
      </v-btn>

      <v-btn
        v-else-if="isCompleted && (!hasExam || passedExam) && enableCertificate !== false"
        color="success"
        block
        prepend-icon="mdi-certificate-outline"
        class="text-none font-weight-black rounded-lg shadow-glow mb-2"
        @click="$emit('claim-certificate')"
        :loading="claimingCertificate"
      >
        Claim Certificate 🎓
      </v-btn>

      <v-chip
        v-else-if="isCompleted && (!hasExam || passedExam) && enableCertificate === false"
        color="success"
        variant="tonal"
        size="large"
        block
        class="justify-center font-weight-bold mb-2 py-3 rounded-lg"
      >
        <v-icon start color="success">mdi-check-decagram</v-icon>
        Course Completed 🎉
      </v-chip>
    </div>

    <!-- Tab switcher: Curriculum vs Study Materials -->
    <div class="px-2 border-b bg-grey-lighten-5">
      <v-tabs v-model="sidebarTab" color="primary" density="compact" grow>
        <v-tab value="curriculum" class="text-caption font-weight-bold">
          <v-icon start size="16">mdi-format-list-bulleted</v-icon>
          Curriculum
        </v-tab>
        <v-tab value="materials" class="text-caption font-weight-bold">
          <v-icon start size="16">mdi-folder-download-outline</v-icon>
          Materials
          <v-chip v-if="studyMaterials.length > 0" size="x-small" color="primary" class="ml-1 font-weight-bold" variant="tonal">
            {{ studyMaterials.length }}
          </v-chip>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Curriculum View -->
    <div v-if="sidebarTab === 'curriculum'" class="flex-grow-1 overflow-y-auto">
      <v-list v-model:opened="openedSections" select-strategy="single-independent">
        <v-list-group v-for="section in curriculum" :key="section.id" :value="section.id">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="section.title"
              class="section-item font-weight-bold"
            >
              <template v-slot:prepend>
                <v-icon size="small" color="primary">mdi-book-open-variant</v-icon>
              </template>
            </v-list-item>
          </template>

          <!-- Nested Modules -->
          <v-list-group v-for="module in section.modules" :key="module.id" :value="module.id">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="module.title"
                class="module-item font-weight-bold pl-6"
              >
                <template v-slot:prepend>
                  <v-icon size="small" color="teal">mdi-package-variant-closed</v-icon>
                </template>
              </v-list-item>
            </template>

            <!-- Lessons under Modules -->
            <v-list-item
              v-for="lesson in module.lessons"
              :key="lesson.id"
              :value="lesson.id"
              :active="lesson.id === currentLessonId"
              @click="onLessonSelect(lesson)"
              class="lesson-item pl-10"
              :class="{ 'completed': lesson.completed }"
              active-color="primary"
            >
              <template v-slot:prepend>
                <v-icon 
                  v-if="lesson.is_locked"
                  color="grey-lighten-1"
                  size="small"
                >
                  mdi-lock-outline
                </v-icon>
                <v-icon 
                  v-else
                  :color="lesson.completed ? 'success' : (lesson.type === 'live' ? 'primary' : 'grey')" 
                  size="small"
                >
                  {{ lesson.completed ? 'mdi-check-circle' : 
                     (lesson.type === 'video' ? 'mdi-play-circle-outline' : 
                     (lesson.type === 'live' ? 'mdi-broadcast' : 
                     (lesson.type === 'quiz' ? 'mdi-help-circle-outline' :
                     (lesson.type === 'assignment' ? 'mdi-clipboard-edit-outline' : 'mdi-file-document-outline')))) }}
                </v-icon>
              </template>
              
              <v-list-item-title class="text-body-2" :class="{ 'text-grey': lesson.completed && lesson.id !== currentLessonId, 'text-grey-lighten-1': lesson.is_locked }">
                {{ lesson.title }}
                <v-chip v-if="lesson.type === 'live'" size="x-small" color="primary" class="ml-2 font-weight-bold" variant="tonal">LIVE</v-chip>
                <v-chip v-if="lesson.is_free_preview" size="x-small" color="success" class="ml-2 font-weight-bold" variant="flat">PREVIEW</v-chip>
              </v-list-item-title>

              <template v-slot:append>
                <span v-if="lesson.type === 'video' && lesson.duration_seconds" class="text-caption text-grey">{{ formatDuration(lesson.duration_seconds) }}</span>
                <span v-else-if="lesson.type === 'live'" class="text-caption text-primary font-weight-bold">{{ lesson.duration_minutes }}m</span>
              </template>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
    </div>

    <!-- Study Materials View -->
    <div v-else class="flex-grow-1 overflow-y-auto pa-3 d-flex flex-column">
      <div v-if="!studyMaterials || studyMaterials.length === 0" class="text-center pa-6 text-grey flex-grow-1 d-flex flex-column align-center justify-center">
        <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-folder-open-outline</v-icon>
        <div class="text-subtitle-2 font-weight-bold">No Study Materials</div>
        <div class="text-caption mt-1">
          No study materials uploaded for this course yet.
        </div>
      </div>

      <div v-else class="d-flex flex-column gap-2">
        <v-card
          v-for="mat in studyMaterials"
          :key="mat.id"
          variant="outlined"
          rounded="lg"
          class="pa-3 bg-white"
        >
          <div class="d-flex align-start gap-2">
            <v-avatar :color="getMaterialColor(mat.file_type || mat.file_name)" size="36" rounded="lg" class="flex-shrink-0">
              <v-icon color="white" size="20">{{ getMaterialIcon(mat.file_type || mat.file_name) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1 overflow-hidden">
              <div class="font-weight-bold text-body-2 text-truncate" :title="mat.title">{{ mat.title }}</div>
              <div class="text-caption text-grey text-truncate mt-0.5" v-if="mat.description">
                {{ mat.description }}
              </div>
              <div class="d-flex align-center gap-2 mt-1">
                <v-chip size="x-small" variant="tonal" :color="getMaterialColor(mat.file_type || mat.file_name)">
                  {{ formatFileType(mat.file_type || mat.file_name) }}
                </v-chip>
                <span class="text-caption text-grey font-weight-medium" v-if="mat.file_size">
                  {{ formatFileSize(mat.file_size) }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center justify-end gap-1 mt-2 pt-2 border-t">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              density="comfortable"
              prepend-icon="mdi-book-open-page-variant"
              @click="openMaterial(mat)"
            >
              Read Material
            </v-btn>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Protected In-Browser PDF Viewer with Dynamic Watermarking -->
    <ProtectedPdfViewer
      v-model="protectedViewer.show"
      :course-id="courseId || (studyMaterials[0]?.course_id || '')"
      :material="protectedViewer.material"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import ProtectedPdfViewer from '@/components/lms/ProtectedPdfViewer.vue';

const props = defineProps({
  curriculum: { type: Array, required: true },
  currentLessonId: { type: String, required: true },
  courseId: { type: String, default: '' },
  completionPercentage: { type: Number, default: 0 },
  hasExam: { type: Boolean, default: false },
  passedExam: { type: Boolean, default: false },
  claimingCertificate: { type: Boolean, default: false },
  enableCertificate: { type: Boolean, default: true },
  studyMaterials: { type: Array, default: () => [] }
});

const emit = defineEmits(['select', 'claim-certificate']);

const config = useRuntimeConfig();
const sidebarTab = ref('curriculum');
const protectedViewer = reactive({ show: false, material: null });

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = config.public.apiBase.replace('/api', '');
  return `${base}${url}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const num = Number(bytes);
  if (isNaN(num)) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const formatFileType = (typeOrName) => {
  if (!typeOrName) return 'FILE';
  const str = String(typeOrName).toLowerCase();
  if (str.includes('pdf')) return 'PDF';
  if (str.includes('word') || str.includes('doc')) return 'DOCX';
  if (str.includes('excel') || str.includes('sheet') || str.includes('xls') || str.includes('csv')) return 'XLS';
  if (str.includes('presentation') || str.includes('powerpoint') || str.includes('ppt')) return 'PPT';
  if (str.includes('zip') || str.includes('rar') || str.includes('7z') || str.includes('tar')) return 'ZIP';
  if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) return 'IMG';
  const ext = str.split('.').pop();
  return ext && ext.length <= 4 ? ext.toUpperCase() : 'FILE';
};

const getMaterialIcon = (typeOrName) => {
  const str = String(typeOrName || '').toLowerCase();
  if (str.includes('pdf')) return 'mdi-file-pdf-box';
  if (str.includes('word') || str.includes('doc')) return 'mdi-file-word-box';
  if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv')) return 'mdi-file-excel-box';
  if (str.includes('presentation') || str.includes('powerpoint') || str.includes('ppt')) return 'mdi-file-powerpoint-box';
  if (str.includes('zip') || str.includes('rar') || str.includes('7z') || str.includes('tar') || str.includes('gz')) return 'mdi-folder-zip-outline';
  if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) return 'mdi-file-image-outline';
  return 'mdi-file-document-outline';
};

const getMaterialColor = (typeOrName) => {
  const str = String(typeOrName || '').toLowerCase();
  if (str.includes('pdf')) return 'red-darken-1';
  if (str.includes('word') || str.includes('doc')) return 'blue-darken-2';
  if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv')) return 'teal-darken-1';
  if (str.includes('presentation') || str.includes('powerpoint') || str.includes('ppt')) return 'deep-orange-darken-1';
  if (str.includes('zip') || str.includes('rar') || str.includes('7z')) return 'amber-darken-3';
  if (str.includes('image') || str.includes('png') || str.includes('jpg')) return 'purple-darken-1';
  return 'primary';
};

const isPdf = (urlOrName) => {
  return String(urlOrName || '').toLowerCase().includes('.pdf');
};

const openMaterial = (mat) => {
  protectedViewer.material = mat;
  protectedViewer.show = true;
};

const openedSections = ref([]);

// Auto-open section and module of current lesson
watch(() => props.currentLessonId, (newId) => {
  if (!newId || !props.curriculum) return;
  props.curriculum.forEach(section => {
    if (section.modules) {
      section.modules.forEach(mod => {
        if (mod.lessons && mod.lessons.some(l => l.id === newId)) {
          if (!openedSections.value.includes(section.id)) {
            openedSections.value.push(section.id);
          }
          if (!openedSections.value.includes(mod.id)) {
            openedSections.value.push(mod.id);
          }
        }
      });
    }
  });
}, { immediate: true, deep: true });

const totalLessons = computed(() => {
  return props.curriculum.reduce((acc, s) => {
    return acc + (s.modules || []).reduce((mAcc, m) => mAcc + (m.lessons || []).length, 0);
  }, 0);
});

const completedCount = computed(() => {
  return props.curriculum.reduce((acc, s) => {
    return acc + (s.modules || []).reduce((mAcc, m) => mAcc + (m.lessons || []).filter(l => l.completed).length, 0);
  }, 0);
});

const isCompleted = computed(() => {
  if (props.completionPercentage === 100) return true;
  return totalLessons.value > 0 && completedCount.value === totalLessons.value;
});

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const onLessonSelect = (lesson) => {
  emit('select', lesson);
};
</script>

<style scoped>
.course-sidebar {
  width: 350px;
}
.section-item {
  background: #f8fafc;
  min-height: 48px !important;
}
.module-item {
  background: #f1f5f9;
  min-height: 44px !important;
}
.lesson-item {
  min-height: 40px !important;
  border-left: 3px solid transparent;
}
.lesson-item.v-list-item--active {
  border-left-color: var(--v-primary-base);
  background: #eff6ff;
}
.lesson-item.completed:not(.v-list-item--active) {
  opacity: 0.8;
}
.shadow-glow {
  
  transition: all 0.3s ease;
  border: 1px solid var(--border);
}
.shadow-glow:hover {
  transform: translateY(-2px);
  border: 1px solid var(--border);
  
}
</style>
