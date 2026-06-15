<template>
  <div class="homepage-wrapper">
    <div class="homepage">
      <!-- Hero Section -->
      <HeroSection />



      <!-- Category Strip -->
      <CategoryStrip :categories="categories" />



      <!-- Featured Courses -->
      <div class="section-on-gradient section-default">
        <v-container>
          <div class="d-flex align-center justify-space-between mb-12">
            <div>
              <h2 class="section-title">Featured Courses</h2>
              <p class="section-sub" style="max-width:none">Handpicked courses by our industry experts.</p>
            </div>
            <v-btn variant="outlined" rounded="lg" color="primary" class="text-capitalize font-weight-bold" to="/courses">
              View All Courses
            </v-btn>
          </div>

        <v-row>
          <v-col v-for="course in featuredCourses" :key="course.id" cols="12" sm="6" md="4">
            <CourseCard :course="course" />
          </v-col>
        </v-row>
        
          <!-- Empty state if no courses -->
          <div v-if="featuredCourses.length === 0" class="text-center py-10">
            <v-icon size="64" color="grey-lighten-2">mdi-book-open-blank-variant</v-icon>
            <p class="text-grey mt-4">No featured courses available at the moment.</p>
          </div>
        </v-container>
      </div>

      <!-- How it Works -->
      <div class="how-it-works section-default section-frosted">
        <v-container>
          <div class="section-header section-header--center">
            <h2 class="section-title">How it Works</h2>
            <p class="section-sub">Your journey from learning to professional success in three simple steps.</p>
          </div>
          
          <v-row>
            <v-col v-for="(step, i) in steps" :key="i" cols="12" md="4">
              <v-card class="pa-8 text-center h-100" flat border v-motion-fade-visible-once>
                <v-avatar color="primary" size="64" class="mb-6">
                  <v-icon color="white" size="32">{{ step.icon }}</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-3">{{ step.title }}</h3>
                <p class="text-body-2 text-grey-darken-1">{{ step.description }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Lead Capture -->
      <div class="section-default">
        <v-container>
          <div class="lead-capture-card" v-motion-slide-visible-bottom>

            <!-- Left: Copy -->
            <div class="lcc-copy">
              <!-- Eyebrow -->
              <div class="lcc-badge">Free Counseling Session</div>

              <h2 class="lcc-title">Ready to Start<br/>Your Journey?</h2>
              <p class="lcc-sub">Talk to our career experts, explore the right course, and get placed — all with one inquiry.</p>

              <!-- Trust badges -->
              <div class="lcc-trust">
                <div class="lcc-trust-item">
                  <v-icon size="18" color="white">mdi-check-circle</v-icon>
                  <span>94% Placement Rate</span>
                </div>
                <div class="lcc-trust-item">
                  <v-icon size="18" color="white">mdi-check-circle</v-icon>
                  <span>10,000+ Students Placed</span>
                </div>
                <div class="lcc-trust-item">
                  <v-icon size="18" color="white">mdi-check-circle</v-icon>
                  <span>200+ Hiring Partners</span>
                </div>
              </div>

              <!-- WhatsApp CTA -->
              <a :href="generateWALink()" target="_blank" class="lcc-wa-btn">
                <v-icon size="20">mdi-whatsapp</v-icon>
                Chat on WhatsApp
              </a>
            </div>

            <!-- Right: Form -->
            <div class="lcc-form-wrap">
              <div class="lcc-form-card">
                <div class="lcc-form-header">
                  <span class="lcc-form-title">Enquire Now</span>
                  <span class="lcc-form-subtitle">We'll get back within 24 hours</span>
                </div>
                <DynamicLeadForm form-id="default-inquiry-form" source="homepage_quote" />
              </div>
            </div>

            <!-- BG shapes -->
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
          </div>
        </v-container>
      </div>

      </div><!-- /homepage -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
});

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Fetch Data
const { data: stats } = useLazyFetch<any>(`${apiBase}/public/stats`);
const { data: categoriesData } = useLazyFetch<any[]>(`${apiBase}/public/categories`);
const { data: coursesData } = useLazyFetch<any>(`${apiBase}/public/courses?limit=6`);

const categories = computed(() => categoriesData.value || []);
const featuredCourses = computed(() => (coursesData.value as any)?.courses || []);



const steps = [
  { title: 'Enroll', description: 'Choose from 50+ industry-relevant courses and enroll in minutes.', icon: 'mdi-account-plus' },
  { title: 'Learn', description: 'Learn from industry experts with hands-on projects and mentorship.', icon: 'mdi-laptop' },
  { title: 'Get Certified', description: 'Complete the course and exam to get globally recognized certificates.', icon: 'mdi-certificate' }
];

const { generateWALink } = useWhatsApp();

useSeoMeta({
  title: 'AEMS Academy · Advanced Learning & Placements',
  description: 'AEMS Academy is India\'s leading eLearning platform with a 94% placement rate. Enroll in industry-relevant courses and transform your career.'
});
</script>

<style scoped>
/* ── Lead Capture Card ─────────────────────────────────── */
.lead-capture-card {
  /* Udemy purple gradient */
  background: linear-gradient(135deg, #5624D0 0%, #7C3AED 55%, #A435F0 100%);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  padding: 64px 56px;
  box-shadow: 0 24px 80px rgba(86, 36, 208, 0.30);
}

@media (max-width: 960px) {
  .lead-capture-card {
    grid-template-columns: 1fr;
    padding: 48px 32px;
    gap: 36px;
  }
}
@media (max-width: 600px) {
  .lead-capture-card {
    padding: 36px 24px;
  }
}

/* ── Left: Copy ─────────────────────────────────────────── */
.lcc-copy {
  position: relative;
  z-index: 1;
  color: white;
}

/* Eyebrow badge */
.lcc-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.90);
  margin-bottom: 20px;
}

/* Headline */
.lcc-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: white;
  margin-bottom: 16px;
}

/* Subtitle */
.lcc-sub {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.75);
  max-width: 400px;
  margin-bottom: 28px;
}

/* Trust bullets */
.lcc-trust {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
}
.lcc-trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.90);
}

/* WhatsApp button */
.lcc-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  background: #25D366;
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.18s ease, transform 0.18s ease;
  box-shadow: 0 4px 16px rgba(37,211,102,0.35);
}
.lcc-wa-btn:hover {
  background: #1ebe5c;
  transform: translateY(-2px);
}

/* ── Right: Form Card ───────────────────────────────────── */
.lcc-form-wrap {
  position: relative;
  z-index: 1;
}

.lcc-form-card {
  /* Solid white — overrides the global frosted card rule */
  background: #ffffff !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}

.lcc-form-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.lcc-form-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #5624D0;
}
.lcc-form-subtitle {
  font-size: 12px;
  color: #6A6F73;
  font-weight: 500;
}

/* ── Background orbs ───────────────────────────────────── */
.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}
.shape-1 {
  width: 360px;
  height: 360px;
  top: -160px;
  left: -80px;
}
.shape-2 {
  width: 480px;
  height: 480px;
  bottom: -240px;
  right: -120px;
}
</style>

