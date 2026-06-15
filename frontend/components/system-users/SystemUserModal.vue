<template>
  <v-dialog v-model="isOpen" max-width="800px" persistent>
    <v-card class="rounded-xl">
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          {{ isEdit ? 'Edit System User' : 'Add System User' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" color="white" variant="text" @click="close"></v-btn>
      </v-toolbar>

      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab value="personal">Personal Info</v-tab>
        <v-tab value="account">Account Info</v-tab>
        <v-tab value="permissions">Role & Permissions</v-tab>
      </v-tabs>

      <v-card-text class="pa-6" style="min-height: 400px; max-height: 60vh; overflow-y: auto;">
        <v-form ref="form" v-model="isValid" @submit.prevent="submit">
          <!-- PERSONAL INFO -->
          <v-window v-model="activeTab">
            <v-window-item value="personal">
              <v-text-field
                v-model="formData.name"
                label="Full Name"
                variant="outlined"
                class="mb-4"
                required
                :rules="[v => !!v || 'Name is required']"
              ></v-text-field>
              <v-text-field
                v-model="formData.email"
                label="Email Address"
                type="email"
                variant="outlined"
                class="mb-4"
                required
                :rules="[v => !!v || 'Email is required']"
              ></v-text-field>
              <v-text-field
                v-model="formData.phone"
                label="Phone Number"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
            </v-window-item>

            <!-- ACCOUNT INFO -->
            <v-window-item value="account">
              <v-alert
                v-if="!isEdit"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                A temporary password will be automatically generated and emailed to the user. You can also set a specific password below.
              </v-alert>
              <v-alert
                v-else
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Use the "Reset Password" action from the table to generate a new password for this user.
              </v-alert>

              <div v-if="!isEdit">
                <v-text-field
                  v-model="formData.password"
                  label="Password (Optional)"
                  type="password"
                  variant="outlined"
                  class="mb-4"
                  hint="Leave blank to auto-generate"
                  persistent-hint
                ></v-text-field>
              </div>
            </v-window-item>

            <!-- ROLE & PERMISSIONS -->
            <v-window-item value="permissions">
              <v-select
                v-model="formData.role"
                :items="roles"
                item-title="label"
                item-value="value"
                label="System Role"
                variant="outlined"
                class="mb-6"
                required
                :rules="[v => !!v || 'Role is required']"
              ></v-select>

              <div v-if="formData.role === 'sub_admin'">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">Module Permissions</h3>
                <v-table density="compact" class="border rounded">
                  <thead>
                    <tr>
                      <th class="text-left">Module</th>
                      <th class="text-center">View</th>
                      <th class="text-center">Create</th>
                      <th class="text-center">Edit</th>
                      <th class="text-center">Delete</th>
                      <th class="text-center">Approve</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="module in modules" :key="module.id">
                      <td class="font-weight-medium">{{ module.label }}</td>
                      <td class="text-center">
                        <v-checkbox-btn v-model="formData.permissions_json[module.id].view" color="primary"></v-checkbox-btn>
                      </td>
                      <td class="text-center">
                        <v-checkbox-btn v-model="formData.permissions_json[module.id].create" color="primary"></v-checkbox-btn>
                      </td>
                      <td class="text-center">
                        <v-checkbox-btn v-model="formData.permissions_json[module.id].edit" color="primary"></v-checkbox-btn>
                      </td>
                      <td class="text-center">
                        <v-checkbox-btn v-model="formData.permissions_json[module.id].delete" color="error"></v-checkbox-btn>
                      </td>
                      <td class="text-center">
                        <v-checkbox-btn v-model="formData.permissions_json[module.id].approve" color="success" :disabled="!module.hasApprove"></v-checkbox-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <v-alert
                v-else-if="formData.role"
                type="info"
                variant="tonal"
                class="mt-4"
              >
                {{ getRoleDescription(formData.role) }}
              </v-alert>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-6">
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="submit"
          :loading="saving"
          :disabled="!isValid"
          elevation="0"
          rounded="lg"
          size="large"
        >
          {{ isEdit ? 'Save Changes' : 'Create User' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  user: Object
});

const emit = defineEmits(['update:modelValue', 'success']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEdit = computed(() => !!props.user?.id);
const activeTab = ref('personal');
const isValid = ref(false);
const saving = ref(false);
const api = useApi();

const modules = [
  { id: 'students', label: 'Students', hasApprove: false },
  { id: 'tutors', label: 'Tutors', hasApprove: true },
  { id: 'courses', label: 'Courses', hasApprove: true },
  { id: 'employers', label: 'Employers', hasApprove: true },
  { id: 'jobs', label: 'Jobs', hasApprove: true },
  { id: 'crm', label: 'CRM / Leads', hasApprove: false },
  { id: 'exams', label: 'Exams', hasApprove: false },
  { id: 'finance', label: 'Finance', hasApprove: false }
];

const roles = [
  { label: 'Sub Admin', value: 'sub_admin', desc: 'Configurable granular permissions.' },
  { label: 'CRM User', value: 'crm_agent', desc: 'Access to Leads, Enquiries, Follow-ups, and Students only.' },
  { label: 'Placement Coordinator', value: 'placement_coordinator', desc: 'Access to Employers, Jobs, Applications, and Interviews.' },
  { label: 'Finance Staff', value: 'finance_staff', desc: 'Access to Payments, Invoices, and Offline Payments.' },
  { label: 'Exam Manager', value: 'exam_manager', desc: 'Access to Exams, Question Banks, and Proctoring Logs.' },
  { label: 'Support Staff', value: 'support_staff', desc: 'General read-only or limited support access.' },
  { label: 'Super Admin', value: 'super_admin', desc: 'Full unrestricted system access.' }
];

const getRoleDescription = (roleValue) => {
  return roles.find(r => r.value === roleValue)?.desc || '';
};

const defaultPermissions = () => {
  const perms = {};
  modules.forEach(m => {
    perms[m.id] = { view: false, create: false, edit: false, delete: false, approve: false };
  });
  return perms;
};

const formData = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: null,
  permissions_json: defaultPermissions()
});

watch(() => props.modelValue, (val) => {
  if (val) {
    activeTab.value = 'personal';
    if (props.user) {
      formData.value = {
        name: props.user.name || '',
        email: props.user.email || '',
        phone: props.user.phone || '',
        role: props.user.role || null,
        password: '',
        permissions_json: props.user.permissions_json 
          ? (typeof props.user.permissions_json === 'string' ? JSON.parse(props.user.permissions_json) : props.user.permissions_json) 
          : defaultPermissions()
      };
      
      // Ensure all modules exist in permissions
      modules.forEach(m => {
        if (!formData.value.permissions_json[m.id]) {
          formData.value.permissions_json[m.id] = { view: false, create: false, edit: false, delete: false, approve: false };
        }
      });
    } else {
      formData.value = {
        name: '',
        email: '',
        phone: '',
        password: '',
        role: null,
        permissions_json: defaultPermissions()
      };
    }
  }
});

const close = () => {
  isOpen.value = false;
};

const submit = async () => {
  saving.value = true;
  try {
    const payload = { ...formData.value };
    if (payload.role !== 'sub_admin') {
      payload.permissions_json = null; // Clear custom perms if not sub_admin
    }

    if (isEdit.value) {
      delete payload.password; // Don't send empty password on edit
      await api.put(`/admin/system-users/${props.user.id}`, payload);
    } else {
      await api.post('/admin/system-users', payload);
    }
    
    emit('success');
    close();
  } catch (error) {
    console.error('Failed to save system user:', error);
    alert(error.response?.data?.message || 'Failed to save system user');
  } finally {
    saving.value = false;
  }
};
</script>
