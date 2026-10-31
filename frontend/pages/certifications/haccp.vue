<template>
  <div class="haccp-page">
    <!-- ── 1. Hero Section ─────────────────────────────────────────── -->
    <section class="haccp-hero">
      <div class="hero-bg-overlay"></div>
      <v-container class="hero-container position-relative">
        <!-- Breadcrumbs -->
        <nav aria-label="Breadcrumb" class="mb-4">
          <ol class="breadcrumb-nav">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li><NuxtLink to="/#standards">Certifications</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li class="active" aria-current="page">HACCP Food Safety</li>
          </ol>
        </nav>

        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="7" class="hero-content">
            <div class="hero-badge mb-3">
              <v-icon size="16" color="teal" class="mr-1">mdi-shield-check</v-icon>
              <span>Codex Alimentarius Benchmark · Food Safety Control</span>
            </div>

            <h1 class="hero-title text-h3 text-md-h2 font-weight-bold mb-4">
              HACCP Certification – Identify, Control and Prevent Food Safety Hazards
            </h1>

            <p class="hero-subtitle text-body-1 text-md-subtitle-1 mb-6">
              Safeguard your consumers and build supply chain integrity. Hazard Analysis and Critical Control Points (HACCP) provides the universally recognized, science-based preventative framework for identifying, evaluating, and systematically controlling biological, chemical, physical, and allergen hazards across every stage of food production.
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
                Start Your HACCP Journey
              </v-btn>

              <v-btn
                variant="outlined"
                color="white"
                size="x-large"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToSection('principles')"
              >
                <v-icon class="mr-2">mdi-numeric-7-box-multiple-outline</v-icon>
                Explore 7 HACCP Principles
              </v-btn>
            </div>

            <!-- Trust Pills Grid -->
            <div class="trust-pills d-flex flex-wrap ga-3">
              <div class="trust-pill">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Codex Alimentarius</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="teal-lighten-2">mdi-shield-bug-outline</v-icon>
                <span>Preventive Control</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="amber-lighten-1">mdi-store-check</v-icon>
                <span>Retail Prerequisite</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="purple-lighten-2">mdi-microscope</v-icon>
                <span>Science-Based Validation</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="5" class="hero-media">
            <div class="hero-card elevation-6 rounded-xl overflow-hidden position-relative">
              <v-img
                src="/img/certifications/iso-22000-ccp-inspection.jpg"
                alt="Food safety technician inspecting Critical Control Point on modern food production line"
                cover
                class="hero-img"
                height="440"
              >
                <div class="hero-card-overlay">
                  <div class="glass-tag top-tag">
                    <v-icon color="teal" size="18" class="mr-1">mdi-check-all</v-icon>
                    <span>Codex General Principles Aligned</span>
                  </div>
                  <div class="glass-tag bottom-tag">
                    <v-icon color="amber" size="18" class="mr-1">mdi-thermometer-check</v-icon>
                    <span>Critical Limits & Real-Time Monitoring</span>
                  </div>
                </div>
              </v-img>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 2. What is HACCP? ────────────────────────────────────────── -->
    <section id="what-is-haccp" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">SCIENTIFIC FOUNDATION</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              What is HACCP?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              <strong>HACCP</strong> stands for <strong>Hazard Analysis and Critical Control Points</strong>. It is a systematic, scientifically grounded methodology that addresses food safety through the proactive analysis and control of biological, chemical, physical, and radiological hazards—from raw material procurement and handling to manufacturing, distribution, and consumption.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Developed in the 1960s by the Pillsbury Company alongside NASA and the U.S. Army Laboratories to ensure 100% pathogen-free food for the space program, HACCP revolutionized global food safety. It shifted the industry away from reliance on retrospective end-product testing (which cannot detect unevenly distributed contamination) toward <strong>in-process preventive controls</strong>.
            </p>

            <v-card class="bg-blue-lighten-5 border-blue-lighten-3 pa-4 rounded-lg mb-4" variant="outlined">
              <div class="d-flex align-start ga-3">
                <v-icon color="primary" size="24" class="mt-1">mdi-information-outline</v-icon>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">HACCP Methodology vs. Third-Party Certification</h3>
                  <p class="text-body-2 text-slate-700 mb-0">
                    <strong>HACCP as a methodology</strong> is the technical system of hazard identification and CCP monitoring codified by the Codex Alimentarius Commission (CAC/RCP 1-1969). <strong>Third-party HACCP certification</strong> is an independent audit conducted by an accredited certification body (CB) confirming that a site’s documented HACCP plan and factory floor operations fully conform to recognized benchmark standards.
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-slate-50">
              <h3 class="text-h6 font-weight-bold mb-4 text-slate-900 d-flex align-center">
                <v-icon color="teal" class="mr-2">mdi-chart-timeline-variant</v-icon>
                Core Pillars of the HACCP Philosophy
              </h3>
              <v-list density="compact" class="bg-transparent">
                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-shield-search</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Prevention Over End-Testing</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Controlling parameters at critical process steps ensures safety is built into the food rather than inspected in at the end.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="teal" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-scale-balance</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Codex Alimentarius Alignment</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Internationally recognized by the FAO and WHO, forming the sanitary basis for the WTO Sanitary and Phytosanitary (SPS) Agreement.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="amber-darken-3" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-layers-triple</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">PRP Foundation Prerequisite</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    A HACCP plan cannot succeed without strong Good Manufacturing Practices (GMP) and Good Hygienic Practices (GHP) as its bedrock.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="purple" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-file-certificate-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Stepping Stone to Global Standards</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    HACCP is the scientific engine embedded within advanced global standards including ISO 22000, FSSC 22000, and BRCGS.
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 3. The Seven Principles of HACCP ─────────────────────────── -->
    <section id="principles" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">CODEX ALIMENTARIUS METHODOLOGY</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The Seven Principles of HACCP
          </h2>
          <p class="text-body-1 text-slate-600">
            Formally defined by Codex Alimentarius in CAC/RCP 1-1969, these seven principles govern the scientific development, execution, and ongoing verification of every credible food safety plan.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(principle, idx) in haccpPrinciples"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="haccp-card h-100 rounded-xl pa-6 border elevation-1 bg-white d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="principle.color" variant="tonal" size="48">
                  <v-icon size="26">{{ principle.icon }}</v-icon>
                </v-avatar>
                <div class="principle-number px-2 py-1 rounded bg-slate-100 text-caption font-weight-black text-slate-700">
                  Principle 0{{ idx + 1 }}
                </div>
              </div>

              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
                {{ principle.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4 flex-grow-1">
                {{ principle.description }}
              </p>

              <div class="principle-output pa-3 rounded-lg bg-slate-50 border">
                <span class="text-caption font-weight-bold text-slate-800 d-block mb-1">Key Action / Output:</span>
                <span class="text-caption text-slate-600">{{ principle.output }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 4. Types of Food Safety Hazards ──────────────────────────── -->
    <section id="hazards" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">HAZARD IDENTIFICATION (PRINCIPLE 1)</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The Four Categories of Food Safety Hazards
          </h2>
          <p class="text-body-1 text-slate-600">
            A hazard is any biological, chemical, physical, or allergen agent in food with the potential to cause adverse human health effects. A complete HACCP plan rigorously evaluates all four classes.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(hazard, idx) in hazardCategories"
            :key="idx"
            cols="12"
            md="6"
          >
            <v-card class="hazard-card h-100 rounded-xl pa-6 border elevation-1 bg-white">
              <div class="d-flex align-center ga-3 mb-4">
                <v-avatar :color="hazard.color" variant="tonal" size="52">
                  <v-icon size="28">{{ hazard.icon }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-bold text-slate-900">{{ hazard.title }}</h3>
                  <span class="text-caption text-slate-500 font-weight-medium">{{ hazard.subtitle }}</span>
                </div>
              </div>

              <p class="text-body-2 text-slate-700 mb-4">
                {{ hazard.description }}
              </p>

              <div class="hazard-examples mb-3 pa-3 rounded-lg bg-slate-50 border">
                <span class="text-caption font-weight-bold text-slate-900 d-block mb-1">Common Examples:</span>
                <span class="text-caption text-slate-700">{{ hazard.examples }}</span>
              </div>

              <div class="hazard-control pa-3 rounded-lg bg-blue-lighten-5 border border-blue-lighten-3">
                <span class="text-caption font-weight-bold text-primary d-block mb-1">Typical CCP / PRP Controls:</span>
                <span class="text-caption text-slate-700">{{ hazard.controls }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 5. What is a HACCP Plan? ─────────────────────────────────── -->
    <section id="haccp-plan" class="py-16 bg-slate-50">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">TECHNICAL SPECIFICATION</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              What is a HACCP Plan?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              A <strong>HACCP Plan</strong> is a formal, written document prepared in accordance with the seven HACCP principles to ensure control of food safety hazards in a specific facility, process line, or food category.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              A HACCP plan is product- and process-specific. A plan engineered for thermal milk pasteurization will differ fundamentally from a plan for frozen raw meat or bakery goods.
            </p>

            <div class="plan-components d-flex flex-column ga-3">
              <div class="pa-3 rounded-lg border bg-white d-flex align-start ga-3">
                <v-icon color="primary" class="mt-1">mdi-file-document-outline</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Product Description & Intended Use</h4>
                  <p class="text-caption text-slate-600 mb-0">Formulation, packaging, shelf life, target consumers, and vulnerable populations (infants, elderly, immunocompromised).</p>
                </div>
              </div>

              <div class="pa-3 rounded-lg border bg-white d-flex align-start ga-3">
                <v-icon color="teal" class="mt-1">mdi-sitemap</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Verified Process Flow Diagram (PFD)</h4>
                  <p class="text-caption text-slate-600 mb-0">Step-by-step schematic of the entire operation verified on-site during active shifts.</p>
                </div>
              </div>

              <div class="pa-3 rounded-lg border bg-white d-flex align-start ga-3">
                <v-icon color="amber-darken-3" class="mt-1">mdi-table-headers-eye</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">HACCP Master Control Plan Table</h4>
                  <p class="text-caption text-slate-600 mb-0">Defines CCPs, hazard descriptions, critical limits, monitoring methods, frequency, designated operators, and pre-planned corrective actions.</p>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="rounded-xl border pa-6 shadow-sm bg-white position-relative">
              <v-img
                src="/img/certifications/fssc-laboratory-testing.jpg"
                alt="Food safety microbiologist testing food samples in analytical laboratory"
                cover
                class="rounded-lg mb-6"
                height="320"
              />
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">The Prerequisite Foundation (PRPs)</h3>
              <p class="text-body-2 text-slate-600 mb-3">
                A HACCP plan cannot function in isolation. It relies on <strong>Prerequisite Programmes (PRPs)</strong> such as building sanitation, pest management, potable water supply, and personnel hygiene. Attempting to manage basic factory cleanliness via CCPs results in a bloated, ineffective safety plan.
              </p>
              <div class="d-flex align-center justify-space-between bg-slate-100 pa-3 rounded-lg">
                <span class="text-caption font-weight-bold text-slate-800">Prerequisite Framework:</span>
                <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">Codex Good Hygienic Practices (GHP)</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 6. Who Needs HACCP? ──────────────────────────────────────── -->
    <section id="who-needs" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">SUPPLY CHAIN APPLICABILITY</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Who Needs HACCP Certification?
          </h2>
          <p class="text-body-1 text-slate-600">
            HACCP is essential for any enterprise that handles, prepares, manufactures, packages, or distributes food intended for human consumption.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(sector, idx) in sectors"
            :key="idx"
            cols="12"
            md="6"
            lg="3"
          >
            <v-card class="sector-card h-100 rounded-xl pa-5 border elevation-1 bg-white d-flex flex-column">
              <v-avatar :color="sector.color" variant="tonal" size="44" class="mb-3">
                <v-icon size="24">{{ sector.icon }}</v-icon>
              </v-avatar>

              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                {{ sector.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-3 flex-grow-1">
                {{ sector.description }}
              </p>

              <div class="bg-slate-50 pa-2 rounded border text-caption text-slate-700">
                <strong>Primary CCP:</strong> {{ sector.primaryCcp }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-8 rounded-xl border pa-6 bg-slate-50">
          <div class="d-flex align-start ga-3">
            <v-icon color="amber-darken-3" size="24" class="mt-1">mdi-scale-balance</v-icon>
            <div>
              <h4 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Are You Legally Required to Have HACCP Certification?</h4>
              <p class="text-body-2 text-slate-700 mb-0">
                Legal obligations vary by country and operational scope. In the European Union (EC Reg 852/2004), the United States (FDA Juice & Seafood HACCP, USDA Meat & Poultry), the UK, and India (FSSAI), businesses are legally mandated to implement procedures based on HACCP principles. While smaller food service outlets may satisfy national requirements through documented prerequisite hygiene systems, food processors, exporters, and supermarket suppliers almost always require <strong>formal third-party HACCP certification</strong> to satisfy commercial buyer contracts.
              </p>
            </div>
          </div>
        </v-card>
      </v-container>
    </section>

    <!-- ── 7. HACCP Implementation Process (12 Steps) ───────────────── -->
    <section id="process" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">CODEX 12-STEP METHODOLOGY</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The 12-Step HACCP Implementation Process
          </h2>
          <p class="text-body-1 text-slate-600">
            Codex Alimentarius outlines 12 logical steps: five preliminary preparation tasks followed by the systematic application of the seven core HACCP principles.
          </p>
        </div>

        <div class="process-timeline">
          <v-row>
            <v-col
              v-for="(step, idx) in twelveSteps"
              :key="idx"
              cols="12"
              md="6"
              lg="3"
            >
              <v-card class="process-step-card h-100 rounded-xl pa-5 border elevation-1 bg-white position-relative">
                <div class="step-badge text-caption font-weight-black text-white px-3 py-1 rounded-pill mb-3 d-inline-block" :class="step.colorClass">
                  Step {{ idx + 1 < 10 ? '0' + (idx + 1) : (idx + 1) }}
                </div>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-slate-600 mb-3">
                  {{ step.description }}
                </p>
                <div class="step-deliverable bg-slate-50 pa-2 rounded border text-caption text-slate-700">
                  <strong>Milestone:</strong> {{ step.deliverable }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- ── 8. Benefits of HACCP ─────────────────────────────────────── -->
    <section id="benefits" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">COMMERCIAL & SAFETY VALUE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Tangible Benefits of HACCP Certification
          </h2>
          <p class="text-body-1 text-slate-600">
            HACCP turns compliance from a burden into a strategic asset, protecting consumer lives and opening doors to lucrative retail and export markets.
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

    <!-- ── 9. HACCP Documentation Checklist ─────────────────────────── -->
    <section id="documentation" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">AUDIT READINESS TOOLKIT</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            HACCP Documentation and Records Checklist
          </h2>
          <p class="text-body-1 text-slate-600">
            In food safety, "if it wasn’t recorded, it never happened." Review the essential plans, CCP logs, calibration records, and verification evidence required for third-party audit success.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white pa-6">
          <v-tabs v-model="activeDocTab" color="primary" align-tabs="center" class="mb-6">
            <v-tab value="plan" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-file-tree-outline</v-icon>
              Plan Architecture
            </v-tab>
            <v-tab value="ccp" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-thermometer-check</v-icon>
              CCP Monitoring Logs
            </v-tab>
            <v-tab value="prps" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-spray-bottle</v-icon>
              PRPs & Sanitation
            </v-tab>
            <v-tab value="verification" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-check-decagram-outline</v-icon>
              Verification & Testing
            </v-tab>
          </v-tabs>

          <v-window v-model="activeDocTab">
            <!-- Plan Architecture Tab -->
            <v-window-item value="plan">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.plan" :key="idx" cols="12" md="6">
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

            <!-- CCP Monitoring Logs Tab -->
            <v-window-item value="ccp">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.ccp" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="teal" class="mt-1">mdi-clipboard-pulse-outline</v-icon>
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

            <!-- Verification Tab -->
            <v-window-item value="verification">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.verification" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="indigo" class="mt-1">mdi-microscope</v-icon>
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

    <!-- ── 10. HACCP vs ISO 22000 ───────────────────────────────────── -->
    <section id="vs-iso-22000" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STANDARD COMPARISON</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            HACCP vs ISO 22000: Operational Tool vs Management System
          </h2>
          <p class="text-body-1 text-slate-600">
            HACCP is the technical hazard control engine. ISO 22000 embeds HACCP into an overarching organizational management system built on the Annex SL structure.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white overflow-hidden mb-6">
          <v-table hover class="comparison-table">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="py-4 font-weight-bold">Comparison Feature</th>
                <th class="py-4 font-weight-bold text-teal-lighten-2">Codex HACCP Methodology</th>
                <th class="py-4 font-weight-bold text-primary-lighten-2">ISO 22000:2018 Management System</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in haccpVsIso22000" :key="idx">
                <td class="font-weight-bold text-slate-900 bg-slate-50 py-3">{{ item.feature }}</td>
                <td class="text-body-2 py-3 text-slate-700">{{ item.haccp }}</td>
                <td class="text-body-2 py-3 text-slate-800">{{ item.iso22000 }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </section>

    <!-- ── 11. HACCP vs FSSC 22000 ──────────────────────────────────── -->
    <section id="vs-fssc-22000" class="py-16 bg-slate-50">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">GLOBAL BENCHMARK HIERARCHY</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              HACCP vs FSSC 22000: The Pathway to GFSI Recognition
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              While stand-alone third-party HACCP certification is widely respected and satisfies regulatory requirements in many countries, major global supermarket chains (such as Walmart, Tesco, and Carrefour) generally demand a <strong>GFSI-benchmarked certification</strong> like <NuxtLink to="/certifications/fssc-22000" class="text-primary font-weight-bold">FSSC 22000</NuxtLink> or <NuxtLink to="/certifications/brcgs" class="text-primary font-weight-bold">BRCGS</NuxtLink>.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              <strong>FSSC 22000</strong> takes HACCP and wraps it within:
            </p>

            <ul class="text-body-2 text-slate-700 pl-4 ga-2 d-flex flex-column mb-6">
              <li><strong>ISO 22000:2018:</strong> Complete Food Safety Management System with executive leadership and communication.</li>
              <li><strong>ISO/TS 22002 Prerequisite Standards:</strong> Highly detailed, prescriptive sector-specific prerequisite hygiene rules.</li>
              <li><strong>FSSC Additional Requirements:</strong> Mandatory food defense (TACCP), food fraud prevention (VACCP), environmental monitoring, and food safety culture.</li>
            </ul>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="pa-6 rounded-xl border bg-white shadow-sm">
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-4 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-stairs-up</v-icon>
                The Food Safety Certification Ladder
              </h3>

              <div class="ladder-step pa-3 rounded-lg bg-slate-50 border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-slate-900">Level 1: Good Hygienic Practices (GHP)</span>
                  <v-chip size="x-small" color="blue-grey">Baseline</v-chip>
                </div>
                <p class="text-caption text-slate-600 mb-0">Sanitation, water testing, pest management, and personal hygiene.</p>
              </div>

              <div class="ladder-step pa-3 rounded-lg bg-teal-lighten-5 border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-teal-darken-3">Level 2: Codex HACCP Certification</span>
                  <v-chip size="x-small" color="teal">Preventive Control</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">Hazard analysis, CCP critical limits, real-time monitoring, and verification.</p>
              </div>

              <div class="ladder-step pa-3 rounded-lg bg-blue-lighten-5 border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-primary">Level 3: ISO 22000:2018 (FSMS)</span>
                  <v-chip size="x-small" color="primary">Management System</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">Integrates HACCP with Annex SL leadership, OPRPs, and continual improvement.</p>
              </div>

              <div class="ladder-step pa-3 rounded-lg bg-purple-lighten-5 border">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-purple-darken-3">Level 4: FSSC 22000 / BRCGS (GFSI)</span>
                  <v-chip size="x-small" color="purple">Global Tier-1 Retail</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">Full GFSI benchmark recognition, unannounced audits, food defense & authenticity.</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 12. HACCP Frequently Asked Questions ─────────────────────── -->
    <section id="faq" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">CLEAR ANSWERS</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            HACCP Frequently Asked Questions
          </h2>
          <p class="text-body-1 text-slate-600">
            Authoritative answers on HACCP plan drafting, CCP determination, audit costs, certificate validity, and regulatory requirements.
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

    <!-- ── 13. Final Enquiry & Consultation Section ─────────────────── -->
    <section id="enquiry" class="py-16 bg-slate-900 text-white position-relative">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6" class="pr-lg-8">
            <div class="hero-badge mb-3 bg-slate-800 text-primary-lighten-2">
              <v-icon size="16" class="mr-1">mdi-phone-incoming</v-icon>
              <span>HACCP Technical Advisory & Gap Assessment</span>
            </div>

            <h2 class="text-h3 font-weight-bold mb-4">
              Build a Flawless, Audit-Ready HACCP Food Safety System
            </h2>

            <p class="text-body-1 text-slate-300 mb-6">
              Don’t risk pathogen outbreaks, costly product recalls, or failed buyer audits. Our food safety specialists help your facility develop verified flow diagrams, establish scientifically sound critical limits, train internal HACCP teams, and navigate third-party certification.
            </p>

            <div class="d-flex flex-column ga-3 mb-6">
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">On-Site Gap Analysis & Process Flowchart Verification</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Scientific Hazard Analysis & Codex Decision Tree CCP Determination</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">HACCP Team Leader & Internal Auditor Competency Training</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Assistance in Selecting Accredited Third-Party Certification Bodies</span>
              </div>
            </div>

            <div class="related-links pa-4 rounded-lg bg-slate-800 border-slate-700">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-2">EXPLORE COMPLEMENTARY FOOD STANDARDS:</span>
              <div class="d-flex flex-wrap ga-3">
                <NuxtLink to="/certifications/iso-22000" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 22000 FSMS</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/fssc-22000" class="text-caption text-primary-lighten-2 font-weight-bold">FSSC 22000</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/brcgs" class="text-caption text-primary-lighten-2 font-weight-bold">BRCGS Food Safety</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/qms" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 9001 QMS</NuxtLink>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl pa-6 pa-md-8 bg-white text-slate-900 elevation-8">
              <h3 class="text-h5 font-weight-bold mb-2">Request HACCP Consultation</h3>
              <p class="text-body-2 text-slate-600 mb-6">
                Connect with our senior food safety advisors. We will review your production line, high-risk ingredients, and certification timeline within 24 business hours.
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
                      v-model="form.industry"
                      label="Food Operation Sector *"
                      :items="[
                        'Food Manufacturing & Processing',
                        'Meat, Poultry & Seafood',
                        'Dairy & Beverages',
                        'Commercial Kitchens & Restaurants',
                        'Hotels, Catering & Institutions',
                        'Food Packaging Converters',
                        'Warehousing & Cold Chain Logistics',
                        'Importers / Exporters'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.timeframe"
                      label="Target Implementation Timeline"
                      :items="[
                        'Immediate (< 1 month)',
                        '1 to 3 months',
                        '3 to 6 months',
                        '6 to 12 months',
                        'General HACCP training enquiry'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.notes"
                      label="Product Types, Thermal Steps, or Specific Buyer Requirements"
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
                  Submit HACCP Consultation Request
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
const pageTitle = 'HACCP Certification | Hazard Analysis and Critical Control Points Advisory';
const pageDescription = 'Comprehensive guide to HACCP Certification. Understand the 7 HACCP Principles, Codex Alimentarius 12-step implementation, biological/chemical hazards, CCPs, and audit requirements.';
const pageUrl = 'https://brixcertifications.com/certifications/haccp';

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogUrl: pageUrl,
  ogType: 'website',
  ogImage: 'https://brixcertifications.com/img/certifications/iso-22000-ccp-inspection.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: 'https://brixcertifications.com/img/certifications/iso-22000-ccp-inspection.jpg'
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
        name: 'HACCP Food Safety Certification and Implementation Advisory',
        serviceType: 'Hazard Analysis and Critical Control Points Consulting',
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
          name: 'HACCP Consulting and Training Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'HACCP Gap Assessment and Process Flowchart Verification'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'HACCP Plan Development and Critical Limit Validation'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'HACCP Team Leader and Internal Auditor Training'
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
            name: 'HACCP Food Safety',
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
            name: 'Is HACCP legally required for every food business?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Legal obligations depend on national jurisdiction and the specific food activity. In many jurisdictions (e.g. EU Regulation 852/2004, US FDA seafood/juice rules, USDA meat/poultry inspection, and FSSAI rules in India), food businesses are legally required to operate procedures based on HACCP principles. While small retail outlets may comply using documented Good Hygienic Practices (GHP), food processors, industrial caterers, and exporters almost universally require formal third-party certified HACCP systems to satisfy regulatory and retail customer mandates.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the difference between a CCP and a PRP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Prerequisite Programmes (PRPs) provide the basic environmental and operational conditions necessary for safe food production throughout the entire facility (e.g. general sanitation, pest control, water potability, handwashing). A Critical Control Point (CCP) is a specific process step (e.g. thermal cooking at 75°C for 2 minutes, metal detection) where control can be applied and is essential to prevent, eliminate, or reduce a specific food safety hazard to an acceptable level.'
            }
          },
          {
            '@type': 'Question',
            name: 'How often must a HACCP plan be reviewed and re-validated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A HACCP plan must be reviewed at least annually, or immediately whenever changes occur: such as reformulating ingredients, introducing new equipment, altering line flow, encountering repeat deviations, or when new pathogen hazards or regulations emerge.'
            }
          },
          {
            '@type': 'Question',
            name: 'What qualifications does a HACCP team leader need?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A HACCP team leader should possess formal training in the 7 Codex HACCP principles (Level 3 or Level 4 HACCP certification), understanding of microbiology, food technology, and plant-specific equipment.'
            }
          }
        ]
      })
    }
  ]
});

// ── The Seven Principles of HACCP Data ────────────────────────────
const haccpPrinciples = [
  {
    title: 'Conduct a Hazard Analysis',
    color: 'primary',
    icon: 'mdi-magnify-scan',
    description: 'Systematically list all potential biological, chemical, physical, and allergen hazards that may reasonably occur at each process step.',
    output: 'Comprehensive hazard analysis worksheet with severity and likelihood ratings.'
  },
  {
    title: 'Determine Critical Control Points (CCPs)',
    color: 'teal',
    icon: 'mdi-target',
    description: 'Apply the Codex CCP Decision Tree to identify the precise steps where control is essential to prevent, eliminate, or reduce a food safety hazard to an acceptable level.',
    output: 'Documented CCP determination log with clear rationale for CCP designations.'
  },
  {
    title: 'Establish Validated Critical Limits',
    color: 'amber-darken-3',
    icon: 'mdi-ruler-square',
    description: 'Determine maximum and/or minimum scientific boundaries (e.g., temperature, time, pH, water activity, chlorine level) that separate safe from unsafe food.',
    output: 'Validated critical limits backed by scientific literature, regulatory codes, or laboratory trials.'
  },
  {
    title: 'Establish Monitoring Procedures',
    color: 'indigo',
    icon: 'mdi-eye-check-outline',
    description: 'Set up planned observations or measurements to assess whether a CCP is under control and produce an accurate record for future verification.',
    output: 'Scheduled monitoring protocols (who, what, when, and how measurements are taken).'
  },
  {
    title: 'Establish Corrective Actions',
    color: 'red-darken-1',
    icon: 'mdi-alert-octagon-outline',
    description: 'Pre-define specific procedures to be executed immediately when monitoring indicates that a critical limit has been breached.',
    output: 'Quarantine procedures, product disposition criteria, and root cause corrective actions.'
  },
  {
    title: 'Establish Verification Procedures',
    color: 'purple',
    icon: 'mdi-check-decagram-outline',
    description: 'Apply methods, procedures, laboratory testing, and calibration audits—in addition to monitoring—to determine ongoing compliance with the HACCP plan.',
    output: 'Instrument calibration records, microbiological testing reports, and annual HACCP reviews.'
  },
  {
    title: 'Establish Record-Keeping Procedures',
    color: 'success',
    icon: 'mdi-folder-text-outline',
    description: 'Maintain efficient, accurate documentation and live operational logs demonstrating that the HACCP system is actively functioning under control.',
    output: 'Auditable archive of CCP monitoring sheets, calibration logs, and deviation records.'
  }
];

// ── Four Categories of Food Safety Hazards ────────────────────────
const hazardCategories = [
  {
    title: 'Biological Hazards',
    subtitle: 'Microbiological Pathogens & Toxins',
    color: 'red-darken-1',
    icon: 'mdi-bacteria-outline',
    description: 'Living microorganisms (bacteria, viruses, parasites, and molds) capable of multiplying in food or producing potent toxins that trigger severe foodborne illness.',
    examples: 'Salmonella enterica, Listeria monocytogenes, E. coli O157:H7, Campylobacter jejuni, Clostridium botulinum, Norovirus, Aflatoxins.',
    controls: 'Validated thermal cooking (≥75°C core), flash pasteurization, chilling (<4°C), acidification (pH <4.6), and strict personal hygiene.'
  },
  {
    title: 'Chemical Hazards',
    subtitle: 'Toxic Compounds & Residues',
    color: 'amber-darken-3',
    icon: 'mdi-flask-outline',
    description: 'Harmful chemical substances that can occur naturally, be unintentionally introduced during farming/manufacturing, or contaminate food via cleaning chemicals.',
    examples: 'Sanitizer/detergent residues, heavy metals (lead, cadmium), pesticide residues, veterinary antibiotic residues, mycotoxins, lubricants.',
    controls: 'Approved chemical registers, food-grade NSF lubricants, supplier Letters of Guarantee (LOG), rinse verifications, and analytical testing.'
  },
  {
    title: 'Physical Hazards',
    subtitle: 'Extraneous Foreign Materials',
    color: 'blue-grey',
    icon: 'mdi-nut',
    description: 'Foreign objects or hard materials capable of causing physical injury, lacerations, choking, or broken teeth upon consumption.',
    examples: 'Metal shavings from blenders/slicers, glass shards from broken lightbulbs, brittle plastic pieces, stones, bone splinters, jewelry.',
    controls: 'Calibrated inline metal detectors, X-ray inspection machines, optical sorters, magnetic traps, 100% fine mesh sieves, and brittle glass audits.'
  },
  {
    title: 'Allergen Hazards',
    subtitle: 'Immunological Cross-Contact & Mislabeling',
    color: 'purple-darken-1',
    icon: 'mdi-peanut-outline',
    description: 'Specific food proteins that trigger life-threatening anaphylactic reactions in sensitized individuals. Cross-contact and incorrect label packaging are major recall drivers.',
    examples: 'Peanuts, tree nuts (almonds, cashews), milk, eggs, wheat/gluten, soy, fish, crustaceans, sesame, mustard, celery, sulfites.',
    controls: 'Dedicated color-coded utensils, validated allergen line flushes, scheduling allergens at end-of-shift, and dual-sign-off label verification.'
  }
];

// ── Industry Applicability Data ────────────────────────────────────
const sectors = [
  {
    title: 'Food Manufacturing & Processing',
    icon: 'mdi-factory',
    color: 'primary',
    description: 'Canneries, bakeries, confectionery, ready-to-eat meals, meat processing, dairy processing, and frozen food production.',
    primaryCcp: 'Core cooking temperature & inline metal detection'
  },
  {
    title: 'Restaurants & Commercial Kitchens',
    icon: 'mdi-silverware-fork-knife',
    color: 'teal',
    description: 'Central preparation commissaries, quick-service chains, cloud kitchens, and fine dining operations handling multi-step recipes.',
    primaryCcp: 'Hot holding (>63°C), rapid chilling, and surface sanitizing'
  },
  {
    title: 'Hotels, Catering & Institutions',
    icon: 'mdi-bed-outline',
    color: 'indigo',
    description: 'Banquet catering, airline catering, hospital patient dining, universities, and schools serving high-risk vulnerable populations.',
    primaryCcp: 'Time-temperature control during transport and service'
  },
  {
    title: 'Food Packaging Converters',
    icon: 'mdi-package-variant-closed',
    color: 'amber-darken-3',
    description: 'Manufacturers of direct food-contact cartons, films, aluminum foils, closures, beverage bottles, and printed laminate pouches.',
    primaryCcp: 'Chemical migration limits & foreign body control'
  },
  {
    title: 'Meat, Poultry & Seafood',
    icon: 'mdi-fish',
    color: 'red-darken-1',
    description: 'Slaughterhouses, deboning lines, fish filleting, shellfish depuration, and cured charcuterie operations.',
    primaryCcp: 'Post-slaughter carcass chilling & antimicrobial washes'
  },
  {
    title: 'Cold Storage & Logistics',
    icon: 'mdi-truck-snowflake',
    color: 'blue-darken-2',
    description: 'Multi-temperature 3PL cold stores, refrigerated freight fleets, cross-docking hubs, and perishable goods import terminals.',
    primaryCcp: 'Continuous cold-chain temperature monitoring (-18°C / <4°C)'
  },
  {
    title: 'Beverage & Bottling Plants',
    icon: 'mdi-bottle-wine-outline',
    color: 'deep-purple-darken-1',
    description: 'Packaged drinking water, carbonated soft drinks, dairy beverages, juices, breweries, and wine bottling facilities.',
    primaryCcp: 'Pasteurization / UHT timing and bottle rinsers'
  },
  {
    title: 'Food Importers & Exporters',
    icon: 'mdi-earth',
    color: 'success',
    description: 'Global trading companies and bulk ingredient brokers needing verified certificate compliance for customs clearance.',
    primaryCcp: 'Supplier CoA verification & intake temperature audits'
  }
];

// ── The 12 Steps of HACCP Implementation ───────────────────────────
const twelveSteps = [
  {
    title: 'Assemble HACCP Team',
    colorClass: 'bg-primary',
    description: 'Form a cross-functional team with quality, production, maintenance, microbiology, and hygiene expertise.',
    deliverable: 'HACCP Team Charter & credentials'
  },
  {
    title: 'Describe the Product',
    colorClass: 'bg-teal',
    description: 'Document raw materials, physical/chemical properties (pH, aw), packaging, and storage/distribution conditions.',
    deliverable: 'Complete product technical specification'
  },
  {
    title: 'Identify Intended Use',
    colorClass: 'bg-indigo',
    description: 'Define target consumer groups, consumption instructions (ready-to-eat vs cook-before-eating), and vulnerable groups.',
    deliverable: 'Intended use & consumer vulnerability document'
  },
  {
    title: 'Construct Flow Diagram',
    colorClass: 'bg-blue-grey',
    description: 'Map every sequential step from raw ingredient intake, storage, processing, packaging, to dispatch.',
    deliverable: 'Draft Process Flow Diagram (PFD)'
  },
  {
    title: 'On-Site Verification of PFD',
    colorClass: 'bg-amber-darken-3',
    description: 'The HACCP team walks the active production line across all shifts to verify the diagram reflects physical reality.',
    deliverable: 'Signed on-site verified flow diagram'
  },
  {
    title: 'Conduct Hazard Analysis (P1)',
    colorClass: 'bg-red-darken-1',
    description: 'Identify biological, chemical, physical, and allergen hazards at every step, rating severity and likelihood.',
    deliverable: 'Master hazard analysis worksheets'
  },
  {
    title: 'Determine CCPs (P2)',
    colorClass: 'bg-purple',
    description: 'Apply the Codex CCP Decision Tree to identify which steps are Critical Control Points vs managed by PRPs.',
    deliverable: 'Documented CCP Decision Tree log'
  },
  {
    title: 'Establish Critical Limits (P3)',
    colorClass: 'bg-success',
    description: 'Set scientific, measurable parameters (e.g. 75°C core for 2 mins, 1.5mm stainless steel detector piece) for each CCP.',
    deliverable: 'Validated critical limit documentation'
  },
  {
    title: 'Establish Monitoring (P4)',
    colorClass: 'bg-primary',
    description: 'Define who measures each CCP, what instrument is used, how frequently measurements occur, and where it is logged.',
    deliverable: 'CCP monitoring SOPs & record sheets'
  },
  {
    title: 'Define Corrective Actions (P5)',
    colorClass: 'bg-teal',
    description: 'Specify immediate containment, product quarantine, batch tracing, and root cause actions if a limit is breached.',
    deliverable: 'Deviation & corrective action protocols'
  },
  {
    title: 'Establish Verification (P6)',
    colorClass: 'bg-indigo',
    description: 'Establish independent testing, calibration routines, internal HACCP audits, and annual plan reviews.',
    deliverable: 'Verification schedule & calibration matrix'
  },
  {
    title: 'Maintain Records (P7)',
    colorClass: 'bg-blue-grey',
    description: 'Assemble all worksheets, monitoring logs, calibration certificates, training records, and audit reports.',
    deliverable: 'Master HACCP Plan Manual & archive'
  }
];

// ── Benefits Data ──────────────────────────────────────────────────
const benefits = [
  {
    title: 'Proactive Food Safety Defense',
    icon: 'mdi-shield-check-outline',
    color: 'primary',
    description: 'Prevents foodborne pathogen outbreaks, chemical contaminations, and physical injuries before food leaves your facility.'
  },
  {
    title: 'Dramatic Recall Risk Reduction',
    icon: 'mdi-trending-down',
    color: 'success',
    description: 'Real-time CCP monitoring and rapid corrective action contain deviations at the line, preventing catastrophic nationwide product recalls.'
  },
  {
    title: 'Tier-1 Retailer Acceptance',
    icon: 'mdi-storefront-outline',
    color: 'teal',
    description: 'Supermarkets, global food chains, and airline caterers mandate certified HACCP compliance as an absolute vendor pre-qualification.'
  },
  {
    title: 'Statutory Due Diligence Evidence',
    icon: 'mdi-gavel',
    color: 'amber-darken-3',
    description: 'In the event of an inspection or customer complaint, validated HACCP records provide legally binding proof of due diligence.'
  },
  {
    title: 'Operational Waste & Scrap Control',
    icon: 'mdi-cash-multiple',
    color: 'indigo',
    description: 'Tight operational tolerances reduce process variability, batch spoilage, and unnecessary product disposal.'
  },
  {
    title: 'Foundation for ISO 22000 & GFSI',
    icon: 'mdi-stairs-up',
    color: 'purple',
    description: 'A verified HACCP plan serves as the core technical engine required to upgrade effortlessly to ISO 22000, FSSC 22000, or BRCGS.'
  }
];

// ── Documentation Checklist Tabs ──────────────────────────────────
const activeDocTab = ref('plan');

const docChecklists = {
  plan: [
    { name: 'HACCP Team Charter & Training Certificates', desc: 'Documented team roster, designated team leader, and formal HACCP training credentials.' },
    { name: 'Product Descriptions & Intended Use Specs', desc: 'Technical specifications for every product line, raw material characteristics, and vulnerable group designations.' },
    { name: 'Verified Process Flow Diagrams (PFDs)', desc: 'Signed, date-stamped flowcharts verified on-site during operational manufacturing shifts.' },
    { name: 'Hazard Analysis Worksheets (Principle 1)', desc: 'Documented risk assessment of all biological, chemical, physical, and allergen hazards with control measures.' }
  ],
  ccp: [
    { name: 'CCP Determination Matrix & Decision Tree Logs', desc: 'Codex Decision Tree justification records documenting why each step was classified as a CCP or PRP.' },
    { name: 'Thermal Processing & Cooking Temperature Sheets', desc: 'Continuous data logger graphs and manual probe thermometer sheets with operator signatures.' },
    { name: 'Metal Detector & X-Ray Challenge Logs', desc: 'Hourly test piece verification records (ferrous, non-ferrous, stainless steel) and reject-arm audits.' },
    { name: 'Deviation & Corrective Action (CAPA) Logs', desc: 'Quarantine records, root cause investigations, product disposition forms, and corrective actions.' }
  ],
  prps: [
    { name: 'Sanitation Standard Operating Procedures (SSOPs)', desc: 'Pre-operational hygiene inspection checklists, chemical concentration logs, and ATP surface swab charts.' },
    { name: 'Pest Control Service Reports & Station Maps', desc: 'Licensed pest operator visit records, bait station maps, trend analysis, and action follow-ups.' },
    { name: 'Water Potability & Ice Testing Certificates', desc: 'Microbiological and chemical potability testing records from certified public health laboratories.' },
    { name: 'Personnel Health & Hygiene Induction Records', desc: 'Medical screening declarations, illness return-to-work logs, and mandatory handwashing training records.' }
  ],
  verification: [
    { name: 'Thermometer & Gauge Calibration Logs', desc: 'Annual calibration certificates traceable to national standards (NIST/ISO 17025) and daily ice-point checks.' },
    { name: 'Finished Product Microbiological Test Reports', desc: 'Third-party accredited laboratory test reports for Salmonella, Listeria, E. coli, and total plate counts.' },
    { name: 'Annual HACCP Verification & Review Minutes', desc: 'Executive review confirming the ongoing adequacy and accuracy of the HACCP plan.' },
    { name: 'Internal HACCP Audit Reports', desc: 'Independent audit reports evaluating adherence to monitoring procedures across all production shifts.' }
  ]
};

// ── HACCP vs ISO 22000 Comparison Data ────────────────────────────
const haccpVsIso22000 = [
  {
    feature: 'Primary Character',
    haccp: 'A technical, scientific hazard control methodology',
    iso22000: 'A full organizational Food Safety Management System (FSMS) standard'
  },
  {
    feature: 'Core Architecture',
    haccp: 'Codex Alimentarius 12 steps and 7 principles',
    iso22000: 'Annex SL 10-clause Harmonized Structure (PDCA cycle)'
  },
  {
    feature: 'Prerequisite Management',
    haccp: 'Assumes PRPs (Good Hygienic Practices) exist as an external foundation',
    iso22000: 'Formally integrates PRPs and introduces Operational PRPs (OPRPs)'
  },
  {
    feature: 'Management Oversight',
    haccp: 'Focused directly on production line operations and technical limits',
    iso22000: 'Mandates top executive leadership, context analysis, and continual improvement'
  },
  {
    feature: 'Communication Protocols',
    haccp: 'Internal monitoring communication within the HACCP team',
    iso22000: 'Structured external (suppliers, customers, regulators) and internal communication'
  },
  {
    feature: 'Integration with Quality/Environment',
    haccp: 'Standalone technical document; difficult to align with ISO 9001/14001',
    iso22000: 'Seamlessly integrates with ISO 9001 and ISO 14001 as an Integrated Management System'
  }
];

// ── FAQ List ──────────────────────────────────────────────────────
const faqList = [
  {
    question: 'Is HACCP legally required for every food business?',
    answer: 'Legal requirements depend on your geographic jurisdiction and operational activity. In the European Union (EC Reg 852/2004), the United States (FDA Juice & Seafood HACCP, USDA Meat & Poultry), the UK, and India (FSSAI), food business operators are legally required to put in place and maintain procedures based on HACCP principles. While small catering or retail outlets may satisfy the law using standardized Good Hygienic Practices (GHP), food processors, industrial caterers, and exporters almost universally require formal third-party certified HACCP systems to satisfy regulatory and retail customer mandates.'
  },
  {
    question: 'What is the difference between a CCP and an OPRP or PRP?',
    answer: 'Prerequisite Programmes (PRPs) provide basic environmental and hygienic conditions across the whole plant (e.g. general cleaning, pest management). A Critical Control Point (CCP) is a specific step where control can be applied and is essential to prevent, eliminate, or reduce a hazard to an acceptable limit, with validated numerical critical limits. In ISO 22000, an Operational PRP (OPRP) is an intermediate control measure essential to prevent or reduce the likelihood of significant food safety hazards, but without the strict numerical limits of a CCP.'
  },
  {
    question: 'How often must a HACCP plan be reviewed and re-validated?',
    answer: 'A HACCP plan must undergo formal verification at least once per year. In addition, an immediate review and re-validation is mandatory whenever significant changes occur: formulating a new recipe, introducing new raw materials or suppliers, installing new processing machinery, modifying packaging, encountering repeated CCP deviations, or when new pathogen hazards are identified in food science.'
  },
  {
    question: 'What qualifications does a HACCP team leader need?',
    answer: 'A HACCP team leader should possess formal training in the Codex 7 HACCP principles (such as an accredited Level 3 or Level 4 HACCP training certificate), practical understanding of food microbiology, familiarity with food safety legislation, and comprehensive operational knowledge of the plant’s equipment and process flows.'
  },
  {
    question: 'How long does it take to develop and implement a HACCP plan?',
    answer: 'For a typical food manufacturing or catering operation, complete development and implementation takes between 2 and 4 months. This timeline allows the team to map process flow diagrams, conduct on-site verification, carry out hazard assessments, calibrate measuring instruments, train line operators, and accumulate at least 1-2 months of operational monitoring records before external certification.'
  },
  {
    question: 'What happens if a critical limit is breached during production?',
    answer: 'When a critical limit is breached, the designated operator must immediately halt the process, segregate and quarantine all affected product manufactured since the last acceptable monitoring check, apply the pre-defined corrective action protocol, notify the HACCP team leader, and record the deviation in the corrective action log.'
  },
  {
    question: 'How long is a third-party HACCP certificate valid?',
    answer: 'A third-party accredited HACCP certificate is typically valid for 1 year or 3 years (depending on the issuing certification body and national scheme), subject to mandatory annual surveillance audits to verify continued compliance.'
  },
  {
    question: 'Can a small restaurant or catering business implement HACCP?',
    answer: 'Yes. The Codex principles are scalable. Smaller food service operations frequently implement simplified, flexible HACCP systems (often referred to as Safer Food, Better Business or standardized temperature/hygiene diaries) focusing on key cooking, hot-holding, and chilling CCPs.'
  },
  {
    question: 'Does having HACCP mean our business is ISO 22000 certified?',
    answer: 'No. HACCP is a vital component of ISO 22000, but ISO 22000 requires substantial additional management infrastructure—including Annex SL management clauses, executive leadership commitments, PRPs, OPRPs, structured external communication, and continuous improvement mechanisms.'
  },
  {
    question: 'What is the role of Brix Certifications?',
    answer: 'To preserve strict objectivity and adhere to ISO/IEC 17021 and 17065 accreditation rules, consulting and training organizations cannot act as the certifying body for the same client. Brix Certifications delivers expert technical advisory, on-site gap assessments, flow verification, HACCP plan drafting, and auditor coaching, guiding you to choose an accredited third-party certification body.'
  },
  {
    question: 'How much does third-party HACCP certification cost?',
    answer: 'Direct third-party accredited certification body audit fees generally range from $2,000 to $5,000 depending on facility size, number of process lines, and audit duration. Additional internal costs may involve equipment calibration (temperature loggers, metal test pieces), laboratory microbiological testing, and staff training.'
  }
];

// ── Consultation Form State & Actions ─────────────────────────────
const form = ref({
  fullName: '',
  company: '',
  email: '',
  phone: '',
  industry: 'Food Manufacturing & Processing',
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
    await new Promise(resolve => setTimeout(resolve, 800));
    submissionMessage.value = 'Thank you! Your HACCP consultation request has been received. Our senior food safety advisor will contact you within 24 hours.';
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
.haccp-page {
  font-family: 'Figtree', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
}

/* ── Hero Styling ─────────────────────────────────────────────────── */
.haccp-hero {
  position: relative;
  background: linear-gradient(135deg, #062828 0%, #0d4a46 50%, #0f172a 100%);
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
  background: radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.2) 0%, transparent 60%);
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
  color: #99f6e4;
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
  color: #5eead4;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(20, 184, 166, 0.2);
  border: 1px solid rgba(45, 212, 191, 0.4);
  font-size: 0.82rem;
  font-weight: 600;
  color: #ccfbf1;
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
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
}

.glass-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.8);
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

/* ── HACCP Principle Cards ────────────────────────────────────────── */
.haccp-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  background: #ffffff;
}

.haccp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1) !important;
}

/* ── Hazard Cards ─────────────────────────────────────────────────── */
.hazard-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hazard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -6px rgba(0, 0, 0, 0.08) !important;
}

/* ── Sector Cards ─────────────────────────────────────────────────── */
.sector-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sector-card:hover {
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
