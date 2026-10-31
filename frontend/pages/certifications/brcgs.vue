<template>
  <div class="brcgs-page">
    <!-- ── 1. Hero Section ─────────────────────────────────────────── -->
    <section class="brcgs-hero">
      <div class="hero-bg-overlay"></div>
      <v-container class="hero-container position-relative">
        <!-- Breadcrumbs -->
        <nav aria-label="Breadcrumb" class="mb-4">
          <ol class="breadcrumb-nav">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li><NuxtLink to="/#standards">Certifications</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li class="active" aria-current="page">BRCGS Global Standards</li>
          </ol>
        </nav>

        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="7" class="hero-content">
            <div class="hero-badge mb-3">
              <v-icon size="16" color="primary" class="mr-1">mdi-shield-check-outline</v-icon>
              <span>BRCGS Global Standards · Issue 9 Benchmarked</span>
            </div>

            <h1 class="hero-title text-h3 text-md-h2 font-weight-bold mb-4">
              BRCGS Certification – Strengthen Food Safety and Product Integrity
            </h1>

            <p class="hero-subtitle text-body-1 text-md-subtitle-1 mb-6">
              Achieve international recognition across premier retail supply chains. BRCGS sets rigorous, GFSI-benchmarked operational standards for food manufacturing, packaging materials, storage, and distribution—protecting brand reputation, ensuring consumer safety, and validating technical excellence.
            </p>

            <div class="hero-actions d-flex flex-wrap ga-3 mb-8">
              <v-btn
                color="primary"
                size="x-large"
                elevation="2"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToEnquiry"
              >
                <v-icon class="mr-2">mdi-check-decagram</v-icon>
                Start Your BRCGS Certification Journey
              </v-btn>

              <v-btn
                variant="outlined"
                color="white"
                size="x-large"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToSection('requirements')"
              >
                <v-icon class="mr-2">mdi-file-document-check-outline</v-icon>
                Explore Issue 9 Requirements
              </v-btn>
            </div>

            <!-- Trust Pills Grid -->
            <div class="trust-pills d-flex flex-wrap ga-3">
              <div class="trust-pill">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>GFSI Recognized</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="info">mdi-earth</v-icon>
                <span>130+ Countries</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="amber-darken-2">mdi-star-check</v-icon>
                <span>Grade AA+ Benchmark</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="purple-lighten-2">mdi-numeric-9-box-multiple</v-icon>
                <span>Issue 9 Active</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="5" class="hero-media">
            <div class="hero-card elevation-6 rounded-xl overflow-hidden position-relative">
              <v-img
                src="/img/certifications/brcgs-food-safety-facility.jpg"
                alt="BRCGS Food Safety Quality Inspection on modern processing line"
                cover
                class="hero-img"
                height="440"
              >
                <div class="hero-card-overlay">
                  <div class="glass-tag top-tag">
                    <v-icon color="success" size="18" class="mr-1">mdi-check-all</v-icon>
                    <span>Retailer Benchmark Standard</span>
                  </div>
                  <div class="glass-tag bottom-tag">
                    <v-icon color="amber" size="18" class="mr-1">mdi-shield-star</v-icon>
                    <span>Issue 9 & Unannounced Protocols</span>
                  </div>
                </div>
              </v-img>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 2. What is BRCGS? ─────────────────────────────────────────── -->
    <section id="what-is-brcgs" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">GLOBAL BENCHMARK EXCELLENCE</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              What is BRCGS Certification?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              <strong>BRCGS</strong> (originally the <em>British Retail Consortium Global Standard</em>, now branded as <strong>Brand Reputation through Compliance Global Standards</strong>) is a globally recognized food safety and quality certification program. Acquired by LGC ASSURE, BRCGS standards are benchmarked by the Global Food Safety Initiative (GFSI) and specified by leading retailers, foodservice operators, and food manufacturers worldwide.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Unlike generic quality frameworks, BRCGS is highly prescriptive and operationally rigorous. It focuses directly on product safety, integrity, legal compliance, authenticity, and operational controls throughout food manufacturing, packaging converting, storage, logistics, and trading operations.
            </p>
            <v-card class="bg-blue-lighten-5 border-blue-lighten-3 pa-4 rounded-lg mb-4" variant="outlined">
              <div class="d-flex align-start ga-3">
                <v-icon color="primary" size="24" class="mt-1">mdi-information-outline</v-icon>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Standard vs. Certification Advisory</h3>
                  <p class="text-body-2 text-slate-700 mb-0">
                    BRCGS publishes the standards and oversees auditor governance. Third-party accredited certification bodies (CBs) conduct the formal audits. <strong>Brix Certifications</strong> delivers expert pre-audit readiness, gap assessments, internal auditor training, and technical advisory to prepare facilities for top-tier audit grading.
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-white">
              <h3 class="text-h6 font-weight-bold mb-4 text-slate-900 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-chart-timeline-variant</v-icon>
                The BRCGS Value Ecosystem
              </h3>
              <v-list density="compact" class="bg-transparent">
                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-store-check</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Premier Retailer Access</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Direct entry to supply supermarket giants including Tesco, Marks & Spencer, Walmart, Costco, Aldi, and Carrefour.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="success" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-shield-check</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">GFSI Full Recognition</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Globally benchmarked under GFSI benchmarking requirements version 2020, eliminating duplicate supplier audits.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="info" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-bullseye-arrow</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Clear Lettered Audit Grading</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Transparent benchmark grades (AA+, AA, A+, A, B+, B) providing buyers immediate visibility into site compliance levels.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="warning" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-database-search</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Public Directory Verification</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Certified sites are listed on the official BRCGS Directory, allowing global retailers to verify certification and audit reports in real time.
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 3. Types of BRCGS Standards ───────────────────────────────── -->
    <section id="standards-family" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">COMPREHENSIVE SUPPLY CHAIN COVERAGE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The BRCGS Family of Standards
          </h2>
          <p class="text-body-1 text-slate-600">
            BRCGS encompasses specialized technical standards designed for every node in the food and consumer goods supply chain, from farm-to-fork packaging and storage to finished food processing.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(standard, idx) in brcgsStandards"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="standard-family-card h-100 rounded-xl pa-6 border elevation-1 d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="standard.color" variant="tonal" size="48">
                  <v-icon size="26">{{ standard.icon }}</v-icon>
                </v-avatar>
                <v-chip size="small" :color="standard.color" variant="flat" class="font-weight-bold">
                  {{ standard.version }}
                </v-chip>
              </div>

              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
                {{ standard.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4 flex-grow-1">
                {{ standard.description }}
              </p>

              <div class="standard-scope pa-3 rounded-lg bg-slate-100 mb-4">
                <span class="text-caption font-weight-bold text-slate-700 d-block mb-1">Target Application:</span>
                <span class="text-caption text-slate-600">{{ standard.scope }}</span>
              </div>

              <div class="d-flex align-center justify-space-between pt-2 border-t">
                <span class="text-caption text-slate-500 font-weight-medium">GFSI Status:</span>
                <span class="text-caption font-weight-bold" :class="standard.gfsi ? 'text-success' : 'text-slate-700'">
                  {{ standard.gfsi ? 'GFSI Recognized' : 'Benchmarked Protocol' }}
                </span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 4. Deep Dive: BRCGS Food Safety Standard (Issue 9) ───────── -->
    <section id="food-safety-standard" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">CORE BENCHMARK</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              BRCGS Global Standard Food Safety (Issue 9)
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              Published in August 2022 and mandatory for all audits from <strong>February 1, 2023</strong>, <strong>Issue 9</strong> represents the definitive technical benchmark for food processing facilities. It reflects evolving food safety challenges, emerging food science, updated regulatory expectations, and revisions to Codex Alimentarius general principles of food hygiene.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Issue 9 places unprecedented emphasis on <em>Food Safety Culture</em>, environmental pathogen monitoring, operational hygiene controls, root cause analysis, and the distinction between primary manufacturing risk zones.
            </p>

            <div class="issue-9-pillars ga-3 d-flex flex-column">
              <div class="pillar-item d-flex align-start pa-3 rounded-lg border bg-slate-50">
                <v-icon color="primary" class="mr-3 mt-1">mdi-account-group-outline</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Empowered Food Safety Culture</h4>
                  <p class="text-caption text-slate-600 mb-0">Mandatory documented plan with defined activities, responsibilities, clear feedback mechanisms, and measurable KPIs for continuous cultural maturity.</p>
                </div>
              </div>

              <div class="pillar-item d-flex align-start pa-3 rounded-lg border bg-slate-50">
                <v-icon color="teal" class="mr-3 mt-1">mdi-bacteria-outline</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Dynamic Environmental Monitoring</h4>
                  <p class="text-caption text-slate-600 mb-0">Risk-based swabbing protocols for high-risk and high-care production areas targeting <em>Listeria monocytogenes</em>, <em>Salmonella</em>, and spoilage indicators.</p>
                </div>
              </div>

              <div class="pillar-item d-flex align-start pa-3 rounded-lg border bg-slate-50">
                <v-icon color="amber-darken-3" class="mr-3 mt-1">mdi-lock-shield-outline</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Food Defence & Authenticity (VACCP & TACCP)</h4>
                  <p class="text-caption text-slate-600 mb-0">Robust vulnerability assessments covering raw material fraud risks, economic adulteration, and intentional contamination threats.</p>
                </div>
              </div>

              <div class="pillar-item d-flex align-start pa-3 rounded-lg border bg-slate-50">
                <v-icon color="indigo" class="mr-3 mt-1">mdi-calendar-alert</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Mandatory Unannounced Audits</h4>
                  <p class="text-caption text-slate-600 mb-0">Adherence to the GFSI mandate requiring at least one unannounced audit every three years to verify day-to-day operational compliance.</p>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="rounded-xl border pa-6 shadow-sm bg-white position-relative">
              <v-img
                src="/img/certifications/brcgs-audit-inspection.jpg"
                alt="BRCGS Auditors reviewing plant records in food processing facility"
                cover
                class="rounded-lg mb-6"
                height="300"
              />
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">Auditor Shop Floor Focus (50% Rule)</h3>
              <p class="text-body-2 text-slate-600 mb-3">
                A hallmark of BRCGS audits is that <strong>a minimum of 50% of the audit duration</strong> must be spent on the production floor directly evaluating good manufacturing practice (GMP), process lines, staff hygiene, and physical site standards—rather than solely examining office paperwork.
              </p>
              <div class="d-flex align-center justify-space-between bg-slate-100 pa-3 rounded-lg">
                <span class="text-caption font-weight-bold text-slate-800">BRCGS Vertical Traceability Audit:</span>
                <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">Max 4 Hours</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 5. Key Requirements: The 9 Sections & Fundamentals ───────── -->
    <section id="requirements" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">TECHNICAL FRAMEWORK</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            BRCGS Food Safety Issue 9: Core Requirements
          </h2>
          <p class="text-body-1 text-slate-600">
            The standard comprises 9 structured sections. Within these sections, <strong>12 clauses are designated as "Fundamental"</strong>—a non-conformance against any Fundamental requirement results in failure to achieve certification or immediate certificate suspension.
          </p>
        </div>

        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="mb-8 rounded-lg"
          icon="mdi-alert-decagram-outline"
        >
          <div class="font-weight-bold text-slate-900 mb-1">Zero Tolerance for Fundamental Non-Conformances</div>
          <div class="text-body-2 text-slate-700">
            If an auditor raises a Critical or Major non-conformance against any of the 12 Fundamental clauses, certification cannot be granted, and existing certificates are immediately suspended. Robust implementation of these areas is essential before scheduling an initial audit.
          </div>
        </v-alert>

        <v-row>
          <v-col
            v-for="(req, idx) in keyRequirements"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="requirement-card h-100 rounded-xl pa-5 border elevation-1 bg-white">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="section-number text-caption font-weight-black text-primary px-2 py-1 rounded bg-blue-lighten-5">
                  Section {{ req.section }}
                </div>
                <v-chip
                  v-if="req.isFundamental"
                  size="x-small"
                  color="red-darken-1"
                  variant="flat"
                  class="font-weight-bold"
                >
                  FUNDAMENTAL
                </v-chip>
              </div>

              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                {{ req.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4">
                {{ req.description }}
              </p>

              <div class="checklist-items pt-3 border-t">
                <div
                  v-for="(point, pIdx) in req.keyPoints"
                  :key="pIdx"
                  class="d-flex align-start ga-2 mb-1"
                >
                  <v-icon size="14" color="primary" class="mt-1">mdi-check</v-icon>
                  <span class="text-caption text-slate-700">{{ point }}</span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 6. Who Needs BRCGS Certification? ────────────────────────── -->
    <section id="who-needs" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">APPLICABILITY & FIT</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              Who Needs BRCGS Certification?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              BRCGS certification is not legally mandated for every food business by government regulators. Instead, it is a <strong>commercial prerequisite</strong> demanded by Tier-1 retailers, global brands, quick-service restaurant (QSR) chains, and multinational distributors seeking guaranteed supply chain integrity.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Organisations that derive the highest strategic and commercial return from BRCGS certification include:
            </p>

            <v-list density="compact" class="bg-transparent mb-6">
              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="primary" class="mr-3">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Private-Label & Own-Brand Food Manufacturers</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Supplying products packaged under major supermarket brand names.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="primary" class="mr-3">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">High-Risk & High-Care Food Processors</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Ready-to-eat chilled meals, processed meat/poultry, dairy, and prepared salads.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="primary" class="mr-3">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Global Exporters Targeting UK, US & European Markets</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Meeting mandatory buyer specifications for import verification and customs due diligence.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="primary" class="mr-3">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Food Contact Packaging Converters</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Producing cartons, films, foils, tins, or bottles under BRCGS Packaging Materials.</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-slate-50">
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-4 d-flex align-center">
                <v-icon color="amber-darken-3" class="mr-2">mdi-scale-balance</v-icon>
                Is BRCGS Mandatory for Your Business?
              </h3>
              <p class="text-body-2 text-slate-700 mb-4">
                Consider this simple decision matrix to evaluate whether BRCGS is appropriate for your operation:
              </p>

              <div class="decision-box pa-4 rounded-lg bg-white border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-slate-900">Supplying UK / Commonwealth / North American Supermarkets?</span>
                  <v-chip size="x-small" color="success" class="font-weight-bold">BRCGS Strongly Recommended</v-chip>
                </div>
                <p class="text-caption text-slate-600 mb-0">
                  Most tier-1 retailers in the UK, Australia, and North America explicitly mandate BRCGS or another GFSI benchmark standard as a vendor condition.
                </p>
              </div>

              <div class="decision-box pa-4 rounded-lg bg-white border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-slate-900">B2B Ingredient Supply / Local Domestic Foodservice?</span>
                  <v-chip size="x-small" color="info" class="font-weight-bold">ISO 22000 or HACCP May Suffice</v-chip>
                </div>
                <p class="text-caption text-slate-600 mb-0">
                  If your customers do not explicitly specify BRCGS, an ISO 22000 or CODEX HACCP system may offer adequate assurance with lower audit prescription.
                </p>
              </div>

              <div class="decision-box pa-4 rounded-lg bg-white border">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-slate-900">Multi-Site Operations with Existing ISO 9001 Integration?</span>
                  <v-chip size="x-small" color="purple" class="font-weight-bold">FSSC 22000 Alternative</v-chip>
                </div>
                <p class="text-caption text-slate-600 mb-0">
                  Facilities with mature ISO systems often find FSSC 22000 harmonizes more naturally with ISO structure while delivering identical GFSI recognition.
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 7. Benefits of BRCGS Certification ───────────────────────── -->
    <section id="benefits" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STRATEGIC ROI</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Commercial and Operational Benefits
          </h2>
          <p class="text-body-1 text-slate-600">
            Achieving BRCGS certification converts food safety compliance from an overhead expense into a formidable commercial differentiator.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(benefit, idx) in benefits"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="benefit-card h-100 rounded-xl pa-6 border elevation-1 bg-white">
              <v-avatar :color="benefit.color" variant="tonal" size="48" class="mb-4">
                <v-icon size="26">{{ benefit.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
                {{ benefit.title }}
              </h3>
              <p class="text-body-2 text-slate-600 mb-0">
                {{ benefit.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 8. BRCGS Certification Process ──────────────────────────── -->
    <section id="process" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STEP-BY-STEP ROADMAP</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The 8-Step BRCGS Certification Journey
          </h2>
          <p class="text-body-1 text-slate-600">
            Navigating BRCGS requires meticulous preparation, cross-functional leadership, and rigorous verification. Follow this structured pathway from gap analysis to official BRCGS Directory listing.
          </p>
        </div>

        <div class="process-timeline">
          <v-row>
            <v-col
              v-for="(step, idx) in certificationSteps"
              :key="idx"
              cols="12"
              md="6"
              lg="3"
            >
              <v-card class="process-step-card h-100 rounded-xl pa-5 border elevation-1 bg-white position-relative">
                <div class="step-badge text-caption font-weight-black text-white px-3 py-1 rounded-pill mb-3 d-inline-block" :class="step.colorClass">
                  Step 0{{ idx + 1 }}
                </div>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-slate-600 mb-3">
                  {{ step.description }}
                </p>
                <div class="step-deliverable bg-slate-50 pa-2 rounded border text-caption text-slate-700">
                  <strong>Key Output:</strong> {{ step.deliverable }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- ── 9. Understanding BRCGS Audits & Grading Matrix ────────────── -->
    <section id="audits" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">AUDIT METHODOLOGY & SCORING</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Understanding BRCGS Audits & The Letter-Grade Matrix
          </h2>
          <p class="text-body-1 text-slate-600">
            Unlike pass/fail certification schemes, BRCGS issues precise letter grades based on the quantity and severity of non-conformances identified during the on-site audit.
          </p>
        </div>

        <!-- Grading Table Card -->
        <v-card class="rounded-xl border shadow-sm bg-white overflow-hidden mb-8">
          <div class="pa-4 bg-slate-900 text-white d-flex align-center justify-space-between flex-wrap ga-2">
            <div class="d-flex align-center ga-2">
              <v-icon color="amber">mdi-trophy-award</v-icon>
              <span class="font-weight-bold text-subtitle-1">BRCGS Food Safety Issue 9 Audit Grading Benchmark</span>
            </div>
            <v-chip size="small" color="primary" variant="flat">Unannounced Grade Includes '+' Suffix</v-chip>
          </div>

          <v-table hover class="grading-table">
            <thead>
              <tr class="bg-slate-100">
                <th class="font-weight-bold text-slate-900 py-3">Announced Grade</th>
                <th class="font-weight-bold text-slate-900 py-3">Unannounced Grade</th>
                <th class="font-weight-bold text-slate-900 py-3">Critical Non-Conformances</th>
                <th class="font-weight-bold text-slate-900 py-3">Major Non-Conformances</th>
                <th class="font-weight-bold text-slate-900 py-3">Minor Non-Conformances</th>
                <th class="font-weight-bold text-slate-900 py-3">Audit Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(grade, idx) in auditGrades" :key="idx" :class="grade.rowClass">
                <td class="font-weight-black text-slate-900">
                  <span class="grade-pill" :class="grade.pillClass">{{ grade.announced }}</span>
                </td>
                <td class="font-weight-black text-primary">
                  <span class="grade-pill-plus">{{ grade.unannounced }}</span>
                </td>
                <td class="text-body-2">{{ grade.critical }}</td>
                <td class="text-body-2">{{ grade.major }}</td>
                <td class="text-body-2">{{ grade.minor }}</td>
                <td class="text-body-2 font-weight-medium">{{ grade.frequency }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Audit Non-Conformance Classifications -->
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="h-100 rounded-xl pa-5 border elevation-1 bg-white border-l-4 border-l-red-500">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon color="red">mdi-close-octagon</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900">Critical Non-Conformance</h3>
              </div>
              <p class="text-body-2 text-slate-600 mb-2">
                A direct failure of food safety, product legality, or integrity that places consumers at immediate risk.
              </p>
              <div class="text-caption font-weight-bold text-red-darken-1">
                Consequence: No certificate granted. Existing certificate suspended immediately. Full re-audit required.
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="h-100 rounded-xl pa-5 border elevation-1 bg-white border-l-4 border-l-amber-500">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon color="amber-darken-2">mdi-alert-circle</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900">Major Non-Conformance</h3>
              </div>
              <p class="text-body-2 text-slate-600 mb-2">
                A substantial failure to meet the requirements of a standard statement of intent, or a systemic breakdown of operational control.
              </p>
              <div class="text-caption font-weight-bold text-amber-darken-2">
                Consequence: Severe impact on audit grade. Evidence of root cause & corrective action must be closed within 28 days.
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="h-100 rounded-xl pa-5 border elevation-1 bg-white border-l-4 border-l-blue-500">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon color="blue">mdi-information</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900">Minor Non-Conformance</h3>
              </div>
              <p class="text-body-2 text-slate-600 mb-2">
                An isolated lapse in meeting a specific requirement that does not compromise overall food safety or product legality.
              </p>
              <div class="text-caption font-weight-bold text-blue-darken-2">
                Consequence: Corrective action evidence must be submitted and validated within 28 calendar days before certificate issuance.
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 10. BRCGS vs FSSC 22000 ──────────────────────────────────── -->
    <section id="comparison" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STRATEGIC BENCHMARK</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            BRCGS vs FSSC 22000: Comprehensive Comparison
          </h2>
          <p class="text-body-1 text-slate-600">
            Both BRCGS Food Safety and FSSC 22000 are benchmarked by GFSI and globally accepted. However, their structural philosophy, audit methodology, and market popularity differ significantly.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white overflow-hidden mb-6">
          <v-table hover class="comparison-table">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="py-4 font-weight-bold">Evaluation Dimension</th>
                <th class="py-4 font-weight-bold text-primary-lighten-2">BRCGS Food Safety (Issue 9)</th>
                <th class="py-4 font-weight-bold text-teal-lighten-2">FSSC 22000 (Version 6)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in comparisonData" :key="idx">
                <td class="font-weight-bold text-slate-900 bg-slate-50 py-3">{{ item.dimension }}</td>
                <td class="text-body-2 py-3">{{ item.brcgs }}</td>
                <td class="text-body-2 py-3">{{ item.fssc }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card class="pa-5 rounded-xl border bg-blue-lighten-5 border-blue-lighten-3 h-100">
              <h3 class="text-subtitle-1 font-weight-bold text-blue-darken-3 mb-2 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-check-decagram</v-icon>
                Choose BRCGS When:
              </h3>
              <ul class="text-body-2 text-slate-700 pl-4 ga-1 d-flex flex-column">
                <li>Your primary customers are UK, US, Canadian, or Commonwealth supermarket retailers.</li>
                <li>Your retail contracts explicitly demand BRCGS or require letter-grade transparency (e.g., Grade A/AA).</li>
                <li>You manufacture private-label own-brand goods for brand owners.</li>
                <li>You prefer a prescriptive standard that provides exact, unambiguous compliance rules.</li>
              </ul>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-5 rounded-xl border bg-teal-lighten-5 border-teal-lighten-3 h-100">
              <h3 class="text-subtitle-1 font-weight-bold text-teal-darken-3 mb-2 d-flex align-center">
                <v-icon color="teal" class="mr-2">mdi-sync</v-icon>
                Choose FSSC 22000 When:
              </h3>
              <ul class="text-body-2 text-slate-700 pl-4 ga-1 d-flex flex-column">
                <li>Your facility already operates ISO 9001, ISO 14001, or ISO 45001 management systems.</li>
                <li>You prefer the Annex SL Harmonized Structure for seamless multi-standard integration.</li>
                <li>Your primary export markets are in Continental Europe, Asia, or Latin America.</li>
                <li>Learn more about our <NuxtLink to="/certifications/fssc-22000" class="text-teal-darken-2 font-weight-bold">FSSC 22000 Certification Guide</NuxtLink>.</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 11. BRCGS Documentation Checklist ────────────────────────── -->
    <section id="documentation" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">AUDIT READINESS TOOLKIT</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            BRCGS Documentation & Records Checklist
          </h2>
          <p class="text-body-1 text-slate-600">
            A successful BRCGS audit hinges on verifiable objective evidence. Review the core documentation sets required during the technical document review and on-site audit.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white pa-6">
          <v-tabs v-model="activeDocTab" color="primary" align-tabs="center" class="mb-6">
            <v-tab value="management" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-account-tie</v-icon>
              Management & Culture
            </v-tab>
            <v-tab value="haccp" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-shield-alert</v-icon>
              HACCP & Risk Plans
            </v-tab>
            <v-tab value="prps" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-factory</v-icon>
              PRPs & Site Fabric
            </v-tab>
            <v-tab value="operations" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-swap-horizontal-bold</v-icon>
              Traceability & Testing
            </v-tab>
          </v-tabs>

          <v-window v-model="activeDocTab">
            <!-- Management Tab -->
            <v-window-item value="management">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.management" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="primary" class="mt-1">mdi-file-check-outline</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- HACCP Tab -->
            <v-window-item value="haccp">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.haccp" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="teal" class="mt-1">mdi-shield-check-outline</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- PRPs Tab -->
            <v-window-item value="prps">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.prps" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="amber-darken-3" class="mt-1">mdi-tools</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Operations Tab -->
            <v-window-item value="operations">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.operations" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="indigo" class="mt-1">mdi-barcode-scan</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card>
      </v-container>
    </section>

    <!-- ── 12. Frequently Asked Questions ───────────────────────────── -->
    <section id="faq" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">CLEAR ANSWERS</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            BRCGS Certification Frequently Asked Questions
          </h2>
          <p class="text-body-1 text-slate-600">
            Authoritative answers on BRCGS Food Safety Issue 9 requirements, audit grading rules, preparation timelines, costs, and compliance protocols.
          </p>
        </div>

        <div class="max-w-900 mx-auto">
          <v-expansion-panels variant="accordion" class="faq-panels">
            <v-expansion-panel
              v-for="(faq, idx) in faqList"
              :key="idx"
              elevation="1"
              class="mb-3 rounded-lg border overflow-hidden"
            >
              <v-expansion-panel-title class="font-weight-bold text-slate-900 py-4">
                {{ faq.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-slate-700 py-3 bg-slate-50">
                {{ faq.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-container>
    </section>

    <!-- ── 13. Enquiry & Consultation Section ───────────────────────── -->
    <section id="enquiry" class="py-16 bg-slate-900 text-white position-relative">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6" class="pr-lg-8">
            <div class="hero-badge mb-3 bg-slate-800 text-primary-lighten-2">
              <v-icon size="16" class="mr-1">mdi-phone-incoming</v-icon>
              <span>BRCGS Technical Advisory & Pre-Audit Gap Analysis</span>
            </div>

            <h2 class="text-h3 font-weight-bold mb-4">
              Prepare with Confidence for Your BRCGS Issue 9 Audit
            </h2>

            <p class="text-body-1 text-slate-300 mb-6">
              Don’t risk non-conformances that could downgrade your site from an AA to a C. Our senior food safety specialists conduct comprehensive mock audits, validate HACCP and culture plans, train internal auditors, and guide your team through each step of the certification pathway.
            </p>

            <div class="d-flex flex-column ga-3 mb-6">
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Independent Pre-Audit Gap Assessments & Shop-Floor Inspections</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Food Safety Culture Plan Development & KPI Benchmarking</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Accredited Lead Auditor and Internal Auditor Coaching</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Assistance in Selecting and Scheduling an Accredited Certification Body</span>
              </div>
            </div>

            <div class="related-links pa-4 rounded-lg bg-slate-800 border-slate-700">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-2">EXPLORE RELATED STANDARDS:</span>
              <div class="d-flex flex-wrap ga-3">
                <NuxtLink to="/certifications/fssc-22000" class="text-caption text-primary-lighten-2 font-weight-bold">FSSC 22000 Standard</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/iso-22000" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 22000 Food Safety</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/iso-certification" class="text-caption text-primary-lighten-2 font-weight-bold">All ISO Certifications</NuxtLink>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl pa-6 pa-md-8 bg-white text-slate-900 elevation-8">
              <h3 class="text-h5 font-weight-bold mb-2">Request BRCGS Consultation</h3>
              <p class="text-body-2 text-slate-600 mb-6">
                Fill out the details below. Our technical food safety advisors will contact you within 24 business hours to discuss your facility scope and audit timeline.
              </p>

              <v-form @submit.prevent="submitEnquiry">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.fullName"
                      label="Full Name *"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                      required
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.company"
                      label="Company / Facility Name *"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                      required
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.email"
                      label="Work Email *"
                      type="email"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                      required
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.phone"
                      label="Phone Number"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.standard"
                      label="Target BRCGS Standard *"
                      :items="[
                        'Food Safety (Issue 9)',
                        'Packaging Materials (Issue 6)',
                        'Storage and Distribution (Issue 4)',
                        'Agents and Brokers (Issue 3)',
                        'Consumer Products (Issue 4)',
                        'Plant-Based / Gluten-Free Module'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.timeframe"
                      label="Target Audit Timeline"
                      :items="[
                        'Immediate (< 1 month)',
                        '1 to 3 months',
                        '3 to 6 months',
                        '6 to 12 months',
                        'General enquiry'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.notes"
                      label="Facility Scope, High-Care Zones, or Specific Buyer Requirements"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      class="mb-4"
                    />
                  </v-col>
                </v-row>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  elevation="2"
                  class="font-weight-bold text-none py-3"
                  :loading="isSubmitting"
                >
                  <v-icon class="mr-2">mdi-send</v-icon>
                  Submit BRCGS Consultation Request
                </v-btn>

                <p v-if="submissionMessage" class="text-caption text-success font-weight-bold text-center mt-3 mb-0">
                  {{ submissionMessage }}
                </p>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ── SEO Metadata & Canonical ──────────────────────────────────────
const pageTitle = 'BRCGS Certification | Global Food Safety Standard (Issue 9) Advisory';
const pageDescription = 'Comprehensive guide to BRCGS Certification for food manufacturers. Understand BRCGS Food Safety Issue 9 requirements, audit grading (AA to D), HACCP, and certification pathways.';
const pageUrl = 'https://brixcertifications.com/certifications/brcgs';

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogUrl: pageUrl,
  ogType: 'website',
  ogImage: 'https://brixcertifications.com/img/certifications/brcgs-food-safety-facility.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: 'https://brixcertifications.com/img/certifications/brcgs-food-safety-facility.jpg'
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
        name: 'BRCGS Certification Consultation and Food Safety Advisory',
        serviceType: 'BRCGS Global Food Safety Standard Consulting',
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
          name: 'BRCGS Certification Gap Analysis & Training Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'BRCGS Issue 9 Gap Analysis & Mock Shop-Floor Audit'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'BRCGS Food Safety Culture Plan & HACCP Validation'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'BRCGS Lead Auditor & Internal Auditor Training'
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
            name: 'BRCGS Certification',
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
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the difference between BRCGS Issue 8 and Issue 9?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'BRCGS Food Safety Issue 9 introduces mandatory food safety culture operational plans with measurable KPIs, expanded environmental monitoring protocols for high-care and high-risk zones, updated equipment design and maintenance clauses, refined Codex Alimentarius HACCP alignments, and strict animal welfare and traceability requirements for meat/livestock processors.'
            }
          },
          {
            '@type': 'Question',
            name: 'What does the "+" suffix mean in BRCGS audit grades (e.g. AA+ or A+)?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The "+" symbol designates that the certification audit was conducted entirely unannounced. For instance, Grade AA+ signifies that the site achieved the highest score tier (fewer than 5 minor non-conformances and zero major/critical findings) during an unannounced inspection.'
            }
          },
          {
            '@type': 'Question',
            name: 'How often must a BRCGS audit be conducted unannounced?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In alignment with GFSI benchmark benchmarking rules, every BRCGS certified site must undergo at least one mandatory unannounced audit every three years. The certification body notifies the site of the 4-month audit window, during which the facility is allowed up to 10 blackout non-audit days for scheduled maintenance or shutdowns.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is a "Fundamental" clause in BRCGS and why is it critical?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'BRCGS designates 12 specific clauses as "Fundamental Statements of Intent"—including Senior Management Commitment, HACCP, Internal Audits, Corrective Actions, Traceability, Layout and Product Flow, Housekeeping and Hygiene, Allergen Management, Operations Control, and Training. Failure to satisfy a Fundamental clause triggers an immediate non-certification or certificate suspension.'
            }
          },
          {
            '@type': 'Question',
            name: 'How long is a BRCGS certificate valid?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For sites achieving grades AA, AA+, A, A+, B, or B+, the BRCGS certificate is valid for 12 months. Sites receiving a Grade C or C+ are subject to a 6-month certificate validity and must undergo a mandatory re-audit within 6 months.'
            }
          }
        ]
      })
    }
  ]
});

// ── Standards Family Data ──────────────────────────────────────────
const brcgsStandards = [
  {
    title: 'Global Standard Food Safety',
    version: 'Issue 9',
    color: 'primary',
    icon: 'mdi-silverware-clean',
    description: 'The flagship benchmark for food processing facilities, covering manufactured foods, raw ingredient preparation, animal slaughter/processing, and ready-to-eat products.',
    scope: 'Food manufacturers, primary processors, packaging-integrated food plants.',
    gfsi: true
  },
  {
    title: 'Global Standard Packaging Materials',
    version: 'Issue 6',
    color: 'teal',
    icon: 'mdi-package-variant-closed',
    description: 'Rigorous hygiene and functional performance standard for manufacturers producing primary, secondary, and tertiary food-contact packaging and consumer packaging materials.',
    scope: 'Flexible plastics, paperboard, glass, metals, closures, and labels.',
    gfsi: true
  },
  {
    title: 'Global Standard Storage & Distribution',
    version: 'Issue 4',
    color: 'blue-grey',
    icon: 'mdi-truck-cargo-container',
    description: 'Ensures product safety, quality, and legal compliance across multi-temperature warehousing, logistics hubs, cross-docking facilities, and transportation fleets.',
    scope: 'Third-party logistics (3PL), temperature-controlled cold stores, freight handlers.',
    gfsi: true
  },
  {
    title: 'Global Standard Agents & Brokers',
    version: 'Issue 3',
    color: 'indigo',
    icon: 'mdi-handshake-outline',
    description: 'Designed for non-manufacturing food trading enterprises, importers, and brokers managing chain-of-custody, supplier approval, and food fraud risk without physical product handling.',
    scope: 'Food traders, import/export agents, bulk commodity brokers.',
    gfsi: true
  },
  {
    title: 'Global Standard Consumer Products',
    version: 'Issue 4',
    color: 'amber-darken-3',
    icon: 'mdi-shopping-outline',
    description: 'Dual-tiered standard (Foundation and Higher Level) covering personal care items, household chemicals, cosmetics, and general merchandise retail goods.',
    scope: 'Cosmetics, soaps, household cleaners, textiles, appliances, toys.',
    gfsi: false
  },
  {
    title: 'Gluten-Free & Plant-Based Modules',
    version: 'Module 12/13',
    color: 'success',
    icon: 'mdi-leaf',
    description: 'Add-on certification modules validating strict allergen-free controls, dedicated segregated production lines, and authentic plant-based product claims.',
    scope: 'Free-from manufacturers, vegan certified producers, specialty health foods.',
    gfsi: false
  }
];

// ── 9 Sections & Fundamental Requirements Data ────────────────────
const keyRequirements = [
  {
    section: '1',
    title: 'Senior Management Commitment',
    isFundamental: true,
    description: 'Demonstrating visible leadership, continuous food safety culture development, adequate resource allocation, and timely management reviews.',
    keyPoints: [
      'Documented food safety culture development plan with KPIs',
      'Confidential whistleblowing mechanism for employees',
      'Quarterly executive reviews of non-conformances and audits'
    ]
  },
  {
    section: '2',
    title: 'The Food Safety Plan – HACCP',
    isFundamental: true,
    description: 'A comprehensive, fully validated HACCP system compliant with the 12 steps of Codex Alimentarius principles.',
    keyPoints: [
      'Multidisciplinary HACCP team led by trained team leader',
      'Complete process flow diagrams verified on the line',
      'Identification and ongoing monitoring of CCPs with defined critical limits'
    ]
  },
  {
    section: '3',
    title: 'Food Safety & Quality Management',
    isFundamental: true,
    description: 'The organizational infrastructure covering document control, internal audits, corrective actions, supplier approval, and customer complaints.',
    keyPoints: [
      'Risk-based internal audit schedule completed annually',
      'Supplier approval based on GFSI certification or audit',
      'Structured root cause analysis on repeat non-conformances'
    ]
  },
  {
    section: '4',
    title: 'Site Standards & Fabric',
    isFundamental: true,
    description: 'Design, layout, and maintenance of physical facilities, equipment hygiene, pest management, and foreign body mitigation.',
    keyPoints: [
      'Strict physical segregation between raw and ready-to-eat zones',
      'Pest management trend analysis and preventative pest proofing',
      'Systematic metal detection, X-ray, and optical sorting controls'
    ]
  },
  {
    section: '5',
    title: 'Product Control',
    isFundamental: true,
    description: 'Product design, allergen management, product authenticity, laboratory testing, and positive release protocols.',
    keyPoints: [
      'Documented allergen validation matrix and cleaning validations',
      'Vulnerability assessment against food fraud (VACCP)',
      'Accredited internal or external laboratory testing regimens'
    ]
  },
  {
    section: '6',
    title: 'Process Control',
    isFundamental: true,
    description: 'Operational validation of recipes, cooking/cooling parameters, temperature logging, and quantity measurement.',
    keyPoints: [
      'Routine calibration of all measuring equipment (gauges, scales)',
      'Legal average quantity weights and volume compliance',
      'Documented rework handling and segregation procedures'
    ]
  },
  {
    section: '7',
    title: 'Personnel & Hygiene',
    isFundamental: true,
    description: 'Staff hygiene, protective workwear laundering, medical screening, and allergen and CCP competency training.',
    keyPoints: [
      'Mandatory hygiene induction prior to entering production lines',
      'Enclosed laundering protocols for high-care protective clothing',
      'Medical screening for contagious diseases and return-to-work logs'
    ]
  },
  {
    section: '8',
    title: 'Production Risk Zones',
    isFundamental: false,
    description: 'Detailed physical and hygiene barriers separating high-risk, high-care, and ambient high-care processing areas.',
    keyPoints: [
      'Full barrier footwear changing stations and air handling filters',
      'Dedicated drainage flow directed away from ready-to-eat zones',
      'Dedicated utensils, cleaning equipment, and maintenance tools'
    ]
  },
  {
    section: '9',
    title: 'Traded Food Products',
    isFundamental: false,
    description: 'Voluntary module for facilities that purchase and resell food products stored at the site but not manufactured there.',
    keyPoints: [
      'Supplier approval system for all traded goods vendors',
      'Traceability maintenance through receipts, storage, and dispatch',
      'Verification of product legality and specification conformance'
    ]
  }
];

// ── Benefits Data ──────────────────────────────────────────────────
const benefits = [
  {
    title: 'Tier-1 Retail Market Access',
    icon: 'mdi-storefront-outline',
    color: 'primary',
    description: 'Opens doors to major national and international supermarket chains that make BRCGS certification a non-negotiable vendor prerequisite.'
  },
  {
    title: 'GFSI Global Equivalence',
    icon: 'mdi-shield-airplane-outline',
    color: 'teal',
    description: 'Benchmarked against the Global Food Safety Initiative, allowing your site to satisfy multiple global buyers with a single audit.'
  },
  {
    title: 'Reduced Operational Scrap & Recalls',
    icon: 'mdi-chart-line-variant',
    color: 'success',
    description: 'Rigorous HACCP validation, allergen controls, and foreign body detection dramatically reduce expensive product withdrawals and rework.'
  },
  {
    title: 'Elimination of Duplicate Customer Audits',
    icon: 'mdi-calendar-check',
    color: 'amber-darken-3',
    description: 'Retailers and food service brands accept your BRCGS audit report and grade, saving substantial internal management time.'
  },
  {
    title: 'Measured Food Safety Culture',
    icon: 'mdi-account-group',
    color: 'indigo',
    description: 'Issue 9 enforces concrete organizational culture programs, empowering staff at all levels to report and resolve food safety risks.'
  },
  {
    title: 'Transparent Public Credibility',
    icon: 'mdi-database-check-outline',
    color: 'purple',
    description: 'Public listing on the BRCGS Directory provides instant real-time verification of your certification validity and audit grade.'
  }
];

// ── 8-Step Certification Process ──────────────────────────────────
const certificationSteps = [
  {
    title: 'Standard Acquisition & Scoping',
    colorClass: 'bg-primary',
    description: 'Acquire official BRCGS Standard Issue 9 and determine exact facility boundaries, product categories, and exclusions.',
    deliverable: 'Defined audit scope document'
  },
  {
    title: 'Comprehensive Gap Assessment',
    colorClass: 'bg-teal',
    description: 'Evaluate existing operational procedures, PRP records, and site layout against every clause of the standard.',
    deliverable: 'Prioritized gap remediation matrix'
  },
  {
    title: 'HACCP & Culture Plan Deployment',
    colorClass: 'bg-indigo',
    description: 'Validate CCP critical limits, update allergen matrices, build environmental swabbing protocols, and launch culture plan.',
    deliverable: 'Validated HACCP & culture plan'
  },
  {
    title: 'Internal Audit & Management Review',
    colorClass: 'bg-blue-grey',
    description: 'Conduct a complete internal audit across all shifts and production zones; execute senior leadership review.',
    deliverable: 'Signed management review minutes'
  },
  {
    title: 'Engage Accredited Certification Body',
    colorClass: 'bg-amber-darken-3',
    description: 'Select an accredited CB, determine audit date or enter the mandatory unannounced audit window.',
    deliverable: 'Confirmed CB audit agreement'
  },
  {
    title: 'On-Site Certification Audit',
    colorClass: 'bg-purple',
    description: 'Auditor spends at least 50% of time evaluating line operations, GMP, traceability, records, and staff interviews.',
    deliverable: 'Initial audit non-conformance sheet'
  },
  {
    title: 'Close Non-Conformances (28 Days)',
    colorClass: 'bg-red-darken-1',
    description: 'Execute root cause analysis and submit corrective action evidence within the strict 28-calendar-day deadline.',
    deliverable: 'CB-approved root cause & CAPA pack'
  },
  {
    title: 'Technical Review & Certificate Issuance',
    colorClass: 'bg-success',
    description: 'CB technical committee reviews audit file, assigns official grade (AA to D), and lists facility on BRCGS Directory.',
    deliverable: 'Official BRCGS Certificate'
  }
];

// ── BRCGS Audit Grades Matrix Data ─────────────────────────────────
const auditGrades = [
  {
    announced: 'AA',
    unannounced: 'AA+',
    critical: '0',
    major: '0',
    minor: '≤ 5',
    frequency: '12 Months',
    rowClass: 'bg-emerald-50',
    pillClass: 'bg-success text-white'
  },
  {
    announced: 'A',
    unannounced: 'A+',
    critical: '0',
    major: '0',
    minor: '6 – 10',
    frequency: '12 Months',
    rowClass: '',
    pillClass: 'bg-primary text-white'
  },
  {
    announced: 'B',
    unannounced: 'B+',
    critical: '0',
    major: '0 (or 1)',
    minor: '11 – 16 (or ≤ 10 with 1 Major)',
    frequency: '12 Months',
    rowClass: '',
    pillClass: 'bg-blue text-white'
  },
  {
    announced: 'C',
    unannounced: 'C+',
    critical: '0',
    major: '0, 1, or 2',
    minor: '17 – 24 (or 11 – 16 with 1 Major, or ≤ 10 with 2 Major)',
    frequency: '6 Months (Re-audit Required)',
    rowClass: 'bg-amber-50',
    pillClass: 'bg-amber-darken-2 text-white'
  },
  {
    announced: 'D',
    unannounced: 'D+',
    critical: '0',
    major: '0, 1, or 2',
    minor: '25 – 30 (or higher combination)',
    frequency: 'Re-audit Required Before Certificate Issue',
    rowClass: 'bg-orange-50',
    pillClass: 'bg-orange-darken-3 text-white'
  },
  {
    announced: 'Uncertified',
    unannounced: 'Uncertified',
    critical: '≥ 1',
    major: '> 1 on Fundamental',
    minor: '> 30',
    frequency: 'Immediate Failure / Existing Certificate Suspended',
    rowClass: 'bg-red-50',
    pillClass: 'bg-red-darken-2 text-white'
  }
];

// ── Comparison Table: BRCGS vs FSSC 22000 ─────────────────────────
const comparisonData = [
  {
    dimension: 'Governing Scheme Owner',
    brcgs: 'LGC ASSURE (Commercial Brand Protection)',
    fssc: 'Foundation FSSC (Non-Profit Foundation)'
  },
  {
    dimension: 'Underlying Standards Foundation',
    brcgs: 'Single standalone, comprehensive standard book (Issue 9)',
    fssc: 'ISO 22000:2018 + Sector PRP (ISO/TS 22002-x) + FSSC Additional Requirements'
  },
  {
    dimension: 'GFSI Benchmark Status',
    brcgs: 'Fully Recognized (Under GFSI Benchmarking Requirements v2020)',
    fssc: 'Fully Recognized (Under GFSI Benchmarking Requirements v2020)'
  },
  {
    dimension: 'Standard Prescriptiveness',
    brcgs: 'High: Specific, prescriptive physical site and operational rules',
    fssc: 'Moderate: Outcome-focused, aligned with ISO management system structure'
  },
  {
    dimension: 'Audit Grading System',
    brcgs: 'Letter grades: AA+, AA, A+, A, B+, B, C, D (transparent on BRCGS Directory)',
    fssc: 'Pass / Fail certification (Non-conformances categorized as Minor, Major, Critical)'
  },
  {
    dimension: 'Shop Floor Audit Duration',
    brcgs: 'Strict mandate: Minimum 50% of total audit time spent on the factory floor',
    fssc: 'Standard ISO sampling methodology across documentation and production floor'
  },
  {
    dimension: 'Mandatory Unannounced Audits',
    brcgs: 'Yes: At least 1 mandatory unannounced audit every 3 years (GFSI protocol)',
    fssc: 'Yes: At least 1 mandatory unannounced audit every 3-year certification cycle'
  },
  {
    dimension: 'Market & Retail Preference',
    brcgs: 'Dominant among UK, US, Commonwealth, and private-label supermarket retailers',
    fssc: 'Dominant among multinational food conglomerates and European ingredient processors'
  },
  {
    dimension: 'Supply Chain Scope',
    brcgs: 'Distinct books for Food, Packaging, Storage/Logistics, Agents/Brokers, Consumer Goods',
    fssc: 'Modular scopes covering Food, Packaging, Transport, Animal Feed, Biochemicals'
  }
];

// ── Documentation Checklist Tabs ──────────────────────────────────
const activeDocTab = ref('management');

const docChecklists = {
  management: [
    { name: 'Food Safety Policy & Culture Plan', desc: 'Signed executive policy, whistleblower procedure, and annual culture plan with measurable progress reviews.' },
    { name: 'Organizational Chart & Job Descriptions', desc: 'Clear reporting lines, defined deputies for key technical roles, and competent authority escalation.' },
    { name: 'Management Review Minutes', desc: 'Quarterly review records covering past audit findings, customer complaints, and resource adequacy.' },
    { name: 'Internal Audit Reports & Schedule', desc: 'Complete annual schedule covering all 9 sections and risk zones with documented corrective actions.' }
  ],
  haccp: [
    { name: 'HACCP Study & Team Qualifications', desc: 'Codex Alimentarius HACCP plan, team training certificates, flow diagrams verified on the line.' },
    { name: 'Hazard Analysis & Risk Evaluation', desc: 'Biological, chemical, physical, allergen, and radiological hazard evaluations with references.' },
    { name: 'Critical Control Point (CCP) Validation', desc: 'Scientific validations of critical limits (temperatures, pH, sieve sizes, metal detector test pieces).' },
    { name: 'CCP Monitoring & Deviation Logs', desc: 'Routine records of continuous monitoring, corrective action logs, and quarantine registers.' }
  ],
  prps: [
    { name: 'Environmental Pathogen Swabbing Records', desc: 'Documented sampling plan for high-risk zones, swab maps, trend graphs, and corrective actions.' },
    { name: 'Pest Control Service Logs & Trend Reports', desc: 'Licensed pest operator reports, bait station maps, chemical usage logs, and annual biologist reviews.' },
    { name: 'Cleaning & Sanitation Validations', desc: 'Visual, ATP, and microbiological validation records for line cleans and allergen changeovers.' },
    { name: 'Preventative Maintenance & Calibration', desc: 'Maintenance schedules, food-grade lubricant certificates, calibration records for scales and probes.' }
  ],
  operations: [
    { name: 'Traceability & 4-Hour Mock Recall Test', desc: 'Annual mass-balance reconciliation completed within 4 hours, accounting for 100% of material.' },
    { name: 'Allergen Management & Matrix', desc: 'Site allergen map, color-coded utensils, rework segregation rules, and allergen test kit records.' },
    { name: 'Foreign Body & Metal Detector Logs', desc: 'Hourly test piece verification records (ferrous, non-ferrous, stainless steel) and failsafe audits.' },
    { name: 'Food Fraud (VACCP) & Food Defence (TACCP)', desc: 'Documented raw material authenticity assessments and site vulnerability security assessments.' }
  ]
};

// ── FAQ List ──────────────────────────────────────────────────────
const faqList = [
  {
    question: 'What is the difference between BRCGS Issue 8 and Issue 9?',
    answer: 'BRCGS Food Safety Issue 9 introduces several major enhancements over Issue 8. Key updates include: mandatory food safety culture operational plans with measurable goals; enhanced environmental pathogen swabbing protocols for high-care and high-risk zones; explicit equipment procurement, design, and commissioning requirements (Section 4.6); revised HACCP alignment with the updated Codex General Principles of Food Hygiene; and integrated animal welfare verification for processors of meat and livestock products.'
  },
  {
    question: 'How much does BRCGS certification cost?',
    answer: 'The total investment consists of two components: the direct accredited certification body (CB) audit fees, and internal preparation costs. CB audit fees typically range between $3,500 and $7,500 depending on facility size, number of HACCP lines, number of production risk zones, and whether the audit is announced or unannounced. Additional costs may involve gap assessments, infrastructure fabric upgrades, laboratory pathogen validation, and staff training.'
  },
  {
    question: 'What does the "+" suffix mean in BRCGS audit grades (e.g., AA+ vs AA)?',
    answer: 'The "+" symbol designates that the certification audit was conducted entirely unannounced. Under BRCGS protocols, an unannounced audit demonstrates that the factory operates to full standard compliance every single day without advance notice or prep work. Achieving an AA+ is the highest possible grade in the BRCGS scheme.'
  },
  {
    question: 'How often must a BRCGS audit be conducted unannounced?',
    answer: 'In alignment with GFSI benchmarking rules, every BRCGS certified site must undergo at least one mandatory unannounced audit every three years. The certification body notifies the site of the 4-month audit window, during which the facility is allowed up to 10 blackout non-audit days for scheduled maintenance or shutdowns.'
  },
  {
    question: 'How long is a BRCGS certificate valid?',
    answer: 'For sites achieving grades AA, AA+, A, A+, B, or B+, the BRCGS certificate is valid for 12 months. Sites receiving a Grade C or C+ are subject to a 6-month certificate validity and must undergo a mandatory re-audit within 6 months to maintain compliance.'
  },
  {
    question: 'What is the strict deadline for closing out non-conformances after a BRCGS audit?',
    answer: 'Objective evidence of corrective action and root cause analysis (CAPA) must be submitted to the certification body within exactly 28 calendar days of the audit closing meeting. Failure to provide acceptable evidence within 28 days results in non-certification and requires a complete re-audit.'
  },
  {
    question: 'What is a "Fundamental" clause in BRCGS and why is it critical?',
    answer: 'BRCGS designates 12 specific clauses as "Fundamental Statements of Intent"—including Senior Management Commitment, HACCP, Internal Audits, Corrective Actions, Traceability, Layout and Product Flow, Housekeeping and Hygiene, Allergen Management, Operations Control, and Training. Failure to satisfy a Fundamental clause triggers an immediate non-certification or certificate suspension.'
  },
  {
    question: 'Does my company need BRCGS if we already have ISO 22000?',
    answer: 'While ISO 22000 is an internationally respected standard, it is NOT recognized by the Global Food Safety Initiative (GFSI) unless augmented into FSSC 22000. Major retailers in the UK, North America, and Europe generally require a GFSI-recognized standard like BRCGS. If your buyers specify BRCGS, ISO 22000 alone will not satisfy their vendor requirements.'
  },
  {
    question: 'How do BRCGS high-risk and high-care production risk zones differ?',
    answer: 'High-risk areas process ready-to-eat (RTE) foods that are subject to a cooking/kill step during manufacturing and are vulnerable to pathogen contamination (e.g., cooked chilled meats). High-care areas handle RTE chilled products where raw materials may have undergone a decontamination step, but pathogens may survive (e.g., prepared bagged salads, dairy). Both require physical segregation, dedicated air filtration, drainage barriers, and distinct boot-changing footwear protocols.'
  },
  {
    question: 'Can Brix Certifications issue our accredited BRCGS certificate directly?',
    answer: 'No. To preserve rigorous impartiality and comply with ISO/IEC 17021 and 17065 accreditation rules, organizations that provide pre-audit consulting and training cannot act as the certification body for the same client. Brix Certifications delivers independent gap analyses, mock audits, culture planning, and readiness training, and assists you in selecting an accredited third-party certification body.'
  },
  {
    question: 'What is a BRCGS vertical audit and trace test?',
    answer: 'During the on-site audit, the auditor conducts a vertical audit trail, selecting a finished product batch and tracing all associated documentation backwards: raw material supplier certificates of analysis, intake temperature logs, formulation sheets, CCP monitoring charts, allergen changeovers, line packaging logs, and final distribution. A full mock trace exercise must be completed within 4 hours with 100% mass balance reconciliation.'
  },
  {
    question: 'How long does it realistically take to implement BRCGS from scratch?',
    answer: 'For a facility starting with basic HACCP, implementation typically requires 4 to 8 months. This timeline provides adequate time to develop written procedures, execute cleaning validations, train personnel, accumulate at least 3 months of operational monitoring records, conduct a full internal audit, and hold a senior management review before hosting the external auditor.'
  }
];

// ── Consultation Form State & Actions ─────────────────────────────
const form = ref({
  fullName: '',
  company: '',
  email: '',
  phone: '',
  standard: 'Food Safety (Issue 9)',
  timeframe: '1 to 3 months',
  notes: ''
});

const isSubmitting = ref(false);
const submissionMessage = ref('');

function scrollToEnquiry() {
  const el = document.getElementById('enquiry');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

async function submitEnquiry() {
  isSubmitting.value = true;
  submissionMessage.value = '';

  try {
    // Simulated submission delay
    await new Promise(resolve => setTimeout(resolve, 800));
    submissionMessage.value = 'Thank you! Your BRCGS consultation request has been received. Our senior food safety specialist will contact you within 24 hours.';
    form.value.fullName = '';
    form.value.company = '';
    form.value.email = '';
    form.value.phone = '';
    form.value.notes = '';
  } catch (e) {
    submissionMessage.value = 'An error occurred. Please call our technical desk or email support directly.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.brcgs-page {
  font-family: 'Figtree', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
}

/* ── Hero Styling ─────────────────────────────────────────────────── */
.brcgs-hero {
  position: relative;
  background: linear-gradient(135deg, #0b1120 0%, #172554 50%, #1e1b4b 100%);
  color: #ffffff;
  padding: 5rem 0 4rem;
  overflow: hidden;
}

.hero-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.18) 0%, transparent 60%);
  pointer-events: none;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
}

.breadcrumb-nav li a {
  color: #93c5fd;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-nav li a:hover {
  color: #ffffff;
}

.breadcrumb-nav .separator {
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
}

.breadcrumb-nav .active {
  color: #cbd5e1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  font-size: 0.82rem;
  font-weight: 600;
  color: #bfdbfe;
}

.hero-title {
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  color: #cbd5e1;
  line-height: 1.6;
}

.trust-pills {
  margin-top: 1rem;
}

.trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #f1f5f9;
  backdrop-filter: blur(8px);
}

.hero-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
}

.glass-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  align-self: flex-start;
}

.bottom-tag {
  align-self: flex-end;
}

/* ── Standard Family Cards ────────────────────────────────────────── */
.standard-family-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  background: #ffffff;
}

.standard-family-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1) !important;
}

/* ── Requirement Cards ────────────────────────────────────────────── */
.requirement-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.requirement-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -6px rgba(0, 0, 0, 0.08) !important;
}

/* ── Benefit Cards ────────────────────────────────────────────────── */
.benefit-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.benefit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -6px rgba(0, 0, 0, 0.08) !important;
}

/* ── Process Timeline ─────────────────────────────────────────────── */
.process-step-card {
  transition: transform 0.2s ease;
}

.process-step-card:hover {
  transform: translateY(-3px);
}

/* ── Grading Table ────────────────────────────────────────────────── */
.grading-table th,
.grading-table td {
  padding: 0.85rem 1rem !important;
  vertical-align: middle;
}

.grade-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.9rem;
}

.grade-pill-plus {
  font-weight: 800;
  font-size: 0.95rem;
}

/* ── Comparison Table ─────────────────────────────────────────────── */
.comparison-table th,
.comparison-table td {
  padding: 0.9rem 1.2rem !important;
  vertical-align: middle;
}

/* ── General Helpers ──────────────────────────────────────────────── */
.max-w-800 {
  max-width: 800px;
}

.max-w-900 {
  max-width: 900px;
}

.tracking-wider {
  letter-spacing: 0.08em;
}

.border-t {
  border-top: 1px solid #e2e8f0;
}

.border-l-4 {
  border-left-width: 4px !important;
}

.border-l-red-500 {
  border-left-color: #ef4444 !important;
}

.border-l-amber-500 {
  border-left-color: #f59e0b !important;
}

.border-l-blue-500 {
  border-left-color: #3b82f6 !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.bg-slate-800 {
  background-color: #1e293b;
}

.bg-slate-900 {
  background-color: #0f172a;
}

.text-slate-900 {
  color: #0f172a;
}

.text-slate-800 {
  color: #1e293b;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-600 {
  color: #475569;
}

.text-slate-500 {
  color: #64748b;
}

.text-slate-400 {
  color: #94a3b8;
}

.text-slate-300 {
  color: #cbd5e1;
}

.text-slate-200 {
  color: #e2e8f0;
}

.border-slate-700 {
  border-color: #334155;
}
</style>
