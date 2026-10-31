<template>
  <div class="qms-page">
    <!-- ── 1. Hero Section ─────────────────────────────────────────── -->
    <section class="qms-hero">
      <div class="hero-bg-overlay"></div>
      <v-container class="hero-container position-relative">
        <!-- Breadcrumbs -->
        <nav aria-label="Breadcrumb" class="mb-4">
          <ol class="breadcrumb-nav">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li><NuxtLink to="/certifications/iso-certification">ISO Standards</NuxtLink></li>
            <li class="separator"><v-icon size="14" color="grey-lighten-1">mdi-chevron-right</v-icon></li>
            <li class="active" aria-current="page">ISO 9001 QMS</li>
          </ol>
        </nav>

        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="7" class="hero-content">
            <div class="hero-badge mb-3">
              <v-icon size="16" color="primary" class="mr-1">mdi-certificate-outline</v-icon>
              <span>Quality Management System · ISO 9001:2015</span>
            </div>

            <h1 class="hero-title text-h3 text-md-h2 font-weight-bold mb-4">
              ISO 9001 Certification – Establish Excellence Through Quality Management
            </h1>

            <p class="hero-subtitle text-body-1 text-md-subtitle-1 mb-6">
              Build an agile, customer-focused organization. ISO 9001:2015 provides the internationally recognized framework for establishing robust quality management systems, streamlining operational workflows, mitigating risk, and consistently delivering products and services that surpass client expectations.
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
                Get ISO 9001 Certified
              </v-btn>

              <v-btn
                variant="outlined"
                color="white"
                size="x-large"
                class="px-6 font-weight-bold text-none rounded-lg"
                @click="scrollToSection('principles')"
              >
                <v-icon class="mr-2">mdi-compass-outline</v-icon>
                Explore 7 Quality Principles
              </v-btn>
            </div>

            <!-- Trust Pills Grid -->
            <div class="trust-pills d-flex flex-wrap ga-3">
              <div class="trust-pill">
                <v-icon size="18" color="success">mdi-earth</v-icon>
                <span>1M+ Certified Sites</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="info">mdi-numeric-7-circle-outline</v-icon>
                <span>7 Quality Principles</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="amber-lighten-1">mdi-sync</v-icon>
                <span>PDCA & Risk-Based Thinking</span>
              </div>
              <div class="trust-pill">
                <v-icon size="18" color="purple-lighten-2">mdi-layers-triple-outline</v-icon>
                <span>Annex SL Harmonized</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="5" class="hero-media">
            <div class="hero-card elevation-6 rounded-xl overflow-hidden position-relative">
              <v-img
                src="/img/certifications/iso-9001-precision-quality-inspection.jpg"
                alt="Quality Assurance Engineer verifying mechanical precision tolerances under ISO 9001"
                cover
                class="hero-img"
                height="440"
              >
                <div class="hero-card-overlay">
                  <div class="glass-tag top-tag">
                    <v-icon color="primary" size="18" class="mr-1">mdi-check-all</v-icon>
                    <span>ISO 9001:2015 Global Benchmark</span>
                  </div>
                  <div class="glass-tag bottom-tag">
                    <v-icon color="success" size="18" class="mr-1">mdi-chart-line-variant</v-icon>
                    <span>Process Consistency & Continuous Improvement</span>
                  </div>
                </div>
              </v-img>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 2. What is a Quality Management System (QMS)? ───────────── -->
    <section id="what-is-qms" class="py-16 bg-surface">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">SYSTEMIC FOUNDATION</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              What is a Quality Management System (QMS)?
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              A <strong>Quality Management System (QMS)</strong> is a structured collection of policies, processes, documented procedures, and resources designed to direct and control how an organization fulfills customer requirements, optimizes operational efficiency, and drives ongoing improvement.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Far beyond a collection of binders on a shelf, a mature QMS embeds quality into organizational culture—aligning leadership vision with day-to-day front-line execution, product realization, supplier control, and performance measurement.
            </p>

            <v-card class="bg-blue-lighten-5 border-blue-lighten-3 pa-4 rounded-lg mb-4" variant="outlined">
              <div class="d-flex align-start ga-3">
                <v-icon color="primary" size="24" class="mt-1">mdi-lightbulb-on-outline</v-icon>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Quality Management vs. End-of-Line Inspection</h3>
                  <p class="text-body-2 text-slate-700 mb-0">
                    <strong>Quality Control (QC)</strong> tests or inspects finished goods at the end of the line to catch defective items. In contrast, a <strong>Quality Management System (QMS)</strong> builds quality into every upstream stage—preventing defects through calibrated tools, trained personnel, validated processes, and proactive risk mitigation.
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-slate-50">
              <h3 class="text-h6 font-weight-bold mb-4 text-slate-900 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-cog-sync</v-icon>
                Primary Objectives of a Modern QMS
              </h3>
              <v-list density="compact" class="bg-transparent">
                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-bullseye-arrow</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Consistent Customer Satisfaction</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Ensuring outputs predictably meet customer specifications, service level agreements (SLAs), and regulatory obligations.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="success" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-delete-sweep-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Waste & Cost Reduction</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Eliminating operational redundancies, unnecessary rework, customer returns, warranty claims, and process bottlenecks.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="amber-darken-3" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-shield-alert-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Risk-Based Problem Prevention</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Anticipating potential failure modes and supply disruptions before they manifest as critical customer issues.
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-avatar color="info" variant="tonal" size="36" class="mr-3">
                      <v-icon size="20">mdi-database-check-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold text-slate-900">Institutionalized Knowledge</v-list-item-title>
                  <v-list-item-subtitle class="text-slate-600">
                    Protecting institutional know-how through documented SOPs, ensuring business continuity during employee turnover.
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 3. What is ISO 9001:2015? ─────────────────────────────────── -->
    <section id="what-is-iso-9001" class="py-16 bg-slate-50">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">INTERNATIONAL GOLD STANDARD</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              Understanding ISO 9001:2015
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              <strong>ISO 9001:2015</strong> is the internationally recognized benchmark for Quality Management Systems, developed by ISO subcommittee <em>ISO/TC 176/SC 2</em>. Adopted by more than one million organizations across 170+ countries, it provides a universal framework that enables organizations of any scale or sector to achieve consistent operational excellence.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              The 2015 edition revolutionized quality management by replacing prescriptive documentation requirements with <strong>Risk-Based Thinking</strong> and the <strong>Process Approach</strong>, incorporating the classic Plan-Do-Check-Act (PDCA) cycle into organizational DNA.
            </p>

            <v-card class="bg-white border rounded-xl pa-4 mb-4">
              <div class="d-flex align-start ga-3">
                <v-icon color="teal" size="24" class="mt-1">mdi-weather-cloudy-clock</v-icon>
                <div>
                  <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">Authoritative Edition & 2024 Climate Change Amendment</h4>
                  <p class="text-caption text-slate-600 mb-0">
                    The active, enforceable standard is <strong>ISO 9001:2015</strong>, supplemented in February 2024 by <em>ISO 9001:2015/Amd 1:2024</em>. This amendment requires organizations to evaluate whether climate change is a relevant issue under Clause 4.1 (Context) and whether interested parties have climate-related requirements under Clause 4.2.
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="rounded-xl border pa-6 shadow-sm bg-white position-relative">
              <v-img
                src="/img/certifications/iso-9001-management-review-meeting.jpg"
                alt="Executive leadership team conducting an ISO 9001 Quality Management Review meeting"
                cover
                class="rounded-lg mb-6"
                height="320"
              />
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">The Process Approach & PDCA Cycle</h3>
              <p class="text-body-2 text-slate-600 mb-3">
                ISO 9001 views organizations not as isolated departments, but as a network of linked processes. Applying the <strong>Plan-Do-Check-Act (PDCA)</strong> model ensures processes are adequately resourced, managed, and monitored for continual improvement.
              </p>
              <div class="d-flex align-center justify-space-between bg-slate-100 pa-3 rounded-lg">
                <span class="text-caption font-weight-bold text-slate-800">ISO Standard Governance:</span>
                <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">ISO/TC 176 Quality Management</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 4. The Seven Quality Management Principles (QMPs) ────────── -->
    <section id="principles" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">PHILOSOPHICAL CORNERSTONE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The Seven Quality Management Principles
          </h2>
          <p class="text-body-1 text-slate-600">
            ISO 9001 is anchored upon seven foundational principles (defined in ISO 9000:2015). Together, they guide organizational decision-making and continuous performance enhancement.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(principle, idx) in qualityPrinciples"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="principle-card h-100 rounded-xl pa-6 border elevation-1 bg-white d-flex flex-column">
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="principle.color" variant="tonal" size="48">
                  <v-icon size="26">{{ principle.icon }}</v-icon>
                </v-avatar>
                <span class="text-caption font-weight-black text-slate-400">0{{ idx + 1 }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
                {{ principle.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-4 flex-grow-1">
                {{ principle.description }}
              </p>

              <div class="principle-impact pa-3 rounded-lg bg-slate-50 border">
                <span class="text-caption font-weight-bold text-slate-800 d-block mb-1">Practical Application:</span>
                <span class="text-caption text-slate-600">{{ principle.application }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 5. ISO 9001 Requirements (Clauses 4 through 10) ──────────── -->
    <section id="requirements" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">ANNEX SL HIGH-LEVEL STRUCTURE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 9001:2015 Main Clause Requirements
          </h2>
          <p class="text-body-1 text-slate-600">
            Following the Annex SL 10-clause structure, Clauses 4 through 10 represent the auditable requirements your organization must satisfy to earn and maintain accredited certification.
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
      </v-container>
    </section>

    <!-- ── 6. Who Needs ISO 9001? (Industry Applicability) ───────────── -->
    <section id="who-needs" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">UNIVERSAL RELEVANCE</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Who Needs ISO 9001 Certification?
          </h2>
          <p class="text-body-1 text-slate-600">
            Because ISO 9001 focuses on process discipline and customer satisfaction rather than product-specific recipes, it applies universally across every modern industry sector.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(industry, idx) in industries"
            :key="idx"
            cols="12"
            md="6"
            lg="3"
          >
            <v-card class="industry-card h-100 rounded-xl pa-5 border elevation-1 bg-white d-flex flex-column">
              <v-avatar :color="industry.color" variant="tonal" size="44" class="mb-3">
                <v-icon size="24">{{ industry.icon }}</v-icon>
              </v-avatar>

              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
                {{ industry.title }}
              </h3>

              <p class="text-body-2 text-slate-600 mb-3 flex-grow-1">
                {{ industry.description }}
              </p>

              <div class="bg-slate-50 pa-2 rounded border text-caption text-slate-700">
                <strong>Primary Driver:</strong> {{ industry.driver }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 7. Benefits of ISO 9001 ──────────────────────────────────── -->
    <section id="benefits" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">COMMERCIAL & OPERATIONAL IMPACT</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            Strategic Benefits of ISO 9001 Certification
          </h2>
          <p class="text-body-1 text-slate-600">
            Achieving ISO 9001 certification delivers profound returns across internal operations, external commercial positioning, customer loyalty, and corporate governance.
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

    <!-- ── 8. ISO 9001 Implementation Process ───────────────────────── -->
    <section id="process" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STRUCTURED ROADMAP</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            The 8-Stage ISO 9001 Implementation Journey
          </h2>
          <p class="text-body-1 text-slate-600">
            From initial leadership alignment to Stage 2 certification audit and beyond, our step-by-step pathway ensures smooth, unbureaucratic implementation.
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

    <!-- ── 9. ISO 9001 Documentation Checklist ──────────────────────── -->
    <section id="documentation" class="py-16 bg-slate-50">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">DOCUMENTED INFORMATION</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 9001 Documentation and Records Checklist
          </h2>
          <p class="text-body-1 text-slate-600">
            ISO 9001:2015 replaced rigid manual mandates with flexible "documented information". Review the required policies, operational criteria, calibration records, and audit evidence.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white pa-6">
          <v-tabs v-model="activeDocTab" color="primary" align-tabs="center" class="mb-6">
            <v-tab value="governance" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-file-certificate-outline</v-icon>
              Governance & Policies
            </v-tab>
            <v-tab value="operations" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-cogs</v-icon>
              Operational SOPs & Criteria
            </v-tab>
            <v-tab value="resources" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-ruler-square</v-icon>
              Calibration & Competency
            </v-tab>
            <v-tab value="evaluation" class="font-weight-bold text-none">
              <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
              Audits, MRM & CAPA
            </v-tab>
          </v-tabs>

          <v-window v-model="activeDocTab">
            <!-- Governance Tab -->
            <v-window-item value="governance">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.governance" :key="idx" cols="12" md="6">
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

            <!-- Operations Tab -->
            <v-window-item value="operations">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.operations" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="teal" class="mt-1">mdi-format-list-checks</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Resources Tab -->
            <v-window-item value="resources">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.resources" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="amber-darken-3" class="mt-1">mdi-certificate</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.name }}</h4>
                      <p class="text-caption text-slate-600 mb-0">{{ item.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Evaluation Tab -->
            <v-window-item value="evaluation">
              <v-row>
                <v-col v-for="(item, idx) in docChecklists.evaluation" :key="idx" cols="12" md="6">
                  <div class="d-flex align-start ga-3 p-3 rounded-lg border bg-slate-50 h-100">
                    <v-icon color="indigo" class="mt-1">mdi-clipboard-text-search-outline</v-icon>
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

    <!-- ── 10. ISO 9001 vs ISO 22000 ────────────────────────────────── -->
    <section id="vs-iso-22000" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">STANDARD COMPARISON</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 9001 vs ISO 22000: Quality vs Food Safety Management
          </h2>
          <p class="text-body-1 text-slate-600">
            While both standards share the Annex SL core structure, their purpose, risk management focus, and verification mechanisms serve fundamentally different objectives.
          </p>
        </div>

        <v-card class="rounded-xl border shadow-sm bg-white overflow-hidden mb-6">
          <v-table hover class="comparison-table">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="py-4 font-weight-bold">Comparison Dimension</th>
                <th class="py-4 font-weight-bold text-primary-lighten-2">ISO 9001:2015 (Quality Management)</th>
                <th class="py-4 font-weight-bold text-teal-lighten-2">ISO 22000:2018 (Food Safety Management)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in comparisonData" :key="idx">
                <td class="font-weight-bold text-slate-900 bg-slate-50 py-3">{{ item.dimension }}</td>
                <td class="text-body-2 py-3 text-slate-800">{{ item.iso9001 }}</td>
                <td class="text-body-2 py-3 text-slate-700">{{ item.iso22000 }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <div class="pa-4 rounded-xl bg-blue-lighten-5 border border-blue-lighten-3 text-body-2 text-slate-700">
          <strong>Key Takeaway:</strong> A food manufacturer certified to ISO 9001 guarantees that its processes are repeatable and customer-focused, but does NOT guarantee safety against microbiological pathogens or food allergens. Conversely, <NuxtLink to="/certifications/iso-22000" class="text-primary font-weight-bold">ISO 22000</NuxtLink> ensures biological, chemical, and physical food safety throughout the consumption chain.
        </div>
      </v-container>
    </section>

    <!-- ── 11. Integrating Multiple Management Systems (IMS) ─────────── -->
    <section id="integrated-systems" class="py-16 bg-slate-50">
      <v-container>
        <v-row align="center">
          <v-col cols="12" lg="6">
            <span class="text-overline text-primary font-weight-bold tracking-wider">ANNEX SL SYNERGY</span>
            <h2 class="text-h4 font-weight-bold mb-4 text-slate-900">
              Integrating ISO 9001 with ISO 14001, ISO 45001 & ISO 22000
            </h2>
            <p class="text-body-1 text-slate-700 mb-4">
              Because all modern ISO standards utilize the <strong>Annex SL High-Level Structure (HLS)</strong>, ISO 9001 serves as the master foundation for an <strong>Integrated Management System (IMS)</strong>.
            </p>
            <p class="text-body-1 text-slate-700 mb-4">
              Instead of running isolated systems with separate manuals, duplicated internal audits, and conflicting policies, organizations can unify:
            </p>

            <v-list density="compact" class="bg-transparent mb-4">
              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="success" class="mr-3">mdi-check-circle-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Unified Quality, Health & Environment Manual</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Harmonizing context, stakeholder analysis, and document version control.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="success" class="mr-3">mdi-check-circle-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Combined Internal Safety & Quality Audits</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Auditing multiple standards simultaneously across operational lines.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template #prepend>
                  <v-icon color="success" class="mr-3">mdi-check-circle-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-900">Single Executive Management Review Meeting (MRM)</v-list-item-title>
                <v-list-item-subtitle class="text-slate-600">Reviewing customer satisfaction, environmental impacts, and safety incidents in one sitting.</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl border pa-6 shadow-sm bg-white">
              <h3 class="text-h6 font-weight-bold text-slate-900 mb-4 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-layers-triple</v-icon>
                The Tripartite Management Matrix
              </h3>

              <div class="ims-box pa-3 rounded-lg bg-blue-lighten-5 border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-primary">ISO 9001 (Quality)</span>
                  <v-chip size="x-small" color="primary">Customer Focus</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">Satisfies clients, controls product specifications, and optimizes operational efficiency.</p>
              </div>

              <div class="ims-box pa-3 rounded-lg bg-teal-lighten-5 border mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-teal-darken-3">ISO 14001 (Environment)</span>
                  <v-chip size="x-small" color="teal">Sustainability</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">Controls environmental aspects, energy consumption, waste streams, and emissions.</p>
              </div>

              <div class="ims-box pa-3 rounded-lg bg-amber-lighten-5 border">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-amber-darken-3">ISO 45001 (OHSMS)</span>
                  <v-chip size="x-small" color="amber-darken-3">Worker Safety</v-chip>
                </div>
                <p class="text-caption text-slate-700 mb-0">
                  Protects workers from injury and ill-health. Explore our <NuxtLink to="/certifications/ohsms" class="font-weight-bold text-amber-darken-4">ISO 45001 Guide</NuxtLink>.
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── 12. Frequently Asked Questions ───────────────────────────── -->
    <section id="faq" class="py-16 bg-surface">
      <v-container>
        <div class="text-center max-w-800 mx-auto mb-12">
          <span class="text-overline text-primary font-weight-bold tracking-wider">EXPERT CLARIFICATIONS</span>
          <h2 class="text-h4 font-weight-bold text-slate-900 mb-3">
            ISO 9001 Frequently Asked Questions
          </h2>
          <p class="text-body-1 text-slate-600">
            Authoritative answers on ISO 9001:2015 certification requirements, costs, audits, documentation rules, and the 2024 Climate Change Amendment.
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
              <span>ISO 9001 QMS Technical Advisory & Pre-Audit Assessment</span>
            </div>

            <h2 class="text-h3 font-weight-bold mb-4">
              Accelerate Your ISO 9001 Certification Journey
            </h2>

            <p class="text-body-1 text-slate-300 mb-6">
              Establish a lean, effective Quality Management System that drives commercial value and wins premium tenders. Our quality advisory team delivers thorough gap assessments, process mapping, internal auditor coaching, and readiness reviews.
            </p>

            <div class="d-flex flex-column ga-3 mb-6">
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Independent Pre-Audit Gap Analysis & Workflow Diagnostics</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Risk-Based Thinking & Process Interaction Mapping</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Certified Internal Quality Auditor & Lead Auditor Training</span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="text-body-2 text-slate-200">Selection of Accredited Certification Bodies (UKAS, ANAB, NABCB)</span>
              </div>
            </div>

            <div class="related-links pa-4 rounded-lg bg-slate-800 border-slate-700">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-2">EXPLORE RELATED STANDARDS:</span>
              <div class="d-flex flex-wrap ga-3">
                <NuxtLink to="/certifications/iso-certification" class="text-caption text-primary-lighten-2 font-weight-bold">ISO Directory</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/ohsms" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 45001 OHSMS</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/iso-22000" class="text-caption text-primary-lighten-2 font-weight-bold">ISO 22000 Food Safety</NuxtLink>
                <span class="text-slate-600">·</span>
                <NuxtLink to="/certifications/brcgs" class="text-caption text-primary-lighten-2 font-weight-bold">BRCGS Food Safety</NuxtLink>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="rounded-xl pa-6 pa-md-8 bg-white text-slate-900 elevation-8">
              <h3 class="text-h5 font-weight-bold mb-2">Request ISO 9001 Consultation</h3>
              <p class="text-body-2 text-slate-600 mb-6">
                Connect with our quality management consultants. We will evaluate your operational scope, existing procedures, and audit timeline within 24 business hours.
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
                        'Manufacturing & Engineering',
                        'Construction & Infrastructure',
                        'IT & Software Development',
                        'Healthcare & Life Sciences',
                        'Logistics & Distribution',
                        'Professional & Financial Services',
                        'Education & Training',
                        'Other Commercial Enterprise'
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
                        'General QMS enquiry'
                      ]"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.notes"
                      label="Facility Scope, Number of Employees, or Multiple Management System Needs"
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
                  Submit ISO 9001 Consultation Request
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
const pageTitle = 'ISO 9001 Certification | Quality Management System (QMS) Advisory';
const pageDescription = 'Comprehensive guide to ISO 9001:2015 Certification. Learn QMS requirements, the 7 Quality Principles, implementation roadmap, documentation, and certification benefits.';
const pageUrl = 'https://brixcertifications.com/certifications/qms';

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogUrl: pageUrl,
  ogType: 'website',
  ogImage: 'https://brixcertifications.com/img/certifications/iso-9001-precision-quality-inspection.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: 'https://brixcertifications.com/img/certifications/iso-9001-precision-quality-inspection.jpg'
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
        name: 'ISO 9001:2015 Quality Management System Certification Advisory',
        serviceType: 'QMS Certification Consulting and Training',
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
          name: 'ISO 9001 QMS Consulting Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 9001 Gap Assessment and Process Mapping'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Risk-Based Thinking & Quality Objectives Deployment'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'ISO 9001 Lead Auditor & Internal Auditor Training'
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
            name: 'ISO 9001 QMS',
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
            name: 'How long does it take to get ISO 9001 certified?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For most small to mid-sized organizations, implementation takes between 3 and 6 months. This allows adequate time to map processes, deploy SOPs, train staff, generate at least 2-3 months of operational records, conduct an internal audit, and execute an executive management review before the external certification audit.'
            }
          },
          {
            '@type': 'Question',
            name: 'Does ISO 9001 require a printed "Quality Manual"?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. ISO 9001:2015 eliminated the mandatory requirement for a formal, standalone Quality Manual. Instead, the standard uses the term "documented information," giving organizations the flexibility to maintain policies, digital procedures, ERP workflows, or intranet wikis that fit their operational culture.'
            }
          },
          {
            '@type': 'Question',
            name: 'What was the 2024 Climate Change Amendment to ISO 9001:2015?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In February 2024, ISO published ISO 9001:2015/Amd 1:2024 ("Climate action changes"). It added an explicit requirement in Clause 4.1 for organizations to determine whether climate change is a relevant internal or external issue, and in Clause 4.2 to note that relevant interested parties can have requirements related to climate change.'
            }
          },
          {
            '@type': 'Question',
            name: 'Does ISO 9001 guarantee 100% defect-free products?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No management standard can guarantee zero defects. ISO 9001 provides a systematic framework to prevent errors, ensure consistency, control non-conforming outputs, and systematically resolve customer complaints through root cause corrective action (CAPA).'
            }
          }
        ]
      })
    }
  ]
});

// ── The Seven Quality Management Principles (QMPs) ────────────────
const qualityPrinciples = [
  {
    title: 'Customer Focus',
    color: 'primary',
    icon: 'mdi-account-heart-outline',
    description: 'The primary focus of quality management is to meet customer requirements and strive to exceed customer expectations.',
    application: 'Systematic customer feedback surveys, net promoter scores, and SLA performance tracking.'
  },
  {
    title: 'Leadership',
    color: 'teal',
    icon: 'mdi-account-tie-outline',
    description: 'Leaders at all levels establish unity of purpose and direction, creating conditions in which people are engaged in achieving objectives.',
    application: 'Visible executive quality policy, resource allocation, and quarterly management review leadership.'
  },
  {
    title: 'Engagement of People',
    color: 'indigo',
    icon: 'mdi-account-group-outline',
    description: 'Competent, empowered, and engaged people throughout the organization enhance its capability to create and deliver value.',
    application: 'Skills matrix mapping, cross-training programs, and continuous suggestion improvement schemes.'
  },
  {
    title: 'Process Approach',
    color: 'blue-grey',
    icon: 'mdi-arrow-decision-outline',
    description: 'Consistent and predictable results are achieved more effectively when activities are understood and managed as interrelated processes.',
    application: 'Turtle diagrams, SIPOC process maps, and clear input-transformation-output controls.'
  },
  {
    title: 'Improvement',
    color: 'success',
    icon: 'mdi-trending-up',
    description: 'Successful organizations maintain an ongoing focus on improvement to react to changes in internal and external conditions.',
    application: 'PDCA problem-solving, structured Root Cause Analysis (5 Whys, Fishbone), and Kaizen initiatives.'
  },
  {
    title: 'Evidence-Based Decision-Making',
    color: 'amber-darken-3',
    icon: 'mdi-chart-areaspline',
    description: 'Decisions based on the analysis and evaluation of reliable data and information are more likely to produce desired results.',
    application: 'Statistical process control (SPC), scrap rate Pareto charts, and delivery punctuality analytics.'
  },
  {
    title: 'Relationship Management',
    color: 'purple',
    icon: 'mdi-handshake-outline',
    description: 'For sustained success, organizations manage their relationships with interested parties, such as suppliers and partners.',
    application: 'Approved Vendor Lists (AVL), formal supplier scorecards, and joint quality development audits.'
  }
];

// ── Clauses 4 through 10 Data ──────────────────────────────────────
const clauses = [
  {
    number: '4',
    title: 'Context of the Organization',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Understand external and internal factors, relevant interested party expectations, define QMS scope, and establish process interactions.',
    items: [
      'Internal & external issues review (including 2024 Climate Change Amd)',
      'Needs of customers, regulators, and supply chain partners',
      'Documented QMS scope and end-to-end process interaction map'
    ]
  },
  {
    number: '5',
    title: 'Leadership & Commitment',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Top management must demonstrate accountability, establish the Quality Policy, foster customer focus, and assign clear authorities.',
    items: [
      'Direct executive ownership of quality performance and resources',
      'Signed Quality Policy aligned with business strategic purpose',
      'Defined roles, responsibilities, and authorities across departments'
    ]
  },
  {
    number: '6',
    title: 'Planning for the QMS',
    pdcaPhase: 'PLAN',
    pdcaColor: 'info',
    description: 'Identify risks and opportunities, set measurable quality objectives at relevant functions, and plan organizational changes.',
    items: [
      'Risk and opportunity registers with preventive action plans',
      'SMART measurable quality objectives (e.g. < 0.5% scrap rate)',
      'Structured planning and management of organizational change'
    ]
  },
  {
    number: '7',
    title: 'Support & Resources',
    pdcaPhase: 'DO',
    pdcaColor: 'primary',
    description: 'Provide resources, infrastructure, suitable working environment, calibrated measuring tools, competent staff, and controlled documents.',
    items: [
      'Workforce competency assessments and documented training logs',
      'Calibration registers for measuring equipment (Clause 7.1.5)',
      'Version control and storage of documented information'
    ]
  },
  {
    number: '8',
    title: 'Operation & Control',
    pdcaPhase: 'DO',
    pdcaColor: 'primary',
    description: 'Plan, implement, and control operational processes: review customer orders, manage product design, control external vendors, and release goods.',
    items: [
      'Customer requirements review and contract sign-off',
      'Design & development controls (inputs, reviews, verifications)',
      'Supplier evaluation and control of non-conforming outputs'
    ]
  },
  {
    number: '9',
    title: 'Performance Evaluation',
    pdcaPhase: 'CHECK',
    pdcaColor: 'warning',
    description: 'Determine what must be measured, evaluate customer satisfaction, analyze operational data, conduct internal audits, and hold management reviews.',
    items: [
      'Customer satisfaction monitoring and trend analysis',
      'Annual risk-based internal audit schedule across all departments',
      'Formal executive Management Review Meetings (MRM) with minutes'
    ]
  },
  {
    number: '10',
    title: 'Continual Improvement',
    pdcaPhase: 'ACT',
    pdcaColor: 'success',
    description: 'Address non-conformances, eliminate root causes with structured corrective actions (CAPA), and continuously enhance system suitability.',
    items: [
      'Non-conformity logging, containment, and root cause investigation',
      'Corrective Action (CAPA) implementation and effectiveness review',
      'Continual system improvement driven by data analytics and audit findings'
    ]
  }
];

// ── Industry Applicability Data ────────────────────────────────────
const industries = [
  {
    title: 'Manufacturing & Engineering',
    icon: 'mdi-factory',
    color: 'primary',
    description: 'Guarantees dimension tolerances, batch repeatability, calibrated measuring tools, and defect reduction on high-speed production lines.',
    driver: 'Customer spec adherence & export trade'
  },
  {
    title: 'Construction & Contracting',
    icon: 'mdi-office-building-cog',
    color: 'amber-darken-3',
    driver: 'Government & public tender prequalification',
    description: 'Standardizes subcontractor oversight, material testing, inspection & test plans (ITPs), and architectural handover documentation.'
  },
  {
    title: 'IT, Software & SaaS',
    icon: 'mdi-laptop',
    color: 'indigo',
    driver: 'Enterprise SLAs & customer retention',
    description: 'Formalizes sprint planning, software QA, automated regression testing, bug escalation protocols, and infrastructure availability.'
  },
  {
    title: 'Healthcare & Clinical Services',
    icon: 'mdi-hospital-box-outline',
    color: 'red-darken-1',
    driver: 'Patient safety & statutory compliance',
    description: 'Standardizes diagnostic procedures, patient intake, equipment calibration, hygiene controls, and medical record confidentiality.'
  },
  {
    title: 'Logistics & Warehousing',
    icon: 'mdi-truck-delivery-outline',
    color: 'teal',
    driver: 'On-time delivery & damage prevention',
    description: 'Controls order picking accuracy, temperature logging, carrier management, shipment tracking, and claims resolution.'
  },
  {
    title: 'Education & Training',
    icon: 'mdi-school-outline',
    color: 'blue-grey',
    driver: 'Accreditation & student satisfaction',
    description: 'Standardizes curriculum delivery, instructor competencies, exam integrity, student feedback, and course material versioning.'
  },
  {
    title: 'Professional & Consulting',
    icon: 'mdi-briefcase-check-outline',
    color: 'purple',
    driver: 'Deliverable consistency & brand trust',
    description: 'Streamlines client onboarding, peer review of technical deliverables, milestone tracking, and billing accuracy.'
  },
  {
    title: 'Retail & Service Providers',
    icon: 'mdi-store-check-outline',
    color: 'success',
    driver: 'Brand reputation & complaint resolution',
    description: 'Ensures uniform service standards across branch networks, returns management, and structured customer feedback loops.'
  }
];

// ── Benefits Data ──────────────────────────────────────────────────
const benefits = [
  {
    title: 'Process Consistency & Low Scrap',
    icon: 'mdi-cog-sync-outline',
    color: 'primary',
    description: 'Replaces ad-hoc practices with documented standard operating procedures (SOPs), dramatically reducing rework, scrap, and operational error rates.'
  },
  {
    title: 'Enhanced Customer Loyalty',
    icon: 'mdi-account-star-outline',
    color: 'success',
    description: 'Delivering consistent quality builds trust, boosts client retention, and increases repeat business and referral contracts.'
  },
  {
    title: 'Prequalification for Major Tenders',
    icon: 'mdi-file-certificate-outline',
    color: 'amber-darken-3',
    description: 'Government agencies, infrastructure projects, and multinational enterprises mandate ISO 9001 certification as a baseline bidding prerequisite.'
  },
  {
    title: 'Proactive Risk-Based Thinking',
    icon: 'mdi-shield-check-outline',
    color: 'teal',
    description: 'Clause 6 forces organizations to identify failure modes and supply disruptions early, turning unexpected crises into managed contingencies.'
  },
  {
    title: 'Effective Supplier Control',
    icon: 'mdi-truck-check-outline',
    color: 'indigo',
    description: 'Formal vendor evaluation and incoming inspection criteria ensure raw materials and outsourced services never compromise your finished product.'
  },
  {
    title: 'Reduced Person-Dependency',
    icon: 'mdi-account-multiple-check-outline',
    color: 'purple',
    description: 'Standardized documentation ensures new employees onboard rapidly and operations continue seamlessly during staff absences or turnover.'
  }
];

// ── 8-Stage Implementation Roadmap ─────────────────────────────────
const implementationSteps = [
  {
    title: 'Executive Sponsorship & Scope',
    colorClass: 'bg-primary',
    description: 'Define QMS boundaries, align quality objectives with organizational strategy, and form a cross-functional project committee.',
    deliverable: 'QMS Project charter & scope'
  },
  {
    title: 'Diagnostic Gap Assessment',
    colorClass: 'bg-teal',
    description: 'Evaluate current processes, documentation, and calibration records against ISO 9001:2015 requirements to isolate gaps.',
    deliverable: 'Detailed gap closure matrix'
  },
  {
    title: 'Process Mapping & Risk Analysis',
    colorClass: 'bg-indigo',
    description: 'Map core process interactions (SIPOC), establish operational KPIs, and document risks and opportunities under Clause 6.1.',
    deliverable: 'Master process interaction map'
  },
  {
    title: 'Policy & SOP Documentation',
    colorClass: 'bg-blue-grey',
    description: 'Draft the Quality Policy, quality objectives, core SOPs, work instructions, forms, and calibration matrices.',
    deliverable: 'Approved documented information'
  },
  {
    title: 'System Rollout & Training',
    colorClass: 'bg-amber-darken-3',
    description: 'Deploy procedures across all departments, train frontline staff, and accumulate 2 to 3 months of live operational records.',
    deliverable: 'Staff training logs & live records'
  },
  {
    title: 'Internal Audit & CAPA',
    colorClass: 'bg-purple',
    description: 'Trained internal auditors evaluate all departments, identifying non-conformances and validating root-cause corrective actions.',
    deliverable: 'Internal audit reports & CAPA log'
  },
  {
    title: 'Management Review Meeting (MRM)',
    colorClass: 'bg-red-darken-1',
    description: 'Executive leadership formally reviews quality performance, customer feedback, audit results, and resource adequacy.',
    deliverable: 'Signed MRM minutes & action plans'
  },
  {
    title: 'Stage 1 & Stage 2 CB Audits',
    colorClass: 'bg-success',
    description: 'Undergo Stage 1 readiness review and Stage 2 on-site audit by an accredited Certification Body (CB) to earn certification.',
    deliverable: 'Official ISO 9001 Certificate'
  }
];

// ── Documentation Checklist ────────────────────────────────────────
const activeDocTab = ref('governance');

const docChecklists = {
  governance: [
    { name: 'Quality Policy Statement', desc: 'Signed executive policy reflecting business context, customer commitment, and continuous improvement objectives.' },
    { name: 'Scope of the QMS', desc: 'Documented physical boundaries, activities, product/service lines, and justifiable clause exclusions (e.g. Design 8.3).' },
    { name: 'Quality Objectives & Action Plans', desc: 'SMART measurable targets (e.g., on-time delivery > 98%, customer satisfaction > 90%) with designated owners.' },
    { name: 'Context & Stakeholder Analysis', desc: 'Internal/external issues matrix including 2024 Climate Change Amd analysis and interested party needs.' }
  ],
  operations: [
    { name: 'Process Flowcharts & Operational SOPs', desc: 'Documented sequence of core processes showing inputs, controls, transformation steps, and measurable outputs.' },
    { name: 'Customer Requirements Review Records', desc: 'Tender reviews, order acceptance sign-offs, and customer change request tracking.' },
    { name: 'Design and Development Controls (Clause 8.3)', desc: 'Design inputs, verification tests, validation prototypes, and engineering change orders (if applicable).' },
    { name: 'Control of Nonconforming Outputs', desc: 'Containment records, scrap logs, rework authorizations, and concession approvals.' }
  ],
  resources: [
    { name: 'Equipment Calibration & Maintenance Logs', desc: 'Calibrated measuring tool registers (Clause 7.1.5) with NIST/ISO 17025 traceable certificates and calibration stickers.' },
    { name: 'Personnel Competency & Training Matrix', desc: 'Job descriptions, educational qualifications, certified training records, and annual competency reviews.' },
    { name: 'Approved Vendor List (AVL) & Evaluations', desc: 'Documented supplier selection criteria, annual performance evaluations, and incoming inspection records.' },
    { name: 'Document Control & Retention Matrix', desc: 'Master list of internal and external documents with versioning, approvals, and legal retention periods.' }
  ],
  evaluation: [
    { name: 'Customer Satisfaction Survey Analytics', desc: 'Annual customer feedback data, net promoter scores, delivery punctuality metrics, and customer complaint logs.' },
    { name: 'Annual Internal Audit Program & Reports', desc: 'Formal audit schedule covering every clause and operational department, with objective auditor notes.' },
    { name: 'Corrective Action (CAPA) Registers', desc: 'Documented root cause analysis (5 Whys / Fishbone), corrective action implementation, and effectiveness sign-offs.' },
    { name: 'Executive Management Review Minutes', desc: 'Top leadership meeting records evaluating system performance, resources, and strategic quality improvements.' }
  ]
};

// ── ISO 9001 vs ISO 22000 Comparison Data ─────────────────────────
const comparisonData = [
  {
    dimension: 'Primary Objective',
    iso9001: 'Customer satisfaction, process consistency & defect prevention across any industry',
    iso22000: 'Food safety and prevention of biological, chemical, physical & allergen hazards'
  },
  {
    dimension: 'Target Industry Scope',
    iso9001: 'Universal: Manufacturing, IT, construction, logistics, services, healthcare',
    iso22000: 'Food supply chain: Agriculture, food processing, packaging, catering, transport'
  },
  {
    dimension: 'Core Risk Management Focus',
    iso9001: 'Business risks and opportunities affecting process outputs and customer satisfaction',
    iso22000: 'Codex Alimentarius HACCP hazard analysis, CCPs, and Operational PRPs (OPRPs)'
  },
  {
    dimension: 'Prerequisite Programs (PRPs)',
    iso9001: 'General infrastructure and work environment controls (Clause 7.1.3 & 7.1.4)',
    iso22000: 'Mandatory hygiene PRPs (pest control, zoning, cleaning, air quality, cross-contamination)'
  },
  {
    dimension: 'Emergency Preparedness',
    iso9001: 'Business continuity, machinery breakdowns, supply shortages',
    iso22000: 'Emergency product withdrawal, public food recalls, batch quarantine'
  },
  {
    dimension: 'Legal & Regulatory Focus',
    iso9001: 'Product specifications, customer contracts, statutory consumer rights',
    iso22000: 'National and international food hygiene statutes, maximum residue limits (MRLs)'
  }
];

// ── FAQ List ──────────────────────────────────────────────────────
const faqList = [
  {
    question: 'How long does it take to get ISO 9001 certified?',
    answer: 'For most small to medium-sized organizations, implementation takes between 3 and 6 months. This timeline allows your business to map operational processes, deploy standardized procedures, train personnel, accumulate 2-3 months of operational evidence, complete an internal audit, and conduct an executive management review before the external Stage 1 and Stage 2 audits.'
  },
  {
    question: 'What is the difference between ISO 9001:2008 and ISO 9001:2015?',
    answer: 'ISO 9001:2015 introduced major architectural enhancements: adoption of the Annex SL 10-clause structure, replacing prescriptive procedures with "Risk-Based Thinking," eliminating the mandatory "Quality Manual" requirement, placing greater accountability on top executive leadership, and increasing emphasis on achieving measurable process outcomes.'
  },
  {
    question: 'Does ISO 9001 require a printed "Quality Manual"?',
    answer: 'No. ISO 9001:2015 eliminated the mandatory requirement for a standalone Quality Manual. Instead, the standard uses the term "documented information," giving organizations the flexibility to maintain procedures as digital workflows, intranet portals, cloud ERP documents, or process flowcharts.'
  },
  {
    question: 'What is the difference between Quality Assurance (QA) and Quality Control (QC)?',
    answer: 'Quality Assurance (QA) is process-oriented and focuses on defect prevention through documented SOPs, trained staff, and risk mitigation across the entire lifecycle. Quality Control (QC) is product-oriented and focuses on defect detection by inspecting, testing, or measuring finished outputs against specifications.'
  },
  {
    question: 'What was the 2024 Climate Change Amendment to ISO 9001:2015?',
    answer: 'In February 2024, ISO published ISO 9001:2015/Amd 1:2024 ("Climate action changes"). It added an explicit requirement in Clause 4.1 for organizations to determine whether climate change is a relevant internal or external issue, and in Clause 4.2 to note that relevant interested parties can have requirements related to climate change.'
  },
  {
    question: 'How much does ISO 9001 certification cost?',
    answer: 'The cost depends on facility size, employee headcount, number of sites, and whether design activities are included. Accredited certification body (CB) audit fees typically range from $3,000 to $8,000 for the initial 3-year certification cycle. Internal costs involve staff training, gap assessments, and calibration equipment.'
  },
  {
    question: 'How long is the ISO 9001 certificate valid and what are surveillance audits?',
    answer: 'An ISO 9001 certificate is valid for three years. To maintain validity, the organization must undergo annual surveillance audits at the end of Year 1 and Year 2. Prior to the end of Year 3, a full recertification audit is conducted to issue a new 3-year certificate.'
  },
  {
    question: 'Does ISO 9001 guarantee 100% defect-free products?',
    answer: 'No management standard can guarantee zero defects. ISO 9001 provides a systematic framework to prevent errors, ensure consistency, control non-conforming outputs, and systematically resolve customer complaints through root cause corrective action (CAPA).'
  },
  {
    question: 'Can service-based companies or small businesses get ISO 9001 certified?',
    answer: 'Absolutely. Over 40% of all ISO 9001 certified organizations globally are service, software, healthcare, financial, or educational enterprises. The standard applies to service processes (such as client onboarding, service delivery, and complaint resolution) just as effectively as physical factory lines.'
  },
  {
    question: 'How do we choose an accredited Certification Body (CB)?',
    answer: 'Ensure the certification body is officially accredited by a recognized national accreditation body (e.g. UKAS in the UK, ANAB in the USA, NABCB in India, JAS-ANZ in Australia) that is a member of the International Accreditation Forum (IAF). Unaccredited certificates lack global recognition and are frequently rejected in enterprise tenders.'
  },
  {
    question: 'What is the role of Brix Certifications?',
    answer: 'To preserve impartiality and adhere to ISO/IEC 17021 accreditation standards, organizations that provide consulting and training cannot act as the certifying body for the same client. Brix Certifications provides independent gap assessments, process mapping, internal audit training, and technical advisory to prepare your organization for a successful audit with an accredited third-party certification body.'
  }
];

// ── Consultation Form State & Actions ─────────────────────────────
const form = ref({
  fullName: '',
  company: '',
  email: '',
  phone: '',
  industry: 'Manufacturing & Engineering',
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
    submissionMessage.value = 'Thank you! Your ISO 9001 consultation request has been received. Our senior quality management advisor will contact you within 24 hours.';
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
.qms-page {
  font-family: 'Figtree', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
}

/* ── Hero Styling ─────────────────────────────────────────────────── */
.qms-hero {
  position: relative;
  background: linear-gradient(135deg, #0a1128 0%, #1e3a8a 50%, #172554 100%);
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
  background: radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.2) 0%, transparent 60%);
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
  color: #bfdbfe;
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
  color: #93c5fd;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.25);
  border: 1px solid rgba(147, 197, 253, 0.4);
  font-size: 0.82rem;
  font-weight: 600;
  color: #dbeafe;
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

/* ── Principle Cards ──────────────────────────────────────────────── */
.principle-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  background: #ffffff;
}

.principle-card:hover {
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

/* ── Industry Cards ───────────────────────────────────────────────── */
.industry-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.industry-card:hover {
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
