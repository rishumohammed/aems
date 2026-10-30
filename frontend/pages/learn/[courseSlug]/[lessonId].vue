<template>
  <v-app>
    <div class="lesson-viewer d-flex flex-column flex-md-row h-screen overflow-hidden bg-grey-lighten-5">
    <!-- Main Content Area -->
    <div class="flex-grow-1 d-flex flex-column h-100 overflow-y-auto content-scroll-area" ref="mainContentRef">
      <!-- Top Navigation (Mobile) -->
      <v-toolbar flat class="d-md-none px-4 bg-white border-b" density="comfortable">
        <v-btn icon="mdi-menu" @click="drawer = !drawer"></v-btn>
        <div class="overflow-hidden flex-grow-1 pr-2">
          <div v-if="courseTitle" class="text-caption text-primary font-weight-bold text-truncate leading-tight">
            {{ courseTitle }}
          </div>
          <div class="text-subtitle-2 font-weight-bold text-truncate leading-tight text-grey-darken-3">
            {{ currentLesson?.title }}
          </div>
        </div>
        <v-btn icon="mdi-arrow-left" color="primary" variant="text" to="/dashboard/student" title="Back to Dashboard"></v-btn>
      </v-toolbar>

      <!-- Top Navigation (Desktop) -->
      <div class="d-none d-md-flex align-center justify-space-between px-6 py-3 bg-white border-b sticky-header">
        <div class="d-flex align-center gap-3 overflow-hidden">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-arrow-left"
            class="text-none font-weight-bold rounded-lg flex-shrink-0"
            to="/dashboard/student"
          >
            Dashboard
          </v-btn>
          <v-divider vertical inset style="height: 20px;"></v-divider>
          <div class="d-flex align-center gap-2 overflow-hidden text-no-wrap">
            <v-icon size="18" color="primary" class="flex-shrink-0">mdi-school-outline</v-icon>
            <span class="text-subtitle-2 font-weight-black text-grey-darken-4 text-truncate" :title="courseTitle">
              {{ courseTitle }}
            </span>
            <template v-if="currentSectionTitle">
              <v-icon size="14" color="grey-lighten-1" class="flex-shrink-0">mdi-chevron-right</v-icon>
              <span class="text-caption text-grey-darken-1 text-truncate" :title="currentSectionTitle">
                {{ currentSectionTitle }}
              </span>
            </template>
            <template v-if="currentLesson?.title">
              <v-icon size="14" color="grey-lighten-1" class="flex-shrink-0">mdi-chevron-right</v-icon>
              <span class="text-caption font-weight-medium text-grey-darken-2 text-truncate" :title="currentLesson?.title">
                {{ currentLesson?.title }}
              </span>
            </template>
          </div>
        </div>
        <div class="d-flex align-center gap-3 flex-shrink-0 ml-4">
          <v-chip
            v-if="enrollment?.completion_percentage !== undefined"
            size="small"
            color="primary"
            variant="tonal"
            class="font-weight-bold"
          >
            <v-icon start size="14">mdi-chart-donut</v-icon>
            {{ Math.round(enrollment?.completion_percentage || 0) }}% Completed
          </v-chip>
        </div>
      </div>

      <!-- Locked State Overlay -->
      <div v-if="currentLesson?.is_locked" class="locked-overlay d-flex flex-column align-center justify-center pa-12 text-center flex-grow-1 bg-grey-lighten-4">
        <v-avatar color="primary-lighten-5" size="100" class="mb-6">
          <v-icon color="primary" size="48">mdi-lock-outline</v-icon>
        </v-avatar>
        <h2 class="text-h4 font-weight-black mb-4">This lesson is locked</h2>
        
        <template v-if="enrollment?.status === 'suspended_offline'">
          <p class="text-body-1 text-grey-darken-1 mb-8 max-width-500 mx-auto">
            Payment waiting for approval, For more details contact Support
          </p>
          <v-btn variant="text" color="primary" class="mt-4 text-none font-weight-bold" @click="navigateToFirstPreview">
            Watch Free Preview
          </v-btn>
        </template>
        <template v-else>
          <p class="text-body-1 text-grey-darken-1 mb-8 max-width-500 mx-auto">
            Your payment for <span class="font-weight-bold text-grey-darken-4">{{ enrollment?.title || 'this course' }}</span> is incomplete. Please settle your pending invoice to unlock this lesson.
          </p>
          <v-btn color="primary" size="large" rounded="pill" class="px-10 font-weight-black" to="/dashboard/finance">
            Complete Payment
          </v-btn>
          <v-btn variant="text" color="primary" class="mt-4 text-none font-weight-bold" @click="navigateToFirstPreview">
            Watch Free Preview
          </v-btn>
        </template>
      </div>

      <!-- Video Area -->
      <div v-else class="pa-4 pa-md-8">
        <div v-if="currentLesson?.type === 'video'" class="video-wrapper">
          <VideoPlayer
            :key="currentLesson.id"
            :source="currentLesson.video_source"
            :video-id="currentLesson.video_id"
            :last-watched-seconds="currentLesson.watched_seconds || 0"
            :enrollment-id="enrollment?.id"
            :lesson-id="currentLesson.id"
            @complete="onLessonComplete"
            @progress="onProgress"
          />
        </div>

        <!-- Resource / Protected PDF Viewer -->
        <div v-else-if="currentLesson?.type === 'resource'" class="resource-viewer">
          <v-card class="rounded-xl pa-8 pa-md-12 bg-white text-center border-0 elevation-2" border>
            <v-avatar color="red-lighten-5" size="80" class="mb-6">
              <v-icon color="red-darken-2" size="40">mdi-file-pdf-box</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black mb-2">{{ currentLesson.title || 'Protected Study Material' }}</h2>
            <p class="text-body-1 text-grey mb-8 max-width-600 mx-auto">
              This lesson contains protected study material. You can read the full document online with our secure, watermarked in-browser reader.
            </p>
            
            <div class="d-inline-block">
              <v-btn
                color="primary"
                size="large"
                rounded="xl"
                prepend-icon="mdi-book-open-page-variant"
                class="px-8 font-weight-bold elevation-4 text-white"
                @click="openMatPreview(currentLesson)"
              >
                Read Protected PDF
              </v-btn>
            </div>
          </v-card>
        </div>

        <!-- Reading Material (Text Lesson) -->
        <div v-else-if="currentLesson?.type === 'text'" class="reading-material-viewer">
          <v-card class="rounded-xl pa-8 pa-md-12 bg-white border-0 elevation-2" border>
            <div class="d-flex align-center mb-6">
              <v-avatar color="primary-lighten-5" size="56" class="mr-4">
                <v-icon color="primary" size="28">mdi-book-open-page-variant-outline</v-icon>
              </v-avatar>
              <div>
                <span class="text-overline text-primary font-weight-bold tracking-wider">Reading Lesson</span>
                <h2 class="text-h4 font-weight-black tracking-tight mt-1">{{ currentLesson.title }}</h2>
              </div>
            </div>
            
            <v-divider class="mb-8"></v-divider>

            <!-- Main Text Content -->
            <div 
              v-if="currentLesson.content_html || currentLesson.notes" 
              class="reading-content text-body-1 text-grey-darken-3 line-height-relaxed"
              v-html="currentLesson.content_html || currentLesson.notes"
            ></div>
            
            <!-- Empty State for Reading Content -->
            <div v-else class="py-12 text-center text-grey">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-text-box-remove-outline</v-icon>
              <h3 class="text-h6 font-weight-bold">No Content Provided</h3>
              <p class="text-body-2 mt-2">This reading lesson does not have any content yet. Please check back later or contact your instructor.</p>
            </div>
          </v-card>
        </div>

        <!-- Assignment Viewer -->
        <div v-else-if="currentLesson?.type === 'assignment'" class="assignment-area">
          <AssignmentViewer
            :assignment-id="currentLesson.assignment_id"
            :course-id="enrollment?.course_id"
            :enrollment-id="enrollment?.id"
            @complete="onLessonComplete"
          />
        </div>

        <!-- Quiz Viewer -->
        <div v-else-if="currentLesson?.type === 'quiz'" class="quiz-area">
          <v-card v-if="loadingExamState" class="pa-12 text-center rounded-xl bg-amber-lighten-5" flat border>
            <v-progress-circular indeterminate color="amber"></v-progress-circular>
          </v-card>
          
          <v-card v-else-if="examAttempt && examAttempt.passed" class="pa-12 text-center rounded-xl bg-success-lighten-5" flat border>
            <v-avatar color="success" size="64" class="mb-4">
              <v-icon color="white" size="32">mdi-check-circle-outline</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black mt-2 text-success">Exam Completed</h2>
            <p class="text-body-1 mt-2 mb-8 text-success-darken-1">Score: {{ examAttempt.score }}%</p>
            <v-btn v-if="nextLesson" color="success" size="large" rounded="xl" append-icon="mdi-chevron-right" @click="navigateToLesson(nextLesson)" elevation="4" class="px-8 font-weight-bold">
              Continue to Next Module
            </v-btn>
          </v-card>

          <v-card v-else-if="examAttempt && !examAttempt.passed && examAttempt.status !== 'in_progress'" class="pa-12 text-center rounded-xl bg-error-lighten-5" flat border>
            <v-avatar color="error" size="64" class="mb-4">
              <v-icon color="white" size="32">mdi-close-circle-outline</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black mt-2 text-error">Exam Not Passed</h2>
            <p class="text-body-1 mt-2 mb-8 text-error-darken-1">Score: {{ examAttempt.score }}%</p>
            <v-btn color="error" size="large" rounded="xl" prepend-icon="mdi-refresh" @click="takeQuiz" elevation="4" class="px-8 font-weight-bold">
              Retry Exam
            </v-btn>
          </v-card>

          <v-card v-else class="pa-12 text-center rounded-xl bg-amber-lighten-5" flat border>
            <v-avatar color="amber" size="64" class="mb-4">
              <v-icon color="white" size="32">mdi-help-circle-outline</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black mt-2">Lesson Exam</h2>
            <p class="text-body-1 mt-2 mb-8" v-if="currentLesson.is_mandatory">This is a mandatory exam. You must pass it to proceed.</p>
            <p class="text-body-1 mt-2 mb-8" v-else>Test your knowledge of this section before moving forward.</p>
            <v-btn color="amber-darken-3" size="large" rounded="xl" prepend-icon="mdi-play-circle" @click="takeQuiz" elevation="4" class="px-8 font-weight-bold">
              {{ examAttempt && examAttempt.status === 'in_progress' ? 'Continue Exam' : 'Start Exam' }}
            </v-btn>
          </v-card>
        </div>

        <v-card v-else-if="currentLesson?.type === 'live'" class="pa-12 text-center rounded-xl bg-primary-lighten-5" flat border>
          <v-icon size="64" color="primary">mdi-video-outline</v-icon>
          <h2 class="text-h5 font-weight-black mt-4">Live Interactive Session</h2>
          <p class="text-body-1 mt-2 mb-6">
            Scheduled for {{ formatDateTime(currentLesson.scheduled_at) }}
            <br>
            <span class="text-caption">Duration: {{ currentLesson.duration_minutes }} minutes</span>
          </p>
          
          <div v-if="isSessionJoinable">
            <v-btn color="primary" size="large" rounded="xl" prepend-icon="mdi-video" :href="currentLesson.zoom_link || currentLesson.live_link" target="_blank" elevation="8" class="px-8 font-weight-bold">
              Join Now
            </v-btn>
            <p class="text-caption mt-4 text-success font-weight-bold animate-pulse">Session is currently live!</p>
          </div>
          <div v-else-if="isSessionUpcoming">
            <div v-if="liveCountdown" class="text-h3 font-weight-black text-primary mb-6" style="font-variant-numeric: tabular-nums;">
              {{ liveCountdown }}
            </div>
            <v-btn color="grey" size="large" rounded="xl" prepend-icon="mdi-clock-outline" disabled class="px-8">
              Waiting for Session...
            </v-btn>
            <p class="text-caption mt-4">The join button will appear 10 minutes before the scheduled time.</p>
          </div>
          <div v-else>
            <v-alert type="warning" variant="tonal" class="rounded-xl mx-auto" max-width="400">
              This live session has ended. Recording will be available soon.
            </v-alert>
          </div>
        </v-card>

        <!-- Fallback / Catch-All -->
        <v-card v-else class="pa-12 text-center rounded-xl" flat border>
          <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
          <h2 class="text-h5 font-weight-bold mt-4">Unknown Lesson Type</h2>
          <p class="text-grey mt-2">This lesson type is not recognized. Please proceed to the next lesson or contact support.</p>
        </v-card>

        <!-- Lesson Info -->
        <div class="mt-8">
          <div v-if="courseTitle" class="d-flex align-center gap-2 mb-2 text-caption font-weight-bold text-primary">
            <v-icon size="15">mdi-school-outline</v-icon>
            <span class="course-name-badge">{{ courseTitle }}</span>
            <template v-if="currentSectionTitle">
              <v-icon size="13" color="grey-lighten-1">mdi-chevron-right</v-icon>
              <span class="text-grey-darken-1 font-weight-medium">{{ currentSectionTitle }}</span>
            </template>
          </div>
          <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-4">
            <h1 class="text-h4 font-weight-black">{{ currentLesson?.title }}</h1>
            <div class="d-flex align-center flex-wrap gap-3 lesson-nav-actions">
              <v-btn
                variant="outlined"
                rounded="lg"
                prepend-icon="mdi-chevron-left"
                :disabled="!prevLesson"
                @click="navigateToLesson(prevLesson)"
                class="font-weight-bold"
              >
                Previous
              </v-btn>
              <v-btn
                v-if="!(currentLesson?.type === 'quiz' && currentLesson?.is_mandatory) && !currentLesson?.completed"
                color="success"
                rounded="lg"
                prepend-icon="mdi-check-circle-outline"
                @click="markComplete"
                :loading="markingComplete"
                class="font-weight-bold"
              >
                <span class="d-none d-sm-inline">Mark as </span>Complete
              </v-btn>
              <v-btn
                v-if="nextLesson"
                color="primary"
                rounded="lg"
                append-icon="mdi-chevron-right"
                :disabled="currentLesson?.type === 'quiz' && currentLesson?.is_mandatory && !currentLesson?.completed"
                @click="navigateToLesson(nextLesson)"
                class="font-weight-bold"
              >
                Next
              </v-btn>
              <v-btn
                v-else-if="enrollment?.has_exam && !enrollment?.passed_exam"
                color="warning"
                rounded="lg"
                append-icon="mdi-file-document-edit"
                to="/dashboard/exams"
                class="font-weight-bold"
              >
                Take Exam
              </v-btn>
              <v-btn
                v-else-if="enrollment?.enable_certificate !== false"
                color="success"
                rounded="lg"
                append-icon="mdi-certificate"
                @click="showCompletionModal = true"
                class="font-weight-bold"
              >
                Claim Certificate
              </v-btn>
            </div>
          </div>

          <v-tabs v-model="infoTab" color="primary">
            <v-tab value="description">Description</v-tab>
            <v-tab value="materials">
              <v-icon start size="18">mdi-folder-download-outline</v-icon>
              Study Materials
              <v-chip v-if="studyMaterials.length > 0" size="x-small" color="primary" class="ml-1 font-weight-bold" variant="tonal">
                {{ studyMaterials.length }}
              </v-chip>
            </v-tab>
          </v-tabs>

          <v-window v-model="infoTab" class="mt-6">
            <v-window-item value="description">
              <v-card flat class="bg-transparent">
                <div class="text-body-1" v-html="currentLesson?.content_html || currentLesson?.notes || currentLesson?.description || 'No description provided.'"></div>
              </v-card>
            </v-window-item>
            <v-window-item value="materials">
              <!-- Materials Cards Grid -->
              <v-row v-if="studyMaterials.length > 0">
                <v-col v-for="mat in studyMaterials" :key="mat.id" cols="12" sm="6" lg="4">
                  <v-card flat border rounded="xl" class="pa-4 h-100 d-flex flex-column bg-white elevation-1">
                    <div class="d-flex align-start gap-3 mb-3">
                      <v-avatar :color="getMatColor(mat.file_type || mat.file_name)" size="44" rounded="lg">
                        <v-icon color="white" size="24">{{ getMatIcon(mat.file_type || mat.file_name) }}</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1 overflow-hidden">
                        <div class="font-weight-bold text-body-1 text-truncate" :title="mat.title">{{ mat.title }}</div>
                        <div class="d-flex align-center gap-2 mt-1">
                          <v-chip size="x-small" variant="tonal" :color="getMatColor(mat.file_type || mat.file_name)" class="font-weight-bold">
                            {{ formatMatType(mat.file_type || mat.file_name) }}
                          </v-chip>
                          <span class="text-caption text-grey" v-if="mat.file_size">
                            {{ formatMatSize(mat.file_size) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="text-body-2 text-grey-darken-1 flex-grow-1 mb-4" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" v-if="mat.description">
                      {{ mat.description }}
                    </div>
                    <div class="text-caption text-grey flex-grow-1 mb-4 text-truncate" v-else>
                      {{ mat.file_name || 'Downloadable attachment' }}
                    </div>

                    <div class="d-flex align-center justify-end gap-2 pt-3 border-t">
                      <v-btn
                        size="small"
                        variant="flat"
                        color="primary"
                        rounded="lg"
                        prepend-icon="mdi-book-open-page-variant"
                        @click="openMatPreview(mat)"
                      >
                        Read Material
                      </v-btn>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-card v-else flat border rounded="xl" class="pa-10 text-center bg-white">
                <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-folder-open-outline</v-icon>
                <div class="text-h6 font-weight-bold text-grey-darken-2">No Study Materials Found</div>
                <div class="text-body-2 text-grey mt-1">
                  {{ materialSearch ? 'No materials match your search filter.' : 'Your instructor has not uploaded any study materials for this course yet.' }}
                </div>
              </v-card>
            </v-window-item>
          </v-window>

        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <div class="d-none d-md-block h-100">
      <CourseSidebar
        :curriculum="curriculum"
        :current-lesson-id="lessonId"
        :course-id="enrollment?.course_id || courseSlug"
        :course-title="courseTitle"
        :study-materials="studyMaterials"
        :completion-percentage="enrollment?.completion_percentage || 0"
        :has-exam="enrollment?.has_exam === 1 || enrollment?.has_exam === true || enrollment?.has_exam === '1'"
        :passed-exam="enrollment?.passed_exam === 1 || enrollment?.passed_exam === true || enrollment?.passed_exam === '1'"
        :claiming-certificate="claimingCertificate"
        :enable-certificate="enrollment?.enable_certificate !== false && enrollment?.enable_certificate !== 0 && enrollment?.enable_certificate !== '0'"
        @select="navigateToLesson"
        @claim-certificate="showCompletionModal = true"
      />
    </div>

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="drawer" temporary class="d-md-none" width="350">
      <CourseSidebar
        :curriculum="curriculum"
        :current-lesson-id="lessonId"
        :course-id="enrollment?.course_id || courseSlug"
        :course-title="courseTitle"
        :study-materials="studyMaterials"
        :completion-percentage="enrollment?.completion_percentage || 0"
        :has-exam="enrollment?.has_exam === 1 || enrollment?.has_exam === true || enrollment?.has_exam === '1'"
        :passed-exam="enrollment?.passed_exam === 1 || enrollment?.passed_exam === true || enrollment?.passed_exam === '1'"
        :claiming-certificate="claimingCertificate"
        :enable-certificate="enrollment?.enable_certificate !== false && enrollment?.enable_certificate !== 0 && enrollment?.enable_certificate !== '0'"
        @select="navigateToLesson"
        @claim-certificate="showCompletionModal = true"
      />
    </v-navigation-drawer>
    </div>

    <!-- Protected In-Browser PDF Viewer with Dynamic Watermarking -->
    <ProtectedPdfViewer
      v-model="protectedViewer.show"
      :course-id="enrollment?.course_id || courseSlug"
      :material="protectedViewer.material"
    />

    <!-- Completion Modal -->
    <v-dialog v-model="showCompletionModal" max-width="650" persistent z-index="9999">
      <CourseCompletionCard 
        v-if="enrollment"
        :course="enrollment" 
        :showCelebration="true"
        @download-certificate="claimCertificate"
      />
      <div class="text-center mt-4">
        <v-btn variant="text" class="text-none font-weight-bold" @click="showCompletionModal = false">Close</v-btn>
      </div>
    </v-dialog>

  </v-app>
</template>

<script setup>
import ProtectedPdfViewer from '@/components/lms/ProtectedPdfViewer.vue';
import VideoPlayer from '@/components/lms/VideoPlayer.vue';
import CourseSidebar from '@/components/lms/CourseSidebar.vue';
import QASection from '@/components/lms/QASection.vue';
import AssignmentViewer from '@/components/lms/AssignmentViewer.vue';
import CourseCompletionCard from '@/components/student/CourseCompletionCard.vue';
import dayjs from 'dayjs';
const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();
const courseSlug = computed(() => route.params.courseSlug);
const lessonId = computed(() => route.params.lessonId);

// Compute full URL for resource files (paths are relative like /uploads/resources/file.pdf)
const resourceFullUrl = computed(() => {
  if (!currentLesson.value?.resource_url) return '';
  const base = config.public.apiBase.replace('/api', '');
  return base + currentLesson.value.resource_url;
});

const drawer = ref(false);
const mainContentRef = ref(null);
const infoTab = ref('description');
const curriculum = ref([]);
const enrollment = ref(null);
const currentLesson = ref(null);
const studyMaterials = ref([]);
const protectedViewer = reactive({ show: false, material: null });
const markingComplete = ref(false);
const claimingCertificate = ref(false);
const showCompletionModal = ref(false);
const examAttempt = ref(null);
const loadingExamState = ref(false);

const courseTitle = computed(() => {
  return enrollment.value?.title || enrollment.value?.course_title || '';
});

const currentSectionTitle = computed(() => {
  if (!currentLesson.value || !curriculum.value?.length) return '';
  for (let i = 0; i < curriculum.value.length; i++) {
    const sect = curriculum.value[i];
    const lessons = sect.lessons || sect.modules?.flatMap(m => m.lessons || []) || [];
    if (lessons.some(l => String(l.id) === String(currentLesson.value?.id))) {
      const title = sect.title;
      if (!title || !title.trim() || title.trim().toLowerCase() === 'untitled section') {
        return `Section ${i + 1}`;
      }
      return title;
    }
  }
  return '';
});

useHead({
  title: () => {
    const lTitle = currentLesson.value?.title;
    const cTitle = courseTitle.value;
    if (lTitle && cTitle) return `${lTitle} - ${cTitle}`;
    if (cTitle) return cTitle;
    return 'Course Player';
  }
});

const extractLessons = (curr) => {
  if (!curr || !Array.isArray(curr)) return [];
  const raw = curr.flatMap(c => {
    if (c.modules && c.modules.length > 0) {
      return c.modules.flatMap(m => m.lessons || []);
    }
    return c.lessons || [];
  });
  const seen = new Set();
  return raw.filter(l => {
    if (!l?.id || seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
};

const loadExamState = async () => {
  if (currentLesson.value?.type !== 'quiz' || !currentLesson.value?.quiz_id) return;
  loadingExamState.value = true;
  try {
    const { data } = await api.get('/lms/student/exam-attempts');
    const attempts = data.filter(a => a.exam_id === currentLesson.value.quiz_id);
    if (attempts.length > 0) {
      const passedAttempt = attempts.find(a => a.passed);
      if (passedAttempt) {
        examAttempt.value = passedAttempt;
      } else {
        examAttempt.value = attempts[0];
      }
    } else {
      examAttempt.value = null;
    }
  } catch(e) {
    console.error(e);
  } finally {
    loadingExamState.value = false;
  }
}

const router = useRouter();

const fetchData = async () => {
  try {
    const slugStr = String(courseSlug.value || '').trim().toLowerCase();

    // If curriculum is already loaded for this course, update currentLesson without reloading all APIs
    if (curriculum.value.length > 0 && enrollment.value) {
      const allLessons = extractLessons(curriculum.value);
      const targetLesson = allLessons.find(l => String(l.id).toLowerCase() === String(lessonId.value || '').toLowerCase());
      if (targetLesson) {
        currentLesson.value = targetLesson;
        await loadExamState();
        if (mainContentRef.value) {
          mainContentRef.value.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
    }

    // 1. Try finding enrollment from dashboard
    let enroll = null;
    try {
      const resDashboard = await api.get('/lms/student/dashboard');
      const enrollments = resDashboard.data?.enrollments || resDashboard.enrollments || [];
      enroll = enrollments.find(e => 
        (e.slug && e.slug.toLowerCase() === slugStr) || 
        e.course_id === courseSlug.value || 
        e.id === courseSlug.value
      );
    } catch (e) {
      console.warn('Dashboard fetch error in lesson viewer:', e);
    }

    // 2. If not found, try my-courses
    if (!enroll) {
      try {
        const resMy = await api.get('/lms/student/my-courses');
        const myCourses = Array.isArray(resMy.data) ? resMy.data : (resMy.data?.data || []);
        enroll = myCourses.find(e => 
          (e.slug && e.slug.toLowerCase() === slugStr) || 
          e.course_id === courseSlug.value || 
          e.id === courseSlug.value
        );
      } catch (e) {
        console.warn('My courses fetch error in lesson viewer:', e);
      }
    }

    const courseId = enroll?.course_id || courseSlug.value;
    enrollment.value = enroll || { course_id: courseId, slug: courseSlug.value, title: 'Course' };

    // 2b. If course title is missing or generic, fetch course details
    if (!enrollment.value?.title || enrollment.value?.title === 'Course') {
      try {
        const resCourse = await api.get(`/public/courses/${courseSlug.value}`);
        const cData = resCourse.data || resCourse;
        if (cData?.title) {
          enrollment.value = {
            ...enrollment.value,
            title: cData.title,
            course_title: cData.title,
            slug: cData.slug || enrollment.value?.slug || courseSlug.value
          };
        }
      } catch (e) {
        console.warn('Fallback public course fetch error in lesson viewer:', e);
      }
    }

    // 3. Fetch curriculum
    const resCurr = await api.get(`/lms/student/courses/${courseId}/curriculum`);
    const currData = resCurr.data || resCurr || [];
    curriculum.value = Array.isArray(currData) ? currData : (currData?.data || []);

    // 3b. Fetch study materials for the course
    try {
      const resMat = await api.get(`/lms/student/courses/${courseId}/materials`);
      studyMaterials.value = Array.isArray(resMat.data) ? resMat.data : (resMat.data?.data || []);
    } catch (e) {
      console.warn('Study materials fetch error in lesson viewer:', e);
      studyMaterials.value = [];
    }

    // 4. Find current lesson
    const allLessons = extractLessons(curriculum.value);
    let targetLesson = allLessons.find(l => String(l.id).toLowerCase() === String(lessonId.value || '').toLowerCase());

    if (!targetLesson && allLessons.length > 0) {
      targetLesson = allLessons[0];
      currentLesson.value = targetLesson;
      if (String(lessonId.value) !== String(targetLesson.id)) {
        router.replace(`/learn/${enroll?.slug || courseSlug.value}/${targetLesson.id}`);
      }
    } else {
      currentLesson.value = targetLesson;
    }

    if (currentLesson.value) {
      await loadExamState();
      if (mainContentRef.value) {
        mainContentRef.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  } catch (error) {
    console.error('Failed to load lesson:', error);
  }
};

const getMatUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = config.public.apiBase.replace('/api', '');
  return `${base}${url}`;
};

const formatMatSize = (bytes) => {
  if (!bytes) return '';
  const num = Number(bytes);
  if (isNaN(num)) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const formatMatType = (typeOrName) => {
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

const getMatIcon = (typeOrName) => {
  const str = String(typeOrName || '').toLowerCase();
  if (str.includes('pdf')) return 'mdi-file-pdf-box';
  if (str.includes('word') || str.includes('doc')) return 'mdi-file-word-box';
  if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv')) return 'mdi-file-excel-box';
  if (str.includes('presentation') || str.includes('powerpoint') || str.includes('ppt')) return 'mdi-file-powerpoint-box';
  if (str.includes('zip') || str.includes('rar') || str.includes('7z') || str.includes('tar') || str.includes('gz')) return 'mdi-folder-zip-outline';
  if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) return 'mdi-file-image-outline';
  return 'mdi-file-document-outline';
};

const getMatColor = (typeOrName) => {
  const str = String(typeOrName || '').toLowerCase();
  if (str.includes('pdf')) return 'red-darken-1';
  if (str.includes('word') || str.includes('doc')) return 'blue-darken-2';
  if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv')) return 'teal-darken-1';
  if (str.includes('presentation') || str.includes('powerpoint') || str.includes('ppt')) return 'deep-orange-darken-1';
  if (str.includes('zip') || str.includes('rar') || str.includes('7z')) return 'amber-darken-3';
  if (str.includes('image') || str.includes('png') || str.includes('jpg')) return 'purple-darken-1';
  return 'primary';
};

const isMatPdf = (urlOrName) => {
  return String(urlOrName || '').toLowerCase().includes('.pdf');
};

const openMatPreview = (mat) => {
  protectedViewer.material = mat;
  protectedViewer.show = true;
};

const flatLessons = computed(() => extractLessons(curriculum.value));

const currentIdx = computed(() => {
  const activeId = currentLesson.value?.id || lessonId.value;
  if (!activeId) return -1;
  return flatLessons.value.findIndex(l => String(l.id).toLowerCase() === String(activeId).toLowerCase());
});

const prevLesson = computed(() => {
  if (currentIdx.value <= 0) return null;
  return flatLessons.value[currentIdx.value - 1] || null;
});

const nextLesson = computed(() => {
  if (currentIdx.value < 0 || currentIdx.value >= flatLessons.value.length - 1) return null;
  return flatLessons.value[currentIdx.value + 1] || null;
});

const navigateToLesson = (lesson) => {
  if (!lesson) return;

  const targetIdx = flatLessons.value.findIndex(l => String(l.id).toLowerCase() === String(lesson.id).toLowerCase());
  const isForward = targetIdx > currentIdx.value;

  // Prevent navigation past a mandatory quiz if incomplete
  if (currentLesson.value?.type === 'quiz' && currentLesson.value?.is_mandatory && !currentLesson.value?.completed && isForward) {
    alert('This is a mandatory exam. Please pass it before continuing to the next lesson.');
    return;
  }

  drawer.value = false;
  const targetSlug = enrollment.value?.slug || courseSlug.value;
  navigateTo(`/learn/${targetSlug}/${lesson.id}`);

  if (mainContentRef.value) {
    mainContentRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const takeQuiz = async () => {
  if (!currentLesson.value?.quiz_id) return;
  try {
    const { data } = await api.post(`/exams/${currentLesson.value.quiz_id}/book`, {});
    navigateTo(`/exam/${data.attempt_id}`);
  } catch (error) {
    console.error('Failed to start quiz:', error);
    alert('Failed to start quiz. Please try again.');
  }
};

const markComplete = async () => {
  if (!currentLesson.value || currentLesson.value.completed || !enrollment.value) return;
  markingComplete.value = true;
  try {
    const res = await api.post('/lms/student/progress', {
      enrollment_id: enrollment.value.id,
      lesson_id: currentLesson.value.id,
      watched_seconds: currentLesson.value.duration_seconds || 0,
      completed: true
    });
    currentLesson.value.completed = true;

    // Update local enrollment completion percentage immediately
    const resData = res.data || res;
    if (resData.completion_percentage !== undefined && enrollment.value) {
      enrollment.value.completion_percentage = resData.completion_percentage;
    }
    
    // Update completed status in curriculum tree
    for (const section of curriculum.value) {
      for (const mod of (section.modules || [])) {
        for (const l of (mod.lessons || [])) {
          if (l.id === currentLesson.value.id) {
            l.completed = true;
          }
        }
      }
    }

    if (resData.course_completed) {
      showCompletionModal.value = true;
    }
  } catch (error) {
    console.error('Failed to mark lesson as complete:', error);
    alert(error.response?.data?.message || 'Failed to update progress. Please try again.');
  } finally {
    markingComplete.value = false;
  }
};

const onLessonComplete = () => {
  markComplete();
};

const onProgress = (data) => {
  // Update local state if needed
};

const claimCertificate = async () => {
  if (claimingCertificate.value) return;
  claimingCertificate.value = true;
  try {
    const res = await api.post('/certs/claim', {
      courseId: enrollment.value.course_id
    });
    
    const config = useRuntimeConfig();
    const pdfUrl = config.public.apiBase.replace('/api', '') + res.data.pdfUrl;
    window.open(pdfUrl, '_blank');
    
    // Refresh enrollment progress
    const resDashboard = await api.get('/lms/student/dashboard');
    const enrollments = resDashboard.data?.enrollments || resDashboard.enrollments || [];
    enrollment.value = enrollments.find(e => e.id === enrollment.value.id);
  } catch (error) {
    console.error('Failed to claim certificate:', error);
    alert(error.response?.data?.message || 'Failed to claim certificate. Please contact support.');
  } finally {
    claimingCertificate.value = false;
  }
};

// Live Session Logic
const isSessionJoinable = computed(() => {
  if (!currentLesson.value?.scheduled_at) return false;
  const start = dayjs(currentLesson.value.scheduled_at);
  const end = start.add(currentLesson.value.duration_minutes || 60, 'minute');
  const now = dayjs();
  
  // Appears 10 mins before, disappears 30 mins after end
  return now.isAfter(start.subtract(10, 'minute')) && now.isBefore(end.add(30, 'minute'));
});

const isSessionUpcoming = computed(() => {
  if (!currentLesson.value?.scheduled_at) return false;
  const start = dayjs(currentLesson.value.scheduled_at);
  return dayjs().isBefore(start.subtract(10, 'minute'));
});

const liveCountdown = ref('');
let countdownInterval = null;

const updateCountdown = () => {
  if (!currentLesson.value?.scheduled_at) return;
  const start = dayjs(currentLesson.value.scheduled_at).subtract(10, 'minute');
  const now = dayjs();
  
  if (now.isBefore(start)) {
    const diff = start.diff(now, 'second');
    const d = Math.floor(diff / (3600 * 24));
    const h = Math.floor((diff % (3600 * 24)) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    if (d > 0) {
      liveCountdown.value = `${d}d ${h}h ${m}m`;
    } else {
      liveCountdown.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  } else {
    liveCountdown.value = '';
    // Force reactivity update to show join button
    if (currentLesson.value) {
      currentLesson.value = { ...currentLesson.value };
    }
  }
};

watch(() => currentLesson.value, updateCountdown);

const formatDateTime = (date) => dayjs(date).format('MMM D, YYYY • h:mm A');

const navigateToFirstPreview = () => {
  const firstPreview = flatLessons.value.find(l => l.is_free_preview);
  if (firstPreview) navigateToLesson(firstPreview);
};

const getFileIcon = (url) => {
  if (!url) return 'mdi-file-outline';
  const ext = url.split('.').pop().toLowerCase();
  switch (ext) {
    case 'zip':
    case 'rar':
    case '7z':
      return 'mdi-zip-box';
    case 'doc':
    case 'docx':
      return 'mdi-file-word';
    case 'xls':
    case 'xlsx':
      return 'mdi-file-excel';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'mdi-file-image';
    default:
      return 'mdi-file-download';
  }
};

const getFileName = (url) => {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1);
};

onMounted(async () => {
  await fetchData();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

// Watch for lessonId changes (re-fetch when navigating between lessons)
watch(lessonId, fetchData);

definePageMeta({
  layout: false,
  middleware: ['auth', 'role', 'enrollment'],
  role: ['student']
});
</script>

<style scoped>
.h-screen {
  height: 100vh;
  height: 100dvh;
}
.lesson-viewer {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.content-scroll-area {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 36px) !important;
  -webkit-overflow-scrolling: touch;
}
.lesson-nav-actions .v-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
@media (max-width: 600px) {
  .lesson-nav-actions {
    display: flex !important;
    width: 100% !important;
    gap: 8px !important;
  }
  .lesson-nav-actions .v-btn {
    flex: 1 1 0 !important;
    min-height: 44px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    font-size: 13px !important;
  }
  .lesson-nav-actions :deep(.v-btn__content) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.video-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
.reading-content {
  font-size: 1.1rem;
  line-height: 1.75;
  color: #334155;
}
.reading-content :deep(p) {
  margin-bottom: 1.25rem;
}
.reading-content :deep(h1), .reading-content :deep(h2), .reading-content :deep(h3) {
  color: #0f172a;
  font-weight: 800;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
.reading-content :deep(ul), .reading-content :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}
.reading-content :deep(li) {
  margin-bottom: 0.5rem;
}
.reading-content :deep(code) {
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}
.reading-content :deep(pre) {
  background: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.25rem;
}
.shadow-apple {
  border: 1px solid var(--border);
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.course-name-badge {
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
</style>
