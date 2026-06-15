<template>
  <div class="pa-6 fade-in">
    <!-- Header Section -->
    <div class="d-flex justify-space-between align-center mb-10">
      <div>
        <h1 class="text-h3 font-weight-black text-grey-darken-4 mb-2">Lead Ecosystem</h1>
        <p class="text-h6 text-secondary">Advanced tracking and conversion pipeline for AEMS Academy.</p>
      </div>
      <div class="d-flex align-center gap-4">
        <TabsPill
          v-model="viewMode"
          :tabs="[
            { label: 'Table', value: 'table' },
            { label: 'Kanban', value: 'kanban' }
          ]"
        />
        
        <AppButton
          icon="mdi-plus"
          @click="showAddLeadModal = true"
        >
          Add Lead
        </AppButton>
      </div>
    </div>

    <!-- Stats Section -->
    <v-row class="mb-6">
      <v-col v-for="stat in statsCards" :key="stat.title" cols="12" sm="6" md="3">
        <KpiCard
          :label="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
          :trend="stat.trend"
          @click="navigateTo(stat.route)"
        />
      </v-col>
    </v-row>

    <!-- Filters Bar -->
    <div class="filters-card mb-6 pa-4 d-flex align-center gap-3">
      <div class="search-pill d-flex align-center px-3 flex-grow-1">
        <v-icon icon="mdi-magnify" size="18" color="grey-darken-1" class="mr-2"></v-icon>
        <input 
          v-model="crmStore.filters.search"
          type="text" 
          placeholder="Search leads..." 
          class="search-input"
          @input="debouncedFetch"
        />
      </div>
      
      <div class="filter-selects d-flex gap-2">
        <AppInput
          v-model="crmStore.filters.status"
          type="select"
          :options="[{ label: 'All Status', value: '' }, ...statusOptions.map(s => ({ label: s.toUpperCase(), value: s }))]"
          @update:model-value="fetchData"
        />
        <AppInput
          v-model="crmStore.filters.source"
          type="select"
          :options="[{ label: 'All Sources', value: '' }, ...sourceOptions.map(s => ({ label: s.toUpperCase(), value: s }))]"
          @update:model-value="fetchData"
        />
        <AppInput
          v-if="authStore.isAdmin"
          v-model="crmStore.filters.assigned_to"
          type="select"
          :options="[{ label: 'All Agents', value: '' }, ...agents]"
          @update:model-value="fetchData"
        />
      </div>
    </div>

    <!-- View Content -->
    <div v-if="viewMode === 'table'" class="fade-in">
      <LeadTable @view="viewLead" @delete="confirmDeleteLead" />
    </div>
    
    <div v-else class="kanban-container fade-in">
      <div class="kanban-scroll d-flex gap-4">
        <div v-for="col in kanbanColumns" :key="col.id" class="kanban-column">
          <div class="d-flex align-center justify-space-between mb-4 px-2">
            <div class="d-flex align-center">
              <div class="column-dot mr-2" :style="{ backgroundColor: `var(--${col.color})` }"></div>
              <h3 class="column-title">{{ col.title }}</h3>
            </div>
            <Badge color="gray">{{ col.leads.length }}</Badge>
          </div>
          
          <VueDraggable
            v-model="col.leads"
            group="leads"
            class="kanban-list"
            @end="onDragEnd($event, col.id)"
          >
            <LeadCard
              v-for="lead in col.leads"
              :key="lead.id"
              :lead="lead"
              @click="viewLead"
            />
          </VueDraggable>
        </div>
      </div>
    </div>

    <!-- Today's Follow-ups Alert -->
    <v-fade-transition>
      <div v-if="crmStore.stats.todayFollowups > 0 && !dismissFollowupAlert" class="followup-alert">
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="position-absolute"
          style="top: 8px; right: 8px;"
          @click="dismissFollowupAlert = true"
        ></v-btn>
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-calendar-alert" color="orange" class="mr-2"></v-icon>
          <div class="font-weight-bold">Today's Follow-ups</div>
        </div>
        <div class="text-caption text-secondary mb-3">You have {{ crmStore.stats.todayFollowups }} follow-ups scheduled for today.</div>
        <AppButton size="xs" variant="g" @click="navigateTo('/dashboard/leads/followups')">View All</AppButton>
      </div>
    </v-fade-transition>

    <!-- Add Lead Modal -->
    <AppModal
      v-model="showAddLeadModal"
      title="Add New Lead"
      action-label="Create Lead"
      :loading="saving"
      @submit="submitAddLead"
    >
      <div class="fr2 mb-4">
        <AppInput v-model="newLead.name" label="Full Name" placeholder="Enter name" :error="errors.name" large />
        <AppInput v-model="newLead.phone" label="Phone Number" placeholder="Enter phone" :error="errors.phone" large />
      </div>
      <div class="fr2 mb-4">
        <AppInput v-model="newLead.email" label="Email Address" type="email" placeholder="Enter email" :error="errors.email" large />
        <v-autocomplete
          v-model="newLead.course_interest_ids"
          :items="courses"
          item-title="label"
          item-value="value"
          label="Course Interests"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="comfortable"
          :error-messages="errors.course_interest_ids"
        ></v-autocomplete>
      </div>
      <AppInput v-model="newLead.notes" label="Initial Notes" type="textarea" placeholder="Add any initial details..." :error="errors.notes" large />
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useCRMStore, type Lead } from '@/stores/crm';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';
import LeadTable from '@/components/crm/LeadTable.vue';
import LeadCard from '@/components/crm/LeadCard.vue';
import Badge from '@/components/ui/Badge.vue';
import { VueDraggable } from 'vue-draggable-plus';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'crm_agent']
});

const crmStore = useCRMStore();
const authStore = useAuthStore();
const api = useApi();

const viewMode = ref('table');
const showAddLeadModal = ref(false);
const saving = ref(false);
const dismissFollowupAlert = ref(false);

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
}

const courses = ref<any[]>([]);
const agents = ref<any[]>([]);

const newLead = ref({
  name: '',
  email: '',
  phone: '',
  course_interest_ids: [],
  notes: ''
});

const errors = ref<any>({});

const statusOptions = ['open', 'called', 'interested', 'not_interested', 'rejected', 'converted'];
const sourceOptions = ['website', 'whatsapp', 'manual'];

const statsCards = computed(() => [
  { title: 'Total Leads', value: crmStore.stats.totalLeads, icon: 'mdi-account-group', color: 'blue', route: '/dashboard/leads' },
  { title: 'Open Leads', value: crmStore.stats.openLeads, icon: 'mdi-account-outline', color: 'teal', route: '/dashboard/leads?status=open' },
  { title: 'Converted', value: crmStore.stats.convertedLeads, icon: 'mdi-account-check', color: 'green', route: '/dashboard/leads?status=converted' },
  { title: 'Conv. Rate', value: (crmStore.stats.conversionRate || 0) + '%', icon: 'mdi-trending-up', color: 'orange', trend: 12, route: '/dashboard/leads' },
]);

const kanbanColumns = ref<KanbanColumn[]>([
  { id: 'open', title: 'Open', color: 'blue', leads: [] },
  { id: 'called', title: 'Called', color: 'teal', leads: [] },
  { id: 'interested', title: 'Interested', color: 'purple', leads: [] },
  { id: 'not_interested', title: 'Not Interested', color: 'orange', leads: [] },
  { id: 'rejected', title: 'Rejected', color: 'red', leads: [] },
  { id: 'converted', title: 'Converted', color: 'green', leads: [] },
]);

const fetchData = async () => {
  await crmStore.fetchLeads();
  await crmStore.fetchStats();
  if (viewMode.value === 'kanban') {
    organizeKanban();
  }
};

let debounceTimer: any;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchData, 500);
};

const organizeKanban = () => {
  kanbanColumns.value.forEach(col => {
    col.leads = crmStore.leads.filter(l => l.status === col.id);
  });
};

const onDragEnd = async (event: any, newStatus: string) => {
  const lead = kanbanColumns.value.find(c => c.id === newStatus)?.leads.find(l => (l.status as string) !== newStatus);
  if (lead) {
    try {
      await crmStore.updateLeadStatus(lead.id, newStatus, 'Moved via Kanban');
      lead.status = newStatus as any;
    } catch (error) {
      fetchData();
    }
  }
};

const viewLead = (lead: any) => {
  navigateTo(`/dashboard/leads/${lead.id}`);
};

const confirmDeleteLead = async (lead: any) => {
  if (confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
    try {
      await crmStore.deleteLead(lead.id);
    } catch (error) {
      alert('Failed to delete lead');
    }
  }
};

const submitAddLead = async () => {
  errors.value = {};
  if (!newLead.value.name) errors.value.name = 'Name is required';
  if (!newLead.value.email) errors.value.email = 'Email is required';
  if (!newLead.value.phone) errors.value.phone = 'Phone is required';
  
  if (Object.keys(errors.value).length > 0) return;

  saving.value = true;
  try {
    await crmStore.createLead(newLead.value);
    showAddLeadModal.value = false;
    newLead.value = { name: '', email: '', phone: '', course_interest_ids: [], notes: '' };
  } catch (error) {
    alert('Failed to create lead. Please check your input.');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  fetchData();
  try {
    const [{ data: coursesData }, agentsResponse] = await Promise.all([
      api.get('/public/courses'),
      api.get('/crm/agents')
    ]);
    courses.value = (coursesData.courses || []).map((c: any) => ({ label: c.title, value: c.id }));
    agents.value = (agentsResponse.data || []).map((a: any) => ({ label: a.name, value: a.id }));
  } catch (err) {
    console.error('Failed to load CRM metadata:', err);
  }
});

watch(viewMode, (newVal) => {
  if (newVal === 'kanban') organizeKanban();
});
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  color: #1e293b;
}

.filters-card {
  background: white;
  border-radius: var(--r16);
  box-shadow: var(--s2);
}

.search-pill {
  height: 36px;
  background: var(--g1);
  border-radius: var(--r-pill);
}

.search-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--g6);
}

.kanban-container {
  overflow-x: auto;
  padding-bottom: 20px;
  min-height: calc(100vh - 400px);
}

.kanban-scroll {
  min-width: 1400px;
}

.kanban-column {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--g1);
  border-radius: var(--r16);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--g7);
}

.kanban-list {
  flex-grow: 1;
  min-height: 200px;
}

.followup-alert {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: white;
  border-radius: var(--r16);
  box-shadow: var(--s3);
  padding: 16px;
  z-index: 100;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>
