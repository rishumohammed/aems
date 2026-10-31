<template>
  <div class="iso22000-certification-page">
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
            <span itemprop="name" class="text-caption font-weight-bold text-dark">ISO 22000:2018 Certification</span>
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
                <v-icon start size="14">mdi-certificate-outline</v-icon>
                ISO Standard 22000:2018
              </v-chip>
              <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
                Food Safety Management System (FSMS)
              </v-chip>
              <v-chip color="grey-darken-3" variant="outlined" size="small" class="font-weight-bold">
                Annex SL High-Level Structure
              </v-chip>
            </div>

            <h1 class="hero-h1 mb-4">
              ISO 22000:2018 Certification – Strengthen Your Food Safety Management System
            </h1>

            <p class="hero-lead mb-6 text-body-1 text-grey-darken-2">
              <strong>ISO 22000:2018</strong> is the internationally recognized standard that harmonizes <strong>HACCP principles</strong>, prerequisite programmes (PRPs), and executive leadership into a unified management system. Protect your consumer supply chain, satisfy statutory food safety requirements, and establish verified audit compliance across every tier of the food chain.
            </p>

            <!-- Trust Highlights -->
            <div class="hero-trust-grid d-flex flex-wrap gap-4 mb-8">
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Global Multi-Sector Recognition</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Dual-Cycle PDCA Risk Framework</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="blue-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Independent Accredited CB Audit</span>
              </div>
            </div>

            <!-- CTAs -->
            <div class="d-flex flex-wrap align-center gap-3">
              <v-btn
                color="primary"
                size="x-large"
                rounded="lg"
                class="font-weight-bold text-none px-6"
                @click="scrollToEnquiry"
                elevation="2"
              >
                Get ISO 22000 Certified
                <v-icon end>mdi-arrow-right</v-icon>
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
                  src="/img/certifications/iso-22000-food-safety-facility.jpg"
                  alt="Certified food safety manager inspecting automated pasteurization CCP dashboard on stainless steel beverage line"
                  title="ISO 22000:2018 Food Safety Management System Monitoring"
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
                    <v-icon color="blue-darken-2" size="26">mdi-shield-check-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-secondary font-weight-bold text-uppercase">Standard Edition</div>
                    <div class="text-subtitle-1 font-weight-black text-dark">ISO 22000:2018 Standard</div>
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
          <!-- Left Column: In-Depth Comprehensive Guide -->
          <v-col cols="12" lg="8">
            <!-- Section 1: What is ISO 22000:2018? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Standard Overview</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                What is ISO 22000:2018 Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                <strong>ISO 22000:2018</strong> is the premier global standard for Food Safety Management Systems (FSMS). Published by the <strong>International Organization for Standardization (ISO)</strong>, it establishes precise requirements for an organization to plan, implement, operate, maintain, and continually update an FSMS aimed at providing food products and services that are safe for consumers throughout their intended use.
              </p>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                The standard covers the entire "farm-to-fork" continuum. It harmonizes the key elements of <strong>interactive communication</strong>, <strong>system management</strong>, <strong>prerequisite programmes (PRPs)</strong>, and the <strong>principles of HACCP</strong> (Hazard Analysis and Critical Control Points) as formulated by the Codex Alimentarius Commission.
              </p>

              <!-- Two-Tier PDCA Framework -->
              <h3 class="text-h6 font-weight-bold mb-4 text-dark d-flex align-center gap-2">
                <v-icon color="primary" size="24">mdi-sync</v-icon>
                The Dual-Cycle Plan-Do-Check-Act (PDCA) Structure
              </h3>
              <p class="text-body-2 text-grey-darken-2 leading-relaxed mb-6">
                ISO 22000:2018 adopts the <strong>Annex SL High-Level Structure (HLS)</strong>, featuring a unique dual-loop PDCA cycle operating simultaneously within the organization:
              </p>

              <v-row class="mb-6">
                <v-col cols="12" md="6">
                  <div class="pa-5 rounded-xl border bg-grey-lighten-5 h-100">
                    <div class="d-flex align-center gap-2 mb-2">
                      <v-avatar color="primary" size="32" class="text-white font-weight-bold text-caption">1</v-avatar>
                      <h4 class="text-subtitle-1 font-weight-bold text-dark mb-0">Organizational Management PDCA</h4>
                    </div>
                    <p class="text-caption text-grey-darken-2 mb-0 leading-relaxed">
                      Governs organizational context, business strategy, executive leadership commitment, risk assessment, support resources, performance evaluation, and continual management improvements (Clauses 4–7, 9–10).
                    </p>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="pa-5 rounded-xl border bg-grey-lighten-5 h-100">
                    <div class="d-flex align-center gap-2 mb-2">
                      <v-avatar color="blue-darken-2" size="32" class="text-white font-weight-bold text-caption">2</v-avatar>
                      <h4 class="text-subtitle-1 font-weight-bold text-dark mb-0">Operational Food Safety PDCA</h4>
                    </div>
                    <p class="text-caption text-grey-darken-2 mb-0 leading-relaxed">
                      Operates within the operational sphere (Clause 8), overseeing prerequisite programmes (PRPs), traceability, hazard identification, hazard evaluation, and execution of the Hazard Control Plan (HACCP/OPRPs).
                    </p>
                  </div>
                </v-col>
              </v-row>

              <div class="pa-4 rounded-xl bg-blue-lighten-5 border border-blue-lighten-3 d-flex align-start gap-3">
                <v-icon color="blue-darken-2" size="24" class="mt-1">mdi-shield-alert-outline</v-icon>
                <div class="text-body-2 text-blue-darken-4">
                  <strong>Important Technical Distinction:</strong> The International Organization for Standardization (ISO) develops international standards through technical committees, but <em>does not perform certification or issue certificates</em>. Certification is audited and issued by independent, third-party accredited Certification Bodies (CBs) that evaluate facility compliance against ISO 22000 requirements.
                </div>
              </div>
            </article>

            <!-- Section 2: Who Needs ISO 22000? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Target Sectors</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Who Needs ISO 22000 Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                ISO 22000 is intentionally designed for universal applicability across the entire food supply chain. Any business directly or indirectly involved in food production, storage, or handling benefits from an audited FSMS:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="sector in applicableSectors" :key="sector.title">
                  <div class="sector-card pa-4 rounded-xl border h-100 bg-grey-lighten-5">
                    <div class="d-flex align-center gap-3 mb-2">
                      <v-avatar :color="sector.color" size="36" rounded="lg">
                        <v-icon color="white" size="20">{{ sector.icon }}</v-icon>
                      </v-avatar>
                      <h3 class="text-subtitle-1 font-weight-bold text-dark mb-0">{{ sector.title }}</h3>
                    </div>
                    <p class="text-caption text-grey-darken-2 mb-0 leading-relaxed">{{ sector.description }}</p>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 3: Key Requirements (The 10 Clauses) -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Standard Requirements</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                Key Requirements of ISO 22000:2018
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Organized under the 10-clause Annex SL framework, ISO 22000 defines both strategic management principles and strict operational hazard controls:
              </p>

              <div class="requirements-accordion mb-6">
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel
                    v-for="req in requirementsClauses"
                    :key="req.clause"
                    class="border mb-2 rounded-xl overflow-hidden"
                  >
                    <v-expansion-panel-title class="py-3 font-weight-bold text-subtitle-2 text-dark">
                      <v-chip size="x-small" color="primary" variant="flat" class="mr-3 font-weight-bold">
                        {{ req.clause }}
                      </v-chip>
                      {{ req.title }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="text-body-2 text-grey-darken-2 leading-relaxed py-2">
                      {{ req.details }}
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Critical In-line Photo -->
              <div class="my-6 rounded-2xl overflow-hidden border">
                <v-img
                  src="/img/certifications/iso-22000-ccp-inspection.jpg"
                  alt="Food safety specialist using calibrated digital sensor probe inspecting cooking Critical Control Point (CCP) on meat production line"
                  title="Critical Control Point (CCP) Temperature Validation"
                  height="300"
                  cover
                  loading="lazy"
                ></v-img>
                <div class="pa-3 bg-grey-lighten-4 text-caption text-secondary text-center">
                  Routine validation of Critical Control Points (CCPs) ensures physical cooking and chilling limits prevent microbiological hazards.
                </div>
              </div>

              <!-- Difference between CCPs and OPRPs Box -->
              <div class="pa-5 rounded-xl border bg-white shadow-sm">
                <h3 class="text-subtitle-1 font-weight-bold text-dark mb-2 d-flex align-center gap-2">
                  <v-icon color="blue-darken-2" size="20">mdi-scale-balance</v-icon>
                  Technical Focus: Understanding CCPs vs. OPRPs in ISO 22000
                </h3>
                <p class="text-caption text-grey-darken-2 mb-3 leading-relaxed">
                  A defining feature of ISO 22000 is the distinction between Critical Control Points (CCPs) and Operational Prerequisite Programmes (OPRPs):
                </p>
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <div class="pa-3 rounded-lg bg-grey-lighten-5 border">
                      <div class="text-caption font-weight-bold text-dark">Critical Control Point (CCP)</div>
                      <div class="text-caption text-grey-darken-2">
                        A control measure applied at a specific processing step essential to prevent or eliminate a significant food safety hazard, requiring measurable <strong>critical limits</strong> (e.g., minimum core temperature 71°C for 2 minutes).
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="pa-3 rounded-lg bg-grey-lighten-5 border">
                      <div class="text-caption font-weight-bold text-dark">Operational Prerequisite Programme (OPRP)</div>
                      <div class="text-caption text-grey-darken-2">
                        A control measure identified by hazard analysis to prevent or reduce significant hazards to acceptable levels, requiring measurable or observable <strong>action criteria</strong> (e.g., automated line sanitation chemical titration checks).
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </article>

            <!-- Section 4: Benefits -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Strategic Value</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Key Benefits of ISO 22000 Certification
              </h2>

              <v-row>
                <v-col cols="12" sm="6" v-for="b in benefitsList" :key="b.title">
                  <div class="benefit-card pa-4 rounded-xl border h-100 d-flex align-start gap-3 bg-white">
                    <v-avatar color="blue-lighten-5" size="40" rounded="lg" class="flex-shrink-0">
                      <v-icon color="blue-darken-2" size="22">{{ b.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ b.title }}</h3>
                      <p class="text-caption text-grey-darken-2 leading-relaxed mb-0">{{ b.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 5: Certification Process -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Audit Pathway</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                The 8-Step ISO 22000 Certification Process
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Achieving accredited certification follows an internationally standardized audit protocol overseen by independent Certification Bodies:
              </p>

              <div class="process-steps-list">
                <div class="process-step-item mb-5" v-for="(step, idx) in auditSteps" :key="step.title">
                  <div class="d-flex align-start gap-4">
                    <div class="step-num-col d-flex flex-column align-center">
                      <div class="step-badge bg-primary text-white font-weight-bold">{{ idx + 1 }}</div>
                      <div class="step-line" v-if="idx < auditSteps.length - 1"></div>
                    </div>
                    <div class="pa-4 rounded-xl border bg-grey-lighten-5 flex-grow-1">
                      <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
                        <h3 class="text-subtitle-1 font-weight-bold text-dark mb-0">{{ step.title }}</h3>
                        <v-chip size="x-small" color="blue-darken-2" variant="tonal" class="font-weight-bold">
                          {{ step.timeline }}
                        </v-chip>
                      </div>
                      <p class="text-body-2 text-grey-darken-2 mb-0 leading-relaxed">{{ step.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Section 6: Documentation and Evidence Required -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Audit Evidence</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                Required Documentation &amp; Records
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Auditors require documented information verifying that your system is actively planned, operated, and maintained:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="doc in requiredDocuments" :key="doc.category">
                  <div class="pa-4 rounded-xl border bg-white h-100">
                    <div class="text-subtitle-2 font-weight-bold text-primary mb-2 d-flex align-center gap-2">
                      <v-icon color="primary" size="18">mdi-file-document-check-outline</v-icon>
                      {{ doc.category }}
                    </div>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li v-for="item in doc.items" :key="item" class="mb-1">{{ item }}</li>
                    </ul>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 7: ISO 22000 vs HACCP -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Technical Comparison</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                ISO 22000 vs. HACCP: Understanding the Relationship
              </h2>
              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                HACCP (Hazard Analysis Critical Control Point) is an operational risk control methodology. ISO 22000 incorporates the entire Codex HACCP framework while elevating it into a comprehensive organizational management system:
              </p>

              <div class="table-responsive rounded-xl border overflow-hidden">
                <v-table density="comfortable" hover>
                  <thead class="bg-primary text-white">
                    <tr>
                      <th class="text-white font-weight-bold">Evaluation Criteria</th>
                      <th class="text-white font-weight-bold bg-blue-darken-3">ISO 22000:2018</th>
                      <th class="text-white font-weight-bold">Codex HACCP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in haccpComparison" :key="row.feature">
                      <td class="font-weight-bold text-dark">{{ row.feature }}</td>
                      <td class="bg-blue-lighten-5 font-weight-bold text-blue-darken-4">{{ row.iso22000 }}</td>
                      <td class="text-grey-darken-2">{{ row.haccp }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </article>

            <!-- Section 8: ISO 22000 vs FSSC 22000 -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Benchmarking</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                ISO 22000 vs. FSSC 22000: Key Differences
              </h2>
              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                A common question from food manufacturers is whether to pursue ISO 22000 or FSSC 22000. FSSC 22000 is not a competitor standard; rather, it uses ISO 22000 as its core management foundation:
              </p>

              <div class="pa-5 rounded-xl border bg-grey-lighten-5 mb-6">
                <v-row>
                  <v-col cols="12" md="6">
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-2">When to Choose ISO 22000:</h3>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li class="mb-2">Your customers or regional tenders specifically request an ISO-accredited FSMS.</li>
                      <li class="mb-2">You operate in catering, commercial transport, distribution, or non-retail processing where GFSI benchmarking is not explicitly demanded.</li>
                      <li class="mb-2">You want a unified management system readily integrated with ISO 9001 (Quality) or ISO 14001 (Environment).</li>
                    </ul>
                  </v-col>
                  <v-col cols="12" md="6">
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-2">When to Choose FSSC 22000:</h3>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li class="mb-2">You supply major international supermarket chains (e.g., Walmart, Tesco, Metro) that mandate a <strong>GFSI-benchmarked</strong> scheme.</li>
                      <li class="mb-2">You require prescriptive sector Prerequisite Programmes (ISO/TS 22002 series) and codified Food Defense/Fraud protocols.</li>
                      <li class="mb-2">You want to be publicly listed on the global Foundation FSSC certified site registry.</li>
                    </ul>
                  </v-col>
                </v-row>
              </div>

              <div class="text-center">
                <NuxtLink to="/certifications/fssc" class="text-decoration-none">
                  <v-btn color="primary" variant="tonal" rounded="lg" class="text-none font-weight-bold">
                    View Comprehensive FSSC 22000 Certification Guide <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </NuxtLink>
              </div>
            </article>

            <!-- Section 9: FAQ Section (8 Questions) -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-blue-darken-2">Frequently Asked Questions</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                ISO 22000 Certification FAQs
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

          <!-- Right Column: Sticky Lead Sidebar -->
          <v-col cols="12" lg="4">
            <aside class="cert-sidebar sticky-top" style="top: 96px;">
              <!-- Lead Form Card -->
              <v-card class="pa-6 pa-md-8 rounded-2xl border bg-white mb-6 shadow-card" id="enquiry-card">
                <div class="d-flex align-center gap-2 mb-2">
                  <v-avatar color="primary" size="32">
                    <v-icon color="white" size="18">mdi-shield-check</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-black text-dark mb-0">Get ISO 22000 Certified</h3>
                </div>
                <p class="text-caption text-grey-darken-1 mb-4">
                  Request consultation, gap analysis, or auditor guidance for your facility.
                </p>

                <DynamicLeadForm
                  form-id="certification-inquiry"
                  source="certification_iso_22000_landing_page"
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
                    Chat with Consultant
                  </v-btn>
                </a>
              </v-card>

              <!-- Technical Specifications -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-4 text-dark d-flex align-center gap-2">
                  <v-icon color="primary" size="20">mdi-clipboard-text-outline</v-icon>
                  Scheme Parameters
                </h4>

                <v-list density="compact" class="pa-0">
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Standard Code</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">ISO 22000:2018</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Audit Methodology</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Stage 1 (Docs) + Stage 2 (On-Site)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Validity Period</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">3 Years (Annual Surveillance)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2">
                    <v-list-item-title class="text-caption text-secondary">Integration Compatibility</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">ISO 9001, ISO 14001, ISO 45001</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Training Quick Links -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text-dark d-flex align-center gap-2">
                  <v-icon color="blue-darken-2" size="20">mdi-school-outline</v-icon>
                  Certified Lead Auditor Courses
                </h4>
                <p class="text-caption text-secondary mb-4">
                  Upskill your QA/QC managers with accredited auditing qualifications:
                </p>

                <div class="d-flex flex-column gap-3">
                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">ISO 22000 Lead Auditor Course</div>
                        <div class="text-caption text-secondary">5 Days • CQI / IRCA Aligned</div>
                      </div>
                      <v-icon color="primary" size="18">mdi-arrow-right</v-icon>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">ISO 22000 Internal Auditor Course</div>
                        <div class="text-caption text-secondary">2 Days • Practical Audit Skills</div>
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
          <div class="eyebrow-label mb-2 text-blue-darken-2">Integrated Standards</div>
          <h2 class="text-h4 font-weight-black text-dark tracking-tight">Explore Related Certifications</h2>
          <p class="text-body-1 text-secondary">Build an integrated management system across food safety, quality, and workplace protection.</p>
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
  const message = 'Hello Brix Certifications, I would like to inquire about ISO 22000:2018 certification requirements, audit stages, and consultation for our facility.';
  return generateWALink(contactWhatsapp.value || undefined, message);
});

const scrollToEnquiry = () => {
  const el = document.getElementById('enquiry-card');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Fast Facts
const fastFacts = [
  { label: 'International Body', value: 'ISO Committee (TC 34/SC 17)', icon: 'mdi-earth', color: 'blue-darken-3' },
  { label: 'Current Standard', value: 'ISO 22000:2018 Edition', icon: 'mdi-certificate-outline', color: 'primary' },
  { label: 'Structure Model', value: 'Annex SL High-Level Structure', icon: 'mdi-layers-outline', color: 'indigo-darken-2' },
  { label: 'Audit Cycle', value: '3-Year Formal Certification', icon: 'mdi-calendar-check', color: 'teal-darken-2' }
];

// Applicable Sectors
const applicableSectors = [
  { title: 'Food & Beverage Manufacturers', description: 'Dairy, meat, poultry, fish, confectionery, bakery, beverages, canned goods, and ready-to-eat meals.', icon: 'mdi-factory', color: 'primary' },
  { title: 'Food Packaging Manufacturers', description: 'Producers of primary and secondary food contact materials including plastics, glass, paper, and metal.', icon: 'mdi-package-variant-closed', color: 'teal-darken-2' },
  { title: 'Storage & Cold-Chain Logistics', description: 'Warehouses, refrigerated storage providers, and temperature-controlled freight logistics.', icon: 'mdi-truck-delivery-outline', color: 'orange-darken-3' },
  { title: 'Catering & Food Service', description: 'Hospitality chains, institutional caterers, airlines, central kitchens, and cloud kitchen networks.', icon: 'mdi-silverware-fork-knife', color: 'deep-purple-darken-1' },
  { title: 'Animal Feed & Pet Food', description: 'Formulators of livestock feed, premixes, aquaculture feed, and packaged pet nutrition.', icon: 'mdi-paw', color: 'green-darken-2' },
  { title: 'Ingredient & Chemical Suppliers', description: 'Manufacturers of food additives, enzymes, flavorings, vitamins, and cleaning chemicals for food plants.', icon: 'mdi-flask-outline', color: 'blue-grey-darken-2' }
];

// Key Requirements (Clauses 4-10)
const requirementsClauses = [
  { clause: 'Clause 4', title: 'Context of the Organization', details: 'Identify external and internal food safety factors, determine interested parties (consumers, regulators, buyers), and establish the clear physical and operational scope of the FSMS.' },
  { clause: 'Clause 5', title: 'Leadership & Commitment', details: 'Executive management must establish an official Food Safety Policy, ensure organizational resources, assign the Food Safety Team Leader, and maintain defined organizational roles.' },
  { clause: 'Clause 6', title: 'Planning for the FSMS', details: 'Address strategic organizational risks and opportunities, define measurable food safety objectives at relevant levels, and systematically plan any procedural changes.' },
  { clause: 'Clause 7', title: 'Support & Resource Allocation', details: 'Provide adequate infrastructure, hygienic work environment, equipment calibration, personnel competence, awareness training, and structured internal and external communication protocols.' },
  { clause: 'Clause 8', title: 'Operation (PRPs & Hazard Control Plan)', details: 'Establish Prerequisite Programmes (PRPs), traceability systems, emergency response plans, hazard analysis, selection and categorization of control measures into Critical Control Points (CCPs) and Operational PRPs (OPRPs), and verification activities.' },
  { clause: 'Clause 9', title: 'Performance Evaluation', details: 'Monitor and measure process controls, conduct regular internal audits across all production shifts, and hold formal executive Management Review Meetings.' },
  { clause: 'Clause 10', title: 'Continual Improvement & CAPA', details: 'Act upon identified nonconformities, implement corrective actions (CAPA) to prevent recurrence, update FSMS documentation, and foster ongoing food safety performance enhancement.' }
];

// Benefits List
const benefitsList = [
  { icon: 'mdi-shield-check', title: 'Systematic Hazard Prevention', desc: 'Identifies biological, chemical, physical, and allergen risks before raw materials enter active processing lines.' },
  { icon: 'mdi-handshake-outline', title: 'Customer & Buyer Confidence', desc: 'Validates to multinational buyers and commercial partners that your facility operates according to recognized global hygiene standards.' },
  { icon: 'mdi-gavel', title: 'Regulatory Compliance Support', desc: 'Aligns operations with national food safety legislation, export regulations, Codex Alimentarius, and FDA FSMA requirements.' },
  { icon: 'mdi-cog-sync-outline', title: 'Standardized Operational Efficiency', desc: 'Replaces ad-hoc practices with documented standard operating procedures (SOPs), reducing waste, spoilage, and rework.' },
  { icon: 'mdi-magnify-scan', title: 'Verified End-to-End Traceability', desc: 'Establishes rapid lot tracing one step backward and one step forward, ensuring quick containment during potential recall scenarios.' },
  { icon: 'mdi-chart-line', title: 'Competitive Market Advantage', desc: 'Enables participation in government tenders, export contracts, and tier-1 vendor supply agreements that require an accredited FSMS.' }
];

// Audit Steps
const auditSteps = [
  { title: 'Step 1: Gap Assessment & Baseline Analysis', timeline: 'Weeks 1 – 2', desc: 'On-site diagnostic comparing current operations and hygiene controls against ISO 22000:2018 requirements.' },
  { title: 'Step 2: FSMS Design & Documentation', timeline: 'Weeks 3 – 6', desc: 'Formulating the Food Safety Policy, PRPs, Hazard Analysis, OPRPs, HACCP Plan, and operational SOPs.' },
  { title: 'Step 3: Workforce Training & System Implementation', timeline: 'Weeks 7 – 10', desc: 'Training operators, CCP monitors, and supervisors. Logging routine monitoring records and calibration data.' },
  { title: 'Step 4: Comprehensive Internal Audit', timeline: 'Weeks 11 – 12', desc: 'Trained internal auditors evaluate all departments and shifts, recording corrective actions (CAPA) for any deviations.' },
  { title: 'Step 5: Executive Management Review', timeline: 'Week 13', desc: 'Leadership reviews audit findings, customer feedback, and resource adequacy to confirm organizational readiness.' },
  { title: 'Step 6: Stage 1 Certification Audit (Readiness)', timeline: 'Weeks 14 – 15', desc: 'An independent accredited Certification Body (CB) reviews documentation, scope, and basic operational preparedness.' },
  { title: 'Step 7: Stage 2 Certification Audit (On-Site)', timeline: 'Weeks 18 – 20', desc: 'The CB auditor evaluates physical production lines, CCP verification, employee practices, and records in real time.' },
  { title: 'Step 8: Corrective Action Closure & Certification', timeline: 'Weeks 22 – 24', desc: 'Upon closing any audit findings, the Certification Body formally grants the 3-year accredited ISO 22000 certificate.' }
];

// Required Documents
const requiredDocuments = [
  { category: 'Governance & Scope', items: ['FSMS Scope Statement', 'Food Safety Policy & Objectives', 'Organizational Chart & Authorities', 'Internal/External Communication Plans'] },
  { category: 'Hazard Control & HACCP', items: ['Prerequisite Programmes (PRPs) Dossier', 'Product Descriptions & Intended Use', 'Process Flow Diagrams & On-Site Verification', 'HACCP Plan & OPRP Hazard Analysis'] },
  { category: 'Operational Evidence', items: ['CCP & OPRP Daily Monitoring Logs', 'Calibration Records for Instruments', 'Traceability & Mock Recall Reports', 'Supplier Evaluation & Qualification Logs'] },
  { category: 'Verification & Review', items: ['Competency & Training Records', 'Internal Audit Schedule & Reports', 'Corrective Action (CAPA) Registers', 'Management Review Minutes & Action Items'] }
];

// HACCP Comparison Table
const haccpComparison = [
  { feature: 'Core Nature', iso22000: 'Complete Organizational Management System', haccp: 'Operational Food Safety Methodology' },
  { feature: 'Governance Structure', iso22000: 'Annex SL High-Level Structure (10 Clauses)', haccp: 'Codex 7 Principles & 12 Application Steps' },
  { feature: 'Executive Leadership', iso22000: 'Mandatory executive accountability & policy', haccp: 'Not formally mandated' },
  { feature: 'Hazard Categorization', iso22000: 'Categorizes into CCPs AND OPRPs', haccp: 'Identifies CCPs only' },
  { feature: 'Communication System', iso22000: 'Structured internal and external communication', haccp: 'Not structured' },
  { feature: 'Continuous Improvement', iso22000: 'Mandatory dual-loop PDCA cycle', haccp: 'System review upon changes' },
  { feature: 'Independent Certification', iso22000: 'Audited by accredited Certification Bodies', haccp: 'Often uncertified or regulatory inspection only' }
];

// FAQs (8 Questions)
const faqList = [
  {
    question: 'What is ISO 22000:2018 and how does it differ from the 2005 version?',
    answer: 'ISO 22000:2018 replaced the 2005 version by introducing the Annex SL High-Level Structure, making it seamless to integrate with ISO 9001 and ISO 14001. It introduces a clear dual-cycle Plan-Do-Check-Act (PDCA) approach (one at the organizational level and one at the operational HACCP level), establishes distinct definitions between Critical Control Points (CCPs) and Operational PRPs (OPRPs), and incorporates risk-based thinking.'
  },
  {
    question: 'Does the International Organization for Standardization (ISO) issue certificates directly?',
    answer: 'No. ISO develops international standards through global technical committees, but does not conduct audits or issue certificates. Third-party accredited Certification Bodies (CBs) conduct the independent Stage 1 and Stage 2 certification audits and issue the formal certificate.'
  },
  {
    question: 'How long does the ISO 22000 certification process typically take?',
    answer: 'For a small to medium-sized food facility with foundational hygiene practices in place, implementation and certification typically takes 3 to 6 months. For large or multi-site processing facilities, the journey may require 6 to 9 months to complete documentation, personnel training, internal audits, and both certification audit stages.'
  },
  {
    question: 'What is the fundamental difference between a CCP and an OPRP in ISO 22000?',
    answer: 'A Critical Control Point (CCP) is a processing step where control can be applied and is essential to prevent or eliminate a food safety hazard to acceptable levels, requiring validated numeric critical limits (e.g., cooking at 75°C). An Operational Prerequisite Programme (OPRP) is a control measure identified by hazard analysis to prevent or reduce significant hazards, managed through measurable or observable action criteria (e.g., automated conveyor surface sanitation checks).'
  },
  {
    question: 'Is ISO 22000 certification mandatory by law?',
    answer: 'ISO 22000 is a voluntary international standard. However, commercial buyers, international export markets, supermarket chains, and major hospitality groups often mandate ISO 22000 or a GFSI-recognized equivalent as a prerequisite condition in supply contracts and commercial tenders.'
  },
  {
    question: 'How long is an ISO 22000 certificate valid, and what are surveillance audits?',
    answer: 'An accredited ISO 22000 certificate is valid for three years from the date of issuance. To maintain its validity, the organization must undergo annual surveillance audits in Years 1 and 2 to verify ongoing compliance, followed by a formal recertification audit prior to the three-year expiration.'
  },
  {
    question: 'Can ISO 22000 be integrated with ISO 9001 (Quality) or other standards?',
    answer: 'Yes. Because ISO 22000:2018 shares the common Annex SL High-Level Structure (identical clause structure, terms, and core definitions), it can be integrated into an Integrated Management System (IMS) with ISO 9001 (Quality), ISO 14001 (Environmental Management), and ISO 45001 (Health & Safety), saving substantial auditing time and documentation overhead.'
  },
  {
    question: 'What factors determine the cost of ISO 22000 certification?',
    answer: 'Certification costs depend on facility size, number of active full-time and seasonal employees, complexity of the food processes (e.g., high-risk ready-to-eat foods vs. ambient dry goods), number of manufacturing lines, and whether single or multi-site audits are needed. These factors determine the required auditor days under international accreditation guidelines (IAF MD 22).'
  }
];

// Related Standards
const relatedStandards = [
  { name: 'FSSC 22000', category: 'GFSI Benchmarked', desc: 'Combines ISO 22000 with sector-specific PRPs (ISO/TS 22002) for global tier-1 retail acceptance.', color: 'teal-darken-2', icon: 'mdi-food-apple-outline', route: '/certifications/fssc' },
  { name: 'HACCP System', category: 'Hazard Control', desc: 'The fundamental preventive methodology identifying and controlling food safety hazards.', color: 'red-darken-1', icon: 'mdi-flask-outline', route: '/certifications/haccp' },
  { name: 'BRCGS Food Safety', category: 'Global Standard', desc: 'Leading international standard focusing on process rigor, product safety, and factory hygiene.', color: 'orange-darken-3', icon: 'mdi-shield-check-outline', route: '/certifications/brcgs' },
  { name: 'ISO 9001:2015 QMS', category: 'Quality Management', desc: 'Global quality management system driving consistent operational excellence and satisfaction.', color: 'green-darken-2', icon: 'mdi-check-circle-outline', route: '/certifications/qms' }
];

// ── SEO Meta Configuration ───────────────────────────────────────
const pageTitle = 'ISO 22000 Certification | Food Safety Management System | Brix Certifications';
const pageDescription = 'Achieve accredited ISO 22000:2018 Food Safety Management System certification. Expert guidance on HACCP, PRPs, OPRPs, audit stages, and certification costs for food manufacturers.';
const pageUrl = 'https://brixcertifications.com/certifications/iso-22000';
const heroImageUrl = 'https://brixcertifications.com/img/certifications/iso-22000-food-safety-facility.jpg';

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
        name: 'ISO 22000:2018 Certification and Food Safety Consultation',
        serviceType: 'Food Safety Management System Certification',
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
          name: 'ISO 22000 Food Safety Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 22000 Gap Analysis & Audit Readiness'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 22000 Lead Auditor & Internal Auditor Training'
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
            name: 'ISO 22000:2018 Certification',
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
  background: linear-gradient(135deg, #1B1B3A 0%, #10213d 50%, #0a1f33 100%);
  color: #ffffff;
}

.cert-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.25) 0%, transparent 60%);
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

/* ── Sector Cards ──────────────────────────────────────────────── */
.sector-card {
  transition: all 0.25s ease;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.sector-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
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
