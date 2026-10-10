<template>
  <div class="d-flex flex-column align-center justify-center h-screen bg-grey-lighten-5">
    <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
    <div class="text-subtitle-1 font-weight-bold text-grey-darken-2">Loading your course...</div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const api = useApi();
const courseSlug = computed(() => String(route.params.courseSlug || '').trim());

onMounted(async () => {
  try {
    const slugStr = courseSlug.value.toLowerCase();
    
    // 1. Fetch dashboard to find enrollment
    let enrollment = null;
    try {
      const resDash = await api.get('/lms/student/dashboard');
      const d = resDash.data || resDash;
      const enrollments = d.enrollments || [];
      enrollment = enrollments.find(e => 
        (e.slug && e.slug.toLowerCase() === slugStr) || 
        e.course_id === courseSlug.value || 
        e.id === courseSlug.value
      );
    } catch (e) {
      console.warn('Dashboard fetch in learn redirect:', e);
    }

    // 2. If not found in dashboard, try my-courses endpoint
    if (!enrollment) {
      try {
        const resMy = await api.get('/lms/student/my-courses');
        const myData = resMy.data || resMy;
        const myCourses = Array.isArray(myData) ? myData : (myData?.data || []);
        enrollment = myCourses.find(e => 
          (e.slug && e.slug.toLowerCase() === slugStr) || 
          e.course_id === courseSlug.value || 
          e.id === courseSlug.value
        );
      } catch (e) {
        console.warn('My courses fetch in learn redirect:', e);
      }
    }

    const courseId = enrollment?.course_id || courseSlug.value;

    // 3. Fetch curriculum
    const resCurr = await api.get(`/lms/student/courses/${courseId}/curriculum`);
    const currData = resCurr.data || resCurr || [];
    const curriculum = Array.isArray(currData) ? currData : (currData?.data || []);
    const allLessons = curriculum.flatMap(c => (c.modules || []).flatMap(m => m.lessons || []));
    
    if (allLessons.length > 0) {
      // Find first incomplete lesson or first lesson
      const nextLesson = allLessons.find(l => !l.completed) || allLessons[0];
      if (nextLesson?.id) {
        return router.replace(`/learn/${enrollment?.slug || courseSlug.value}/${nextLesson.id}`);
      }
    }

    // If no lessons exist in curriculum yet
    alert('This course does not have any published lessons yet. Please check back soon.');
    router.replace('/dashboard/student/my-courses');
  } catch (error) {
    console.error('Redirect to lesson failed:', error);
    router.replace('/dashboard/student/my-courses');
  }
});

definePageMeta({
  layout: false,
  middleware: ['auth', 'role', 'enrollment'],
  role: ['student']
});
</script>
