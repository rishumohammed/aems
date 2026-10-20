<template>
  <div class="email-templates-tab fade-in">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-6 gap-3">
      <div>
        <div class="d-flex align-center gap-2 mb-1 flex-wrap">
          <h2 class="text-h6 font-weight-bold">Email Templates</h2>
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            {{ filteredTemplates.length }} Templates
          </v-chip>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Customize subject lines, dynamic placeholders, and HTML content for all automated system emails.
        </p>
      </div>

      <div class="d-flex align-center gap-2 flex-shrink-0">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          rounded="lg"
          variant="flat"
          @click="openEditor()"
          class="text-none font-weight-bold"
        >
          New Template
        </v-btn>
      </div>
    </div>

    <!-- Filter Category Controls -->
    <v-card variant="outlined" class="rounded-xl pa-3 pa-sm-4 mb-6 bg-surface border-surface">
      <div class="d-flex flex-wrap gap-2 align-center">
        <v-chip
          v-for="cat in categories"
          :key="cat.value"
          :color="selectedCategory === cat.value ? 'primary' : undefined"
          :variant="selectedCategory === cat.value ? 'flat' : 'tonal'"
          class="font-weight-medium text-none"
          size="small"
          rounded="lg"
          @click="selectedCategory = cat.value"
        >
          <v-icon start size="16">{{ cat.icon }}</v-icon>
          {{ cat.label }}
        </v-chip>
      </div>
    </v-card>

    <!-- Templates Loading Skeleton -->
    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTemplates.length === 0" class="text-center py-12">
      <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
        <v-icon size="32">mdi-email-search-outline</v-icon>
      </v-avatar>
      <h3 class="text-subtitle-1 font-weight-bold mb-1">No templates found</h3>
      <p class="text-caption text-secondary mb-4">
        No email templates found in this category.
      </p>
      <v-btn variant="tonal" color="primary" size="small" @click="selectedCategory = 'all'">
        View All Templates
      </v-btn>
    </div>

    <!-- Templates Grid -->
    <v-row v-else class="template-grid">
      <v-col
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        cols="12"
        lg="6"
        class="d-flex"
      >
        <v-card
          variant="outlined"
          class="template-card rounded-xl pa-4 pa-sm-5 d-flex flex-column justify-space-between w-100 transition-swing"
          :class="{ 'opacity-60': !tpl.is_active }"
        >
          <!-- Card Header -->
          <div>
            <div class="d-flex justify-space-between align-center mb-3 gap-2 flex-wrap">
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-chip
                  size="x-small"
                  :color="getCategoryColor(tpl.category)"
                  variant="flat"
                  class="font-weight-bold text-uppercase"
                >
                  {{ tpl.category }}
                </v-chip>

                <v-chip
                  v-if="tpl.is_system"
                  size="x-small"
                  color="grey-darken-1"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  Built-in
                </v-chip>
                <v-chip
                  v-else
                  size="x-small"
                  color="teal"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  Custom
                </v-chip>

                <span class="text-caption font-mono text-medium-emphasis">
                  {{ tpl.code }}
                </span>
              </div>

              <!-- Active Status Switch -->
              <v-switch
                :model-value="tpl.is_active"
                color="success"
                density="compact"
                hide-details
                inset
                class="flex-grow-0 ma-0"
                @update:model-value="toggleActive(tpl)"
                title="Toggle Active Status"
              ></v-switch>
            </div>

            <!-- Title & Subject -->
            <h3 class="text-subtitle-1 font-weight-bold mb-2 text-truncate" :title="tpl.name">
              {{ tpl.name }}
            </h3>

            <div class="subject-box rounded-lg px-3 py-2 mb-3 bg-surface-light border" style="word-break: break-word;">
              <div class="text-caption text-secondary font-weight-medium mb-1">Subject Line:</div>
              <div class="text-body-2 font-weight-bold" :title="tpl.subject">
                {{ tpl.subject }}
              </div>
            </div>

            <!-- Description -->
            <p class="text-caption text-secondary line-clamp-2 mb-3">
              {{ tpl.description || 'No description provided.' }}
            </p>

            <!-- Supported Placeholders Chips -->
            <div v-if="tpl.placeholders && tpl.placeholders.length" class="mb-4">
              <div class="text-caption text-secondary mb-1 font-weight-medium">Dynamic Variables:</div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="ph in tpl.placeholders.slice(0, 5)"
                  :key="ph.key"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  class="font-mono cursor-pointer"
                  @click="copyPlaceholder(ph.key)"
                  :title="`${ph.description || ph.key} (Click to copy)`"
                >
                  {{ ph.key }}
                </v-chip>
                <v-chip
                  v-if="tpl.placeholders.length > 5"
                  size="x-small"
                  variant="text"
                  class="text-caption text-secondary"
                >
                  +{{ tpl.placeholders.length - 5 }} more
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="pt-3 border-t d-flex flex-wrap align-center justify-space-between gap-2 mt-auto">
            <div class="d-flex align-center gap-1 flex-wrap">
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                rounded="lg"
                prepend-icon="mdi-pencil-outline"
                @click="openEditor(tpl)"
                class="text-none font-weight-bold"
              >
                Edit Template
              </v-btn>

              <v-btn
                variant="text"
                color="secondary"
                size="small"
                icon="mdi-eye-outline"
                @click="openQuickPreview(tpl)"
                title="Preview Email"
              ></v-btn>

              <v-btn
                variant="text"
                color="secondary"
                size="small"
                icon="mdi-send-outline"
                @click="openTestModal(tpl)"
                title="Send Test Email"
              ></v-btn>
            </div>

            <div class="d-flex align-center">
              <v-btn
                v-if="tpl.is_system"
                variant="text"
                color="grey"
                size="small"
                icon="mdi-restore"
                @click="confirmReset(tpl)"
                title="Reset to Factory Default"
              ></v-btn>
              <v-btn
                v-else
                variant="text"
                color="error"
                size="small"
                icon="mdi-delete-outline"
                @click="confirmDelete(tpl)"
                title="Delete Custom Template"
              ></v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ========================================== -->
    <!-- DUAL-PANE TEMPLATE EDITOR DIALOG           -->
    <!-- ========================================== -->
    <v-dialog v-model="editorDialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="d-flex flex-column h-100 bg-surface">
        <!-- Editor Top Toolbar -->
        <v-toolbar color="surface" density="comfortable" class="border-b px-4">
          <div class="d-flex align-center gap-2">
            <v-avatar color="primary" variant="tonal" size="36">
              <v-icon size="20">mdi-email-edit-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ editingItem.id ? `Edit: ${editingItem.name}` : 'New Custom Template' }}
              </div>
              <div class="text-caption text-secondary font-mono">
                {{ editingItem.code || 'custom_code' }}
              </div>
            </div>
          </div>

          <v-spacer></v-spacer>

          <!-- Device Preview Mode Toggle -->
          <div class="d-none d-md-flex align-center mr-4 bg-surface-light rounded-lg pa-1 border">
            <v-btn
              size="small"
              :variant="previewDevice === 'desktop' ? 'flat' : 'text'"
              :color="previewDevice === 'desktop' ? 'primary' : undefined"
              icon="mdi-monitor"
              @click="previewDevice = 'desktop'"
              title="Desktop View (600px)"
            ></v-btn>
            <v-btn
              size="small"
              :variant="previewDevice === 'mobile' ? 'flat' : 'text'"
              :color="previewDevice === 'mobile' ? 'primary' : undefined"
              icon="mdi-cellphone"
              @click="previewDevice = 'mobile'"
              title="Mobile View (375px)"
            ></v-btn>
          </div>

          <!-- Quick Test Send from Editor -->
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-send-outline"
            rounded="lg"
            size="small"
            class="text-none font-weight-bold mr-2"
            @click="openTestModal(editingItem)"
          >
            Send Test
          </v-btn>

          <!-- Close Button -->
          <v-btn icon="mdi-close" variant="text" @click="editorDialog = false"></v-btn>
        </v-toolbar>

        <!-- Editor Main Body: Split View -->
        <div class="editor-split-container flex-grow-1 overflow-hidden">
          <!-- LEFT PANE: Form & HTML Code Editor -->
          <div class="editor-pane pa-6 overflow-y-auto">
            <v-form @submit.prevent="saveTemplate">
              <!-- Basic Metadata Grid -->
              <v-row class="mb-2">
                <v-col cols="12" md="6" class="py-1">
                  <v-text-field
                    v-model="editingItem.name"
                    label="Template Title"
                    placeholder="e.g. Student Welcome Email"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3" class="py-1">
                  <v-select
                    v-model="editingItem.category"
                    :items="categorySelectOptions"
                    label="Category"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="3" class="py-1">
                  <v-text-field
                    v-model="editingItem.code"
                    label="Template Code"
                    placeholder="welcome_email"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="editingItem.is_system"
                    hint="Unique identifier"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Subject Line -->
              <div class="mb-4">
                <v-text-field
                  v-model="editingItem.subject"
                  label="Subject Line"
                  placeholder="e.g. Welcome to {{PLATFORM_NAME}}, {{NAME}}!"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  persistent-hint
                  hint="Supports dynamic tags like {{NAME}}, {{COURSE_NAME}}"
                  ref="subjectInputRef"
                >
                  <template #append-inner>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="x-small"
                          color="primary"
                          variant="tonal"
                          rounded="md"
                          class="text-none font-weight-bold"
                        >
                          + Insert Tag
                        </v-btn>
                      </template>
                      <v-list density="compact" class="rounded-lg">
                        <v-list-item
                          v-for="ph in editingItem.placeholders"
                          :key="ph.key"
                          @click="insertIntoSubject(ph.key)"
                        >
                          <v-list-item-title class="font-mono text-caption font-weight-bold text-primary">
                            {{ ph.key }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ ph.description }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-text-field>
              </div>

              <!-- Placeholder Insertion Toolbar -->
              <div class="placeholders-toolbar rounded-lg pa-3 mb-4 bg-surface-light border">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption font-weight-bold text-medium-emphasis">
                    Available Variables (Click to insert into HTML):
                  </span>
                  <span class="text-caption text-secondary">
                    Click tag to insert at cursor
                  </span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="ph in editingItem.placeholders"
                    :key="ph.key"
                    size="small"
                    variant="flat"
                    color="primary"
                    class="font-mono cursor-pointer font-weight-bold"
                    @click="insertIntoHtml(ph.key)"
                    :title="`${ph.description} (Click to insert)`"
                  >
                    <v-icon start size="x-small">mdi-code-tags</v-icon>
                    {{ ph.key }}
                  </v-chip>
                </div>
              </div>

              <!-- Quick HTML Snippet Helpers -->
              <div class="d-flex align-center gap-2 mb-2 flex-wrap">
                <span class="text-caption text-secondary font-weight-bold mr-1">Insert Snippet:</span>
                <v-btn
                  size="x-small"
                  variant="outlined"
                  color="secondary"
                  class="text-none rounded-md"
                  @click="insertSnippet('button')"
                >
                  <v-icon start size="x-small">mdi-gesture-tap-button</v-icon>
                  CTA Button
                </v-btn>
                <v-btn
                  size="x-small"
                  variant="outlined"
                  color="secondary"
                  class="text-none rounded-md"
                  @click="insertSnippet('card')"
                >
                  <v-icon start size="x-small">mdi-card-outline</v-icon>
                  Info Box
                </v-btn>
                <v-btn
                  size="x-small"
                  variant="outlined"
                  color="secondary"
                  class="text-none rounded-md"
                  @click="insertSnippet('divider')"
                >
                  <v-icon start size="x-small">mdi-minus</v-icon>
                  Divider
                </v-btn>
              </div>

              <!-- HTML Code Editor Area -->
              <div class="html-editor-wrapper mb-4">
                <div class="d-flex justify-space-between align-center px-3 py-1 bg-grey-darken-4 rounded-t-lg text-caption text-grey-lighten-1">
                  <span>HTML Email Template Source</span>
                  <span class="font-mono">HTML5 / Inline CSS</span>
                </div>
                <textarea
                  ref="htmlTextareaRef"
                  v-model="editingItem.body_html"
                  class="html-code-textarea"
                  placeholder="<!DOCTYPE html><html>...</html>"
                  rows="18"
                  spellcheck="false"
                  required
                ></textarea>
              </div>

              <!-- Description & Active Status -->
              <v-row class="align-center">
                <v-col cols="12" md="8">
                  <v-textarea
                    v-model="editingItem.description"
                    label="Template Purpose / When it is triggered"
                    rows="2"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="4" class="d-flex justify-end">
                  <v-switch
                    v-model="editingItem.is_active"
                    label="Template Active"
                    color="success"
                    hide-details
                    inset
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </div>

          <!-- RIGHT PANE: Real-Time Live Rendered Preview -->
          <div class="preview-pane pa-6 d-flex flex-column bg-grey-lighten-4 border-l">
            <!-- Simulated Email Client Header -->
            <div class="email-mockup-wrapper mx-auto w-100 d-flex flex-column" :style="previewContainerStyle">
              <div class="email-client-header bg-white pa-4 rounded-t-xl border border-b-0 shadow-sm">
                <div class="d-flex justify-space-between align-center mb-2 pb-2 border-b">
                  <div class="d-flex align-center gap-2">
                    <span class="window-dot bg-red"></span>
                    <span class="window-dot bg-amber"></span>
                    <span class="window-dot bg-green"></span>
                    <span class="text-caption text-secondary ml-2 font-weight-medium">Email Client Preview</span>
                  </div>
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                    {{ previewDevice === 'desktop' ? 'Desktop View' : 'Mobile View' }}
                  </v-chip>
                </div>

                <div class="text-subtitle-1 font-weight-bold mb-1 text-truncate">
                  {{ renderedSubjectPreview || 'Subject will appear here...' }}
                </div>

                <div class="d-flex align-center justify-space-between text-caption text-secondary">
                  <div>
                    <strong>From:</strong> Brix Certifications &lt;noreply@brixify.online&gt;
                  </div>
                  <div>Today</div>
                </div>
                <div class="text-caption text-secondary">
                  <strong>To:</strong> Alex Johnson &lt;alex.johnson@example.com&gt;
                </div>
              </div>

              <!-- Sandboxed Email Render Frame -->
              <div class="email-client-body bg-white rounded-b-xl border shadow-sm flex-grow-1 overflow-hidden" style="min-height: 480px;">
                <iframe
                  :srcdoc="renderedHtmlPreview"
                  class="preview-iframe w-100 h-100"
                  frameborder="0"
                  sandbox="allow-same-origin"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Footer Actions -->
        <v-toolbar color="surface" density="comfortable" class="border-t px-6 justify-space-between">
          <div>
            <v-btn
              v-if="editingItem.id && editingItem.is_system"
              variant="text"
              color="error"
              prepend-icon="mdi-restore"
              @click="confirmReset(editingItem)"
              class="text-none"
            >
              Reset to Factory Default
            </v-btn>
          </div>

          <div class="d-flex align-center gap-3">
            <v-btn variant="text" @click="editorDialog = false" class="text-none">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              class="px-6 text-none font-weight-bold"
              :loading="saving"
              prepend-icon="mdi-check"
              @click="saveTemplate"
            >
              Save Template
            </v-btn>
          </div>
        </v-toolbar>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- SEND TEST EMAIL MODAL                      -->
    <!-- ========================================== -->
    <v-dialog v-model="testModal" max-width="500">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="pa-4 font-weight-bold d-flex align-center gap-2">
          <v-avatar color="primary" variant="tonal" size="36">
            <v-icon size="20">mdi-send-check</v-icon>
          </v-avatar>
          <div>
            <div>Send Test Email</div>
            <div class="text-caption text-secondary font-weight-regular">
              {{ testTargetItem?.name }}
            </div>
          </div>
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Enter a recipient email address to test deliverability and examine formatting directly inside your inbox via Brevo REST API.
          </p>

          <v-text-field
            v-model="testRecipient"
            label="Recipient Email Address"
            placeholder="admin@brixify.online"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            required
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end gap-2">
          <v-btn variant="text" @click="testModal = false" class="text-none">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="sendingTest"
            prepend-icon="mdi-send"
            class="px-5 text-none font-weight-bold"
            @click="dispatchTestEmail"
          >
            Send Test
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" rounded="lg" timeout="3500">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

const api = useApi();

const templates = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const sendingTest = ref(false);

const selectedCategory = ref('all');

const editorDialog = ref(false);
const testModal = ref(false);
const testRecipient = ref('');
const testTargetItem = ref<any>(null);

const previewDevice = ref<'desktop' | 'mobile'>('desktop');
const htmlTextareaRef = ref<HTMLTextAreaElement | null>(null);
const subjectInputRef = ref<any>(null);

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const categories = [
  { label: 'All Templates', value: 'all', icon: 'mdi-view-grid-outline' },
  { label: 'LMS & Learning', value: 'lms', icon: 'mdi-school-outline' },
  { label: 'Events & Sessions', value: 'events', icon: 'mdi-calendar-star' },
  { label: 'Authentication', value: 'auth', icon: 'mdi-shield-lock-outline' },
  { label: 'Jobs & Careers', value: 'jobs', icon: 'mdi-briefcase-outline' },
  { label: 'Staff & Administration', value: 'users', icon: 'mdi-account-cog-outline' }
];

const categorySelectOptions = [
  { title: 'LMS & Learning', value: 'lms' },
  { title: 'Events & Sessions', value: 'events' },
  { title: 'Authentication', value: 'auth' },
  { title: 'Jobs & Careers', value: 'jobs' },
  { title: 'Staff & Administration', value: 'users' },
  { title: 'General', value: 'general' }
];

const defaultTemplate = {
  id: null,
  code: '',
  name: '',
  description: '',
  category: 'general',
  subject: '',
  body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0; }
    .container { max-width: 580px; margin: auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: white; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .btn { display: inline-block; padding: 12px 28px; background: #4f46e5; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Platform Notification</h2>
    </div>
    <div class="content">
      <p>Hello <strong>{{NAME}}</strong>,</p>
      <p>Your notification message goes here.</p>
      <div style="text-align: center;">
        <a href="{{LOGIN_URL}}" class="btn">View Details &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>`,
  placeholders: [
    { key: '{{NAME}}', description: 'Recipient name' },
    { key: '{{LOGIN_URL}}', description: 'Platform URL' }
  ],
  is_active: true,
  is_system: false
};

const editingItem = ref<any>({ ...defaultTemplate });

const showToast = (message: string, color = 'success') => {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Fetch Templates
const fetchTemplates = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/config/email-templates');
    templates.value = data;
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to load email templates', 'error');
  } finally {
    loading.value = false;
  }
};

// Filtered Templates
const filteredTemplates = computed(() => {
  return templates.value.filter((t: any) => {
    return selectedCategory.value === 'all' || t.category === selectedCategory.value;
  });
});

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'lms': return 'blue-darken-1';
    case 'events': return 'purple-darken-1';
    case 'auth': return 'emerald';
    case 'jobs': return 'amber-darken-2';
    case 'users': return 'indigo-darken-1';
    default: return 'grey-darken-1';
  }
};

const previewContainerStyle = computed(() => {
  return {
    maxWidth: previewDevice.value === 'mobile' ? '375px' : '640px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };
});

// Sample mock substitution for live preview
const sampleMockValues: Record<string, string> = {
  '{{NAME}}': 'Ameer',
  '{{STUDENT_NAME}}': 'Alex Johnson',
  '{{EMAIL}}': 'ameer@brixify.online',
  '{{PASSWORD}}': 'Brixify@2026!',
  '{{COURSE_NAME}}': 'Full-Stack Web Development Masterclass',
  '{{LOGIN_URL}}': 'https://brixify.online/login',
  '{{PLATFORM_NAME}}': 'Brix Certifications',
  '{{COMPLETION_DATE}}': 'October 24, 2026',
  '{{CERTIFICATE_TEXT}}': 'Your verified certificate of completion is now available for download.',
  '{{CERTIFICATE_BUTTON}}': '<a href="#" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Download Certificate &rarr;</a>',
  '{{PROFILE_PICTURE_HTML}}': '<div style="width:72px;height:72px;border-radius:50%;background:#4f46e5;color:#ffffff;font-size:28px;font-weight:bold;line-height:72px;text-align:center;margin:0 auto 16px;">AJ</div>',
  '{{FRONTEND_URL}}': 'https://brixify.online',
  '{{RESET_LINK}}': 'https://brixify.online/reset-password?token=sample-reset-token-xyz123',
  '{{EXPIRY_TIME}}': '1 hour',
  '{{EVENT_TITLE}}': 'Highfield International - World Food Day Webinar',
  '{{OTP}}': '739241',
  '{{VALIDITY}}': '10 minutes',
  '{{EVENT_DATE}}': 'Sunday, October 25, 2026 at 07:30 PM IST',
  '{{ATTENDEE_TYPE}}': 'Working',
  '{{ATTENDEE_DETAIL}}': 'Working (Company: Brix)',
  '{{ORGANIZATION}}': 'Company: Brix',
  '{{JOIN_LINK}}': 'https://brixify.online/events/world-food-day',
  '{{JOB_TITLE}}': 'Senior Full Stack Engineer',
  '{{COMPANY_NAME}}': 'Apex Global Technologies',
  '{{PORTAL_URL}}': 'https://brixify.online/dashboard/jobs',
  '{{ADMIN_NOTES}}': 'Great profile credentials! Looking forward to your advanced course syllabus.',
  '{{DASHBOARD_URL}}': 'https://brixify.online/dashboard/tutor',
  '{{REASON}}': 'Application requires updated industry certification portfolio.',
  '{{SUPPORT_EMAIL}}': 'support@brixify.online',
  '{{ROLE}}': 'Placement Coordinator',
  '{{TEMPORARY_PASSWORD}}': 'StaffBrix#2026'
};

const substituteMockVars = (text: string) => {
  if (!text) return '';
  let result = text;
  const currentCode = editingItem.value?.code || '';
  const mockVars: Record<string, string> = { ...sampleMockValues };

  if (currentCode === 'course_enrollment' || currentCode === 'certificate_issued') {
    mockVars['{{NAME}}'] = 'Alex Johnson';
  } else if (currentCode === 'event_registration_success' || currentCode === 'event_reminder') {
    mockVars['{{NAME}}'] = 'Ameer';
    mockVars['{{EVENT_TITLE}}'] = 'Highfield International - World Food Day Webinar';
    mockVars['{{EVENT_DATE}}'] = 'Sunday, October 25, 2026 at 07:30 PM IST';
    mockVars['{{ATTENDEE_TYPE}}'] = 'Working';
    mockVars['{{ORGANIZATION}}'] = 'Company: Brix';
    mockVars['{{JOIN_LINK}}'] = 'https://brixify.online/events/world-food-day';
  }

  for (const [key, val] of Object.entries(mockVars)) {
    result = result.split(key).join(val);
  }
  return result;
};

const renderedSubjectPreview = computed(() => {
  return substituteMockVars(editingItem.value.subject || '');
});

const renderedHtmlPreview = computed(() => {
  return substituteMockVars(editingItem.value.body_html || '');
});

// Toggle Active
const toggleActive = async (tpl: any) => {
  const newStatus = !tpl.is_active;
  tpl.is_active = newStatus;
  try {
    await api.put(`/admin/config/email-templates/${tpl.id}`, { is_active: newStatus });
    showToast(`Template ${newStatus ? 'activated' : 'deactivated'}`);
  } catch (err: any) {
    tpl.is_active = !newStatus; // revert
    showToast(err?.response?.data?.message || 'Failed to update template status', 'error');
  }
};

// Open Editor
const openEditor = (item: any = null) => {
  if (item) {
    editingItem.value = JSON.parse(JSON.stringify(item));
  } else {
    editingItem.value = JSON.parse(JSON.stringify(defaultTemplate));
  }
  editorDialog.value = true;
};

// Open Quick Preview
const openQuickPreview = (item: any) => {
  openEditor(item);
};

// Open Test Modal
const openTestModal = (item: any) => {
  testTargetItem.value = item;
  testModal.value = true;
};

// Dispatch Test Email
const dispatchTestEmail = async () => {
  if (!testTargetItem.value) return;
  sendingTest.value = true;
  try {
    const { data } = await api.post(`/admin/config/email-templates/${testTargetItem.value.id}/test`, {
      recipient: testRecipient.value,
      subject: testTargetItem.value.subject,
      body_html: testTargetItem.value.body_html
    });
    showToast(data.message || 'Test email dispatched successfully!');
    testModal.value = false;
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to dispatch test email', 'error');
  } finally {
    sendingTest.value = false;
  }
};

// Copy Placeholder Tag
const copyPlaceholder = (key: string) => {
  navigator.clipboard.writeText(key);
  showToast(`Copied ${key} to clipboard!`);
};

// Insert into Subject Input
const insertIntoSubject = (key: string) => {
  editingItem.value.subject = (editingItem.value.subject || '') + ` ${key}`;
  showToast(`Inserted ${key} into subject`);
};

// Insert into HTML Textarea at cursor
const insertIntoHtml = (snippet: string) => {
  const textarea = htmlTextareaRef.value;
  if (!textarea) {
    editingItem.value.body_html = (editingItem.value.body_html || '') + snippet;
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = editingItem.value.body_html || '';
  editingItem.value.body_html = text.substring(0, start) + snippet + text.substring(end);

  // Restore cursor position
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + snippet.length, start + snippet.length);
  }, 50);
};

// Insert Predefined Snippets
const insertSnippet = (type: string) => {
  let snippet = '';
  switch (type) {
    case 'button':
      snippet = `\n<div style="text-align: center; margin: 28px 0;">\n  <a href="{{LOGIN_URL}}" target="_blank" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">Action Button &rarr;</a>\n</div>\n`;
      break;
    case 'card':
      snippet = `\n<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">\n  <h4 style="margin: 0 0 8px 0; color: #1e293b;">Important Notice</h4>\n  <p style="margin: 0; color: #475569; font-size: 14px;">Place your highlighted content here.</p>\n</div>\n`;
      break;
    case 'divider':
      snippet = `\n<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">\n`;
      break;
  }
  insertIntoHtml(snippet);
};

// Save Template
const saveTemplate = async () => {
  if (!editingItem.value.name || !editingItem.value.subject || !editingItem.value.body_html) {
    showToast('Name, Subject, and HTML Content are required.', 'error');
    return;
  }

  saving.value = true;
  try {
    if (editingItem.value.id) {
      const { data } = await api.put(`/admin/config/email-templates/${editingItem.value.id}`, {
        name: editingItem.value.name,
        category: editingItem.value.category,
        subject: editingItem.value.subject,
        body_html: editingItem.value.body_html,
        description: editingItem.value.description,
        is_active: editingItem.value.is_active
      });
      showToast('Template updated successfully!');
      const idx = templates.value.findIndex(t => t.id === editingItem.value.id);
      if (idx !== -1) templates.value[idx] = data.template;
    } else {
      const { data } = await api.post('/admin/config/email-templates', editingItem.value);
      showToast('Template created successfully!');
      templates.value.unshift(data.template);
    }
    editorDialog.value = false;
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to save template', 'error');
  } finally {
    saving.value = false;
  }
};

// Reset System Template
const confirmReset = async (tpl: any) => {
  if (!confirm(`Are you sure you want to reset "${tpl.name}" back to its factory default HTML content? Any custom modifications will be overwritten.`)) {
    return;
  }

  try {
    const { data } = await api.post(`/admin/config/email-templates/${tpl.id}/reset`);
    showToast('Template successfully restored to factory defaults!');
    const idx = templates.value.findIndex(t => t.id === tpl.id);
    if (idx !== -1) templates.value[idx] = data.template;
    if (editorDialog.value && editingItem.value.id === tpl.id) {
      editingItem.value = JSON.parse(JSON.stringify(data.template));
    }
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to reset template', 'error');
  }
};

// Delete Custom Template
const confirmDelete = async (tpl: any) => {
  if (!confirm(`Delete template "${tpl.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await api.delete(`/admin/config/email-templates/${tpl.id}`);
    templates.value = templates.value.filter(t => t.id !== tpl.id);
    showToast('Template deleted successfully!');
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to delete template', 'error');
  }
};

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.email-templates-tab {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.category-chips-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
}

.search-input-wrapper {
  min-width: 220px;
}

.template-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--v-theme-surface, #ffffff);
}

.template-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.editor-split-container {
  display: flex;
  height: calc(100vh - 128px);
}

.editor-pane {
  flex: 1;
  max-width: 50%;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.preview-pane {
  flex: 1;
  max-width: 50%;
  background-color: #f1f5f9;
}

@media (max-width: 960px) {
  .editor-split-container {
    flex-direction: column;
    height: auto;
  }
  .editor-pane, .preview-pane {
    max-width: 100%;
  }
}

.html-code-textarea {
  width: 100%;
  background: #0f172a;
  color: #f8fafc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  border: 1px solid #1e293b;
  border-radius: 0 0 12px 12px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.html-code-textarea:focus {
  border-color: rgba(var(--v-theme-primary), 0.8);
}

.window-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.bg-red { background-color: #ef4444; }
.bg-amber { background-color: #f59e0b; }
.bg-green { background-color: #10b981; }

.preview-iframe {
  background: #ffffff;
  min-height: 500px;
}
</style>
