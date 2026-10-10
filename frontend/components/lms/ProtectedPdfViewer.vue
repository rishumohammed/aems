<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    transition="dialog-bottom-transition"
    z-index="9999"
  >
    <div
      class="protected-pdf-container d-flex flex-column h-100 bg-grey-darken-4"
      @contextmenu.prevent="onBlockedAction('Right-click menu')"
    >
      <!-- Top Security & Navigation Toolbar -->
      <v-toolbar color="grey-darken-4" density="comfortable" class="border-b border-grey-darken-3 px-3 flex-shrink-0">
        <!-- Title & Security Badge -->
        <div class="d-flex align-center gap-3 text-truncate header-info-section">
          <v-avatar color="red-darken-3" size="32" rounded="lg">
            <v-icon color="white" size="18">mdi-file-pdf-box</v-icon>
          </v-avatar>
          <div class="text-truncate">
            <div class="text-subtitle-2 font-weight-bold text-white text-truncate">{{ material?.title || 'Study Material' }}</div>
            <div class="text-caption text-grey-lighten-1 d-none d-sm-flex align-center gap-1">
              <v-icon size="12" color="success">mdi-shield-check</v-icon>
              <span>Protected Reader • Right-Click & Downloads Disabled</span>
            </div>
          </div>
        </div>

        <v-spacer></v-spacer>

        <!-- Reader Controls (Page Nav & Zoom) -->
        <div v-if="pdfDoc && !loading" class="d-flex align-center gap-2 reader-controls-bar">
          <!-- Page Navigation -->
          <div class="d-flex align-center bg-grey-darken-3 rounded-lg px-1 py-0 border border-grey-darken-2">
            <v-btn
              icon="mdi-chevron-left"
              size="x-small"
              variant="text"
              color="white"
              :disabled="currentPage <= 1"
              title="Previous Page"
              @click="prevPage"
            ></v-btn>
            <span class="text-caption font-weight-bold text-white px-2 user-select-none">
              {{ currentPage }} <span class="text-grey">/</span> {{ numPages }}
            </span>
            <v-btn
              icon="mdi-chevron-right"
              size="x-small"
              variant="text"
              color="white"
              :disabled="currentPage >= numPages"
              title="Next Page"
              @click="nextPage"
            ></v-btn>
          </div>

          <!-- Zoom Controls -->
          <div class="d-flex align-center bg-grey-darken-3 rounded-lg px-1 py-0 border border-grey-darken-2">
            <v-btn
              icon="mdi-minus"
              size="x-small"
              variant="text"
              color="white"
              :disabled="zoomScale <= 0.6"
              title="Zoom Out"
              @click="zoomOut"
            ></v-btn>
            <span class="text-caption font-weight-medium text-grey-lighten-2 px-1 font-mono user-select-none zoom-display">
              {{ Math.round(zoomScale * 100) }}%
            </span>
            <v-btn
              icon="mdi-plus"
              size="x-small"
              variant="text"
              color="white"
              :disabled="zoomScale >= 2.5"
              title="Zoom In"
              @click="zoomIn"
            ></v-btn>
            <v-btn
              size="x-small"
              variant="tonal"
              color="primary"
              class="ml-1 text-none font-weight-bold d-none d-md-flex"
              title="Fit to Container Width"
              @click="fitToWidth"
            >
              Fit Width
            </v-btn>
          </div>
        </div>

        <v-spacer></v-spacer>

        <!-- Dynamic Security Chip -->
        <v-chip size="small" color="primary" variant="tonal" class="mr-3 font-weight-medium d-none d-lg-flex">
          <v-icon start size="14">mdi-account-check</v-icon>
          {{ studentDisplayInfo }}
        </v-chip>

        <!-- Close Button -->
        <v-btn
          color="white"
          variant="tonal"
          rounded="lg"
          size="small"
          prepend-icon="mdi-close"
          class="font-weight-bold"
          @click="closeViewer"
        >
          Close
        </v-btn>
      </v-toolbar>

      <!-- Main Reader Body -->
      <div class="pdf-viewer-viewport flex-grow-1 position-relative overflow-hidden bg-grey-darken-3 d-flex flex-column align-center justify-center">
        <!-- Loading State Overlay -->
        <div v-if="loading" class="pdf-loading-overlay position-absolute w-100 h-100 d-flex flex-column align-center justify-center bg-grey-darken-4" style="z-index: 50;">
          <v-progress-circular indeterminate color="primary" size="56" class="mb-4"></v-progress-circular>
          <div class="text-subtitle-1 font-weight-bold text-white">Loading Protected PDF...</div>
          <div class="text-caption text-grey mt-1">Applying security restrictions & dynamic watermarks</div>
        </div>

        <!-- Top Rendering Progress Bar (shown while pages render) -->
        <v-progress-linear
          v-if="isRendering && !loading"
          indeterminate
          color="primary"
          height="3"
          class="position-absolute top-0 left-0 right-0"
          style="z-index: 60;"
        ></v-progress-linear>

        <!-- Error State -->
        <div v-if="errorMessage && !loading" class="text-center pa-8 text-white max-width-500">
          <v-icon color="error" size="56" class="mb-4">mdi-alert-circle-outline</v-icon>
          <div class="text-h6 font-weight-bold mb-2">Unable to load document</div>
          <p class="text-body-2 text-grey-lighten-1 mb-6">{{ errorMessage }}</p>
          <v-btn color="primary" rounded="lg" @click="loadPdf">Try Again</v-btn>
        </div>

        <!-- Native HTML5 Canvas Multi-Page Reader (NO native PDF plugin, 100% blocked right-click) -->
        <div
          v-else-if="pdfDoc"
          ref="scrollContainerRef"
          class="pdf-scroll-container w-100 h-100 overflow-y-auto overflow-x-auto position-relative"
          @scroll="handleScroll"
          @contextmenu.prevent="onBlockedAction('Right-click menu')"
        >
          <div class="pdf-pages-track d-flex flex-column align-center py-6 px-4">
            <div
              v-for="pageIndex in numPages"
              :key="pageIndex"
              :id="`pdf-page-${pageIndex}`"
              :data-page-num="pageIndex"
              class="pdf-page-card elevation-8 rounded-lg position-relative mb-6 overflow-hidden flex-shrink-0"
              :style="getPageCardStyle()"
              @contextmenu.prevent="onBlockedAction('Right-click menu')"
            >
              <!-- Page Canvas -->
              <canvas
                :ref="(el) => setCanvasRef(el, pageIndex)"
                class="pdf-page-canvas d-block"
                draggable="false"
                @dragstart.prevent
                @contextmenu.prevent="onBlockedAction('Right-click menu')"
              ></canvas>

              <!-- Page Watermark Overlay -->
              <div class="page-watermark-overlay" aria-hidden="true">
                <div class="watermark-grid">
                  <div v-for="n in 16" :key="n" class="watermark-item">
                    <div class="watermark-text font-weight-bold">{{ studentName }}</div>
                    <div class="watermark-sub">{{ studentEmail }} • ID: #{{ studentId }}</div>
                    <div class="watermark-notice">CONFIDENTIAL • PROPRIETARY</div>
                  </div>
                </div>
              </div>

              <!-- Page Corner Indicator -->
              <div class="page-corner-badge">
                Page {{ pageIndex }} of {{ numPages }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Security Notice -->
      <div class="px-4 py-2 bg-grey-darken-4 border-t border-grey-darken-3 d-flex align-center justify-space-between flex-shrink-0 text-caption text-grey">
        <div class="d-flex align-center gap-2">
          <v-icon size="14" color="warning">mdi-lock-outline</v-icon>
          <span>Licensed exclusively to {{ studentName }} ({{ studentEmail }}). Unauthorized copying, distribution, or reproduction is strictly prohibited.</span>
        </div>
        <div class="d-none d-sm-block font-mono text-grey-darken-1">
          Session ID: {{ sessionId }}
        </div>
      </div>
    </div>

    <!-- Security Warning Snackbar -->
    <v-snackbar
      v-model="warningSnackbar.show"
      color="error"
      location="top"
      :timeout="3000"
      rounded="pill"
      elevation="8"
    >
      <v-icon start>mdi-shield-alert</v-icon>
      {{ warningSnackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed, watch, nextTick, onMounted, onUnmounted, reactive } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  courseId: { type: String, required: true },
  material: { type: Object, default: () => null }
});

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const api = useApi();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const isRendering = ref(false);
const renderStatus = ref('Ready');
const errorMessage = ref('');
const sessionId = ref('');

// PDF.js State (shallowRef prevents Vue from creating a deep Proxy that breaks private class fields like #d)
const pdfDoc = shallowRef(null);
const numPages = ref(0);
const currentPage = ref(1);
const zoomScale = ref(1.0);
const basePageDimensions = ref(null); // { width, height }
const scrollContainerRef = ref(null);

// Plain JS map for raw canvas DOM elements
const canvasElements = {};
let renderSessionId = 0;

const warningSnackbar = reactive({
  show: false,
  message: ''
});

const studentName = computed(() => authStore.user?.name || 'Authorized Student');
const studentEmail = computed(() => authStore.user?.email || 'student@domain.com');
const studentId = computed(() => authStore.user?.id || 'STUDENT');
const studentDisplayInfo = computed(() => `${studentName.value} (${studentEmail.value})`);

const setCanvasRef = (el, pageIndex) => {
  if (el) {
    canvasElements[pageIndex] = el;
  }
};

const waitForCanvas = async (pageNum, maxWaitMs = 1500) => {
  const start = Date.now();
  while (!canvasElements[pageNum] && Date.now() - start < maxWaitMs) {
    await nextTick();
    await new Promise((r) => setTimeout(r, 20));
  }
  return canvasElements[pageNum] || null;
};

const onBlockedAction = (action) => {
  warningSnackbar.message = `${action} is disabled to protect copyrighted study materials.`;
  warningSnackbar.show = true;
};

// Global security event listeners for capturing Phase
const handleGlobalContextMenu = (e) => {
  if (isOpen.value) {
    e.preventDefault();
    e.stopPropagation();
    onBlockedAction('Right-click menu');
    return false;
  }
};

const handleGlobalKeyDown = (e) => {
  if (!isOpen.value) return;

  // Block Ctrl+S / Cmd+S (Save)
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    e.stopPropagation();
    onBlockedAction('Saving');
    return false;
  }

  // Block Ctrl+P / Cmd+P (Print)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    e.stopPropagation();
    onBlockedAction('Printing');
    return false;
  }

  // Block Ctrl+U / Cmd+U (View Source)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
    e.preventDefault();
    e.stopPropagation();
    onBlockedAction('Viewing source');
    return false;
  }

  // Block F12 and DevTools shortcuts
  if (
    e.key === 'F12' ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
  ) {
    e.preventDefault();
    e.stopPropagation();
    onBlockedAction('Developer Tools');
    return false;
  }
};

// PDF.js dynamic loader
let pdfjsPromise = null;
const loadPdfJs = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR not supported'));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    let script = document.getElementById('pdfjs-dist-lib');
    if (!script) {
      script = document.createElement('script');
      script.id = 'pdfjs-dist-lib';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const initWorkerAndResolve = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        setTimeout(initWorkerAndResolve, 50);
      }
    };

    script.onload = initWorkerAndResolve;
    script.onerror = () => {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
      fallbackScript.async = true;
      fallbackScript.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize'));
        }
      };
      fallbackScript.onerror = () => reject(new Error('Failed to load PDF viewer engine'));
      document.head.appendChild(fallbackScript);
    };

    if (window.pdfjsLib) initWorkerAndResolve();
  });

  return pdfjsPromise;
};

// Clean up PDF document resources
const cleanupPdf = () => {
  renderSessionId++;
  if (pdfDoc.value) {
    try {
      pdfDoc.value.destroy();
    } catch (e) {}
    pdfDoc.value = null;
  }
  numPages.value = 0;
  currentPage.value = 1;
  basePageDimensions.value = null;
  isRendering.value = false;
  renderStatus.value = 'Closed';
  Object.keys(canvasElements).forEach((key) => delete canvasElements[key]);
};

const closeViewer = () => {
  cleanupPdf();
  isOpen.value = false;
};

// Render all pages cleanly and sequentially onto canvas elements
const renderAllPages = async () => {
  if (!pdfDoc.value || !numPages.value || !isOpen.value) return;

  const currentSession = ++renderSessionId;
  isRendering.value = true;
  renderStatus.value = `Rendering ${numPages.value} pages...`;

  try {
    for (let pageNum = 1; pageNum <= numPages.value; pageNum++) {
      if (!isOpen.value || currentSession !== renderSessionId) break;

      let canvas = canvasElements[pageNum];
      if (!canvas) {
        renderStatus.value = `Waiting for canvas ${pageNum}...`;
        canvas = await waitForCanvas(pageNum);
      }
      if (!canvas) {
        renderStatus.value = `Canvas ${pageNum} not found`;
        continue;
      }

      renderStatus.value = `Loading pg ${pageNum}...`;
      const page = await pdfDoc.value.getPage(pageNum);
      if (!isOpen.value || currentSession !== renderSessionId) break;

      const pixelRatio = window.devicePixelRatio || 1;
      const effectiveScale = zoomScale.value * pixelRatio;
      const viewport = page.getViewport({ scale: effectiveScale });

      // Set canvas pixel buffer dimensions (High DPI crispness)
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Set canvas CSS display dimensions
      canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      renderStatus.value = `Drawing pg ${pageNum} (${canvas.width}x${canvas.height})...`;
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      renderStatus.value = `Pg ${pageNum} rendered! (${canvas.width}x${canvas.height})`;
    }
  } catch (err) {
    renderStatus.value = `ERR: ${err?.message || err}`;
    console.error('Error rendering PDF:', err);
  } finally {
    if (currentSession === renderSessionId) {
      isRendering.value = false;
    }
  }
};

// Compute card dimensions
const getPageCardStyle = () => {
  if (!basePageDimensions.value) return { backgroundColor: '#ffffff' };

  const width = Math.floor(basePageDimensions.value.width * zoomScale.value);
  const height = Math.floor(basePageDimensions.value.height * zoomScale.value);

  return {
    width: `${width}px`,
    minHeight: `${height}px`,
    backgroundColor: '#ffffff'
  };
};

let zoomDebounceTimer = null;
const handleZoomChange = () => {
  if (zoomDebounceTimer) clearTimeout(zoomDebounceTimer);
  zoomDebounceTimer = setTimeout(() => {
    renderAllPages();
  }, 100);
};

const zoomIn = () => {
  if (zoomScale.value < 2.5) {
    zoomScale.value = Math.min(Math.round((zoomScale.value + 0.15) * 100) / 100, 2.5);
    handleZoomChange();
  }
};

const zoomOut = () => {
  if (zoomScale.value > 0.5) {
    zoomScale.value = Math.max(Math.round((zoomScale.value - 0.15) * 100) / 100, 0.5);
    handleZoomChange();
  }
};

const fitToWidth = () => {
  if (!scrollContainerRef.value || !basePageDimensions.value?.width) return;
  const containerWidth = scrollContainerRef.value.clientWidth - 48; // padding
  if (containerWidth > 250) {
    const ideal = containerWidth / basePageDimensions.value.width;
    zoomScale.value = Math.min(Math.max(Math.round(ideal * 100) / 100, 0.6), 2.2);
    handleZoomChange();
  }
};

const scrollToPage = (pageNum) => {
  if (pageNum < 1 || pageNum > numPages.value) return;
  currentPage.value = pageNum;
  const targetEl = document.getElementById(`pdf-page-${pageNum}`);
  if (targetEl && scrollContainerRef.value) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    scrollToPage(currentPage.value - 1);
  }
};

const nextPage = () => {
  if (currentPage.value < numPages.value) {
    scrollToPage(currentPage.value + 1);
  }
};

const handleScroll = () => {
  if (!scrollContainerRef.value || numPages.value <= 1) return;
  const container = scrollContainerRef.value;
  const containerTop = container.getBoundingClientRect().top;

  let closestPage = 1;
  let minDistance = Infinity;

  for (let i = 1; i <= numPages.value; i++) {
    const el = document.getElementById(`pdf-page-${i}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top - containerTop);
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = i;
      }
    }
  }
  currentPage.value = closestPage;
};

const loadPdf = async () => {
  if (!props.material?.id || !props.courseId) return;

  cleanupPdf();
  loading.value = true;
  errorMessage.value = '';
  renderStatus.value = 'Fetching document...';
  sessionId.value = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    const response = await api.get(
      `/lms/student/courses/${props.courseId}/materials/${props.material.id}/view`,
      { responseType: 'arraybuffer' }
    );

    let rawBuffer = response.data;
    if (response.data instanceof Blob) {
      rawBuffer = await response.data.arrayBuffer();
    }

    // If server returned a small JSON error payload instead of raw PDF
    if (rawBuffer?.byteLength !== undefined && rawBuffer.byteLength < 500) {
      try {
        const text = new TextDecoder().decode(rawBuffer);
        const json = JSON.parse(text);
        if (json.message) {
          errorMessage.value = json.message;
          loading.value = false;
          renderStatus.value = `Server Error: ${json.message}`;
          return;
        }
      } catch (e) {}
    }

    renderStatus.value = `Got ${rawBuffer.byteLength}B. Loading PDF.js...`;
    const pdfjs = await loadPdfJs();
    renderStatus.value = 'PDF.js loaded. Parsing doc...';

    const dataClone = rawBuffer.slice(0);
    const loadingTask = pdfjs.getDocument({
      data: dataClone,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });

    const doc = await loadingTask.promise;
    pdfDoc.value = markRaw(doc);
    numPages.value = doc.numPages;
    renderStatus.value = `Parsed: ${doc.numPages} pages.`;

    // Get unscaled dimensions from page 1
    const page1 = await doc.getPage(1);
    const defaultViewport = page1.getViewport({ scale: 1.0 });
    basePageDimensions.value = {
      width: defaultViewport.width,
      height: defaultViewport.height
    };

    // Hide initial loading overlay so Vue mounts the canvas elements immediately
    loading.value = false;
    await nextTick();

    // Calculate initial scale to fit container width nicely
    if (scrollContainerRef.value && defaultViewport.width > 0) {
      const containerWidth = scrollContainerRef.value.clientWidth - 48;
      if (containerWidth > 250) {
        const initialScale = Math.min(Math.max(containerWidth / defaultViewport.width, 0.75), 1.35);
        zoomScale.value = Math.round(initialScale * 100) / 100;
      } else {
        zoomScale.value = 1.0;
      }
    }

    await nextTick();
    await renderAllPages();
  } catch (error) {
    console.error('Failed to load protected PDF:', error);
    loading.value = false;
    renderStatus.value = `FAIL: ${error?.message || error}`;
    if (error.response?.data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(error.response.data);
        const json = JSON.parse(text);
        if (json.message) {
          errorMessage.value = json.message;
          return;
        }
      } catch (e) {}
    }
    if (error.response?.status === 403) {
      errorMessage.value = 'Access denied: You must be actively enrolled in this course to view this study material.';
    } else if (error.response?.status === 404) {
      errorMessage.value = 'This study material document could not be found on the server.';
    } else {
      errorMessage.value = 'Failed to load study material. Please check your network connection and try again.';
    }
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      window.addEventListener('contextmenu', handleGlobalContextMenu, true);
      window.addEventListener('keydown', handleGlobalKeyDown, true);
      loadPdf();
    } else {
      window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      cleanupPdf();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    window.addEventListener('contextmenu', handleGlobalContextMenu, true);
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    loadPdf();
  }
});

onUnmounted(() => {
  window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
  window.removeEventListener('keydown', handleGlobalKeyDown, true);
  cleanupPdf();
});
</script>

<style scoped>
.protected-pdf-container,
.pdf-scroll-container,
.pdf-page-card,
.pdf-page-canvas {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  -webkit-touch-callout: none !important;
}

.pdf-scroll-container {
  background-color: #1e1e1e;
}

.pdf-pages-track {
  min-height: 100%;
}

.pdf-page-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: width 0.15s ease, min-height 0.15s ease;
}

.pdf-page-canvas {
  background-color: #ffffff;
  pointer-events: auto;
}

/* Page corner number badge */
.page-corner-badge {
  position: absolute;
  bottom: 12px;
  right: 14px;
  background: rgba(15, 23, 42, 0.75);
  color: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.5px;
  pointer-events: none;
  z-index: 6;
  backdrop-filter: blur(4px);
}

/* Dynamic floating diagonal watermark grid specifically on each page */
.page-watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  z-index: 5;
}

.watermark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-gap: 80px 40px;
  width: 160%;
  height: 160%;
  margin-top: -15%;
  margin-left: -15%;
  transform: rotate(-25deg);
  pointer-events: none;
}

.watermark-item {
  text-align: center;
  color: rgba(100, 116, 139, 0.15);
  pointer-events: none;
  line-height: 1.35;
}

.watermark-text {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  font-weight: 600;
  opacity: 0.95;
}

.watermark-sub {
  font-size: 0.75rem;
  opacity: 0.82;
}

.watermark-notice {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.72;
}

.zoom-display {
  min-width: 44px;
  text-align: center;
}

.user-select-none {
  user-select: none !important;
}

/* Blank screen on print attempt */
@media print {
  body * {
    display: none !important;
  }
  body::before {
    content: "Printing and reproduction of this course study material is strictly prohibited.";
    font-size: 24px;
    font-weight: bold;
    color: red;
    display: block;
    padding: 50px;
  }
}
</style>
