<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="about-hero text-center text-white py-16 position-relative overflow-hidden">
      <div class="hero-bg position-absolute w-100 h-100" style="top:0; left:0; z-index:0;"></div>
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      
      <v-container class="position-relative py-12" style="z-index: 1;">
        <h1 class="text-h2 font-weight-black mb-6 mt-8 hero-title">Empowering Learning, Skills, and Career Success</h1>
        <p class="text-h6 font-weight-medium mb-10 hero-subtitle mx-auto" style="max-width: 850px; opacity: 0.9; line-height: 1.6;">
          A comprehensive learning, certification, examination, and placement platform designed to bridge the gap between education and employment.
        </p>
        <div class="d-flex justify-center gap-4 flex-wrap">
          <v-btn color="white" class="text-primary font-weight-black px-10 text-none" size="x-large" rounded="pill" elevation="3" to="/courses">Explore Courses</v-btn>
        </div>
      </v-container>
    </div>

    <!-- About Section -->
    <div class="py-16 bg-white">
      <v-container class="py-12">
        <v-row align="center">
          <v-col cols="12" md="6" class="pr-md-10">
            <h2 class="text-h3 font-weight-black text-dark mb-8">About AEMS</h2>
            <div class="text-body-1 text-secondary leading-relaxed">
              <p class="mb-5 text-h6 font-weight-medium text-dark">
                <strong>AEMS</strong> is a comprehensive learning and career development platform designed to bridge the gap between education and employment.
              </p>
              <p class="mb-5 text-h6 font-weight-medium text-secondary" style="opacity: 0.9;">
                Our mission is to provide learners with quality education, practical skill development, industry-recognized certifications, and career opportunities through a single integrated ecosystem.
              </p>
              <p>
                We believe that education should not only focus on knowledge acquisition but also on preparing individuals for real-world success. Through our platform, students can learn, practice, get certified, participate in assessments, and connect with employment opportunities that align with their skills and aspirations.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="about-illustration rounded-xl overflow-hidden bg-grey-lighten-4 d-flex align-center justify-center pa-8" style="min-height: 450px; position: relative;">
              <v-icon size="300" color="primary" style="opacity: 0.05; position: absolute;">mdi-rocket-launch</v-icon>
              <v-row class="position-relative z-index-1">
                <v-col cols="6">
                  <v-card class="pa-8 rounded-xl bg-primary text-white text-center shadow-lg hover-lift">
                    <v-icon size="48" class="mb-3">mdi-book-open-variant</v-icon>
                    <div class="font-weight-black text-h5">Learn</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-8 rounded-xl bg-secondary text-white text-center shadow-lg hover-lift mt-8">
                    <v-icon size="48" class="mb-3">mdi-certificate</v-icon>
                    <div class="font-weight-black text-h5">Certify</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-8 rounded-xl bg-info text-white text-center shadow-lg hover-lift">
                    <v-icon size="48" class="mb-3">mdi-checkbox-marked-circle-outline</v-icon>
                    <div class="font-weight-black text-h5">Assess</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-8 rounded-xl bg-success text-white text-center shadow-lg hover-lift mt-8">
                    <v-icon size="48" class="mb-3">mdi-briefcase</v-icon>
                    <div class="font-weight-black text-h5">Work</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- What We Offer -->
    <div class="py-16 bg-grey-lighten-4">
      <v-container class="py-12">
        <div class="text-center mb-16">
          <h2 class="text-h3 font-weight-black text-dark mb-4">What We Offer</h2>
          <p class="text-h6 text-secondary mx-auto" style="max-width: 700px;">
            A complete ecosystem tailored for learning, assessment, and career advancement.
          </p>
        </div>

        <v-row justify="center">
          <v-col cols="12" sm="6" md="4" v-for="(offer, i) in offerings" :key="i">
            <v-card class="pa-8 h-100 rounded-xl hover-lift border-0 shadow-sm d-flex flex-column">
              <v-avatar :color="offer.color + '-lighten-5'" size="80" class="mb-6">
                <v-icon :color="offer.color" size="40">{{ offer.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h5 font-weight-black text-dark mb-3">{{ offer.title }}</h3>
              <p class="text-body-1 text-secondary leading-relaxed flex-grow-1">{{ offer.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Vision & Mission -->
    <div class="py-16 bg-white position-relative">
      <v-container class="py-12">
        <v-row class="align-stretch">
          <!-- Vision -->
          <v-col cols="12" md="6">
            <v-card class="pa-10 rounded-xl bg-primary text-white h-100 border-0 shadow-lg position-relative overflow-hidden">
              <v-icon size="200" color="white" style="position: absolute; right: -40px; bottom: -40px; opacity: 0.1;">mdi-eye</v-icon>
              <div class="position-relative z-index-1">
                <div class="d-flex align-center mb-8">
                  <v-avatar color="white" size="64" class="mr-4 shadow-sm">
                    <v-icon color="primary" size="32">mdi-lightbulb-on</v-icon>
                  </v-avatar>
                  <h2 class="text-h3 font-weight-black">Our Vision</h2>
                </div>
                <p class="text-h5 font-weight-medium leading-relaxed" style="opacity: 0.95; line-height: 1.8 !important;">
                  To create a future where education, skills, certifications, and career opportunities are seamlessly connected, empowering individuals to achieve their personal and professional goals.
                </p>
              </div>
            </v-card>
          </v-col>

          <!-- Mission -->
          <v-col cols="12" md="6">
            <v-card class="pa-10 rounded-xl bg-grey-lighten-4 h-100 border-0 shadow-sm position-relative overflow-hidden">
              <v-icon size="200" color="primary" style="position: absolute; right: -40px; bottom: -40px; opacity: 0.05;">mdi-bullseye-arrow</v-icon>
              <div class="position-relative z-index-1">
                <div class="d-flex align-center mb-8">
                  <v-avatar color="primary" size="64" class="mr-4 shadow-sm text-white">
                    <v-icon size="32">mdi-bullseye-arrow</v-icon>
                  </v-avatar>
                  <h2 class="text-h3 font-weight-black text-dark">Our Mission</h2>
                </div>
                <v-list class="bg-transparent" lines="one">
                  <v-list-item v-for="(item, i) in missions" :key="i" class="px-0 py-3">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="28" class="mr-4">mdi-check-circle</v-icon>
                    </template>
                    <span class="text-h6 font-weight-bold text-dark">{{ item }}</span>
                  </v-list-item>
                </v-list>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Why Choose AEMS -->
    <div class="py-16 bg-white border-t">
      <v-container class="py-12">
        <h2 class="text-h3 font-weight-black text-center text-dark mb-16">Why Choose AEMS</h2>
        <v-row justify="center">
          <v-col cols="12" sm="6" md="4" v-for="(feature, i) in features" :key="i">
            <v-card class="d-flex align-center pa-5 rounded-xl bg-white border shadow-sm hover-lift mb-2 h-100">
              <v-avatar color="success-lighten-5" size="56" class="mr-5">
                <v-icon color="success" size="32">mdi-check-decagram</v-icon>
              </v-avatar>
              <span class="text-h6 font-weight-bold text-dark">{{ feature }}</span>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- CTA Section -->
    <div class="cta-section py-16 position-relative text-white overflow-hidden text-center">
      <div class="cta-bg position-absolute w-100 h-100" style="top:0; left:0; z-index:0;"></div>
      <div class="shape shape-3"></div>
      
      <v-container class="position-relative py-16" style="z-index: 1;">
        <v-icon size="80" color="white" class="mb-6" style="opacity: 0.9;">mdi-account-group</v-icon>
        <h2 class="text-h2 font-weight-black mb-8">Join Our Learning Community</h2>
        <p class="text-h5 font-weight-medium mb-12 mx-auto leading-relaxed" style="max-width: 900px; opacity: 0.9; line-height: 1.6 !important;">
          Whether you are a student looking to build skills, a professional seeking career advancement, an educator sharing expertise, or an employer searching for talented candidates, AEMS provides the tools and opportunities to help you succeed.
        </p>
        <p class="text-h4 font-weight-black mb-12 text-amber-accent-2">
          Together, let's learn, grow, and build successful futures.
        </p>
        <v-btn color="white" class="text-primary font-weight-black px-12 text-none" size="x-large" rounded="pill" elevation="10" to="/register">
          Join AEMS Today
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
});

useSeoMeta({
  title: 'About AEMS | Education, Skills, Certification & Careers',
  description: 'AEMS is a comprehensive learning and career development platform designed to bridge the gap between education and employment.'
});

const offerings = [
  {
    icon: 'mdi-laptop',
    color: 'primary',
    title: 'Learning Management System (LMS)',
    desc: 'Access high-quality courses created by experienced educators and industry professionals.'
  },
  {
    icon: 'mdi-clipboard-text-outline',
    color: 'warning',
    title: 'Online Examinations & Assessments',
    desc: 'Evaluate your knowledge through practice tests, talent assessments, scholarship examinations, and skill-based evaluations.'
  },
  {
    icon: 'mdi-certificate',
    color: 'success',
    title: 'Certification Programs',
    desc: 'Earn verifiable certificates that strengthen academic and professional profiles.'
  },
  {
    icon: 'mdi-briefcase-outline',
    color: 'info',
    title: 'Career Development & Placement Support',
    desc: 'Explore jobs, attend interviews, track applications, and connect with employers.'
  },
  {
    icon: 'mdi-star-circle-outline',
    color: 'deep-purple',
    title: 'Talent & Scholarship Programs',
    desc: 'Participate in exclusive talent hunts and scholarship examinations.'
  }
];

const missions = [
  'Deliver accessible and high-quality education',
  'Support continuous skill development',
  'Enable transparent certification and verification',
  'Connect learners with employment opportunities',
  'Foster lifelong learning and career growth'
];

const features = [
  'Industry-Relevant Courses',
  'Structured Learning Paths',
  'Online Assessments & Certifications',
  'Career & Placement Support',
  'Employer Connections',
  'Student-Centric Learning Experience',
  'Secure and Verifiable Credentials'
];
</script>

<style scoped>
.about-hero {
  background: #5624d0;
}
.hero-bg {
  background: linear-gradient(135deg, rgba(86,36,208,1) 0%, rgba(124,58,237,1) 100%);
}
.cta-bg {
  background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(86,36,208,1) 100%);
}

.leading-relaxed {
  line-height: 1.8 !important;
}

.text-dark {
  color: #0f172a;
}

.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}
.shadow-sm {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.z-index-1 {
  z-index: 1;
}

/* Background Shapes */
.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  pointer-events: none;
}
.shape-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -100px;
}
.shape-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
}
.shape-3 {
  width: 800px;
  height: 800px;
  top: -300px;
  right: -200px;
  background: rgba(255, 255, 255, 0.02);
}

@media (max-width: 960px) {
  .hero-title {
    font-size: 3rem !important;
    line-height: 1.1;
  }
}
@media (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem !important;
    line-height: 1.1;
  }
}
</style>
