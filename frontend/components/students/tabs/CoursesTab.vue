<template>
  <div class="courses-tab">
    <!-- Courses Table -->
    <v-data-table
      :headers="headers"
      :items="enrollments"
      :loading="loading"
      class="elevation-0 rounded-xl border courses-table"
    >
      <!-- Course Column -->
      <template v-slot:item.course="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="44" rounded="lg" class="mr-3 bg-grey-lighten-4 border">
            <v-img :src="item.thumbnail_url || '/placeholder-course.png'" cover></v-img>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-truncate max-width-280">{{ item.title }}</div>
            <div class="text-caption text-grey d-flex align-center gap-1 mt-0-5">
              <v-icon size="13" color="grey">mdi-account-tie</v-icon>
              <span>{{ item.tutor_name || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Attached Invoiced Price & Billing Column -->
      <template v-slot:item.billing="{ item }">
        <div class="py-1">
          <div class="d-flex align-center gap-1">
            <span class="text-subtitle-2 font-weight-black text-grey-darken-3">INR {{ Number(item.price || 0).toLocaleString() }}</span>
            <v-btn
              v-if="item.invoice_id"
              icon="mdi-pencil-outline"
              size="x-small"
              variant="text"
              color="primary"
              title="Adjust Course Price on Invoice"
              @click="openAdjustPriceModal(item)"
            ></v-btn>
          </div>
          <div class="text-caption text-grey-darken-1 d-flex align-center gap-2 mt-0-5">
            <span>Paid: <strong class="text-success">₹{{ Number(item.amount_paid || 0).toLocaleString() }}</strong></span>
            <span>•</span>
            <span>Due: <strong :class="Number(item.balance_due || 0) > 0 ? 'text-error' : 'text-grey'">₹{{ Number(item.balance_due || 0).toLocaleString() }}</strong></span>
          </div>
          <div class="mt-1">
            <v-chip
              :color="getPaymentStatusColor(item.payment_status)"
              size="x-small"
              variant="tonal"
              class="text-uppercase font-weight-bold"
            >
              {{ item.payment_status || 'Pending' }}
            </v-chip>
          </div>
        </div>
      </template>

      <!-- Enrolled Date Column -->
      <template v-slot:item.enrolled_at="{ item }">
        <span class="text-caption font-weight-medium text-grey-darken-2">
          {{ formatDate(item.enrolled_at) }}
        </span>
      </template>

      <!-- Progress Column -->
      <template v-slot:item.progress="{ item }">
        <div style="min-width: 140px">
          <UiProgressFraction
            :current="item.completed_lessons || 0"
            :total="item.total_lessons || 100"
          />
        </div>
      </template>

      <!-- Status Column with Quick Change Menu -->
      <template v-slot:item.status="{ item }">
        <v-menu location="bottom end">
          <template v-slot:activator="{ props: menuProps }">
            <v-chip
              v-bind="menuProps"
              :color="getStatusColor(item.status)"
              size="small"
              class="text-uppercase font-weight-bold cursor-pointer"
              append-icon="mdi-chevron-down"
            >
              {{ item.status }}
            </v-chip>
          </template>
          <v-list density="compact" class="rounded-lg elevation-4 border">
            <v-list-item
              v-for="st in ['active', 'suspended', 'completed']"
              :key="st"
              :active="item.status === st"
              @click="changeStatus(item.id, st)"
            >
              <template v-slot:prepend>
                <v-icon size="16" :color="getStatusColor(st)">
                  {{ st === 'active' ? 'mdi-check-circle' : (st === 'completed' ? 'mdi-trophy' : 'mdi-pause-circle') }}
                </v-icon>
              </template>
              <v-list-item-title class="text-capitalize text-caption font-weight-bold">
                Mark as {{ st }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center justify-end gap-1">
          <!-- View Course Page -->
          <v-btn
            icon="mdi-eye-outline"
            size="small"
            variant="text"
            color="grey-darken-2"
            title="View Course"
            :to="`/courses/${item.slug}`"
            target="_blank"
          ></v-btn>

          <!-- Change / Switch Course -->
          <v-btn
            icon="mdi-swap-horizontal"
            size="small"
            variant="text"
            color="primary"
            title="Change to Another Course"
            @click="openChangeCourseModal(item)"
          ></v-btn>

          <!-- Adjust Price -->
          <v-btn
            v-if="item.invoice_id"
            icon="mdi-currency-inr"
            size="small"
            variant="text"
            color="amber-darken-3"
            title="Adjust Invoiced Price"
            @click="openAdjustPriceModal(item)"
          ></v-btn>

          <!-- Remove / Unenroll Course -->
          <v-btn
            icon="mdi-trash-can-outline"
            size="small"
            variant="text"
            color="error"
            title="Remove Enrolled Course"
            @click="openRemoveCourseModal(item)"
          ></v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Bottom Action Button -->
    <div class="mt-8 d-flex justify-center">
      <v-btn
        color="primary"
        variant="outlined"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="font-weight-bold px-6"
        @click="$emit('enroll')"
      >
        Enroll in Another Course
      </v-btn>
    </div>

    <!-- ============================================== -->
    <!-- MODAL 1: CHANGE / SWITCH COURSE                -->
    <!-- ============================================== -->
    <v-dialog v-model="changeModal" max-width="600px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="primary" flat>
          <v-icon color="white" class="ml-4 mr-2">mdi-swap-horizontal</v-icon>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Change Enrolled Course</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="changeModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <!-- Current Course Box -->
          <div class="pa-4 rounded-lg bg-grey-lighten-4 border mb-5">
            <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Current Course</div>
            <div class="text-subtitle-1 font-weight-black text-grey-darken-4 mt-1">{{ selectedEnrollment?.title }}</div>
            <div class="d-flex align-center flex-wrap gap-4 mt-2 text-caption text-grey-darken-2">
              <span>Billed Price: <strong>₹{{ Number(selectedEnrollment?.price || 0).toLocaleString() }}</strong></span>
              <span>Amount Paid: <strong class="text-success">₹{{ Number(selectedEnrollment?.amount_paid || 0).toLocaleString() }}</strong></span>
              <span>Balance: <strong class="text-error">₹{{ Number(selectedEnrollment?.balance_due || 0).toLocaleString() }}</strong></span>
            </div>
          </div>

          <!-- Select New Course -->
          <v-autocomplete
            v-model="changeForm.newCourseId"
            :items="availableTargetCourses"
            item-title="title"
            item-value="id"
            label="Select New Course"
            placeholder="Search course title..."
            variant="outlined"
            prepend-inner-icon="mdi-book-arrow-right"
            :loading="loadingCourses"
            class="mb-4"
            required
            @update:model-value="onNewCourseSelected"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="'Standard Fee: INR ' + (item.raw.price || 0)">
                <template v-slot:append>
                  <v-chip size="x-small" color="primary" variant="tonal">
                    INR {{ item.raw.price }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Adjusted Price for New Course -->
          <v-text-field
            v-model="changeForm.newPrice"
            label="Course Fee for New Course (INR)"
            variant="outlined"
            prefix="INR"
            type="number"
            min="0"
            hint="Prefilled with new course price. You can adjust for discounts/scholarships."
            persistent-hint
            class="mb-4"
          ></v-text-field>

          <!-- Live Billing Impact Summary -->
          <v-card variant="tonal" color="primary" class="rounded-lg pa-4 mb-4" flat>
            <div class="text-subtitle-2 font-weight-bold mb-2">Billing & Balance Impact</div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>New Course Fee:</span>
              <span class="font-weight-bold">INR {{ Number(changeForm.newPrice || 0).toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Credit from Amount Paid:</span>
              <span class="font-weight-bold text-success">- INR {{ Number(selectedEnrollment?.amount_paid || 0).toLocaleString() }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-subtitle-2 font-weight-black">
              <span>New Balance Due:</span>
              <span :class="calculatedNewBalance > 0 ? 'text-error font-weight-black' : 'text-success font-weight-black'">
                INR {{ calculatedNewBalance.toLocaleString() }}
              </span>
            </div>
          </v-card>

          <!-- Reset Progress Option -->
          <v-checkbox
            v-model="changeForm.resetProgress"
            label="Reset lesson progress & completion to 0% for the new course"
            density="comfortable"
            color="primary"
            hide-details
          ></v-checkbox>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="changeModal = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold"
            :loading="changingCourse"
            :disabled="!changeForm.newCourseId"
            @click="submitChangeCourse"
          >
            Confirm Transfer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================== -->
    <!-- MODAL 2: ADJUST INVOICED COURSE PRICE          -->
    <!-- ============================================== -->
    <v-dialog v-model="priceModal" max-width="500px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="amber-darken-3" flat>
          <v-icon color="white" class="ml-4 mr-2">mdi-currency-inr</v-icon>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Adjust Course Price</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="priceModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-black">{{ selectedEnrollment?.title }}</div>
            <div class="text-caption text-grey">Invoice #{{ selectedEnrollment?.invoice_number || selectedEnrollment?.invoice_id?.slice(0, 8) }}</div>
          </div>

          <v-text-field
            v-model="priceForm.price"
            label="New Course Total Fee (INR)"
            variant="outlined"
            prefix="INR"
            type="number"
            min="0"
            class="mb-4"
            hint="Update the total billed price for this course on student's invoice"
            persistent-hint
          ></v-text-field>

          <!-- Real-Time Calculation -->
          <v-card variant="tonal" color="amber-darken-4" class="rounded-lg pa-4 mb-2" flat>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Adjusted Total Price:</span>
              <span class="font-weight-bold">INR {{ Number(priceForm.price || 0).toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Amount Already Paid:</span>
              <span class="font-weight-bold text-success">INR {{ Number(selectedEnrollment?.amount_paid || 0).toLocaleString() }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-subtitle-2 font-weight-black">
              <span>New Balance Due:</span>
              <span :class="calculatedAdjustedBalance > 0 ? 'text-error' : 'text-success'">
                INR {{ calculatedAdjustedBalance.toLocaleString() }}
              </span>
            </div>
          </v-card>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="priceModal = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="amber-darken-3"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold text-white"
            :loading="adjustingPrice"
            @click="submitAdjustPrice"
          >
            Update Price
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================== -->
    <!-- MODAL 3: REMOVE / UNENROLL COURSE              -->
    <!-- ============================================== -->
    <v-dialog v-model="removeModal" max-width="500px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="error" flat>
          <v-icon color="white" class="ml-4 mr-2">mdi-alert-circle-outline</v-icon>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Remove Enrolled Course</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" variant="text" @click="removeModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <p class="text-body-1 text-grey-darken-3 mb-4">
            Are you sure you want to remove <strong class="text-grey-darken-4 font-weight-black">{{ selectedEnrollment?.title }}</strong> from this student?
          </p>

          <v-alert
            v-if="Number(selectedEnrollment?.amount_paid || 0) > 0"
            type="warning"
            variant="tonal"
            class="rounded-lg mb-4"
            density="compact"
          >
            This student has already paid <strong>INR {{ Number(selectedEnrollment?.amount_paid || 0).toLocaleString() }}</strong> for this course. Removing the course will void the remaining balance due.
          </v-alert>

          <v-checkbox
            v-model="removeForm.cancelInvoice"
            label="Void attached unpaid invoice and clear balance due"
            density="comfortable"
            color="error"
            hide-details
          ></v-checkbox>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="removeModal = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="px-6 font-weight-bold"
            :loading="removingCourse"
            @click="submitRemoveCourse"
          >
            Yes, Remove Course
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  enrollments: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  studentId: { type: String, default: '' }
});

const emit = defineEmits(['enroll', 'update-status', 'refresh']);

const { $api } = useNuxtApp();
const route = useRoute();
const currentStudentId = computed(() => props.studentId || route.params.id);

const headers = [
  { title: 'Course', key: 'course', align: 'start' },
  { title: 'Invoiced Price & Billing', key: 'billing', align: 'start' },
  { title: 'Enrolled Date', key: 'enrolled_at', align: 'center' },
  { title: 'Progress', key: 'progress', align: 'center' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
];

// All courses cache for transfer
const allCourses = ref([]);
const loadingCourses = ref(false);

const fetchPublishedCourses = async () => {
  if (allCourses.value.length > 0) return;
  loadingCourses.value = true;
  try {
    const { data } = await $api.get('/public/courses');
    allCourses.value = (data?.courses || []).filter(c => c.status === 'published');
  } catch (err) {
    console.error('Failed to load courses:', err);
  } finally {
    loadingCourses.value = false;
  }
};

const availableTargetCourses = computed(() => {
  const currentlyEnrolledIds = props.enrollments.map(e => e.course_id);
  return allCourses.value.filter(c => !currentlyEnrolledIds.includes(c.id));
});

// Modal states
const changeModal = ref(false);
const changingCourse = ref(false);
const selectedEnrollment = ref(null);
const changeForm = ref({
  newCourseId: null,
  newPrice: 0,
  resetProgress: true
});

const calculatedNewBalance = computed(() => {
  const fee = parseFloat(changeForm.value.newPrice) || 0;
  const paid = parseFloat(selectedEnrollment.value?.amount_paid) || 0;
  return Math.max(0, fee - paid);
});

const openChangeCourseModal = async (enrollment) => {
  selectedEnrollment.value = enrollment;
  changeForm.value = {
    newCourseId: null,
    newPrice: 0,
    resetProgress: true
  };
  changeModal.value = true;
  await fetchPublishedCourses();
};

const onNewCourseSelected = (newId) => {
  const target = allCourses.value.find(c => c.id === newId);
  if (target) {
    changeForm.value.newPrice = parseFloat(target.price) || 0;
  }
};

const submitChangeCourse = async () => {
  if (!selectedEnrollment.value || !changeForm.value.newCourseId) return;
  changingCourse.value = true;
  try {
    await $api.post(`/admin/students/${currentStudentId.value}/courses/${selectedEnrollment.value.enrollment_id || selectedEnrollment.value.id}/change`, {
      new_course_id: changeForm.value.newCourseId,
      new_price: parseFloat(changeForm.value.newPrice) || 0,
      reset_progress: changeForm.value.resetProgress
    });
    changeModal.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Failed to change course:', error);
    alert(error.response?.data?.message || 'Failed to change course');
  } finally {
    changingCourse.value = false;
  }
};

// Modal: Adjust Invoiced Price
const priceModal = ref(false);
const adjustingPrice = ref(false);
const priceForm = ref({
  price: 0
});

const calculatedAdjustedBalance = computed(() => {
  const newP = parseFloat(priceForm.value.price) || 0;
  const paid = parseFloat(selectedEnrollment.value?.amount_paid) || 0;
  return Math.max(0, newP - paid);
});

const openAdjustPriceModal = (enrollment) => {
  selectedEnrollment.value = enrollment;
  priceForm.value.price = parseFloat(enrollment.price || 0);
  priceModal.value = true;
};

const submitAdjustPrice = async () => {
  if (!selectedEnrollment.value?.invoice_id) return;
  adjustingPrice.value = true;
  try {
    await $api.put(`/admin/students/invoices/${selectedEnrollment.value.invoice_id}/adjust-price`, {
      price: parseFloat(priceForm.value.price) || 0
    });
    priceModal.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Failed to adjust price:', error);
    alert(error.response?.data?.message || 'Failed to adjust price');
  } finally {
    adjustingPrice.value = false;
  }
};

// Modal: Remove Course
const removeModal = ref(false);
const removingCourse = ref(false);
const removeForm = ref({
  cancelInvoice: true
});

const openRemoveCourseModal = (enrollment) => {
  selectedEnrollment.value = enrollment;
  removeForm.value.cancelInvoice = true;
  removeModal.value = true;
};

const submitRemoveCourse = async () => {
  if (!selectedEnrollment.value) return;
  removingCourse.value = true;
  try {
    await $api.delete(`/admin/students/${currentStudentId.value}/courses/${selectedEnrollment.value.enrollment_id || selectedEnrollment.value.id}`, {
      data: { cancel_invoice: removeForm.value.cancelInvoice }
    });
    removeModal.value = false;
    emit('refresh');
  } catch (error) {
    console.error('Failed to remove course:', error);
    alert(error.response?.data?.message || 'Failed to remove enrolled course');
  } finally {
    removingCourse.value = false;
  }
};

// Change enrollment status
const changeStatus = (enrollmentId, status) => {
  emit('update-status', enrollmentId, status);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY');
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'primary';
    case 'completed': return 'success';
    case 'suspended': return 'error';
    default: return 'grey';
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'pending': return 'error';
    default: return 'grey';
  }
};

onMounted(() => {
  fetchPublishedCourses();
});
</script>

<style scoped>
.max-width-280 {
  max-width: 280px;
}
.courses-table :deep(th) {
  font-weight: 700 !important;
  color: #475569 !important;
}
</style>
