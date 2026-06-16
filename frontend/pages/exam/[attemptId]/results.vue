<template>
  <div class="results-page">
    <div v-if="loading" class="loading-screen">
      <v-progress-circular indeterminate color="#F4791F" size="64" />
      <p class="text-muted mt-4">Loading your results...</p>
    </div>

    <div v-else-if="result" class="results-content">
      <!-- Score Hero Section -->
      <div class="score-hero">
        <div class="confetti-wrap" v-if="result.passed">
          <div v-for="i in 30" :key="i" class="confetti-piece" :style="confettiStyle(i)"></div>
        </div>

        <div class="score-ring-wrap">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" class="ring-bg" />
            <circle
              cx="60" cy="60" r="52"
              :class="result.passed ? 'ring-pass' : 'ring-fail'"
              :style="{ strokeDashoffset: ringOffset }"
              class="ring-progress"
            />
          </svg>
          <div class="score-inner">
            <div class="score-pct">{{ result.score }}%</div>
            <div class="score-label">{{ result.passed ? '🎉 Passed' : '😔 Failed' }}</div>
          </div>
        </div>

        <div class="text-center mt-6">
          <h1 class="text-h4 font-weight-black text-ink mb-2">{{ result.exam_title }}</h1>
          <p class="text-muted">{{ result.course_title }}</p>
        </div>

        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-val">{{ result.auto_score }}</div>
            <div class="stat-key">Marks Earned</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">{{ result.total_marks }}</div>
            <div class="stat-key">Total Marks</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">{{ result.pass_percentage }}%</div>
            <div class="stat-key">Pass Threshold</div>
          </div>
          <div class="stat-box" v-if="result.pending_manual_review">
            <div class="stat-val" style="color:#f59e0b">Pending</div>
            <div class="stat-key">Manual Review</div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="cta-row">
          <template v-if="result.passed">
            <v-chip color="success" size="large" prepend-icon="mdi-check-decagram" class="font-weight-bold px-6 py-4 text-body-1">
              Certificate Earned!
            </v-chip>
            <v-btn v-if="result.cert_id" color="success" size="large" prepend-icon="mdi-download" rounded="xl" @click="downloadCertificate" :loading="downloading">
              Download Certificate
            </v-btn>
          </template>
          <template v-else>
            <p class="text-muted text-center max-w-400 mb-4">Don't give up! Review the questions below, strengthen your knowledge, and come back stronger.</p>
          </template>
          <v-btn variant="tonal" color="blue-grey" @click="router.push('/dashboard/exams')" size="large" rounded="xl">Back to Exams</v-btn>
        </div>
      </div>

      <!-- Question Review -->
      <div v-if="result.show_result_detail && result.question_breakdown && result.question_breakdown.length > 0" class="review-section">
        <h2 class="text-h5 font-weight-bold text-ink mb-6">Question Review</h2>
        <div v-for="(q, i) in result.question_breakdown" :key="q.question_id" class="review-card" :class="q.is_correct === false ? 'wrong' : q.is_correct === true ? 'correct' : 'pending'">
          <div class="review-header">
            <span class="q-num">Q{{ i + 1 }}</span>
            <span class="q-type">{{ q.type }}</span>
            <div class="q-score-badge" :class="q.is_correct === true ? 'badge-pass' : q.is_correct === false ? 'badge-fail' : 'badge-pending'">
              <template v-if="q.is_correct === null">Pending Review</template>
              <template v-else>{{ q.marks_awarded }} / {{ q.marks }} marks</template>
            </div>
          </div>
          <div class="q-text">{{ q.question_text }}</div>

          <div class="answer-row">
            <div class="answer-block your-answer">
              <span class="answer-label">Your Answer</span>
              <span class="answer-text">{{ q.answer_text || '(No answer)' }}</span>
            </div>
            <div v-if="q.correct_answer" class="answer-block correct-answer">
              <span class="answer-label">Correct Answer</span>
              <span class="answer-text">{{ q.correct_answer }}</span>
            </div>
          </div>

          <div v-if="q.explanation" class="explanation">
            <v-icon size="15" class="mr-1">mdi-lightbulb-outline</v-icon>
            {{ q.explanation }}
          </div>

          <!-- Manual grading input (for admin/tutor) -->
          <div v-if="canGrade && q.is_correct === null" class="grade-row">
            <v-text-field
              v-model.number="gradeInputs[q.id]"
              :label="`Marks (max ${q.marks})`"
              type="number"
              :min="0"
              :max="q.marks"
              density="compact"
              hide-details
              style="max-width: 160px"
            />
            <v-btn size="small" color="primary" variant="tonal" @click="gradeAnswer(q.id, q.marks)">
              Save Grade
            </v-btn>
          </div>
        </div>
      </div>

      <div v-else-if="result.pending_manual_review" class="pending-banner">
        <v-icon size="40" color="warning">mdi-clock-outline</v-icon>
        <h3 class="text-h6 text-ink font-weight-bold mt-3 mb-2">Awaiting Manual Review</h3>
        <p class="text-muted">Some of your answers require manual grading by your tutor. Your final result will be available shortly.</p>
      </div>
    </div>
    
    <div v-else class="text-center pt-16">
      <v-icon size="64" color="error" class="mb-4">mdi-file-hidden</v-icon>
      <h2 class="text-h5 font-weight-bold text-ink mb-2">This exam is unavailable.</h2>
      <p class="text-muted mb-6">We couldn't load the results for this attempt.</p>
      <v-btn color="#F4791F" class="text-white" @click="router.push('/dashboard/exams')">Back to Exams</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';

definePageMeta({ middleware: ['auth'] });

const route = useRoute();
const router = useRouter();
const api = useApi();
const authStore = useAuthStore();

const attemptId = computed(() => (route.params as any).attemptId);
const loading = ref(true);

interface QuestionBreakdown {
  question_id: string | number;
  is_correct: boolean | null;
  type: string;
  marks_awarded: number;
  marks: number;
  question_text: string;
  answer_text?: string;
  correct_answer?: string;
  explanation?: string;
  id: string | number;
}

interface AttemptResult {
  passed: boolean;
  score: number;
  exam_title: string;
  course_title: string;
  auto_score: number;
  total_marks: number;
  pass_percentage: number;
  pending_manual_review: boolean;
  cert_id?: string | number;
  show_result_detail: boolean;
  question_breakdown?: QuestionBreakdown[];
  attempts_used?: number;
  max_attempts?: number;
  exam_id: string | number;
  cert_number?: string;
}

const result = ref<AttemptResult | null>(null);
const retrying = ref(false);
const downloading = ref(false);
const gradeInputs = ref<Record<string, number>>({});

const canRetry = computed(() => result.value && !result.value.passed && (result.value.attempts_used || 0) < (result.value.max_attempts || 1));
const canGrade = computed(() => ['super_admin', 'tutor'].includes(authStore.userRole));

const CIRCUMFERENCE = 2 * Math.PI * 52;
const ringOffset = computed(() => {
  if (!result.value) return CIRCUMFERENCE;
  return CIRCUMFERENCE - (result.value.score / 100) * CIRCUMFERENCE;
});

const confettiStyle = (i: number) => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 2}s`,
  background: ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444'][i % 5],
});

onMounted(async () => {
  try {
    const { data } = await api.get(`/exams/attempts/${attemptId.value}/results`);
    result.value = data;
    // init grade inputs
    if (data.question_breakdown) {
      data.question_breakdown.forEach((q: any) => {
        gradeInputs.value[q.id] = 0;
      });
    }
  } finally {
    loading.value = false;
  }
});

const retryExam = async () => {
  if (!result.value) return;
  retrying.value = true;
  try {
    const { data } = await api.post(`/exams/${result.value.exam_id}/book`, {});
    router.push(`/exam/${data.attempt_id}`);
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to retry exam');
  } finally {
    retrying.value = false;
  }
};

const gradeAnswer = async (answerId: string | number, maxMarks: number) => {
  const marks = Math.min(Math.max(0, gradeInputs.value[answerId] || 0), maxMarks);
  await api.post(`/exams/attempts/${attemptId.value}/grade`, { answer_id: answerId, marks_awarded: marks });
  // Refresh
  const { data } = await api.get(`/exams/attempts/${attemptId.value}/results`);
  result.value = data;
};

const downloadCertificate = async () => {
  if (!result.value || !result.value.cert_id) return;
  downloading.value = true;
  try {
    const response = await api.get(`/certs/${result.value.cert_id}/download`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.value.cert_number || 'certificate'}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download certificate:', error);
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  padding: 40px 20px;
  font-family: var(--font-body);
}
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }

.results-content { max-width: 860px; margin: 0 auto; }

/* Score Hero */
.score-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
}
.confetti-wrap { position: absolute; top: 0; left: 0; right: 0; pointer-events: none; }
.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confetti-fall 3s ease-in forwards;
  top: -20px;
}
@keyframes confetti-fall {
  to { transform: translateY(300px) rotate(720deg); opacity: 0; }
}

.score-ring-wrap { position: relative; width: 180px; height: 180px; margin-bottom: 8px; }
.score-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: var(--border); stroke-width: 10; }
.ring-progress { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1s ease; stroke-dasharray: 326.7; }
.ring-pass { stroke: #10b981; }
.ring-fail { stroke: var(--accent); }
.score-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.score-pct { font-size: 32px; font-weight: 900; color: var(--ink); line-height: 1; }
.score-label { font-size: 14px; color: var(--muted); margin-top: 4px; font-weight: 600; }

.stats-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin: 32px 0; }
.stat-box {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 28px;
  text-align: center;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.stat-val { font-size: 28px; font-weight: 800; color: var(--ink); }
.stat-key { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; font-weight: 600; }

.cta-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; align-items: center; margin-top: 24px; }

/* Review section */
.review-section { margin-top: 40px; }
.review-card {
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.review-card.correct { border-left: 4px solid #10b981; }
.review-card.wrong   { border-left: 4px solid var(--accent); }
.review-card.pending { border-left: 4px solid #f59e0b; }

.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.q-num { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
.q-type { font-size: 11px; background: var(--panel); border-radius: 10px; padding: 2px 8px; color: var(--muted); text-transform: uppercase; font-weight: 600; }
.q-score-badge { margin-left: auto; font-size: 12px; font-weight: 700; border-radius: 20px; padding: 3px 12px; }
.badge-pass { background: rgba(16,185,129,0.1); color: #10b981; }
.badge-fail { background: var(--accent-soft); color: var(--accent); }
.badge-pending { background: rgba(245,158,11,0.1); color: #f59e0b; }

.q-text { font-size: 15px; color: var(--ink); line-height: 1.6; margin-bottom: 16px; font-weight: 600; }

.answer-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.answer-block { flex: 1; min-width: 200px; background: var(--panel); border-radius: var(--radius-md); padding: 12px; border: 1px solid var(--border); }
.answer-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 6px; font-weight: 600; }
.answer-text { font-size: 14px; color: var(--ink); font-weight: 500; }
.correct-answer { border-color: #10b981; background: rgba(16,185,129,0.05); }

.explanation { font-size: 13px; color: var(--muted); display: flex; align-items: flex-start; gap: 6px; margin-top: 12px; padding: 12px; background: rgba(245,158,11,0.05); border-radius: var(--radius-md); }
.grade-row { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }

.pending-banner {
  text-align: center;
  padding: 60px 20px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.text-ink { color: var(--ink) !important; }
.text-muted { color: var(--muted) !important; }
</style>
