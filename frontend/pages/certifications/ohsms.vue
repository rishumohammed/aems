<template>
  <div class="ohsms-page">
    <!-- ── 1. Hero Section ─────────────────────────────────────────── -->
    <section class="ohsms-hero">
      <div class="hero-bg-overlay"></div>
      <v-container class="hero-container position-relative">
        <!-- Breadcrumbs -->
        <nav aria-label="Breadcrumb" class="mb-4">
          <ol class="breadcrumb-nav">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li><NuxtLink to="/certifications/iso-certification">ISO Standards</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li class="active" aria-current="page">ISO 45001 OHSMS</li>
          </ol>
        </nav>

        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="7" class="hero-content">
            <div class="hero-badge mb-3">
              <v-icon size="16" color="warning" class="mr-1">mdi-hard-hat</v-icon>
              <span>Occupational Health & Safety Management · ISO 45001:2018</span>
            </div>

            <h1 class="hero-title text-h3 text-md-h2 font-weight-bold mb-4">
              ISO 45001 Certification – Building Safer and Healthier Workplaces
            </h1>

            <p class="hero-subtitle text-body-1 text-md-subtitle-1 mb-6">
              Protect your most valuable asset—your workforce. An Occupational Health and Safety Management System (OHSMS) certified to ISO 45001:2018 empowers organisations to systematically identify workplace hazards, eliminate risks, engage workers, and achieve measurable improvements in safety performance.
            </p>

            <div class="hero-actions d-flex flex-wrap ga-3 mb-8">
              <v-btn
                color="primary"
                size="x-large"
                elevation="2"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToEnquiry"
              >
                <v-icon class="mr-2">mdi-shield-check</v-icon>
                Get ISO 45001 Certified
              </v-btn>

              <v-btn
                variant="outlined"
                color="white"
                size="x-large"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToSection('requirements')"
              >
                <v-icon class="mr-2">mdi-format-list-checks</v-icon>
                Explore Safety Requirements
              </v-btn>
            </div>

            <!-- Trust Pills Grid -->
            <div class="trust-pills d-flex flex-wrap ga-3">
              <div class="trust-pill">
                <v-icon size="18" color="success">mdi-check-decagram</v-icon>
                <span>Global ISO Standard</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="amber-lighten-1">mdi-account-hard-hat</v-icon>
                <span>Worker Consultation (5.4)</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="info">mdi-layers-triple-outline</v-icon>
                <span>Annex SL Harmonized</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="purple-lighten-2">mdi-chart-line</v-icon>
                <span>Proactive HIRA Control</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="5" class="hero-media">
            <div class="hero-card elevation-6 rounded-xl overflow-hidden position-relative">
              <v-img
                src="/img/certifications/iso-45001-workplace-safety.jpg"
                alt="Occupational Health and Safety compliance officer conducting site hazard inspection"
                cover
                class="hero-img"
                height="440"
              >
                <div class="hero-card-overlay">
                  <div class="glass-tag top-tag">
                    <v-icon color="warning" size="18" class="mr-1">mdi-shield-alert-outline</v-icon>
                    <span>ISO 45001:2018 Certified Framework</span>
                  </div>
                  <div class="glass-tag bottom-tag">
                    <v-icon color="success" size="18" class="mr-1">mdi-account-group-outline</v-icon>
                    <span>Hierarchy of Controls & Worker Consultation</span>
                  </div>
                </div>
              </v-img>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 2. What is an OHSMS? ─────────────────────────────────────── -->
    <section id="what-is-ohsms" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">FOUNDATIONAL CONCEPT</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              What is an Occupational Health & Safety Management System (OHSMS)?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              An <strong>Occupational Health and Safety Management System (OHSMS)</strong> is a formalized, proactive organizational framework designed to manage health and safety risks in the workplace. It integrates organizational structures, planning activities, worker consultations, responsibilities, operational practices, procedures, and resources into a unified management discipline.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Rather than treating workplace safety as an isolated checklist or a reactive response to accidents, an effective OHSMS embeds safety considerations directly into daily operations, capital expenditures, procurement, and strategic decision-making.
            </p>
            <v-card class="bg-amber-lighten-5 border-amber-lighten-3 pa-4 rounded-lg mb-4" variant="outlined">
              <div class="d-flex align-start ga-3">
                <v-icon color="amber-darken-3" size="24" class="mt-1">mdi-alert-circle-outline</v-icon>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Standard Scope & Realistic Expectations</h3>
                  <p class="text-body-2 text-slate-700 mb-0">
                    An OHSMS provides a robust framework for managing occupational risks and demonstrating statutory due diligence. However, standard certification does not guarantee an absolute zero-accident workplace or automatic immunity from regulatory sanctions; it establishes a rigorous system of continuous risk reduction, hazard control, and proactive leadership.
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-slate-50">
              <h3 class="text-h6 font-weight-bold mb-4 text-slate-900 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-bullseye-arrow</v-icon>
                Core Pillars of an Effective OHSMS
              </h3>
              <v-list density="compact" class="bg-transparent">
                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-eye-check-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Hazard Identification & Risk Assessment (HIRA)</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Proactive identification of physical, chemical, biological, ergonomic, and psychosocial workplace hazards before harm occurs.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="success" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-account-multiple-check-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Worker Consultation & Participation</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Direct engagement of non-managerial staff in safety committees, risk evaluations, and procedure designs.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="warning" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-filter-variant</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">The Hierarchy of Controls</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Prioritizing hazard elimination and engineering redesign over administrative rules or personal protective equipment (PPE).
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="info" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-scale-balance</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Legal Compliance & Regulatory Due Diligence</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Ongoing tracking and systematic compliance evaluation with local and national occupational health and safety legislation.
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 3. What is ISO 45001:2018? ───────────────────────────────── -->
    <section id="what-is-iso-45001" class="py-16 bg-slate-50">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">INTERNATIONAL BENCHMARK</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              Understanding ISO 45001:2018
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              <strong>ISO 45001:2018</strong> is the world’s first and only truly international standard for occupational health and safety management systems. Developed by ISO technical committee <em>ISO/TC 283</em> and published in March 2018, it replaced the British standard OHSAS 18001 to provide a unified, global benchmark.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              According to the International Labour Organization (ILO), over 2.78 million workers lose their lives each year due to occupational accidents and work-related diseases, alongside 374 million non-fatal injuries. ISO 45001 was engineered precisely to reverse this toll by offering an internationally agreed framework for creating safer operating conditions.
            </p>

            <div class="hls-features ga-3 d-flex flex-column">
              <div class="hls-item d-flex align-start pa-3 rounded-lg border bg-white">
                <v-icon color="primary" class="mr-3 mt-1">mdi-view-quilt-outline</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Annex SL Harmonized Structure</h4>
                  <p class="text-caption text-slate-600 mb-0">Shares the identical 10-clause high-level architecture with ISO 9001 (Quality) and ISO 14001 (Environment) for effortless Integrated Management System (IMS) implementation.</p>
                </div>
              </div>

              <div class="hls-item d-flex align-start pa-3 rounded-lg border bg-white">
                <v-icon color="teal" class="mr-3 mt-1">mdi-account-tie</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Direct Leadership Accountability</h4>
                  <p class="text-caption text-slate-600 mb-0">Safety cannot be simply delegated to a safety officer; top management must demonstrate direct, accountable leadership and resource ownership.</p>
                </div>
              </div>

              <div class="hls-item d-flex align-start pa-3 rounded-lg border bg-white">
                <v-icon color="amber-darken-3" class="mr-3 mt-1">mdi-brain</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900">Psychosocial Well-Being Recognition</h4>
                  <p class="text-caption text-slate-600 mb-0">Addresses both physical safety and occupational mental health, supported by guidance standard ISO 45003 for managing psychosocial risks.</p>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="rounded-xl border pa-6 shadow-sm bg-white position-relative">
              <v-img
                src="/img/certifications/iso-45001-worker-toolbox-consultation.jpg"
                alt="Safety supervisor conducting toolbox talk with team under ISO 45001 Clause 5.4"
                cover
                class="rounded-lg mb-6"
                height="320"
              />
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">Clause 5.4: Worker Consultation in Action</h3>
              <p class="text-body-2 text-slate-600 mb-3">
                A defining feature of ISO 45001 is <strong>Clause 5.4 (Consultation and participation of workers)</strong>. Organizations must provide the mechanisms, time, training, and resources for non-managerial staff to actively participate in hazard identification, risk assessments, and incident reviews without fear of reprisal.
              </p>
              <div class="d-flex align-center justify-space-between bg-slate-100 pa-3 rounded-lg">
                <span class="text-caption font-weight-bold text-slate-800">ISO Standard Governance:</span>
                <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">ISO/TC 283 Technical Committee</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 4. Who Needs ISO 45001? (Industry Sectors) ───────────────── -->
    <section id="who-needs" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">APPLICABILITY ACROSS INDUSTRIES</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Who Needs ISO 45001 Certification?
          </h2>
          <p class="text-body-1 text-slate-600">
            ISO 45001 applies to any organization, regardless of size, revenue, or hazard profile. While heavy industrial environments face immediate physical dangers, service and corporate sectors gain immense value by managing ergonomics, mental health, and contractor activities.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(sector, idx) in sectors"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="sector-card h-100 rounded-xl pa-6 border elevation-1 bg-white d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="sector.color" variant="tonal" size="48">
                  <v-icon size="26">{{ sector.icon }}</v-icon>
                </v-avatar>
                <v-chip size="x-small" :color="sector.riskColor" variant="flat" class="font-weight-bold">
                  {{ sector.riskLevel }}
                </v-chip>
              </div>

              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
                {{ sector.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4 flex-grow-1">
                {{ sector.description }}
              </p>

              <div class="sector-hazards pa-3 rounded-lg bg-slate-50 border">
                <span class="text-caption font-weight-bold text-slate-800 d-block mb-1">Key Occupational Risks:</span>
                <span class="text-caption text-slate-600">{{ sector.hazards }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 5. ISO 45001 Requirements (Clauses 4 to 10) ─────────────── -->
    <section id="requirements" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">ANNEX SL ARCHITECTURE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 45001:2018 Technical Requirements
          </h2>
          <p class="text-body-1 text-slate-600">
            Structured across the Plan-Do-Check-Act (PDCA) management cycle, ISO 45001 specifies seven operational requirement clauses (Clauses 4 through 10) that form an integrated safety system.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(clause, idx) in clauses"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="clause-card h-100 rounded-xl pa-5 border elevation-1 bg-white">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="clause-badge text-caption font-weight-black text-primary px-2 py-1 rounded bg-blue-lighten-5">
                  Clause {{ clause.number }}
                </span>
                <v-chip size="x-small" :color="clause.pdcaColor" variant="tonal" class="font-weight-bold">
                  {{ clause.pdcaPhase }}
                </v-chip>
              </div>

              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                {{ clause.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4">
                {{ clause.description }}
              </p>

              <div class="clause-points pt-3 border-t">
                <div
                  v-for="(item, iIdx) in clause.items"
                  :key="iIdx"
                  class="d-flex align-start ga-2 mb-1"
                >
                  <v-icon size="14" color="primary" class="mt-1">mdi-check</v-icon>
                  <span class="text-caption text-slate-700">{{ item }}</span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Hierarchy of Controls Callout Card -->
        <v-card class="mt-8 rounded-xl border pa-6 bg-white elevation-2">
          <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between mb-4 ga-3">
            <div>
              <span class="text-overline text-primary font-weight-bold tracking-wider">CLAUSE 8.1.2 OPERATIONAL DISCIPLINE</span>
              <h3 class="text-h6 font-weight-bold text-slate-900">The ISO 45001 Hierarchy of Controls</h3>
            </div>
            <v-chip color="primary" variant="flat" class="font-weight-bold">Mandatory Prioritization</v-chip>
          </div>
          <p class="text-body-2 text-slate-700 mb-6">
            When establishing operational controls, ISO 45001 strictly obliges organizations to reduce risks according to the established safety hierarchy—moving from the most effective control measure down to the least effective:
          </p>

          <v-row dense>
            <v-col cols="12" sm="6" md="2" class="text-center">
              <div class="hoc-pill pa-3 rounded-lg bg-red-lighten-5 border-red-lighten-3 border">
                <div class="text-caption font-weight-black text-red-darken-3">1. ELIMINATION</div>
                <div class="text-caption text-slate-600">Physically remove the hazard entirely</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="2" class="text-center">
              <div class="hoc-pill pa-3 rounded-lg bg-orange-lighten-5 border-orange-lighten-3 border">
                <div class="text-caption font-weight-black text-orange-darken-3">2. SUBSTITUTION</div>
                <div class="text-caption text-slate-600">Replace hazard with a safer alternative</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3" class="text-center">
              <div class="hoc-pill pa-3 rounded-lg bg-amber-lighten-5 border-amber-lighten-3 border">
                <div class="text-caption font-weight-black text-amber-darken-4">3. ENGINEERING CONTROLS</div>
                <div class="text-caption text-slate-600">Isolate workers from hazard via guards/ventilation</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3" class="text-center">
              <div class="hoc-pill pa-3 rounded-lg bg-blue-lighten-5 border-blue-lighten-3 border">
                <div class="text-caption font-weight-black text-blue-darken-3">4. ADMINISTRATIVE CONTROLS</div>
                <div class="text-caption text-slate-600">Change work procedures, training, signage & shifts</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="2" class="text-center">
              <div class="hoc-pill pa-3 rounded-lg bg-slate-100 border">
                <div class="text-caption font-weight-black text-slate-800">5. PPE</div>
                <div class="text-caption text-slate-600">Protect worker with gear (Last line of defense)</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <!-- ── 6. Benefits of ISO 45001 ─────────────────────────────────── -->
    <section id="benefits" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STRATEGIC & HUMAN VALUE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Tangible Benefits of ISO 45001 Certification
          </h2>
          <p class="text-body-1 text-slate-600">
            Investing in occupational health and safety transforms workplace culture, protects organizational liability, and unlocks competitive advantages in global commerce.
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

    <!-- ── 7. ISO 45001 Implementation Process ──────────────────────── -->
    <section id="process" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">IMPLEMENTATION ROADMAP</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The 8-Stage ISO 45001 Implementation Journey
          </h2>
          <p class="text-body-1 text-slate-600">
            A methodical, structured roadmap ensuring complete compliance with ISO 45001:2018 requirements prior to your accredited Stage 1 and Stage 2 certification audits.
          </p>
        </div>

        <div class="process-timeline">
          <v-row>
            <v-col
              v-for="(step, idx) in implementationSteps"
              :key="idx"
              cols="12"
              md="6"
              lg="3"
            >
              <v-card class="process-step-card h-100 rounded-xl pa-5 border elevation-1 bg-white position-relative">
                <div class="step-badge text-caption font-weight-black text-white px-3 py-1 rounded-pill mb-3 d-inline-block" :class="step.colorClass">
                  Stage 0{{ idx + 1 }}
                </div>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                  {{ step.title }}
                </h3>
                <p class="text-body-2 text-slate-600 mb-3">
                  {{ step.description }}
                </p>
                <div class="step-deliverable bg-slate-50 pa-2 rounded border text-caption text-slate-700">
                  <strong>Key Milestone:</strong> {{ step.deliverable }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- ── 8. Required Documentation & Records Checklist ────────────── -->
    <section id="documentation" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">AUDIT READINESS EVIDENCE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Required Documentation and Records
          </h2>
          <p class="text-body-1 text-slate-600">
            ISO 45001 mandates specific "documented information" that an auditor will inspect. Review the vital policies, registers, operational records, and performance metrics required for compliance.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white pa-6">
          <v-tabs v-model="activeDocTab" color="primary" align-tabs="center" class="mb-6">
            <v-tab value="policies" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-file-certificate-outline</v-icon>
              Policies & Governance
            </v-tab>
            <v-tab value="hira" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-clipboard-list-outline</v-icon>
              HIRA & Legal Registers
            </v-tab>
            <v-tab value="operations" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-account-hard-hat-outline</v-icon>
              Operational & Contractor Logs
            </v-tab>
            <v-tab value="incidents" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-file-find-outline</v-icon>
              Incident & Audit Records
            </v-tab>
          </v-tabs>

          <v-window v-model="activeDocTab">
            <!-- Policies Tab -->
            <v-window-item value="policies">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.policies" :key="idx" cols="12" md="6">
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

            <!-- HIRA Tab -->
            <v-window-item value="hira">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.hira" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="teal" class="mt-1">mdi-table-check</v-icon>
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
                    <v-icon color="amber-darken-3" class="mt-1">mdi-tools</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Incidents Tab -->
            <v-window-item value="incidents">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.incidents" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="indigo" class="mt-1">mdi-magnify-scan</v-icon>
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

    <!-- ── 9. ISO 45001 vs OHSAS 18001 ──────────────────────────────── -->
    <section id="vs-ohsas-18001" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">EVOLUTION OF SAFETY STANDARDS</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 45001 vs OHSAS 18001: The Strategic Evolution
          </h2>
          <p class="text-body-1 text-slate-600">
            OHSAS 18001 was formally withdrawn in March 2021. Understanding the shift from OHSAS 18001 to ISO 45001 reveals why modern safety management emphasizes leadership, worker consultation, and holistic risk/opportunity management.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white overflow-hidden mb-6">
          <v-table hover class="comparison-table">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="py-4 font-weight-bold">Comparison Feature</th>
                <th class="py-4 font-weight-bold text-primary-lighten-2">ISO 45001:2018 (Current International Standard)</th>
                <th class="py-4 font-weight-bold text-slate-400">OHSAS 18001 (Withdrawn March 2021)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in ohsasComparison" :key="idx">
                <td class="font-weight-bold text-slate-900 bg-slate-50 py-3">{{ item.feature }}</td>
                <td class="text-body-2 py-3 text-slate-800">{{ item.iso45001 }}</td>
                <td class="text-body-2 py-3 text-slate-600">{{ item.ohsas18001 }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </section>

    <!-- ── 10. ISO 45001 vs ISO 9001: Integrated Management Systems ─── -->
    <section id="vs-iso-9001" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">MANAGEMENT SYSTEM SYNERGY</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              ISO 45001 vs ISO 9001: Quality & Safety Working Together
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              While <strong>ISO 9001</strong> centers on product quality, consistency, and customer satisfaction, <strong>ISO 45001</strong> is dedicated to worker safety, preventing workplace harm, and promoting physical and mental well-being.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Because both standards share the Annex SL Harmonized Structure, they are not competing silos—they are designed to operate as an <strong>Integrated Management System (IMS)</strong>. Integrating them reduces duplicate paperwork, streamlines internal audits, and ensures operational quality never comes at the expense of human safety.
            </p>

            <div class="d-flex flex-column ga-2">
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="20">mdi-check-circle-outline</v-icon>
                <span class="text-body-2 text-slate-800 font-weight-medium">Unified Management Reviews and Document Control</span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="20">mdi-check-circle-outline</v-icon>
                <span class="text-body-2 text-slate-800 font-weight-medium">Combined Internal and External Surveillance Audits</span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="20">mdi-check-circle-outline</v-icon>
                <span class="text-body-2 text-slate-800 font-weight-medium">Aligned Root Cause Corrective Action (CAPA) Protocols</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="pa-6 rounded-xl border bg-slate-50 shadow-sm">
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-4 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-compare-horizontal</v-icon>
                At a Glance: ISO 45001 vs ISO 9001
              </h3>

              <div class="mb-4 pa-3 rounded-lg bg-white border">
                <span class="text-caption font-weight-bold text-primary d-block mb-1">PRIMARY BENEFICIARY:</span>
                <div class="d-flex justify-space-between text-body-2">
                  <span><strong>ISO 45001:</strong> Workers, contractors, visitors</span>
                  <span><strong>ISO 9001:</strong> Customers, end-users, clients</span>
                </div>
              </div>

              <div class="mb-4 pa-3 rounded-lg bg-white border">
                <span class="text-caption font-weight-bold text-primary d-block mb-1">CORE METHODOLOGY:</span>
                <div class="d-flex justify-space-between text-body-2">
                  <span><strong>ISO 45001:</strong> Hazard ID & Hierarchy of Controls</span>
                  <span><strong>ISO 9001:</strong> Process approach & customer feedback</span>
                </div>
              </div>

              <div class="pa-3 rounded-lg bg-white border">
                <span class="text-caption font-weight-bold text-primary d-block mb-1">REGULATORY CONTEXT:</span>
                <div class="d-flex justify-space-between text-body-2">
                  <span><strong>ISO 45001:</strong> Heavy statutory criminal/civil liability</span>
                  <span><strong>ISO 9001:</strong> Commercial contracts & specs</span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 11. Frequently Asked Questions ───────────────────────────── -->
    <section id="faq" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">EXPERT CLARIFICATIONS</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 45001 Frequently Asked Questions
          </h2>
          <p class="text-body-1 text-slate-600">
            Authoritative answers on ISO 45001:2018 requirements, certification costs, audit stages, worker participation, and legal compliance.
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
              <v-expansion-panel-text class="text-body-2 text-slate-700 py-3 bg-white">
                {{ faq.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-container>
    </section>

    <!-- ── 12. Final CTA & Consultation Section ─────────────────────── -->
    <section id="enquiry" class="py-16 bg-slate-900 text-white position-relative">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6" class="pr-lg-8">
            <div class="hero-badge mb-3 bg-slate-800 text-primary-lighten-2">
              <v-icon size="16" class="mr-1">mdi-phone-incoming</v-icon>
              <span>ISO 45001 OHSMS Advisory & Pre-Audit Assessment</span>
            </div>

            <h2 class="text-h3 font-weight-bold mb-4">
              Build a Resilient, Certified Safety Culture
            </h2>

            <p class="text-body-1 text-slate-300 mb-6">
              Protect your team and fulfill regulatory and tender prerequisites with an ISO 45001:2018 certified management system. Our health and safety specialists deliver practical gap assessments, HIRA coaching, worker participation frameworks, and audit readiness advisory.
            </p>

            <div class="d-flex flex-column ga-3 mb-6">
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Comprehensive Pre-Audit Gap Analysis & Workplace Hazard Walkthroughs</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Hazard Identification & Risk Assessment (HIRA) Methodology Validation</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Clause 5.4 Worker Consultation Framework & Safety Committee Guidance</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Accredited Lead Auditor and Internal Safety Auditor Training</span>
              </div>
            </div>

            <div class="related-links pa-4 rounded-lg bg-slate-800 border-slate-700">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-2">INTEGRATE WITH COMPLEMENTARY STANDARDS:</span>
              <div class="d-flex flex-wrap ga-3">
                <NuxtLink to="/certifications/iso-certification" class="text-caption text-primary-lighten-2 font-weight-bold">ISO Standards Overview</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/iso-22000" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 22000 Food Safety</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/brcgs" class="text-caption text-primary-lighten-2 font-weight-bold">BRCGS Food Safety</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/fssc-22000" class="text-caption text-primary-lighten-2 font-weight-bold">FSSC 22000</NuxtLink>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl pa-6 pa-md-8 bg-white text-slate-900 elevation-8">
              <h3 class="text-h5 font-weight-bold mb-2">Request ISO 45001 Consultation</h3>
              <p class="text-body-2 text-slate-600 mb-6">
                Connect with our certified health and safety advisors. We will review your facility profile, high-hazard zones, and audit timeline within 24 business hours.
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
                      label="Industry Sector *"
                      :items="[
                        'Manufacturing & Production',
                        'Construction & Infrastructure',
                        'Engineering & Fabrication',
                        'Logistics, Warehousing & Fleet',
                        'Energy, Oil & Gas, Utilities',
                        'Healthcare & Pharmaceuticals',
                        'Corporate, Facility Management & Services'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.timeframe"
                      label="Target Certification Timeline"
                      :items="[
                        'Immediate (< 1 month)',
                        '1 to 3 months',
                        '3 to 6 months',
                        '6 to 12 months',
                        'General advisory & training'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.notes"
                      label="Facility Scope, Number of Employees, or Existing Certifications (e.g. ISO 9001)"
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
                  Submit ISO 45001 Consultation Request
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
const pageTitle = 'ISO 45001 Certification | Occupational Health & Safety Management System';
const pageDescription = 'Comprehensive guide to ISO 45001:2018 Certification. Learn OHSMS requirements, hazard identification (HIRA), worker participation, implementation steps, and certification benefits.';
const pageUrl = 'https://brixcertifications.com/certifications/ohsms';

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogUrl: pageUrl,
  ogType: 'website',
  ogImage: 'https://brixcertifications.com/img/certifications/iso-45001-workplace-safety.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: 'https://brixcertifications.com/img/certifications/iso-45001-workplace-safety.jpg'
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
        name: 'ISO 45001:2018 Occupational Health & Safety Management System Advisory',
        serviceType: 'OHSMS Certification Consulting and Training',
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
          name: 'ISO 45001 OHSMS Consulting Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 45001 Gap Analysis and HIRA Review'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Worker Participation and Safety Committee Framework'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 45001 Internal Auditor & Lead Auditor Coaching'
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
            name: 'ISO Certifications',
            item: 'https://brixcertifications.com/certifications/iso-certification'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'ISO 45001 OHSMS',
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
            name: 'How long does it take to achieve ISO 45001 certification?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For most small-to-medium organizations, implementation takes between 4 and 8 months. This duration ensures sufficient time to perform hazard identification, engage workers, establish operational controls, execute at least one full cycle of internal safety audits, and hold a senior management review prior to the accredited Stage 1 and Stage 2 certification audits.'
            }
          },
          {
            '@type': 'Question',
            name: 'Does ISO 45001 guarantee zero accidents or complete immunity from regulatory penalties?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No standard can guarantee an accident-free workplace or grant immunity from statutory enforcement. ISO 45001 establishes a systematic management framework to identify hazards, reduce risks proactively, and demonstrate due diligence. It serves as strong evidence of compliance efforts during regulatory inspections or insurance reviews.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the difference between OHSAS 18001 and ISO 45001?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'OHSAS 18001 was a British standard focused predominantly on internal site procedures and hazard management. ISO 45001:2018 is a globally recognized ISO standard built on the Annex SL High-Level Structure. It emphasizes top management leadership, organizational context, mandatory worker consultation (Clause 5.4), and managing both risks and opportunities.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the role of worker participation under Clause 5.4?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Clause 5.4 mandates that organizations provide the mechanisms, time, training, and resources for non-managerial workers to consult on safety policies, hazard identification, risk assessments, and incident investigations, ensuring safety decisions reflect shop-floor realities.'
            }
          }
        ]
      })
    }
  ]
});

// ── Industry Sectors Data ──────────────────────────────────────────
const sectors = [
  {
    title: 'Manufacturing & Processing',
    riskLevel: 'High Physical Risk',
    riskColor: 'red-darken-1',
    color: 'primary',
    icon: 'mdi-factory',
    description: 'Heavy machinery, automated robotics, automated conveyers, and process heat create immediate mechanical, electrical, and thermal risks.',
    hazards: 'Machine entanglement, noise, vibration, airborne particulates, chemical exposure, repetitive strain injuries (RSI).'
  },
  {
    title: 'Construction & Civil Engineering',
    riskLevel: 'Critical Risk',
    riskColor: 'red-darken-2',
    color: 'amber-darken-3',
    icon: 'mdi-office-building-cog',
    description: 'Dynamic, multi-employer worksites where transient conditions and heavy earthmoving equipment require daily risk assessment.',
    hazards: 'Working at height, trench collapses, crane and rigging failures, structural instability, slips/trips, dust inhalation.'
  },
  {
    title: 'Logistics, Fleet & Warehousing',
    riskLevel: 'Moderate to High',
    riskColor: 'orange-darken-2',
    color: 'teal',
    icon: 'mdi-forklift',
    description: 'Intense interaction between pedestrians and material handling equipment, high-bay pallet racking, and driver fatigue.',
    hazards: 'Forklift collisions, falling pallet loads, manual handling strains, loading bay falls, commercial driver fatigue.'
  },
  {
    title: 'Healthcare & Medical Facilities',
    riskLevel: 'Bio-Physical Risk',
    riskColor: 'purple-darken-1',
    color: 'purple',
    icon: 'mdi-hospital-box',
    description: 'Hospitals, laboratories, and care facilities manage biological contagion, patient handling, radiation, and shift-work fatigue.',
    hazards: 'Needlestick sharps injuries, bloodborne pathogens, physical workplace violence, patient transfer musculoskeletal injuries.'
  },
  {
    title: 'Energy, Oil & Gas, Utilities',
    riskLevel: 'Process Safety Risk',
    riskColor: 'red-darken-1',
    color: 'blue-grey',
    icon: 'mdi-flash',
    description: 'High-voltage switchgear, pressurized steam, combustible gases, and confined spaces require formal Permit-to-Work (PTW) controls.',
    hazards: 'Arc flash, combustible dust explosions, toxic hydrogen sulfide leaks, confined space asphyxiation, high-pressure releases.'
  },
  {
    title: 'Corporate Offices & Services',
    riskLevel: 'Ergonomic & Psychosocial',
    riskColor: 'info',
    color: 'indigo',
    icon: 'mdi-laptop',
    description: 'Lower physical injury rates, but prominent ergonomic risks, digital eye strain, and significant psychosocial stress.',
    hazards: 'Workstation ergonomics, chronic stress, workplace harassment, hybrid working isolation, emergency egress.'
  }
];

// ── Clauses 4 through 10 Data ──────────────────────────────────────
const clauses = [
  {
    number: '4',
    title: 'Context of the Organization',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Determine external and internal factors affecting safety performance, understand worker and interested party expectations, and define OHSMS scope.',
    items: [
      'Internal and external issues analysis (PESTLE/SWOT)',
      'Needs of workers, regulators, and contractors',
      'Documented boundaries and scope of the safety system'
    ]
  },
  {
    number: '5',
    title: 'Leadership & Worker Participation',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Top management must take ultimate accountability for safety, establish the OHS policy, assign roles, and mandate worker participation.',
    items: [
      'Executive ownership and provision of necessary resources',
      'Signed Health & Safety Policy with harm-prevention commitment',
      'Clause 5.4: Formal worker consultation and safety committees'
    ]
  },
  {
    number: '6',
    title: 'Planning & Risk Assessment',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Systematic hazard identification, risk assessment, identification of legal obligations, and setting measurable safety objectives.',
    items: [
      'Proactive hazard identification across routine and non-routine tasks',
      'Compliance obligations and statutory legal register',
      'SMART occupational health and safety objectives and action plans'
    ]
  },
  {
    number: '7',
    title: 'Support & Competence',
    pdcaPhase: 'DO',
    pdcaColor: 'primary',
    description: 'Providing competent staff, mandatory safety training, open communication channels, and controlled documentation.',
    items: [
      'Training needs analysis and verified safety certifications',
      'Two-way internal and external communication protocols',
      'Version control of procedures, risk assessments, and records'
    ]
  },
  {
    number: '8',
    title: 'Operational Planning & Control',
    pdcaPhase: 'DO',
    pdcaColor: 'primary',
    description: 'Implementing the Hierarchy of Controls, managing operational change, controlling procurement and contractors, and emergency drills.',
    items: [
      'Application of the Hierarchy of Controls to all risks',
      'Management of Change (MOC) process for equipment and processes',
      'Contractor safety vetting, permits to work, and emergency response'
    ]
  },
  {
    number: '9',
    title: 'Performance Evaluation',
    pdcaPhase: 'CHECK',
    pdcaColor: 'warning',
    description: 'Monitoring workplace environments, evaluating legal compliance, carrying out internal audits, and top management reviews.',
    items: [
      'Leading and lagging safety KPIs (near-misses, TRIR, air monitoring)',
      'Periodic evaluations of statutory legal compliance',
      'Comprehensive internal safety audit program and management review'
    ]
  },
  {
    number: '10',
    title: 'Improvement & Investigation',
    pdcaPhase: 'ACT',
    pdcaColor: 'success',
    description: 'Responding to incidents and non-conformances with structured root cause analysis to prevent recurrence and drive continuous improvement.',
    items: [
      'Incident, near-miss, and accident reporting and investigation',
      'Determining root causes rather than assigning individual blame',
      'Continual enhancement of safety culture and management system'
    ]
  }
];

// ── Benefits Data ──────────────────────────────────────────────────
const benefits = [
  {
    title: 'Measurable Incident Reduction',
    icon: 'mdi-trending-down',
    color: 'success',
    description: 'Systematic hazard identification and the Hierarchy of Controls reduce work-related injuries, illnesses, and lost-time incidents.'
  },
  {
    title: 'Genuine Worker Engagement',
    icon: 'mdi-account-group',
    color: 'primary',
    description: 'Clause 5.4 empowers frontline workers to report hazards without fear of retribution, building a collaborative, proactive safety culture.'
  },
  {
    title: 'Legal Due Diligence Evidence',
    icon: 'mdi-gavel',
    color: 'amber-darken-3',
    description: 'Demonstrates to labor inspectors, regulators, and courts that your organization systematically manages health and safety risks.'
  },
  {
    title: 'Lower Operational & Insurance Costs',
    icon: 'mdi-cash-multiple',
    color: 'teal',
    description: 'Fewer compensation claims, lower liability premiums, reduced employee absenteeism, and avoided regulatory penalties.'
  },
  {
    title: 'Prequalification for Major Tenders',
    icon: 'mdi-file-certificate',
    color: 'indigo',
    description: 'ISO 45001 is frequently mandatory to bid on government, infrastructure, and multinational corporate supply contracts.'
  },
  {
    title: 'Annex SL Harmonized Integration',
    icon: 'mdi-layers-triple-outline',
    color: 'purple',
    description: 'Integrates seamlessly with ISO 9001 (Quality) and ISO 14001 (Environment), eliminating redundant audits and siloed documentation.'
  }
];

// ── 8-Stage Implementation Steps ──────────────────────────────────
const implementationSteps = [
  {
    title: 'Leadership Commitment & Charter',
    colorClass: 'bg-primary',
    description: 'Secure senior executive sponsorship, establish project team, and allocate financial and training resources.',
    deliverable: 'Signed executive safety mandate'
  },
  {
    title: 'Comprehensive Gap Assessment',
    colorClass: 'bg-teal',
    description: 'Inspect physical facilities and documentation against ISO 45001 clauses to map operational discrepancies.',
    deliverable: 'Prioritized gap closure matrix'
  },
  {
    title: 'Hazard ID & Risk Assessment (HIRA)',
    colorClass: 'bg-indigo',
    description: 'Execute site-wide risk assessments involving frontline personnel, identifying physical, chemical, and psychosocial hazards.',
    deliverable: 'Master HIRA & Risk Registers'
  },
  {
    title: 'Worker Consultation & Committees',
    colorClass: 'bg-blue-grey',
    description: 'Establish Joint Health & Safety Committees (JHSC) and anonymous hazard reporting channels under Clause 5.4.',
    deliverable: 'Safety Committee charter & logs'
  },
  {
    title: 'Operational Controls & Procedures',
    colorClass: 'bg-amber-darken-3',
    description: 'Deploy Safe Work Method Statements (SWMS), Lockout/Tagout (LOTO), contractor safety agreements, and emergency plans.',
    deliverable: 'Operational control procedures'
  },
  {
    title: 'Internal Audit & Drill Testing',
    colorClass: 'bg-purple',
    description: 'Train internal auditors, conduct a complete internal audit across all shifts, test emergency evacuation drills.',
    deliverable: 'Internal audit reports & drill logs'
  },
  {
    title: 'Management Review Meeting',
    colorClass: 'bg-red-darken-1',
    description: 'Top executive review of safety KPIs, audit non-conformances, legal compliance status, and continuous improvement actions.',
    deliverable: 'Signed management review minutes'
  },
  {
    title: 'Stage 1 & Stage 2 CB Audits',
    colorClass: 'bg-success',
    description: 'Host accredited certification body for Stage 1 documentation review followed by Stage 2 on-site verification and certification.',
    deliverable: 'Official ISO 45001 Certificate'
  }
];

// ── Documentation Checklist ────────────────────────────────────────
const activeDocTab = ref('policies');

const docChecklists = {
  policies: [
    { name: 'Occupational Health & Safety Policy', desc: 'Signed executive policy committing to harm prevention, hazard elimination, legal compliance, and worker consultation.' },
    { name: 'OHSMS Scope Document', desc: 'Clearly defined physical boundaries, facilities, worker groups, and activities covered by the safety system.' },
    { name: 'Roles, Responsibilities & Authorities', desc: 'Organizational chart, job descriptions, and designated safety representatives with authority to halt unsafe work.' },
    { name: 'Worker Consultation & Participation Charter', desc: 'Documented processes for safety committee operation, meeting frequency, and feedback escalation.' }
  ],
  hira: [
    { name: 'Hazard Identification & Risk Assessment (HIRA)', desc: 'Live register evaluating routine and non-routine activities across all shifts, using the Hierarchy of Controls.' },
    { name: 'Legal and Other Compliance Obligations Register', desc: 'Catalog of applicable national safety legislation, codes of practice, and municipal fire regulations.' },
    { name: 'Safety Objectives & Action Programs', desc: 'SMART measurable goals (e.g. 20% reduction in manual handling injuries, 100% contractor vetting) with owners.' },
    { name: 'Psychosocial Risk Assessment (ISO 45003)', desc: 'Evaluation of workplace mental health factors, excessive workloads, shift fatigue, and anti-harassment safeguards.' }
  ],
  operations: [
    { name: 'Safe Work Method Statements (SWMS) & SOPs', desc: 'Written operational procedures for high-hazard work (e.g., confined space entry, working at heights, chemical decanting).' },
    { name: 'Permit-to-Work (PTW) System', desc: 'Authorizations and sign-offs for hot work, electrical isolation, excavation, and roof access.' },
    { name: 'Contractor Safety Induction & Vetting Logs', desc: 'Contractor pre-qualification records, site-specific safety inductions, and daily work activity oversight.' },
    { name: 'Emergency Preparedness & Evacuation Drills', desc: 'Emergency response plans, spill containment kits, fire warden rosters, and annual evacuation drill logs.' }
  ],
  incidents: [
    { name: 'Incident & Near-Miss Investigation Reports', desc: 'Documented investigation records identifying root causes rather than operator blame, with closed-out actions.' },
    { name: 'Internal Audit Program & Audit Reports', desc: 'Objective evidence of annual internal audits covering every clause, operational zone, and compliance obligation.' },
    { name: 'Legal Compliance Evaluation Reports', desc: 'Documented evaluations verifying fulfillment of applicable safety statutes, noise limits, and machinery inspections.' },
    { name: 'Management Review Minutes & Action Items', desc: 'Executive leadership review of safety system performance, resource allocations, and strategic improvements.' }
  ]
};

// ── ISO 45001 vs OHSAS 18001 Comparison Data ──────────────────────
const ohsasComparison = [
  {
    feature: 'Standard Architecture',
    iso45001: 'Annex SL Harmonized Structure (10 clauses, identical to ISO 9001 and ISO 14001)',
    ohsas18001: 'Legacy standalone structure (difficult to integrate with other ISO management systems)'
  },
  {
    feature: 'System Philosophy',
    iso45001: 'Process-based and proactive: Embeds safety into the organization’s overall business operations',
    ohsas18001: 'Procedure-based: Focused heavily on standalone documented procedures and manual compliance'
  },
  {
    feature: 'Executive Leadership',
    iso45001: 'Top management is directly accountable for OHS; safety cannot be outsourced to a safety manager',
    ohsas18001: 'Allowed executive delegation of safety responsibility to an isolated "Management Representative"'
  },
  {
    feature: 'Worker Consultation (5.4)',
    iso45001: 'Mandatory, explicit requirements for worker consultation, participation, and removing participation barriers',
    ohsas18001: 'General worker participation was encouraged, but lacked structured non-managerial consultation rules'
  },
  {
    feature: 'Risk & Opportunity Focus',
    iso45001: 'Addresses both risks (preventing harm) AND opportunities (enhancing health, safety, and operational well-being)',
    ohsas18001: 'Exclusively focused on hazard control and negative risk mitigation'
  },
  {
    feature: 'Context & Interested Parties',
    iso45001: 'Requires systematic evaluation of internal/external context, contractors, supply chains, and external neighbors',
    ohsas18001: 'Focused almost exclusively on internal conditions within the site boundary'
  }
];

// ── FAQ List ──────────────────────────────────────────────────────
const faqList = [
  {
    question: 'How long does it take to achieve ISO 45001 certification?',
    answer: 'For small-to-medium enterprises, implementation typically takes between 4 and 8 months. This timeline allows your organization to conduct site-wide hazard identification, engage frontline workers, deploy operational controls, complete at least one round of internal safety audits, and hold an executive management review before the external accredited certification audit.'
  },
  {
    question: 'Does ISO 45001 guarantee zero accidents or complete immunity from regulatory penalties?',
    answer: 'No standard can guarantee an accident-free workplace or grant automatic legal immunity. ISO 45001 provides an internationally verified framework that helps you systematically identify hazards, reduce risks, and demonstrate statutory due diligence. In the event of a workplace incident or inspection, an ISO 45001 certification provides verifiable evidence of proactive risk management and regulatory commitment.'
  },
  {
    question: 'What is the fundamental difference between OHSAS 18001 and ISO 45001?',
    answer: 'OHSAS 18001 was a British standard that was formally withdrawn in March 2021. ISO 45001 is a globally recognized ISO standard built on the Annex SL high-level structure. Unlike OHSAS 18001, ISO 45001 places direct accountability on top executive leadership, mandates structured worker consultation (Clause 5.4), manages both safety risks and improvement opportunities, and integrates seamlessly with ISO 9001 and ISO 14001.'
  },
  {
    question: 'What is the role of worker participation under Clause 5.4?',
    answer: 'Clause 5.4 requires organizations to establish formal mechanisms, time, training, and resources for non-managerial staff to actively participate in safety decisions. This includes consulting workers on safety policies, hazard identification, risk assessments, control measures, training needs, and incident investigations, ensuring that safety systems are built with frontline insight rather than top-down assumptions.'
  },
  {
    question: 'Can ISO 45001 be integrated with ISO 9001 and ISO 14001?',
    answer: 'Yes. ISO 45001, ISO 9001 (Quality), and ISO 14001 (Environment) all share the Annex SL Harmonized Structure with identical 10-clause architectures. Organizations can establish an Integrated Management System (IMS) with a single unified manual, combined internal audits, shared document control, and integrated management reviews, dramatically reducing administrative overhead.'
  },
  {
    question: 'How does ISO 45001 address contractor and temporary worker safety?',
    answer: 'Clause 8.1.4 explicitly requires organizations to coordinate with contractors to identify and control hazards arising from contractor activities on-site, as well as hazards your operations pose to contractors. Organizations must implement rigorous contractor pre-qualification vetting, site safety inductions, permits-to-work, and continuous monitoring of contractor compliance.'
  },
  {
    question: 'What are psychosocial hazards and does ISO 45001 address mental health?',
    answer: 'Yes. ISO 45001 defines health as encompassing both physical and mental well-being. Psychosocial hazards include excessive workloads, workplace bullying, lack of role clarity, organizational change, and workplace violence. Guidance standard ISO 45003 provides detailed guidelines on managing psychosocial risks within an ISO 45001 framework.'
  },
  {
    question: 'How often are surveillance audits conducted and what is certificate validity?',
    answer: 'An ISO 45001 certificate is valid for three years, subject to successful annual surveillance audits conducted by an accredited certification body (CB) at the end of Year 1 and Year 2. Prior to the end of Year 3, a full recertification audit is conducted to issue a new 3-year certificate.'
  },
  {
    question: 'What is the Hierarchy of Controls and how must it be applied?',
    answer: 'Under Clause 8.1.2, organizations must systematically apply the Hierarchy of Controls in descending order: 1. Elimination (physically remove the hazard), 2. Substitution (replace with a less hazardous process or material), 3. Engineering controls (guards, barriers, ventilation), 4. Administrative controls (procedures, training, signage), and 5. Personal Protective Equipment (PPE as a last resort).'
  },
  {
    question: 'What role does Brix Certifications play vs an accredited certification body?',
    answer: 'To preserve strict objectivity and comply with ISO/IEC 17021 accreditation standards, organizations that provide consulting, gap assessments, and training cannot act as the certifying body for the same client. Brix Certifications delivers independent technical advisory, gap analyses, HIRA coaching, and internal audit support, assisting you in selecting an accredited third-party certification body for your formal audit.'
  }
];

// ── Consultation Form State & Actions ─────────────────────────────
const form = ref({
  fullName: '',
  company: '',
  email: '',
  phone: '',
  industry: 'Manufacturing & Production',
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
    submissionMessage.value = 'Thank you! Your ISO 45001 consultation request has been received. Our senior health and safety specialist will contact you within 24 hours.';
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
.ohsms-page {
  font-family: 'Figtree', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
}

/* ── Hero Styling ─────────────────────────────────────────────────── */
.ohsms-hero {
  position: relative;
  background: linear-gradient(135deg, #0b1120 0%, #1e293b 50%, #0f172a 100%);
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
  background: radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 60%);
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
  color: #cbd5e1;
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
  color: #f59e0b;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 0.82rem;
  font-weight: 600;
  color: #fde68a;
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

/* ── Sector Cards ─────────────────────────────────────────────────── */
.sector-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  background: #ffffff;
}

.sector-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1) !important;
}

/* ── Clause Cards ─────────────────────────────────────────────────── */
.clause-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clause-card:hover {
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

/* ── Hierarchy of Controls Pills ──────────────────────────────────── */
.hoc-pill {
  min-height: 85px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.2s ease;
}

.hoc-pill:hover {
  transform: translateY(-2px);
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
