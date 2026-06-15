<template>
  <section class="hero-section" aria-label="Hero">
    <!-- Subtle grid texture overlay -->
    <div class="hero-grid-bg" aria-hidden="true"></div>
    <!-- Ambient glow blobs -->
    <div class="glow glow-blue" aria-hidden="true"></div>
    <div class="glow glow-purple" aria-hidden="true"></div>

    <div class="hero-inner">
      <!-- Left: Copy -->
      <div class="hero-copy" v-motion-fade-visible>
        <!-- Badge -->
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Season 2026 · 100% Placement Support
        </div>

        <!-- Headline -->
        <h1 class="hero-headline">
          Level Up Your<br />
          <span class="headline-accent">Career</span><br />
          With Experts.
        </h1>

        <!-- Sub-copy -->
        <p class="hero-sub">
          Join India's most comprehensive learning platform. Get certified, build
          real-world projects, and land your dream job.
        </p>

        <!-- CTAs -->
        <div class="hero-ctas">
          <NuxtLink to="/courses" class="cta-primary">
            Browse Courses
            <svg class="cta-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
          <NuxtLink to="/about" class="cta-ghost">Learn More</NuxtLink>
        </div>

        <!-- Social proof -->
        <div class="hero-proof">
          <div class="proof-avatars">
            <img
              v-for="i in 4"
              :key="i"
              :src="`https://i.pravatar.cc/64?u=hero${i}`"
              class="proof-avatar"
              :alt="`Student ${i}`"
              width="32"
              height="32"
            />
          </div>
          <div class="proof-text">
            <strong>10k+</strong> students already enrolled
            <div class="proof-stars">
              <span v-for="s in 5" :key="s" class="star">★</span>
              <span class="proof-rating">4.9 / 5</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Visual panel -->
      <div class="hero-visual" v-motion-slide-right>
        <!-- Main image -->
        <div class="image-frame">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200"
            alt="Students learning together"
            class="hero-img"
            width="600"
            height="450"
          />
          <!-- Scrim at bottom -->
          <div class="image-scrim"></div>
        </div>

        <!-- Floating stat: Placement rate -->
        <div class="float-card float-top" v-motion-roll-visible-top>
          <div class="float-icon float-icon--green">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M3 17l5-5 4 4 9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="float-content">
            <div class="float-label">Placement Rate</div>
            <div class="float-value">94%</div>
            <div class="float-bar">
              <div class="float-bar-fill" style="width: 94%"></div>
            </div>
          </div>
        </div>

        <!-- Floating stat: Certified -->
        <div class="float-card float-bottom" v-motion-roll-visible-bottom>
          <div class="float-icon float-icon--blue">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M9 12l2 2 4-4M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="float-content">
            <div class="float-label">Certified &amp; Job Ready</div>
            <div class="float-value-sm">Industry Recognized</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom metrics row -->
    <div class="hero-metrics" v-motion-fade-visible>
      <div class="metric" v-for="(m, i) in metrics" :key="i">
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const metrics = [
  { value: '10k+', label: 'Active Students' },
  { value: '94%',  label: 'Placement Rate' },
  { value: '200+', label: 'Hiring Partners' },
  { value: '6.5 LPA', label: 'Avg. Package' },
];
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────────── */
.hero-section {
  position: relative;
  overflow: hidden;
  /* Match the site-wide gradient exactly so the hero blends into the page */
  background: linear-gradient(135deg, #eef4ff 0%, #f5eeff 50%, #fff4ee 100%);
  color: #1D1D1F;
  padding: 0 0 0 0;
}

/* ── Texture: dot grid ────────────────────────────────── */
.hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px);
  background-size: 28px 28px;
  z-index: 0;
  pointer-events: none;
}

/* ── Ambient glow blobs ───────────────────────────────── */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
  opacity: 0.28;
}
.glow-blue {
  width: 560px;
  height: 560px;
  background: #5624D0;   /* Udemy purple */
  top: -200px;
  right: -120px;
}
.glow-purple {
  width: 400px;
  height: 400px;
  background: #A435F0;   /* Udemy accent */
  bottom: 0px;
  left: -120px;
  opacity: 0.18;
}

/* ── Inner layout ─────────────────────────────────────── */
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--sp-24) var(--sp-8) var(--sp-20); /* 96px 32px 80px */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-20);  /* 80px */
  align-items: center;
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
    padding: var(--sp-20) var(--sp-6) var(--sp-16); /* 80px 24px 64px */
    gap: var(--sp-12); /* 48px */
  }
  .hero-visual {
    order: -1;
  }
}

/* ── Badge ────────────────────────────────────────────── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(86,36,208,0.22);
  background: rgba(86,36,208,0.08);
  font-size: 12px;
  font-weight: 600;
  color: #5624D0;
  letter-spacing: 0.2px;
  margin-bottom: 28px;
  backdrop-filter: blur(8px);
}
.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #30B94D;
  box-shadow: 0 0 0 3px rgba(48,185,77,0.25);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 3px rgba(48,185,77,0.25); }
  50%       { box-shadow: 0 0 0 6px rgba(48,185,77,0.10); }
}

/* ── Headline ─────────────────────────────────────────── */
.hero-headline {
  font-size: clamp(2.6rem, 5.5vw, 4.25rem);
  font-weight: 900;
  line-height: 1.0;
  letter-spacing: -0.04em;
  color: #1D1D1F;
  margin-bottom: 24px;
}
.headline-accent {
  /* Gradient text */
  background: linear-gradient(135deg, #007AFF 0%, #AF52DE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Sub-copy ─────────────────────────────────────────── */
.hero-sub {
  font-size: 1.05rem;
  font-weight: 400;
  line-height: 1.7;
  color: #636366;
  max-width: 460px;
  margin-bottom: 40px;
}

/* ── CTAs ─────────────────────────────────────────────── */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  background: #5624D0;   /* Udemy purple */
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 0 0 0 rgba(86,36,208,0);
}
.cta-primary:hover {
  background: #3D1FA3;   /* Udemy purple dark */
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(86,36,208,0.40);
}
.cta-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.18s ease;
}
.cta-primary:hover .cta-arrow {
  transform: translateX(3px);
}

.cta-ghost {
  display: inline-flex;
  align-items: center;
  padding: 14px 24px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.14);
  color: #3A3A3C;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
}
.cta-ghost:hover {
  border-color: rgba(86,36,208,0.40);
  color: #5624D0;
  background: rgba(86,36,208,0.05);
}

/* ── Social Proof ─────────────────────────────────────── */
.hero-proof {
  display: flex;
  align-items: center;
  gap: 14px;
}
.proof-avatars {
  display: flex;
}
.proof-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #f0f6ff;
  margin-left: -8px;
  object-fit: cover;
}
.proof-avatar:first-child { margin-left: 0; }

.proof-text {
  font-size: 13px;
  color: #636366;
  line-height: 1.4;
}
.proof-text strong {
  color: #1D1D1F;
  font-weight: 700;
}
.proof-stars {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
}
.star {
  color: #FF9500;
  font-size: 11px;
}
.proof-rating {
  color: #636366;
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
}

/* ── Visual / Image ───────────────────────────────────── */
.hero-visual {
  position: relative;
}
.image-frame {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.07);
  box-shadow: 0 24px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
}
.hero-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 4/3;
}
.image-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%);
}

/* ── Floating cards ───────────────────────────────────── */
.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.80);
  border: 1px solid rgba(0,0,0,0.07);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  min-width: 190px;
}
.float-top {
  top: -20px;
  right: -20px;
}
.float-bottom {
  bottom: -18px;
  left: -20px;
}

@media (max-width: 900px) {
  .float-top  { top: 12px; right: 12px; }
  .float-bottom { bottom: 12px; left: 12px; }
}

.float-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.float-icon--green {
  background: rgba(48,185,77,0.15);
  color: #30B94D;
}
.float-icon--blue {
  background: rgba(86,36,208,0.12);
  color: #5624D0;
}

.float-label {
  font-size: 11px;
  color: #8E8E93;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}
.float-value {
  font-size: 22px;
  font-weight: 900;
  color: #1D1D1F;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 6px;
}
.float-value-sm {
  font-size: 13px;
  font-weight: 600;
  color: #3A3A3C;
}
.float-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
  overflow: hidden;
}
.float-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #30B94D, #60d976);
  border-radius: 99px;
}

/* ── Metrics strip ────────────────────────────────────── */
.hero-metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(0,0,0,0.07);
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(8px);
}

@media (max-width: 640px) {
  .hero-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric {
  padding: var(--sp-6) var(--sp-8); /* 24px 32px */
  border-right: 1px solid rgba(0,0,0,0.07);
  text-align: center;
}
.metric:last-child { border-right: none; }

.metric-value {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #5624D0;   /* Udemy purple */
  line-height: 1;
  margin-bottom: var(--sp-2); /* 8px */
}
.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
