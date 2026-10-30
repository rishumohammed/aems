<template>
  <div class="course-sidebar h-100 border-s bg-white d-flex flex-column">
    <div class="pa-4 border-b">
      <v-btn
        variant="tonal"
        color="primary"
        block
        prepend-icon="mdi-arrow-left"
        class="text-none font-weight-bold rounded-lg mb-3"
        to="/dashboard/student"
      >
        Back to Dashboard
      </v-btn>
      <div class="mb-3">
        <div class="text-caption text-primary font-weight-bold text-uppercase tracking-wider mb-1 d-flex align-center gap-1">
          <v-icon size="14">mdi-school-outline</v-icon>
          <span>Course</span>
        </div>
        <h3 class="text-subtitle-1 font-weight-black text-grey-darken-4 line-clamp-2 leading-snug" :title="courseTitle">
          {{ courseTitle || 'Course Content' }}
        </h3>
      </div>
      <UiProgressFraction
        :current="completedCount"
        :total="totalLessons"
        class="mt-1 mb-4"
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
        <v-list-group v-for="(section, sIndex) in curriculum" :key="section.id" :value="section.id">
          <template v-slot:activator="{ props: sectionProps }">
            <v-list-item
              v-bind="sectionProps"
              class="section-item font-weight-bold"
            >
              <template v-slot:prepend>
                <v-icon size="small" color="primary" class="mr-2">mdi-book-open-variant</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold text-body-2 text-truncate section-title-text">
                {{ formatSectionTitle(section.title, sIndex) }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <!-- Direct Lessons (when section is flattened / single dummy module) -->
          <template v-if="!hasMultipleModules(section)">
            <v-list-item
              v-for="lesson in getSectionLessons(section)"
              :key="lesson.id"
              :value="lesson.id"
              :active="String(lesson.id) === String(currentLessonId)"
              @click="onLessonSelect(lesson)"
              class="lesson-item pl-6"
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
              
              <v-list-item-title class="text-body-2" :class="{ 'text-grey': lesson.completed && String(lesson.id) !== String(currentLessonId), 'text-grey-lighten-1': lesson.is_locked }">
                {{ lesson.title }}
                <v-chip v-if="lesson.type === 'live'" size="x-small" color="primary" class="ml-2 font-weight-bold" variant="tonal">LIVE</v-chip>
                <v-chip v-if="lesson.is_free_preview" size="x-small" color="success" class="ml-2 font-weight-bold" variant="flat">PREVIEW</v-chip>
              </v-list-item-title>

              <template v-slot:append>
                <span v-if="lesson.type === 'video' && lesson.duration_seconds" class="text-caption text-grey">{{ formatDuration(lesson.duration_seconds) }}</span>
                <span v-else-if="lesson.type === 'live'" class="text-caption text-primary font-weight-bold">{{ lesson.duration_minutes }}m</span>
              </template>
            </v-list-item>
          </template>

          <!-- Nested Modules (if course genuinely has multiple modules per section) -->
          <template v-else>
            <v-list-group v-for="(module, mIndex) in section.modules" :key="module.id" :value="module.id">
              <template v-slot:activator="{ props: modProps }">
                <v-list-item
                  v-bind="modProps"
                  class="module-item font-weight-bold pl-6"
                >
                  <template v-slot:prepend>
                    <v-icon size="small" color="teal" class="mr-2">mdi-package-variant-closed</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium text-body-2 text-truncate module-title-text">
                    {{ formatModuleTitle(module.title, mIndex) }}
                  </v-list-item-title>
                </v-list-item>
              </template>

              <!-- Lessons under Module -->
              <v-list-item
                v-for="lesson in getModuleLessons(module)"
                :key="lesson.id"
                :value="lesson.id"
                :active="String(lesson.id) === String(currentLessonId)"
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
                
                <v-list-item-title class="text-body-2" :class="{ 'text-grey': lesson.completed && String(lesson.id) !== String(currentLessonId), 'text-grey-lighten-1': lesson.is_locked }">
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
          </template>
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
  courseTitle: { type: String, default: '' },
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

const hasMultipleModules = (section) => {
  if (!section || !section.modules || !Array.isArray(section.modules)) return false;
  if (section.modules.length > 1) return true;
  if (section.modules.length === 1) {
    const mod = section.modules[0];
    const isSameId = String(mod.id) === String(section.id);
    const isSameTitle = String(mod.title || '').trim().toLowerCase() === String(section.title || '').trim().toLowerCase();
    return !isSameId && !isSameTitle;
  }
  return false;
};

const formatSectionTitle = (title, index) => {
  if (!title || !title.trim() || title.trim().toLowerCase() === 'untitled section') {
    return `Section ${index + 1}`;
  }
  return title;
};

const formatModuleTitle = (title, index) => {
  if (!title || !title.trim() || title.trim().toLowerCase() === 'untitled module') {
    return `Module ${index + 1}`;
  }
  return title;
};

const getModuleLessons = (module) => {
  if (!module || !Array.isArray(module.lessons)) return [];
  const seen = new Set();
  return module.lessons.filter(l => {
    if (!l?.id || seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
};

const getSectionLessons = (section) => {
  if (!section) return [];
  let raw = [];
  if (section.lessons && Array.isArray(section.lessons) && section.lessons.length > 0) {
    raw = section.lessons;
  } else if (section.modules && Array.isArray(section.modules) && section.modules.length > 0) {
    raw = section.modules[0].lessons || [];
  }
  const seen = new Set();
  return raw.filter(l => {
    if (!l?.id || seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
};

// Auto-open section and module of current lesson
watch(() => props.currentLessonId, (newId) => {
  if (!newId || !props.curriculum) return;
  props.curriculum.forEach(section => {
    const secLessons = getSectionLessons(section);
    const hasLesson = secLessons.some(l => String(l.id) === String(newId));
    
    if (hasLesson) {
      if (!openedSections.value.includes(section.id)) {
        openedSections.value.push(section.id);
      }
      if (hasMultipleModules(section) && section.modules) {
        section.modules.forEach(mod => {
          const modLessons = getModuleLessons(mod);
          if (modLessons.some(l => String(l.id) === String(newId))) {
            if (!openedSections.value.includes(mod.id)) {
              openedSections.value.push(mod.id);
            }
          }
        });
      }
    }
  });
}, { immediate: true, deep: true });

const totalLessons = computed(() => {
  if (!props.curriculum || !Array.isArray(props.curriculum)) return 0;
  return props.curriculum.reduce((acc, s) => {
    if (hasMultipleModules(s) && s.modules) {
      return acc + s.modules.reduce((mAcc, m) => mAcc + getModuleLessons(m).length, 0);
    }
    return acc + getSectionLessons(s).length;
  }, 0);
});

const completedCount = computed(() => {
  if (!props.curriculum || !Array.isArray(props.curriculum)) return 0;
  return props.curriculum.reduce((acc, s) => {
    if (hasMultipleModules(s) && s.modules) {
      return acc + s.modules.reduce((mAcc, m) => mAcc + getModuleLessons(m).filter(l => l.completed).length, 0);
    }
    const lessons = getSectionLessons(s);
    return acc + lessons.filter(l => l.completed).length;
  }, 0);
});

const isCompleted = computed(() => {
  if (totalLessons.value > 0) {
    return completedCount.value >= totalLessons.value;
  }
  return Number(props.completionPercentage) === 100 && totalLessons.value > 0;
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
  color: #1e293b !important;
}
.section-title-text {
  color: #0f172a !important;
  font-weight: 700 !important;
  font-size: 0.875rem !important;
  letter-spacing: -0.01em;
}
.module-item {
  background: #f1f5f9;
  min-height: 44px !important;
  color: #334155 !important;
}
.module-title-text {
  color: #334155 !important;
  font-weight: 600 !important;
  font-size: 0.825rem !important;
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.leading-snug {
  line-height: 1.35;
}
</style>
