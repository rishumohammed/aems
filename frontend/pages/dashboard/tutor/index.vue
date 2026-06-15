<template>
  <v-container fluid class="pa-0">
    <!-- Header Section with Gradient -->
    <div class="header-section pa-10 pb-16 mb-n12 rounded-b-xl elevation-6">
      <div class="d-flex align-center justify-space-between mb-2 position-relative" style="z-index: 2">
        <div>
          <h1 class="text-h3 font-weight-black text-white mb-2">Instructor Studio</h1>
          <p class="text-h6 text-white opacity-90">Manage your academy, interact with students, and track your growth.</p>
        </div>
        <v-btn color="amber-accent-2" rounded="xl" class="text-grey-darken-4 font-weight-black px-8 shadow-glow-amber" size="large" to="/dashboard/courses/create" prepend-icon="mdi-plus">
          New Course
        </v-btn>
      </div>
      <div class="header-overlay"></div>
    </div>

    <v-container fluid class="pa-8">
      <!-- Stats Row -->
      <v-row class="mb-8">
        <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3" class="d-flex flex-column">
          <v-card flat class="stat-card rounded-xl pa-6 border-0 overflow-hidden flex-grow-1 w-100" elevation="4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-uppercase font-weight-black text-grey-darken-1 mb-1">{{ stat.title }}</div>
                <div class="text-h3 font-weight-black mb-1 tracking-tight">{{ stat.value }}</div>
                <div class="text-caption font-weight-bold d-flex align-center" :class="'text-' + (stat.trendColor || 'success')">
                  <v-icon size="14" class="mr-1" :icon="stat.trendIcon || 'mdi-trending-up'"></v-icon>
                  {{ stat.trendText }}
                </div>
              </div>
              <v-avatar :color="stat.color" size="64" rounded="lg" class="elevation-10 stat-icon-box">
                <v-icon color="white" size="32">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <!-- Decorative Background Circle -->
            <div class="card-bg-circle" :class="'bg-' + stat.color"></div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content Grid -->
      <v-row>
        <v-col cols="12">
          <v-card flat rounded="xl" class="border-0 shadow-soft">
            <div class="pa-6 border-b d-flex align-center justify-space-between">
              <h2 class="text-h5 font-weight-black">My Courses</h2>
              <v-tabs v-model="courseFilter" density="compact" color="primary" class="font-weight-bold">
                <v-tab value="all">All</v-tab>
                <v-tab value="published">Published</v-tab>
                <v-tab value="draft">Drafts</v-tab>
              </v-tabs>
            </div>
            
            <v-data-table
              :headers="headers"
              :items="filteredCourses"
              :loading="loading"
              hover
              class="modern-table"
            >
              <template v-slot:item.title="{ item }">
                <div class="d-flex align-center py-4">
                  <v-img
                    :src="item.thumbnail_url ? ($config.public.apiBase.replace('/api', '') + item.thumbnail_url) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'"
                    width="100"
                    max-width="100"
                    aspect-ratio="16/9"
                    cover
                    class="rounded-lg mr-4 elevation-2 bg-grey-lighten-4 flex-shrink-0"
                  ></v-img>
                  <div>
                    <div class="text-subtitle-1 font-weight-black mb-1 cursor-pointer hover-link" @click="viewPublic(item)">
                      {{ item.title }}
                    </div>
                    <div class="d-flex align-center mb-1">
                      <v-chip size="x-small" :color="getStatusColor(item.status)" class="font-weight-black mr-2 px-3" variant="flat">
                        {{ item.status.toUpperCase() }}
                      </v-chip>
                      <span class="text-caption text-grey font-weight-bold">{{ item.category_name }}</span>
                    </div>
                    <div class="d-flex align-center flex-wrap gap-1" style="gap: 4px;">
                      <v-chip size="x-small" variant="tonal" color="indigo" class="font-weight-medium">
                        <v-icon start size="10">mdi-book-open-outline</v-icon>
                        {{ item.chapter_count || 0 }} Chaps
                      </v-chip>
                      <v-chip size="x-small" variant="tonal" color="teal" class="font-weight-medium">
                        <v-icon start size="10">mdi-package-variant-closed</v-icon>
                        {{ item.module_count || 0 }} Mods
                      </v-chip>
                      <v-chip size="x-small" variant="tonal" color="red-darken-1" class="font-weight-medium">
                        <v-icon start size="10">mdi-play-circle-outline</v-icon>
                        {{ item.video_count || 0 }} Vids
                      </v-chip>
                      <v-chip size="x-small" variant="tonal" color="deep-orange" class="font-weight-medium">
                        <v-icon start size="10">mdi-file-document-outline</v-icon>
                        {{ item.document_count || 0 }} Docs
                      </v-chip>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:item.enrolled_count="{ item }">
                <div class="text-center">
                  <div class="text-body-1 font-weight-black">{{ item.enrolled_count || 0 }}</div>
                  <div class="text-caption text-grey font-weight-bold">Active Students</div>
                </div>
              </template>

              <template v-slot:item.rating="{ item }">
                <v-chip variant="outlined" size="small" color="amber-darken-2" class="font-weight-black px-3 rounded-pill border-opacity-50">
                  <v-icon size="14" class="mr-1">mdi-star</v-icon>
                  4.8
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex justify-end pr-2">
                  <v-btn icon="mdi-pencil-box-multiple" variant="tonal" size="small" color="primary" class="mr-2 rounded-lg" :to="`/dashboard/courses/${item.id}/edit`"></v-btn>
                  <v-btn icon="mdi-eye-circle" variant="tonal" size="small" color="grey-darken-1" class="rounded-lg" @click="viewPublic(item)"></v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role']
});

const api = useApi();

const loading = ref(true);
const courses = ref([]);
const students = ref([]);
const courseFilter = ref('all');

const coursesCreatedThisMonth = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return courses.value.filter(c => {
    const d = new Date(c.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
});

const studentsThisMonth = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return students.value.filter(s => {
    const d = new Date(s.joined_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
});

const stats = computed(() => {
  const totalCourses = courses.value.length;
  const newCourses = coursesCreatedThisMonth.value;
  const totalStudents = courses.value.reduce((acc, c) => acc + (c.enrolled_count || 0), 0);
  const newStudents = studentsThisMonth.value;
  const pendingCount = courses.value.filter(c => c.status === 'pending_review').length;

  return [
    {
      title: 'My Courses',
      value: totalCourses,
      icon: 'mdi-book-open-variant',
      color: 'primary',
      trendText: newCourses > 0 ? `+${newCourses} this month` : 'All active',
      trendIcon: newCourses > 0 ? 'mdi-trending-up' : 'mdi-check-circle-outline',
      trendColor: newCourses > 0 ? 'success' : 'grey-darken-1'
    },
    {
      title: 'Total Students',
      value: totalStudents,
      icon: 'mdi-account-group',
      color: 'success',
      trendText: newStudents > 0 ? `+${newStudents} this month` : 'No new signups',
      trendIcon: newStudents > 0 ? 'mdi-trending-up' : 'mdi-minus',
      trendColor: newStudents > 0 ? 'success' : 'grey-darken-1'
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      icon: 'mdi-star',
      color: 'amber-darken-2',
      trendText: 'Top 5% instructor',
      trendIcon: 'mdi-award-outline',
      trendColor: 'amber-darken-2'
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: 'mdi-clock-outline',
      color: 'warning',
      trendText: pendingCount > 0 ? 'Requires attention' : 'Up to date',
      trendIcon: pendingCount > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline',
      trendColor: pendingCount > 0 ? 'warning' : 'success'
    }
  ];
});

const filteredCourses = computed(() => {
  if (courseFilter.value === 'all') return courses.value;
  return courses.value.filter(c => c.status === courseFilter.value);
});

const headers = [
  { title: 'Course Details', key: 'title' },
  { title: 'Enrolled', key: 'enrolled_count', align: 'center', width: '150px' },
  { title: 'Feedback', key: 'rating', align: 'center', width: '120px' },
  { title: '', key: 'actions', align: 'end', sortable: false, width: '140px' }
];

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const [coursesRes, studentsRes] = await Promise.all([
      api.get('/lms/courses'),
      api.get('/lms/tutor/students')
    ]);
    courses.value = coursesRes.data || coursesRes || [];
    students.value = studentsRes.data?.students || studentsRes.students || [];
  } catch (error) {
    console.error('Fetch dashboard data error:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'published': return 'success';
    case 'pending_review': return 'warning';
    case 'rejected': return 'error';
    case 'archived': return 'grey';
    default: return 'grey';
  }
};

const viewPublic = (course) => {
  window.open(`/courses/${course.slug}`, '_blank');
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.header-section {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
  position: relative;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%);
  z-index: 1;
}

.shadow-glow-amber {
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.3) !important;
}

.stat-card {
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: white;
  border: 1px solid rgba(0,0,0,0.05) !important;
}

.stat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.1) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

.stat-icon-box {
  z-index: 2;
}

.card-bg-circle {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 1;
}

.shadow-soft {
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}

.tracking-tight {
  letter-spacing: -0.05em;
}

.modern-table :deep(thead th) {
  background: #f1f5f9 !important;
  font-weight: 800 !important;
  color: #1e293b !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.1em;
  border: none !important;
  padding: 16px !important;
}

.modern-table :deep(tr) {
  transition: background 0.2s;
}

.modern-table :deep(tr:hover) {
  background: #f1f5f9 !important;
}

.modern-table :deep(td) {
  padding: 12px 16px !important;
}
</style>
