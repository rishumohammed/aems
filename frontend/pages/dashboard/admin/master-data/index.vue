<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-2">
          <h1 class="text-h4 font-weight-bold mb-1" style="color: var(--g7);">Master Metadata Management</h1>
          <Badge color="blue">System Config</Badge>
        </div>
        <p style="color: var(--g4); font-size: 13px; font-weight: 500;" class="mb-0">
          Manage dynamic dropdown options for languages, qualifications, and notice periods across Student, Employer, and Job portals.
        </p>
      </div>

      <div class="d-flex gap-2">
        <AppButton variant="blue" icon="mdi-plus" @click="openAddDialog">
          Add {{ activeTabTitle }}
        </AppButton>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <v-card color="white" rounded="xl" border elevation="0" class="pa-3 mb-6">
      <v-tabs v-model="activeTab" color="primary" density="comfortable">
        <v-tab value="languages" class="text-none font-weight-bold">
          <v-icon start size="18">mdi-translate</v-icon>
          Languages ({{ languages.length }})
        </v-tab>
        <v-tab value="qualifications" class="text-none font-weight-bold">
          <v-icon start size="18">mdi-school-outline</v-icon>
          Qualifications & Degrees ({{ qualifications.length }})
        </v-tab>
        <v-tab value="notice_periods" class="text-none font-weight-bold">
          <v-icon start size="18">mdi-clock-fast</v-icon>
          Notice Periods ({{ noticePeriods.length }})
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Content Card -->
    <div class="apple-table-card">
      <!-- 1. Languages Table -->
      <v-data-table
        v-if="activeTab === 'languages'"
        :headers="languageHeaders"
        :items="languages"
        :loading="loading"
        class="apple-data-table"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-bold text-subtitle-2 text-grey-darken-4">
            {{ item.name }}
          </div>
        </template>

        <template v-slot:item.code="{ item }">
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
            {{ item.code || 'N/A' }}
          </v-chip>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :true-value="1"
            :false-value="0"
            color="success"
            density="compact"
            hide-details
            @update:model-value="toggleLanguageStatus(item)"
          ></v-switch>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="deleteItem('languages', item.id, item.name)"></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center text-secondary">
            <v-icon size="48" class="mb-2 opacity-50">mdi-translate-off</v-icon>
            <div>No languages found. Add one above.</div>
          </div>
        </template>
      </v-data-table>

      <!-- 2. Qualifications Table -->
      <v-data-table
        v-if="activeTab === 'qualifications'"
        :headers="qualificationHeaders"
        :items="qualifications"
        :loading="loading"
        class="apple-data-table"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-bold text-subtitle-2 text-grey-darken-4">
            {{ item.name }}
          </div>
        </template>

        <template v-slot:item.level_rank="{ item }">
          <v-chip size="small" color="indigo" variant="tonal" class="font-weight-bold">
            Tier Rank: {{ item.level_rank ?? 1 }}
          </v-chip>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :true-value="1"
            :false-value="0"
            color="success"
            density="compact"
            hide-details
            @update:model-value="toggleQualificationStatus(item)"
          ></v-switch>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="deleteItem('qualifications', item.id, item.name)"></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center text-secondary">
            <v-icon size="48" class="mb-2 opacity-50">mdi-school-outline</v-icon>
            <div>No qualifications found. Add one above.</div>
          </div>
        </template>
      </v-data-table>

      <!-- 3. Notice Periods Table -->
      <v-data-table
        v-if="activeTab === 'notice_periods'"
        :headers="noticePeriodHeaders"
        :items="noticePeriods"
        :loading="loading"
        class="apple-data-table"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-bold text-subtitle-2 text-grey-darken-4">
            {{ item.name }}
          </div>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :true-value="1"
            :false-value="0"
            color="success"
            density="compact"
            hide-details
            @update:model-value="toggleNoticePeriodStatus(item)"
          ></v-switch>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="deleteItem('notice-periods', item.id, item.name)"></v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center text-secondary">
            <v-icon size="48" class="mb-2 opacity-50">mdi-clock-outline</v-icon>
            <div>No notice periods found. Add one above.</div>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Add Item Modal -->
    <v-dialog v-model="addDialog" max-width="480">
      <v-card color="white" rounded="xl" border class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-0">
            Add New {{ activeTabTitle }}
          </h3>
          <v-btn icon="mdi-close" variant="text" size="small" @click="addDialog = false"></v-btn>
        </div>

        <v-divider class="mb-4 border-opacity-10"></v-divider>

        <v-form @submit.prevent="submitAdd">
          <v-text-field
            v-model="addForm.name"
            :label="`${activeTabTitle} Name`"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="mb-4"
            placeholder="e.g. Malayalam or B.Tech"
            :rules="[v => !!v || 'Required']"
          ></v-text-field>

          <v-text-field
            v-if="activeTab === 'languages'"
            v-model="addForm.code"
            label="Language Code (Optional)"
            variant="outlined"
            density="comfortable"
            color="primary"
            placeholder="e.g. ml, ar, en"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-if="activeTab === 'qualifications'"
            v-model.number="addForm.level_rank"
            :items="[
              { title: 'Level 0 - 10th / Secondary', value: 0 },
              { title: 'Level 1 - High School / Plus Two', value: 1 },
              { title: 'Level 2 - Diploma', value: 2 },
              { title: 'Level 3 - Bachelor Degree / Graduate', value: 3 },
              { title: 'Level 4 - Master Degree / Post Graduate', value: 4 },
              { title: 'Level 5 - Doctorate / PhD', value: 5 }
            ]"
            item-title="title"
            item-value="value"
            label="Hierarchy Rank"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="mb-4"
          ></v-select>

          <div class="d-flex justify-end gap-2 mt-4">
            <v-btn variant="tonal" color="grey" @click="addDialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="font-weight-bold px-6"
              :loading="saving"
              type="submit"
            >
              Save {{ activeTabTitle }}
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], roles: ['super_admin'] });

const api = useApi();
const activeTab = ref<'languages' | 'qualifications' | 'notice_periods'>('languages');
const loading = ref(false);
const saving = ref(false);

const languages = ref<any[]>([]);
const qualifications = ref<any[]>([]);
const noticePeriods = ref<any[]>([]);

const addDialog = ref(false);
const addForm = ref({
  name: '',
  code: '',
  level_rank: 3
});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const languageHeaders = [
  { title: 'Language Name', key: 'name', sortable: true },
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Active', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const qualificationHeaders = [
  { title: 'Qualification Level / Degree', key: 'name', sortable: true },
  { title: 'Matching Rank', key: 'level_rank', sortable: true },
  { title: 'Active', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const noticePeriodHeaders = [
  { title: 'Notice Period / Availability', key: 'name', sortable: true },
  { title: 'Active', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const activeTabTitle = computed(() => {
  if (activeTab.value === 'languages') return 'Language';
  if (activeTab.value === 'qualifications') return 'Qualification';
  return 'Notice Period';
});

onMounted(async () => {
  await loadAllData();
});

const loadAllData = async () => {
  loading.value = true;
  try {
    const [langsRes, qualsRes, noticesRes] = await Promise.all([
      api.get('/admin/master-metadata/languages'),
      api.get('/admin/master-metadata/qualifications'),
      api.get('/admin/master-metadata/notice-periods')
    ]);

    languages.value = langsRes.data || langsRes || [];
    qualifications.value = qualsRes.data || qualsRes || [];
    noticePeriods.value = noticesRes.data || noticesRes || [];
  } catch (error) {
    console.error('Failed to load master metadata', error);
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  addForm.value = {
    name: '',
    code: '',
    level_rank: 3
  };
  addDialog.value = true;
};

const submitAdd = async () => {
  if (!addForm.value.name?.trim()) return;

  saving.value = true;
  try {
    let endpoint = '/admin/master-metadata/languages';
    let payload: any = { name: addForm.value.name.trim() };

    if (activeTab.value === 'languages') {
      endpoint = '/admin/master-metadata/languages';
      payload.code = addForm.value.code?.trim() || null;
    } else if (activeTab.value === 'qualifications') {
      endpoint = '/admin/master-metadata/qualifications';
      payload.level_rank = addForm.value.level_rank;
    } else if (activeTab.value === 'notice_periods') {
      endpoint = '/admin/master-metadata/notice-periods';
    }

    await api.post(endpoint, payload);
    snackbarText.value = `${activeTabTitle.value} added successfully!`;
    snackbarColor.value = 'success';
    snackbar.value = true;
    addDialog.value = false;
    await loadAllData();
  } catch (error: any) {
    snackbarText.value = error.response?.data?.message || 'Failed to add item';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    saving.value = false;
  }
};

const toggleLanguageStatus = async (item: any) => {
  try {
    await api.put(`/admin/master-metadata/languages/${item.id}`, { is_active: item.is_active });
  } catch (error) {
    console.error('Failed to toggle status', error);
  }
};

const toggleQualificationStatus = async (item: any) => {
  try {
    await api.put(`/admin/master-metadata/qualifications/${item.id}`, { is_active: item.is_active });
  } catch (error) {
    console.error('Failed to toggle status', error);
  }
};

const toggleNoticePeriodStatus = async (item: any) => {
  try {
    await api.put(`/admin/master-metadata/notice-periods/${item.id}`, { is_active: item.is_active });
  } catch (error) {
    console.error('Failed to toggle status', error);
  }
};

const deleteItem = async (type: string, id: number, name: string) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
  try {
    await api.delete(`/admin/master-metadata/${type}/${id}`);
    snackbarText.value = 'Deleted successfully';
    snackbarColor.value = 'success';
    snackbar.value = true;
    await loadAllData();
  } catch (error: any) {
    snackbarText.value = error.response?.data?.message || 'Failed to delete';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};
</script>

<style scoped>
.apple-table-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.apple-data-table {
  background: transparent !important;
}

:deep(.v-data-table-header th) {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  color: var(--g4) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  background: #f8fafc !important;
}

:deep(.v-data-table__td) {
  font-size: 13px !important;
  color: var(--g6) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
  vertical-align: middle !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
</style>
