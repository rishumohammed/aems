<template>
  <div class="iso-overview-page">
    <!-- ── Breadcrumbs Bar ─────────────────────────────────────────── -->
    <nav class="breadcrumb-strip py-3 bg-surface-light border-b" aria-label="Breadcrumb">
      <v-container>
        <ol class="breadcrumb-list d-flex align-center flex-wrap gap-2 pa-0 ma-0" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="d-flex align-center">
            <NuxtLink to="/" itemprop="item" class="breadcrumb-link text-caption text-secondary font-weight-medium">
              <span itemprop="name">Home</span>
            </NuxtLink>
            <meta itemprop="position" content="1" />
            <v-icon size="14" color="grey" class="mx-2">mdi-chevron-right</v-icon>
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="d-flex align-center">
            <NuxtLink to="/#standards" itemprop="item" class="breadcrumb-link text-caption text-secondary font-weight-medium">
              <span itemprop="name">Certifications</span>
            </NuxtLink>
            <meta itemprop="position" content="2" />
            <v-icon size="14" color="grey" class="mx-2">mdi-chevron-right</v-icon>
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="d-flex align-center">
            <span itemprop="name" class="text-caption font-weight-bold text-dark">ISO Certification Guide</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </v-container>
    </nav>

    <!-- ── Hero Section ───────────────────────────────────────────── -->
    <header class="cert-hero position-relative overflow-hidden py-12 py-md-16">
      <div class="cert-hero-bg"></div>
      <div class="cert-hero-pattern"></div>

      <v-container class="position-relative" style="z-index: 2;">
        <v-row align="center" justify="space-between" class="gy-8">
          <!-- Hero Copy -->
          <v-col cols="12" lg="7">
            <div class="d-flex align-center gap-2 mb-4 flex-wrap">
              <v-chip color="blue-darken-3" variant="flat" size="small" class="font-weight-bold text-uppercase px-3">
                <v-icon start size="14">mdi-earth</v-icon>
                Global Standards Guide
              </v-chip>
              <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
                Management System Frameworks
              </v-chip>
              <v-chip color="grey-darken-3" variant="outlined" size="small" class="font-weight-bold">
                Annex SL Harmonized
              </v-chip>
            </div>

            <h1 class="hero-h1 mb-4">
              ISO Certification – Build Business Credibility with International Standards
            </h1>

            <p class="hero-lead mb-6 text-body-1 text-grey-darken-2">
              International Organization for Standardization (ISO) management systems provide organizations with world-class frameworks to optimize operational quality, reduce environmental impact, safeguard workplace health, manage information security, and establish trusted credibility across global commercial supply chains.
            </p>

            <!-- Trust Highlights -->
            <div class="hero-trust-grid d-flex flex-wrap gap-4 mb-8">
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Over 24,000 Global Standards</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Recognized Across 168+ Countries</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Accredited Third-Party Verification</span>
              </div>
            </div>

            <!-- CTAs -->
            <div class="d-flex flex-wrap align-center gap-3">
              <v-btn
                color="primary"
                size="x-large"
                rounded="lg"
                class="font-weight-bold text-none px-6"
                @click="scrollToDirectory"
                elevation="2"
              >
                Explore ISO Certifications
                <v-icon end>mdi-arrow-down</v-icon>
              </v-btn>

              <a :href="waInquiryLink" target="_blank" class="wa-hero-btn text-decoration-none">
                <v-btn
                  color="#25D366"
                  variant="flat"
                  size="x-large"
                  rounded="lg"
                  class="font-weight-bold text-none text-white px-6"
                >
                  <v-icon start size="22">mdi-whatsapp</v-icon>
                  Request Consultation
                </v-btn>
              </a>

              <v-btn
                variant="outlined"
                color="primary"
                size="x-large"
                rounded="lg"
                class="font-weight-bold text-none px-5"
                to="/courses"
              >
                Lead Auditor Training
              </v-btn>
            </div>
          </v-col>

          <!-- Hero Media Card -->
          <v-col cols="12" lg="5">
            <div class="hero-media-wrapper position-relative">
              <v-card class="hero-image-card rounded-2xl overflow-hidden elevation-3 border">
                <v-img
                  src="/img/certifications/iso-standards-audit-team.jpg"
                  alt="Certified lead auditors conducting ISO management system compliance review in modern enterprise facility"
                  title="ISO Standards Compliance and Process Auditing"
                  height="380"
                  cover
                  class="hero-img"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                  </template>
                </v-img>

                <!-- Floating Highlight Overlay -->
                <div class="hero-stat-floating pa-4 bg-white rounded-xl elevation-3 border d-flex align-center gap-3">
                  <v-avatar color="blue-lighten-5" size="48" rounded="lg">
                    <v-icon color="blue-darken-2" size="26">mdi-certificate-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-secondary font-weight-bold text-uppercase">Standard Benchmark</div>
                    <div class="text-subtitle-1 font-weight-black text-dark">International Credibility</div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </header>

    <!-- ── Fast Facts Bar ─────────────────────────────────────────── -->
    <section class="fast-facts-section py-8 bg-surface border-b" aria-label="Key Facts">
      <v-container>
        <v-row dense>
          <v-col cols="6" md="3" v-for="fact in fastFacts" :key="fact.label">
            <div class="fact-card pa-4 rounded-xl border bg-white h-100 d-flex align-center gap-3">
              <v-avatar :color="fact.color" size="44" rounded="lg" class="flex-shrink-0">
                <v-icon color="white" size="22">{{ fact.icon }}</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-secondary font-weight-bold">{{ fact.label }}</div>
                <div class="text-subtitle-2 font-weight-black text-dark">{{ fact.value }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── Main Content Grid ──────────────────────────────────────── -->
    <main class="py-16 bg-background">
      <v-container>
        <v-row>
          <!-- Left Column: In-Depth Comprehensive Content -->
          <v-col cols="12" lg="8">
            <!-- Section 1: What is ISO? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Foundational Overview</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                What is ISO (International Organization for Standardization)?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Founded in 1947 and headquartered in Geneva, Switzerland, the <strong>International Organization for Standardization (ISO)</strong> is an independent, non-governmental international organization comprising national standards bodies from over 168 member countries. ISO brings together global technical experts to develop voluntary, consensus-based, market-relevant International Standards that support innovation and provide solutions to global challenges.
              </p>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                From manufacturing specifications and food safety protocols to cybersecurity and environmental stewardship, ISO standards ensure that products, services, and systems operate safely, reliably, and with consistent quality across borders.
              </p>

              <!-- Infobox -->
              <div class="pa-5 rounded-xl border bg-grey-lighten-5 d-flex align-start gap-4">
                <v-avatar color="primary" size="40" rounded="lg" class="flex-shrink-0">
                  <v-icon color="white" size="22">mdi-lightbulb-on-outline</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">How Standards Are Used Worldwide</h3>
                  <p class="text-caption text-grey-darken-2 leading-relaxed mb-0">
                    Standards represent distilled wisdom from global practitioners. When a business implements an ISO management standard, it aligns its internal processes with proven international best practices rather than reinventing operating procedures from scratch.
                  </p>
                </div>
              </div>
            </article>

            <!-- Section 2: What is ISO Certification? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Understanding Certification</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                What is ISO Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                <strong>ISO certification</strong> is formal third-party confirmation that an organization's management system meets all mandatory requirements specified in a particular ISO standard. It demonstrates to clients, partners, and regulators that your internal procedures are disciplined, consistently monitored, and continuously improved.
              </p>

              <!-- Distinction Box -->
              <div class="pa-5 rounded-xl border bg-blue-lighten-5 border-blue-lighten-3 mb-6">
                <h3 class="text-subtitle-1 font-weight-bold text-blue-darken-4 mb-2 d-flex align-center gap-2">
                  <v-icon color="blue-darken-3" size="22">mdi-alert-circle-outline</v-icon>
                  Crucial Distinction: Implementing vs. Certifying
                </h3>
                <p class="text-body-2 text-blue-darken-3 mb-3 leading-relaxed">
                  Any organization can legally purchase and implement an ISO standard internally to improve its operational efficiency. However, to claim formal <strong>ISO certification</strong>, an organization must undergo an independent audit conducted by an accredited third-party Certification Body (CB).
                </p>
                <div class="pa-3 rounded-lg bg-white border border-blue-lighten-2 text-caption text-dark font-weight-medium">
                  <strong>Important Note:</strong> ISO itself does <em>not</em> conduct audits, issue certificates, or certify businesses. Certification is performed solely by independent accredited certification bodies overseen by national accreditation authorities (such as UKAS, ANAB, NABCB, or JAS-ANZ under the IAF multilateral framework).
                </div>
              </div>
            </article>

            <!-- Section 3: Types of ISO Certifications (Directory Hub) -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card" id="standards-directory">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Standards Directory</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                Major Types of ISO Management System Certifications
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-8">
                Depending on your industry, operational focus, and client requirements, explore the primary ISO standards applied across businesses globally:
              </p>

              <v-row>
                <v-col cols="12" md="6" v-for="standard in isoStandardsDirectory" :key="standard.code">
                  <v-card class="standard-hub-card pa-5 rounded-2xl border bg-white h-100 hover-lift d-flex flex-column">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-chip size="small" :color="standard.color" variant="flat" class="font-weight-bold text-white">
                        {{ standard.code }}
                      </v-chip>
                      <v-icon :color="standard.color" size="24">{{ standard.icon }}</v-icon>
                    </div>

                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ standard.title }}</h3>
                    <div class="text-caption text-primary font-weight-bold mb-2">{{ standard.focusArea }}</div>
                    <p class="text-caption text-grey-darken-1 mb-4 flex-grow-1 leading-relaxed">
                      {{ standard.summary }}
                    </p>

                    <div class="pt-3 border-t d-flex align-center justify-space-between">
                      <NuxtLink :to="standard.link" class="text-caption font-weight-bold text-primary text-decoration-none d-flex align-center">
                        Explore Full Guide <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                      </NuxtLink>
                      <v-chip size="x-small" color="grey-lighten-3" variant="flat" class="text-grey-darken-2 font-weight-medium">
                        {{ standard.badge }}
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </article>

            <!-- Section 4: Why Does Your Business Need ISO Certification? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Strategic Commercial Value</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Why Does Your Business Need ISO Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Achieving accredited ISO certification is a high-return strategic investment that transforms internal efficiency and unlocks premium enterprise relationships:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="benefit in businessBenefits" :key="benefit.title">
                  <div class="pa-4 rounded-xl border h-100 d-flex align-start gap-3 bg-grey-lighten-5">
                    <v-avatar color="blue-lighten-5" size="40" rounded="lg" class="flex-shrink-0">
                      <v-icon color="blue-darken-2" size="22">{{ benefit.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ benefit.title }}</h3>
                      <p class="text-caption text-grey-darken-2 leading-relaxed mb-0">{{ benefit.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 5: Who Can Apply? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Universal Applicability</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Who Can Apply for ISO Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                A common misconception is that ISO standards are only intended for industrial giants. In reality, modern ISO management systems follow the generic <strong>Annex SL structure</strong>, making them scalable to organizations of any size, sector, or maturity:
              </p>

              <v-row>
                <v-col cols="6" sm="4" v-for="sector in applicableIndustries" :key="sector.title">
                  <div class="pa-4 rounded-xl border bg-white text-center h-100 hover-card">
                    <v-icon :color="sector.color" size="32" class="mb-2">{{ sector.icon }}</v-icon>
                    <div class="text-subtitle-2 font-weight-bold text-dark">{{ sector.title }}</div>
                    <div class="text-caption text-secondary">{{ sector.examples }}</div>
                  </div>
                </v-col>
              </v-row>

              <!-- In-line Review Photo -->
              <div class="mt-8 rounded-2xl overflow-hidden border">
                <v-img
                  src="/img/certifications/iso-management-compliance-review.jpg"
                  alt="Management review team analyzing ISO compliance KPI reports and process workflow binders in corporate boardroom"
                  title="ISO Management System Review Meeting"
                  height="280"
                  cover
                  loading="lazy"
                ></v-img>
                <div class="pa-3 bg-grey-lighten-4 text-caption text-secondary text-center">
                  Cross-functional teams review process workflows and KPI reports during formal ISO management reviews.
                </div>
              </div>
            </article>

            <!-- Section 6: ISO Certification Process -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Audit Pathway</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                The Complete ISO Certification Process
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Achieving accredited certification involves a structured, internationally standardized procedure from preliminary gap review to certificate issuance:
              </p>

              <div class="process-timeline">
                <div class="process-item mb-5" v-for="(phase, idx) in certificationPhases" :key="phase.title">
                  <div class="d-flex align-start gap-4">
                    <div class="step-num-col d-flex flex-column align-center">
                      <div class="step-badge bg-primary text-white font-weight-bold">{{ idx + 1 }}</div>
                      <div class="step-line" v-if="idx < certificationPhases.length - 1"></div>
                    </div>
                    <div class="pa-4 rounded-xl border bg-grey-lighten-5 flex-grow-1">
                      <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
                        <h3 class="text-subtitle-1 font-weight-bold text-dark mb-0">{{ phase.title }}</h3>
                        <v-chip size="x-small" color="blue-darken-2" variant="tonal" class="font-weight-bold">
                          {{ phase.timeline }}
                        </v-chip>
                      </div>
                      <p class="text-body-2 text-grey-darken-2 mb-0 leading-relaxed">{{ phase.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Section 7: Documentation and Requirements -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Mandatory Records</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                Core ISO Documentation &amp; Evidence Requirements
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                While specific requirements vary depending on whether you are certifying to ISO 9001, ISO 14001, or ISO 22000, all modern ISO standards require verified documented information across common management pillars:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="group in documentationGroups" :key="group.title">
                  <div class="pa-4 rounded-xl border bg-white h-100">
                    <div class="text-subtitle-2 font-weight-bold text-primary mb-2 d-flex align-center gap-2">
                      <v-icon color="primary" size="18">mdi-file-check-outline</v-icon>
                      {{ group.title }}
                    </div>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li v-for="item in group.items" :key="item" class="mb-1">{{ item }}</li>
                    </ul>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 8: How to Choose the Right ISO Standard? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Decision Guide</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                How to Choose the Right ISO Standard for Your Business?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Selecting the appropriate standard depends on your industry profile, primary operational risks, and client procurement demands:
              </p>

              <div class="guide-cards d-flex flex-column gap-3 mb-6">
                <div class="pa-4 rounded-xl border bg-grey-lighten-5 d-flex align-start gap-3" v-for="guide in selectionGuide" :key="guide.scenario">
                  <v-avatar :color="guide.color" size="32" class="text-white font-weight-bold text-caption flex-shrink-0 mt-1">
                    <v-icon size="18">{{ guide.icon }}</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ guide.scenario }}</h3>
                    <p class="text-body-2 text-grey-darken-2 mb-0 leading-relaxed">{{ guide.recommendation }}</p>
                  </div>
                </div>
              </div>

              <!-- Integrated Management Systems (IMS) Note -->
              <div class="pa-5 rounded-xl border bg-blue-lighten-5 border-blue-lighten-3">
                <h3 class="text-subtitle-1 font-weight-bold text-blue-darken-4 mb-2 d-flex align-center gap-2">
                  <v-icon color="blue-darken-3" size="22">mdi-merge</v-icon>
                  Integrated Management Systems (IMS)
                </h3>
                <p class="text-body-2 text-blue-darken-3 mb-0 leading-relaxed">
                  Because ISO 9001, ISO 14001, ISO 45001, and ISO 22000 share the identical 10-clause Annex SL High-Level Structure, organizations frequently combine two or more standards into a single Integrated Management System. This eliminates duplicate documentation, cuts audit fees, and unifies executive reporting.
                </p>
              </div>
            </article>

            <!-- Section 9: FAQ Section (8 Questions) -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Frequently Asked Questions</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                ISO Certification FAQs
              </h2>

              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(faq, index) in faqList"
                  :key="index"
                  class="border mb-3 rounded-xl overflow-hidden"
                >
                  <v-expansion-panel-title class="font-weight-bold text-body-1 text-dark py-4">
                    {{ faq.question }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="text-body-2 text-grey-darken-2 leading-relaxed pt-2 pb-4">
                    {{ faq.answer }}
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </article>
          </v-col>

          <!-- Right Column: Sticky Sidebar -->
          <v-col cols="12" lg="4">
            <aside class="cert-sidebar sticky-top" style="top: 96px;">
              <!-- Lead Form Card -->
              <v-card class="pa-6 pa-md-8 rounded-2xl border bg-white mb-6 shadow-card" id="enquiry-card">
                <div class="d-flex align-center gap-2 mb-2">
                  <v-avatar color="primary" size="32">
                    <v-icon color="white" size="18">mdi-shield-check</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-black text-dark mb-0">Get ISO Certified</h3>
                </div>
                <p class="text-caption text-grey-darken-1 mb-4">
                  Request a consultation with our standards advisors to identify the right ISO certification for your organization.
                </p>

                <DynamicLeadForm
                  form-id="certification-inquiry"
                  source="certification_iso_overview_page"
                />

                <v-divider class="my-4"></v-divider>

                <!-- WhatsApp Direct Support -->
                <a :href="waInquiryLink" target="_blank" class="text-decoration-none">
                  <v-btn
                    block
                    color="#25D366"
                    variant="tonal"
                    size="large"
                    rounded="lg"
                    class="font-weight-bold text-none"
                  >
                    <v-icon start size="20">mdi-whatsapp</v-icon>
                    Chat on WhatsApp
                  </v-btn>
                </a>
              </v-card>

              <!-- Fast Audit Specs -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-4 text-dark d-flex align-center gap-2">
                  <v-icon color="primary" size="20">mdi-tune-vertical</v-icon>
                  ISO Audit Parameters
                </h4>

                <v-list density="compact" class="pa-0">
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Certificate Validity</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">3 Years (Annual Surveillance)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Accreditation Oversight</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">IAF MLA Aligned Bodies</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Audit Stages</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Stage 1 (Docs) + Stage 2 (Site)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2">
                    <v-list-item-title class="text-caption text-secondary">Standard Architecture</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Annex SL High-Level Structure</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Training & Upskilling -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text-dark d-flex align-center gap-2">
                  <v-icon color="blue-darken-2" size="20">mdi-school-outline</v-icon>
                  Lead Auditor Qualifications
                </h4>
                <p class="text-caption text-secondary mb-4">
                  Certify your internal team with CQI &amp; IRCA recognized auditor courses:
                </p>

                <div class="d-flex flex-column gap-3">
                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">ISO 9001 Quality Lead Auditor</div>
                        <div class="text-caption text-secondary">5 Days • CQI / IRCA Certified</div>
                      </div>
                      <v-icon color="primary" size="18">mdi-arrow-right</v-icon>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">ISO 22000 Food Safety Lead Auditor</div>
                        <div class="text-caption text-secondary">5 Days • Comprehensive FSMS</div>
                      </div>
                      <v-icon color="primary" size="18">mdi-arrow-right</v-icon>
                    </div>
                  </NuxtLink>
                </div>
              </v-card>
            </aside>
          </v-col>
        </v-row>
      </v-container>
    </main>

    <!-- ── Related Standards Navigation Strip ─────────────────────── -->
    <section class="related-standards-section py-16 bg-surface border-t">
      <v-container>
        <div class="section-header text-center mb-10">
          <div class="eyebrow-label mb-2 text-blue-darken-2">Certification Portfolios</div>
          <h2 class="text-h4 font-weight-black text-dark tracking-tight">Explore Dedicated Standards Pages</h2>
          <p class="text-body-1 text-secondary">Access in-depth technical guides, audit roadmaps, and requirements for each standard.</p>
        </div>

        <v-row justify="center">
          <v-col cols="12" sm="6" md="3" v-for="standard in relatedStandards" :key="standard.name">
            <NuxtLink :to="standard.route" class="text-decoration-none">
              <v-card class="related-standard-card pa-5 rounded-2xl border bg-white h-100 hover-lift d-flex flex-column">
                <v-avatar :color="standard.color" size="48" rounded="xl" class="mb-4">
                  <v-icon color="white" size="26">{{ standard.icon }}</v-icon>
                </v-avatar>
                <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ standard.name }}</h3>
                <div class="text-caption text-primary font-weight-bold mb-2">{{ standard.category }}</div>
                <p class="text-caption text-grey-darken-1 mb-4 flex-grow-1">{{ standard.desc }}</p>
                <div class="d-flex align-center text-caption font-weight-bold text-primary">
                  Learn More <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                </div>
              </v-card>
            </NuxtLink>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWhatsApp } from '@/composables/useWhatsApp';
import DynamicLeadForm from '@/components/DynamicLeadForm.vue';

definePageMeta({
  layout: 'public'
});

const { generateWALink } = useWhatsApp();
const contactWhatsapp = useState('contact_whatsapp', () => '');

const waInquiryLink = computed(() => {
  const message = 'Hello Brix Certifications, I would like to consult with your team on identifying and achieving the appropriate ISO management system certification for our organization.';
  return generateWALink(contactWhatsapp.value || undefined, message);
});

const scrollToDirectory = () => {
  const el = document.getElementById('standards-directory');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Fast Facts
const fastFacts = [
  { label: 'Origin Organization', value: 'ISO (Geneva, Est. 1947)', icon: 'mdi-earth', color: 'blue-darken-3' },
  { label: 'Global Membership', value: '168+ National Standards Bodies', icon: 'mdi-account-group-outline', color: 'primary' },
  { label: 'Published Standards', value: '24,000+ Voluntary Standards', icon: 'mdi-file-tree-outline', color: 'indigo-darken-2' },
  { label: 'Audit Cycle', value: '3-Year Formal Certification', icon: 'mdi-calendar-check', color: 'teal-darken-2' }
];

// ISO Standards Directory
const isoStandardsDirectory = [
  {
    code: 'ISO 9001:2015',
    title: 'Quality Management System (QMS)',
    focusArea: 'Operational Quality & Customer Satisfaction',
    summary: 'The world’s most adopted management framework. Establishes standardized procedures, risk management, and continuous improvement metrics across product and service delivery.',
    icon: 'mdi-check-decagram-outline',
    color: 'primary',
    badge: 'Universal Across All Sectors',
    link: '/certifications/qms'
  },
  {
    code: 'ISO 22000:2018',
    title: 'Food Safety Management System (FSMS)',
    focusArea: 'Farm-to-Fork Food Safety & Hazard Control',
    summary: 'Integrates Codex HACCP principles with prerequisite programmes (PRPs) and organizational management to prevent biological, chemical, physical, and allergen hazards.',
    icon: 'mdi-certificate-outline',
    color: 'blue-darken-3',
    badge: 'Food Chain & Packaging',
    link: '/certifications/iso-22000'
  },
  {
    code: 'ISO 14001:2015',
    title: 'Environmental Management System (EMS)',
    focusArea: 'Sustainability & Resource Efficiency',
    summary: 'Helps organizations identify, monitor, and control their environmental impacts, carbon footprints, waste management, and regulatory compliance obligations.',
    icon: 'mdi-leaf',
    color: 'teal-darken-2',
    badge: 'Sustainability & ESG',
    link: '/certifications/iso-certification'
  },
  {
    code: 'ISO 45001:2018',
    title: 'Occupational Health & Safety (OHSMS)',
    focusArea: 'Workplace Safety & Hazard Prevention',
    summary: 'Provides an international framework for managing occupational health hazards, preventing workplace injuries, and fostering a proactive worker safety culture.',
    icon: 'mdi-hard-hat',
    color: 'deep-purple-darken-1',
    badge: 'Workforce Protection',
    link: '/certifications/ohsms'
  },
  {
    code: 'ISO 27001:2022',
    title: 'Information Security Management (ISMS)',
    focusArea: 'Cybersecurity & Data Protection',
    summary: 'Defines requirements for establishing, implementing, and continually improving an Information Security Management System, protecting confidential client assets.',
    icon: 'mdi-shield-lock-outline',
    color: 'orange-darken-3',
    badge: 'IT & Data Privacy',
    link: '/certifications/iso-certification'
  },
  {
    code: 'ISO 50001:2018',
    title: 'Energy Management System (EnMS)',
    focusArea: 'Energy Efficiency & Cost Reduction',
    summary: 'Assists organizations in establishing structured systems to improve energy performance, optimize thermal and electrical consumption, and reduce operational expenditures.',
    icon: 'mdi-lightning-bolt-outline',
    color: 'amber-darken-3',
    badge: 'Energy Optimization',
    link: '/certifications/iso-certification'
  }
];

// Business Benefits
const businessBenefits = [
  { icon: 'mdi-cog-sync-outline', title: 'Streamlined Operational Processes', desc: 'Replaces scattered informal practices with documented Standard Operating Procedures (SOPs), reducing waste, rework, and operational errors.' },
  { icon: 'mdi-handshake-outline', title: 'Enhanced Customer & Buyer Trust', desc: 'Provides instant third-party validation to domestic and overseas clients that your organization adheres to internationally recognized benchmarks.' },
  { icon: 'mdi-earth', title: 'Global Market & Export Access', desc: 'Overcomes cross-border trade barriers and fulfills vendor pre-qualification criteria in corporate and government procurement tenders.' },
  { icon: 'mdi-shield-alert-outline', title: 'Proactive Risk Management', desc: 'Embeds structured risk-based thinking (Clause 6) into daily planning to anticipate bottlenecks, disruptions, and non-conformances before they materialize.' },
  { icon: 'mdi-account-group-outline', title: 'Clear Leadership & Accountability', desc: 'Establishes clear roles, responsibilities, and communication channels, improving cross-departmental coordination and workforce engagement.' },
  { icon: 'mdi-chart-line', title: 'Continual Performance Improvement', desc: 'Utilizes the Plan-Do-Check-Act (PDCA) cycle, regular internal audits, and executive management reviews to drive sustainable business growth.' }
];

// Applicable Industries
const applicableIndustries = [
  { title: 'Manufacturing & Heavy Industry', examples: 'Automotive, machinery, chemicals, electronics, plastics', icon: 'mdi-factory', color: 'primary' },
  { title: 'Food & Agriculture', examples: 'Food processing, beverage packaging, catering, farming', icon: 'mdi-food-apple-outline', color: 'blue-darken-2' },
  { title: 'Information Technology', examples: 'Software development, cloud providers, SaaS, telecom', icon: 'mdi-laptop', color: 'orange-darken-3' },
  { title: 'Healthcare & Pharma', examples: 'Hospitals, medical device producers, pharmaceuticals', icon: 'mdi-hospital-box-outline', color: 'red-darken-1' },
  { title: 'Construction & Engineering', examples: 'General contracting, civil infrastructure, MEP services', icon: 'mdi-office-building', color: 'deep-purple-darken-1' },
  { title: 'Logistics & Warehousing', examples: 'Freight forwarding, cold storage, shipping lines, 3PL', icon: 'mdi-truck-delivery-outline', color: 'teal-darken-2' }
];

// Certification Phases
const certificationPhases = [
  { title: 'Phase 1: Standard Selection & Scope Definition', timeline: 'Week 1', desc: 'Identify which ISO standard(s) align with your corporate objectives and define the exact physical and operational boundaries of the management system.' },
  { title: 'Phase 2: Baseline Gap Assessment', timeline: 'Weeks 2 – 3', desc: 'Conduct a thorough diagnostic evaluating current processes, policies, and recordkeeping against the standard requirements to isolate non-compliant areas.' },
  { title: 'Phase 3: System Design & SOP Documentation', timeline: 'Weeks 4 – 7', desc: 'Draft the Policy, measurable objectives, core operational SOPs, work instructions, forms, and risk assessment matrices conforming to Annex SL.' },
  { title: 'Phase 4: Implementation & Employee Training', timeline: 'Weeks 8 – 11', desc: 'Roll out documentation across operational departments. Conduct staff awareness training and generate mandatory operational monitoring records.' },
  { title: 'Phase 5: Internal Audit & Corrective Action', timeline: 'Weeks 12 – 13', desc: 'Trained internal auditors evaluate all departments and shifts, recording corrective actions (CAPA) for any deviations found.' },
  { title: 'Phase 6: Management Review Meeting', timeline: 'Week 14', desc: 'Executive leadership reviews audit findings, customer feedback, and resource allocations to confirm readiness for the external certification audit.' },
  { title: 'Phase 7: Stage 1 Certification Audit (Readiness)', timeline: 'Weeks 15 – 16', desc: 'The accredited Certification Body (CB) reviews your documentation, policy alignment, and scope to confirm that the system is ready for the on-site audit.' },
  { title: 'Phase 8: Stage 2 Certification Audit (On-Site)', timeline: 'Weeks 18 – 20', desc: 'Auditors physically verify process implementation, interview staff, and review live records. Upon resolving any findings, official 3-year ISO certification is issued.' }
];

// Documentation Groups
const documentationGroups = [
  { title: 'Governance & Strategic Scope', items: ['Management System Scope Statement', 'Organizational Quality / Safety / Environmental Policy', 'Documented Measurable Objectives (KPIs)', 'Organizational Roles, Responsibilities & Authorities'] },
  { title: 'Risk & Operational Planning', items: ['Risks and Opportunities Identification Register', 'Legal & Regulatory Compliance Register', 'Process Flowcharts & Operational SOPs', 'Emergency Preparedness & Response Plans'] },
  { title: 'Support & Resource Evidence', items: ['Competency Matrix & Training Records', 'Equipment Maintenance & Calibration Logs', 'Document Control & Record Retention Matrix', 'Internal & External Communication Records'] },
  { title: 'Performance & Continual Improvement', items: ['Annual Internal Audit Plan & Reports', 'Management Review Meeting (MRM) Minutes', 'Nonconformity & Corrective Action (CAPA) Logs', 'Customer Satisfaction & Complaint Records'] }
];

// How to Choose Guide
const selectionGuide = [
  { scenario: 'If your primary goal is consistent product quality, client satisfaction, and tender qualification:', recommendation: 'Start with ISO 9001 (Quality Management System). It is the universal baseline standard suitable for all businesses.', icon: 'mdi-check-decagram', color: 'primary' },
  { scenario: 'If you handle food, beverage, pet nutrition, or food packaging materials:', recommendation: 'Adopt ISO 22000 (Food Safety Management System), or FSSC 22000 if your buyers require GFSI benchmarking.', icon: 'mdi-food-apple', color: 'blue-darken-3' },
  { scenario: 'If your activities involve physical job site hazards, manufacturing equipment, or construction risks:', recommendation: 'Implement ISO 45001 (Occupational Health & Safety) to protect workers and reduce liability.', icon: 'mdi-hard-hat', color: 'deep-purple-darken-1' },
  { scenario: 'If your organization manages sensitive client information, software code, financial, or healthcare data:', recommendation: 'Pursue ISO 27001 (Information Security Management System) to protect data integrity and satisfy GDPR / privacy regulations.', icon: 'mdi-shield-lock', color: 'orange-darken-3' },
  { scenario: 'If you face environmental compliance audits, heavy energy consumption, or ESG investor scrutiny:', recommendation: 'Combine ISO 14001 (Environmental Management) and ISO 50001 (Energy Management) to minimize carbon footprint and energy costs.', icon: 'mdi-leaf', color: 'teal-darken-2' }
];

// FAQs (8 Questions)
const faqList = [
  {
    question: 'What is ISO certification and how does it work?',
    answer: 'ISO certification is an independent third-party seal of approval confirming that a business complies with one of the international management system standards published by the International Organization for Standardization (ISO). An accredited certification body audits the company’s documented processes and real-world operations, issuing an official certificate when all standard requirements are satisfied.'
  },
  {
    question: 'Does the International Organization for Standardization (ISO) issue certificates directly?',
    answer: 'No. ISO develops international standards through global technical committees, but does not conduct certification audits or issue certificates. Certification is performed solely by independent third-party accredited Certification Bodies (CBs). These certification bodies are in turn accredited by national accreditation bodies (e.g., UKAS, ANAB, NABCB, JAS-ANZ) under the International Accreditation Forum (IAF).'
  },
  {
    question: 'How much does ISO certification cost for a business?',
    answer: 'The cost of ISO certification varies according to company size, total headcount, number of operating locations, industry risk profile, and the specific ISO standard selected. These parameters dictate the required auditor days specified under international IAF mandatory guidelines. Costs generally include internal preparation/consultancy, training, and the external certification body audit fees.'
  },
  {
    question: 'How long does it take to achieve ISO certification?',
    answer: 'For small to medium-sized organizations with existing organized workflows, the typical implementation and audit journey takes between 2 to 4 months. Larger enterprises, multi-site operations, or complex manufacturing environments typically require 4 to 8 months to complete system design, staff training, internal audits, and both external audit stages.'
  },
  {
    question: 'How long is an ISO certificate valid, and what are surveillance audits?',
    answer: 'An accredited ISO certificate is valid for three years from the date of issuance. To keep the certificate valid, the organization must successfully pass annual surveillance audits at the end of Year 1 and Year 2. Prior to the end of the three-year term, a recertification audit is conducted to issue a new three-year certificate.'
  },
  {
    question: 'What is the difference between an accredited and non-accredited certificate?',
    answer: 'An accredited certificate is issued by a Certification Body that has been evaluated and officially recognized by an IAF-signatory national accreditation body (such as UKAS in the UK or ANAB in the US). Accredited certificates carry the national accreditation mark alongside the CB logo and are globally accepted. Non-accredited certificates lack this oversight and are frequently rejected by government agencies and major enterprise buyers.'
  },
  {
    question: 'Can an organization obtain multiple ISO certifications simultaneously (IMS)?',
    answer: 'Yes. Most modern ISO management standards (including ISO 9001, ISO 14001, ISO 45001, and ISO 22000) share the identical Annex SL High-Level Structure. This allows organizations to build an Integrated Management System (IMS) where policies, risk registers, internal audits, and management reviews are unified, reducing audit time and overall certification costs by 20% to 35%.'
  },
  {
    question: 'What is the Annex SL High-Level Structure and why does it matter?',
    answer: 'Annex SL is a standardized framework created by ISO that defines identical 10-clause structures, common core text, and shared terminology across all new and revised management system standards. This harmonization makes it effortless for businesses to implement and audit multiple standards seamlessly without conflicting procedures.'
  }
];

// Related Standards
const relatedStandards = [
  { name: 'ISO 9001:2015 QMS', category: 'Quality Management', desc: 'The universal global quality standard driving process consistency and client satisfaction.', color: 'primary', icon: 'mdi-check-decagram-outline', route: '/certifications/qms' },
  { name: 'ISO 22000:2018 FSMS', category: 'Food Safety Management', desc: 'Comprehensive farm-to-fork food safety management incorporating Codex HACCP and PRPs.', color: 'blue-darken-3', icon: 'mdi-certificate-outline', route: '/certifications/iso-22000' },
  { name: 'FSSC 22000', category: 'GFSI Benchmarked', desc: 'Combines ISO 22000 with sector-specific PRPs (ISO/TS 22002) for global tier-1 retail acceptance.', color: 'teal-darken-2', icon: 'mdi-food-apple-outline', route: '/certifications/fssc' },
  { name: 'ISO 45001:2018 OHSMS', category: 'Workplace Safety', desc: 'International standard protecting workforce health, preventing injuries, and mitigating risks.', color: 'deep-purple-darken-1', icon: 'mdi-hard-hat', route: '/certifications/ohsms' }
];

// ── SEO Meta Configuration ───────────────────────────────────────
const pageTitle = 'ISO Certification Guide | ISO Standards for Business | Brix Certifications';
const pageDescription = 'Comprehensive guide to ISO management system certifications for businesses. Learn about ISO 9001, ISO 14001, ISO 22000, ISO 45001, ISO 27001, audit processes, costs, and accredited certification bodies.';
const pageUrl = 'https://brixcertifications.com/certifications/iso-certification';
const heroImageUrl = 'https://brixcertifications.com/img/certifications/iso-standards-audit-team.jpg';

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage: heroImageUrl,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: heroImageUrl
});

// ── Structured Data (Schema.org) ──────────────────────────────────
useHead({
  link: [
    { rel: 'canonical', href: pageUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'ISO Management System Certification Consultation & Training',
        serviceType: 'ISO Standards Certification Advisory',
        description: pageDescription,
        provider: {
          '@type': 'Organization',
          name: 'Brix Certifications',
          url: 'https://brixcertifications.com',
          logo: 'https://brixcertifications.com/favicon.ico'
        },
        areaServed: 'Worldwide',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'ISO Certification Consulting and Auditing Pathways',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO Management System Gap Analysis & Audit Readiness'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Accredited ISO Lead Auditor & Internal Auditor Training'
              }
            }
          ]
        }
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://brixcertifications.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Certifications',
            item: 'https://brixcertifications.com/#standards'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'ISO Certification Guide',
            item: pageUrl
          }
        ]
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      })
    }
  ]
});
</script>

<style scoped>
/* ── Hero Styling ──────────────────────────────────────────────── */
.cert-hero {
  background: linear-gradient(135deg, #1B1B3A 0%, #152238 50%, #0d1e36 100%);
  color: #ffffff;
}

.cert-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.22) 0%, transparent 60%);
  pointer-events: none;
}

.cert-hero-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: radial-gradient(#ffffff 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.hero-h1 {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-lead {
  font-size: 1.15rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9) !important;
}

.hero-trust-grid {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 0;
}

.hero-stat-floating {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 3;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95) !important;
}

/* ── Content Blocks ────────────────────────────────────────────── */
.content-block {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.eyebrow-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.shadow-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
}

/* ── Standard Directory Cards ──────────────────────────────────── */
.standard-hub-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.standard-hub-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
  border-color: #1976D2 !important;
}

/* ── Process Steps Timeline ────────────────────────────────────── */
.step-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.step-line {
  width: 2px;
  flex-grow: 1;
  background: #E0E0E0;
  min-height: 32px;
  margin: 4px 0;
}

/* ── Hover Effects ─────────────────────────────────────────────── */
.hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
}

.hover-card {
  transition: all 0.2s ease;
}

.hover-card:hover {
  border-color: #1B1B3A !important;
  background: #ffffff !important;
}

/* ── Breadcrumbs ───────────────────────────────────────────────── */
.breadcrumb-list {
  list-style: none;
}

.breadcrumb-link {
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #1B1B3A !important;
  text-decoration: underline;
}

/* ── Sticky Sidebar ────────────────────────────────────────────── */
.cert-sidebar {
  position: sticky;
}

@media (max-width: 1264px) {
  .cert-sidebar {
    position: static;
  }
}
</style>
