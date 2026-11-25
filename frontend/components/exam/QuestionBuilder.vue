<template>
  <div class="question-builder">
    <div class="d-flex flex-wrap justify-space-between align-center gap-2 mb-4">
      <h3 class="text-subtitle-1 font-weight-bold">Question Bank ({{ questions.length }})</h3>
      <div class="d-flex flex-wrap gap-2">
        <v-btn size="small" variant="outlined" color="secondary" prepend-icon="mdi-download" @click="downloadSampleCsv">
          Sample CSV
        </v-btn>
        <v-btn size="small" variant="tonal" color="success" prepend-icon="mdi-file-upload-outline" @click="openCsvModal">
          Bulk Upload CSV
        </v-btn>
        <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="addQuestion">Add Question</v-btn>
      </div>
    </div>

    <div v-if="questions.length === 0" class="empty-state">
      <v-icon size="48" color="grey">mdi-help-box-outline</v-icon>
      <p class="text-grey mt-2">No questions yet. Click "Add Question" or "Bulk Upload CSV" to begin.</p>
    </div>

    <div v-for="(q, i) in questions" :key="i" class="q-item mb-4">
      <v-card border flat rounded="lg" class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-caption font-weight-bold text-grey">Q{{ i + 1 }}</span>
          <div class="d-flex gap-1">
            <v-btn icon="mdi-chevron-up" size="x-small" variant="text" :disabled="i === 0" @click="moveUp(i)"></v-btn>
            <v-btn icon="mdi-chevron-down" size="x-small" variant="text" :disabled="i === questions.length - 1" @click="moveDown(i)"></v-btn>
            <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeQuestion(i)"></v-btn>
          </div>
        </div>

        <v-row dense>
          <v-col cols="12">
            <v-textarea v-model="q.question_text" label="Question Text" rows="2" auto-grow density="compact" hide-details class="mb-2" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="q.type"
              :items="questionTypes"
              label="Type"
              density="compact"
              hide-details
              @update:model-value="onTypeChange(q)"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model.number="q.marks" label="Marks" type="number" min="1" density="compact" hide-details />
          </v-col>
        </v-row>

        <!-- MCQ options -->
        <div v-if="q.type === 'mcq'" class="mt-3">
          <div class="text-caption text-grey mb-2">Options (click ★ to mark correct answer)</div>
          <div v-for="(opt, oi) in q.options" :key="oi" class="d-flex align-center gap-2 mb-2">
            <v-icon
              :color="q.correct_answer === opt ? 'success' : 'grey'"
              size="20"
              style="cursor:pointer"
              @click="q.correct_answer = opt"
            >{{ q.correct_answer === opt ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
            <v-text-field
              v-model="q.options[oi]"
              density="compact"
              hide-details
              :placeholder="`Option ${Number(oi) + 1}`"
              class="flex-1"
            />
            <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="q.options.splice(oi, 1)"></v-btn>
          </div>
          <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="q.options.push('')">Add Option</v-btn>
        </div>

        <!-- True/False -->
        <div v-if="q.type === 'truefalse'" class="mt-3">
          <div class="text-caption text-grey mb-2">Correct Answer</div>
          <v-btn-toggle v-model="q.correct_answer" mandatory density="compact" color="success" variant="outlined">
            <v-btn value="True">True</v-btn>
            <v-btn value="False">False</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Short/Long answer key (optional) -->
        <div v-if="q.type === 'short' || q.type === 'long'" class="mt-3">
          <v-textarea
            v-model="q.correct_answer"
            :label="`Model Answer / Keywords (for grader reference)`"
            rows="2"
            density="compact"
            hide-details
            placeholder="Optional: Enter expected keywords or model answer for grader reference"
          />
        </div>

        <!-- Explanation -->
        <div class="mt-3">
          <v-textarea
            v-model="q.explanation"
            label="Explanation (shown to student post-exam)"
            rows="1"
            density="compact"
            hide-details
            auto-grow
            placeholder="Optional explanation shown after exam results"
          />
        </div>

        <v-divider class="my-4"></v-divider>
        
        <div class="d-flex justify-center mb-1">
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus-circle" @click="insertQuestion(i)">
            Add Next Question
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Bulk CSV Upload Modal -->
    <v-dialog v-model="csvModal.show" max-width="640px">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center gap-2">
            <v-icon color="success" size="28">mdi-file-delimited-outline</v-icon>
            <h3 class="text-h6 font-weight-bold">Bulk Upload Questions (CSV)</h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="csvModal.show = false" />
        </div>

        <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mb-4 text-body-2">
          <div class="d-flex flex-wrap align-center justify-space-between gap-2">
            <span>
              Columns: <code>question_text, type, option_a, option_b, option_c, option_d, correct_answer, marks, explanation</code>
            </span>
            <v-btn size="x-small" color="info" variant="flat" prepend-icon="mdi-download" @click="downloadSampleCsv">
              Download Sample
            </v-btn>
          </div>
          <div class="text-caption mt-1">
            Types: <code>mcq</code>, <code>truefalse</code>, <code>short</code>, <code>long</code>. For MCQ, <code>correct_answer</code> can be the exact option text or letter (<code>A</code>–<code>D</code>).
          </div>
        </v-alert>

        <v-file-input
          v-model="csvModal.file"
          label="Select CSV File"
          accept=".csv,text/csv"
          variant="outlined"
          density="comfortable"
          prepend-icon="mdi-paperclip"
          show-size
          clearable
          @update:model-value="onCsvFileChange"
        />

        <v-alert v-if="csvModal.errors.length > 0" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">
          <div class="font-weight-bold mb-1">Found {{ csvModal.errors.length }} issue(s):</div>
          <ul class="pl-4 mb-0 text-caption" style="max-height: 120px; overflow-y: auto;">
            <li v-for="(err, idx) in csvModal.errors" :key="idx">{{ err }}</li>
          </ul>
        </v-alert>

        <v-alert v-else-if="csvModal.parsed.length > 0" type="success" variant="tonal" density="compact" rounded="lg" class="mb-4">
          Ready to import <strong>{{ csvModal.parsed.length }}</strong> valid question{{ csvModal.parsed.length === 1 ? '' : 's' }}.
        </v-alert>

        <div v-if="questions.length > 0 && csvModal.parsed.length > 0" class="mb-4">
          <v-radio-group v-model="csvModal.mode" inline density="compact" hide-details>
            <v-radio label="Append to existing questions" value="append" color="primary" />
            <v-radio label="Replace existing questions" value="replace" color="warning" />
          </v-radio-group>
        </div>

        <div class="d-flex justify-end gap-2 mt-2">
          <v-btn variant="text" @click="csvModal.show = false">Cancel</v-btn>
          <v-btn
            color="success"
            variant="flat"
            rounded="lg"
            :disabled="csvModal.parsed.length === 0"
            prepend-icon="mdi-check"
            @click="confirmCsvImport"
          >
            Import {{ csvModal.parsed.length > 0 ? `(${csvModal.parsed.length})` : '' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: any[] }>();
const emit = defineEmits(['update:modelValue']);

const questions = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const questionTypes = [
  { title: 'Multiple Choice (MCQ)', value: 'mcq' },
  { title: 'True / False', value: 'truefalse' },
  { title: 'Short Answer', value: 'short' },
  { title: 'Long Answer', value: 'long' },
];

const addQuestion = () => {
  questions.value = [...questions.value, {
    question_text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    explanation: '',
  }];
};

const insertQuestion = (i: number) => {
  const arr = [...questions.value];
  arr.splice(i + 1, 0, {
    question_text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    explanation: '',
  });
  questions.value = arr;
};

const removeQuestion = (i: number) => {
  const arr = [...questions.value];
  arr.splice(i, 1);
  questions.value = arr;
};

const moveUp = (i: number) => {
  const arr = [...questions.value];
  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
  questions.value = arr;
};

const moveDown = (i: number) => {
  const arr = [...questions.value];
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
  questions.value = arr;
};

const onTypeChange = (q: any) => {
  q.correct_answer = '';
  if (q.type === 'mcq') q.options = ['', '', '', ''];
  else if (q.type === 'truefalse') { q.options = []; q.correct_answer = 'True'; }
  else q.options = [];
};

// ── Bulk CSV Upload & Sample Download ────────────────────────────────────────
const csvModal = reactive({
  show: false,
  file: null as File | File[] | null,
  parsed: [] as any[],
  errors: [] as string[],
  mode: 'append' as 'append' | 'replace',
});

const openCsvModal = () => {
  csvModal.file = null;
  csvModal.parsed = [];
  csvModal.errors = [];
  csvModal.mode = 'append';
  csvModal.show = true;
};

const downloadSampleCsv = () => {
  const headers = ['question_text', 'type', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'marks', 'explanation'];
  const sampleRows = [
    ['What does HACCP stand for in food safety?', 'mcq', 'Hazard Analysis and Critical Control Points', 'Health Assessment and Clean Cooking Protocol', 'Hazardous Area Control and Check Process', 'Hygiene Audit and Compliance Check Point', 'A', '2', 'HACCP is a systematic preventive approach to food safety.'],
    ['Food handlers should wash their hands before handling ready-to-eat food.', 'truefalse', '', '', '', '', 'True', '1', 'Proper hand hygiene prevents cross-contamination.'],
    ['Name the ideal temperature danger zone in Celsius for bacterial growth.', 'short', '', '', '', '', '5°C to 60°C', '2', 'Pathogens multiply rapidly between 5°C and 60°C.'],
    ['Explain the difference between cleaning and sanitizing in a food processing facility.', 'long', '', '', '', '', 'Cleaning removes visible dirt/debris with detergent; sanitizing reduces microorganisms to safe levels.', '5', ''],
  ];

  const escapeCell = (val: string) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [headers, ...sampleRows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_exam_questions.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// RFC 4180 CSV parser supporting quoted fields, commas, newlines, and "" escapes
const parseCsvText = (text: string): string[][] => {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.some(c => c.trim() !== ''));
};

const onCsvFileChange = async (fileVal: File | File[] | null) => {
  csvModal.parsed = [];
  csvModal.errors = [];
  const file = Array.isArray(fileVal) ? fileVal[0] : fileVal;
  if (!file) return;

  try {
    const text = await file.text();
    const rows = parseCsvText(text);
    if (rows.length < 2) {
      csvModal.errors.push('CSV must contain a header row and at least one question row.');
      return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const idx = (name: string) => headers.indexOf(name);

    const qIdx = idx('question_text');
    if (qIdx === -1) {
      csvModal.errors.push('Missing required "question_text" column in CSV header.');
      return;
    }

    const typeIdx = idx('type');
    const optAIdx = idx('option_a');
    const optBIdx = idx('option_b');
    const optCIdx = idx('option_c');
    const optDIdx = idx('option_d');
    const ansIdx = idx('correct_answer');
    const marksIdx = idx('marks');
    const expIdx = idx('explanation');

    const validTypes = ['mcq', 'truefalse', 'short', 'long'];
    const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

    const imported: any[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const rowNum = r + 1;
      const questionText = (row[qIdx] || '').trim();
      if (!questionText) {
        csvModal.errors.push(`Row ${rowNum}: question_text is empty.`);
        continue;
      }

      const rawType = (typeIdx !== -1 ? row[typeIdx] : 'mcq')?.trim().toLowerCase() || 'mcq';
      const type = rawType === 'true/false' || rawType === 'tf' ? 'truefalse' : rawType;
      if (!validTypes.includes(type)) {
        csvModal.errors.push(`Row ${rowNum}: invalid type "${rawType}". Use mcq, truefalse, short, or long.`);
        continue;
      }

      const rawMarks = marksIdx !== -1 ? Number(row[marksIdx]) : 1;
      const marks = Number.isFinite(rawMarks) && rawMarks >= 1 ? Math.round(rawMarks) : 1;
      const explanation = expIdx !== -1 ? (row[expIdx] || '').trim() : '';
      let correctAnswer = ansIdx !== -1 ? (row[ansIdx] || '').trim() : '';
      let options: string[] = [];

      if (type === 'mcq') {
        options = [
          optAIdx !== -1 ? (row[optAIdx] || '').trim() : '',
          optBIdx !== -1 ? (row[optBIdx] || '').trim() : '',
          optCIdx !== -1 ? (row[optCIdx] || '').trim() : '',
          optDIdx !== -1 ? (row[optDIdx] || '').trim() : '',
        ].filter(Boolean);

        if (options.length < 2) {
          csvModal.errors.push(`Row ${rowNum}: MCQ must have at least 2 non-empty options.`);
          continue;
        }

        // Resolve letter (A/B/C/D or Option A) to actual option text if not an exact match
        if (correctAnswer && !options.includes(correctAnswer)) {
          const normalized = correctAnswer.toLowerCase().replace(/^option\s+/, '');
          if (normalized in letterMap && options[letterMap[normalized]] !== undefined) {
            correctAnswer = options[letterMap[normalized]];
          }
        }

        if (!correctAnswer || !options.includes(correctAnswer)) {
          csvModal.errors.push(`Row ${rowNum}: correct_answer "${correctAnswer}" does not match any option (or A–D).`);
          continue;
        }
      } else if (type === 'truefalse') {
        const lower = correctAnswer.toLowerCase();
        if (['true', 't', '1', 'yes'].includes(lower)) correctAnswer = 'True';
        else if (['false', 'f', '0', 'no'].includes(lower)) correctAnswer = 'False';
        else {
          csvModal.errors.push(`Row ${rowNum}: True/False correct_answer must be True or False.`);
          continue;
        }
      }

      imported.push({
        question_text: questionText,
        type,
        options,
        correct_answer: correctAnswer,
        marks,
        explanation,
      });
    }

    csvModal.parsed = imported;
  } catch (err: any) {
    csvModal.errors.push('Failed to read CSV file: ' + (err?.message || 'Unknown error'));
  }
};

const confirmCsvImport = () => {
  if (csvModal.parsed.length === 0) return;
  if (csvModal.mode === 'replace') {
    questions.value = [...csvModal.parsed];
  } else {
    questions.value = [...questions.value, ...csvModal.parsed];
  }
  csvModal.show = false;
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 32px;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
}
</style>
