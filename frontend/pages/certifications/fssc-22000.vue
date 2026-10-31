<template>
  <div class="fssc22000-certification-page">
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
            <span itemprop="name" class="text-caption font-weight-bold text-dark">FSSC 22000 Certification</span>
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
              <v-chip color="teal-darken-3" variant="flat" size="small" class="font-weight-bold text-uppercase px-3">
                <v-icon start size="14">mdi-shield-check</v-icon>
                GFSI Benchmarked Standard
              </v-chip>
              <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
                FSSC 22000 Version 6 Scheme
              </v-chip>
              <v-chip color="grey-darken-3" variant="outlined" size="small" class="font-weight-bold">
                ISO 22000 + Sector PRPs
              </v-chip>
            </div>

            <h1 class="hero-h1 mb-4">
              FSSC 22000 Certification – Advance Your Food Safety Standards
            </h1>

            <p class="hero-lead mb-6 text-body-1 text-grey-darken-2">
              <strong>FSSC 22000</strong> provides a globally recognized, GFSI-benchmarked certification framework that integrates <strong>ISO 22000:2018</strong>, sector-specific prerequisite programmes (PRPs), and mandatory FSSC additional requirements. Gain universal supply chain acceptance, satisfy multinational retailer mandates, and instill verifiable food safety and quality discipline across your operations.
            </p>

            <!-- Trust Highlights -->
            <div class="hero-trust-grid d-flex flex-wrap gap-4 mb-8">
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="teal-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Full GFSI Benchmark Recognition</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="teal-darken-2" size="20">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Version 6 Scheme Alignment</span>
              </div>
              <div class="trust-badge-item d-flex align-center gap-2">
                <v-icon color="teal-darken-2" size="20">mdi-check-circle</v-icon>
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
                Get FSSC 22000 Certified
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
                  Talk to an Expert
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
                  src="/img/certifications/fssc-food-processing-facility.jpg"
                  alt="Automated commercial food and beverage processing facility with quality auditor inspecting digital compliance controls"
                  title="FSSC 22000 Certified Food Manufacturing Facility"
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
                  <v-avatar color="teal-lighten-5" size="48" rounded="lg">
                    <v-icon color="teal-darken-2" size="26">mdi-shield-check</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-secondary font-weight-bold text-uppercase">Scheme Edition</div>
                    <div class="text-subtitle-1 font-weight-black text-dark">FSSC 22000 Version 6</div>
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
          <!-- Left Column: Comprehensive In-Depth Guides -->
          <v-col cols="12" lg="8">
            <!-- Section 1: What is FSSC 22000? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Scheme Foundation</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                What is FSSC 22000?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                <strong>FSSC 22000 (Food Safety System Certification)</strong> is a globally recognized, market-driven food safety certification scheme managed by <strong>Foundation FSSC</strong>, an independent non-profit foundation based in the Netherlands. The scheme is formally benchmarked and recognized by the <strong>Global Food Safety Initiative (GFSI)</strong>, certifying that an organization operates an audited Food Safety Management System meeting international best-practice standards.
              </p>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                FSSC 22000 applies across the entire international food chain. Rather than functioning as a standalone prescriptive standard, FSSC 22000 incorporates the international consensus standard <strong>ISO 22000</strong> as its structural foundation, augmenting it with industry-specific <strong>Prerequisite Programmes (PRPs)</strong> and targeted <strong>FSSC Additional Requirements</strong>.
              </p>

              <div class="pa-4 rounded-xl bg-teal-lighten-5 border border-teal-lighten-3 d-flex align-start gap-3">
                <v-icon color="teal-darken-2" size="24" class="mt-1">mdi-earth</v-icon>
                <div class="text-body-2 text-teal-darken-4">
                  <strong>Independent Accreditation Oversight:</strong> Foundation FSSC develops, maintains, and licenses the scheme documentation. Certification audits are performed by independent, licensed Certification Bodies (CBs) that are accredited by national accreditation bodies operating under the International Accreditation Forum (IAF).
                </div>
              </div>
            </article>

            <!-- Section 2: Understanding the FSSC 22000 Scheme Structure -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Modular Architecture</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                Understanding the FSSC 22000 Scheme: The Three Core Elements
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                The strength of FSSC 22000 lies in its modular tripartite architecture. These three distinct elements work together as an integrated whole to assure food safety:
              </p>

              <v-row class="mb-6">
                <v-col cols="12" md="4" v-for="element in threeSchemeElements" :key="element.title">
                  <div class="pillar-card pa-5 rounded-xl border bg-grey-lighten-5 h-100 d-flex flex-column">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-avatar color="primary" size="36" class="text-white font-weight-bold text-caption">
                        {{ element.step }}
                      </v-avatar>
                      <v-icon :color="element.iconColor" size="24">{{ element.icon }}</v-icon>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold mb-2 text-dark">{{ element.title }}</div>
                    <p class="text-caption text-grey-darken-2 leading-relaxed mb-0 flex-grow-1">
                      {{ element.description }}
                    </p>
                  </div>
                </v-col>
              </v-row>

              <p class="text-body-2 text-grey-darken-2 leading-relaxed mb-0">
                <strong>How they work together:</strong> ISO 22000 supplies the management framework, leadership commitment, and hazard analysis. The sector PRPs establish physical plant hygiene, sanitation, and cross-contamination barriers. The FSSC Additional Requirements ensure current supply chain risks (such as intentional sabotage, counterfeiting, and corporate safety culture) are rigorously addressed.
              </p>
            </article>

            <!-- Section 3: Technical Requirements -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Detailed Specifications</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                FSSC 22000 Technical Requirements Breakdown
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                To achieve and sustain certification, an organization must systematically address every dimension of food safety risk management:
              </p>

              <div class="requirements-accordion mb-6">
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel
                    v-for="req in fsscTechnicalRequirements"
                    :key="req.title"
                    class="border mb-2 rounded-xl overflow-hidden"
                  >
                    <v-expansion-panel-title class="py-3 font-weight-bold text-subtitle-2 text-dark">
                      <v-icon :color="req.iconColor" size="20" class="mr-3">{{ req.icon }}</v-icon>
                      {{ req.title }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="text-body-2 text-grey-darken-2 leading-relaxed py-2">
                      {{ req.details }}
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Inspection In-line Photo -->
              <div class="my-6 rounded-2xl overflow-hidden border">
                <v-img
                  src="/img/certifications/fssc-audit-inspection.jpg"
                  alt="Certified food safety auditor in cleanroom attire inspecting packaged food batch barcode and GFSI compliance seals"
                  title="FSSC 22000 Operational Line Verification Audit"
                  height="300"
                  cover
                  loading="lazy"
                ></v-img>
                <div class="pa-3 bg-grey-lighten-4 text-caption text-secondary text-center">
                  Independent auditors verify physical line hygiene, allergen segregation, and critical control points during on-site Stage 2 audits.
                </div>
              </div>
            </article>

            <!-- Section 4: Who Needs FSSC 22000? -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Scope &amp; Sectors</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Who Needs FSSC 22000 Certification?
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                FSSC 22000 accommodates facilities across the entire food supply chain through defined industry categories:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="cat in fsscCategories" :key="cat.code">
                  <div class="pa-4 rounded-xl border bg-grey-lighten-5 h-100">
                    <div class="d-flex align-center gap-2 mb-2">
                      <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
                        Category {{ cat.code }}
                      </v-chip>
                      <h3 class="text-subtitle-2 font-weight-bold text-dark mb-0">{{ cat.title }}</h3>
                    </div>
                    <div class="text-caption font-weight-bold text-teal-darken-3 mb-1">{{ cat.prpStandard }}</div>
                    <p class="text-caption text-grey-darken-2 mb-0 leading-relaxed">{{ cat.scope }}</p>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 5: Benefits of FSSC 22000 -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Commercial Advantages</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                Key Benefits of FSSC 22000 Certification
              </h2>

              <v-row>
                <v-col cols="12" sm="6" v-for="b in fsscBenefits" :key="b.title">
                  <div class="pa-4 rounded-xl border h-100 d-flex align-start gap-3 bg-white">
                    <v-avatar color="teal-lighten-5" size="40" rounded="lg" class="flex-shrink-0">
                      <v-icon color="teal-darken-2" size="22">{{ b.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ b.title }}</h3>
                      <p class="text-caption text-grey-darken-2 leading-relaxed mb-0">{{ b.desc }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 6: Certification Process -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Step-by-Step Pathway</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                The FSSC 22000 Certification Process
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Achieving accredited certification requires systematic preparation and verification across clear operational phases:
              </p>

              <div class="process-timeline">
                <div class="process-item mb-5" v-for="(phase, idx) in auditPhases" :key="phase.title">
                  <div class="d-flex align-start gap-4">
                    <div class="step-num-col d-flex flex-column align-center">
                      <div class="step-badge bg-primary text-white font-weight-bold">{{ idx + 1 }}</div>
                      <div class="step-line" v-if="idx < auditPhases.length - 1"></div>
                    </div>
                    <div class="pa-4 rounded-xl border bg-grey-lighten-5 flex-grow-1">
                      <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
                        <h3 class="text-subtitle-1 font-weight-bold text-dark mb-0">{{ phase.title }}</h3>
                        <v-chip size="x-small" color="teal-darken-2" variant="tonal" class="font-weight-bold">
                          {{ phase.timeline }}
                        </v-chip>
                      </div>
                      <p class="text-body-2 text-grey-darken-2 mb-0 leading-relaxed">{{ phase.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lab Testing Photo -->
              <div class="mt-8 rounded-2xl overflow-hidden border">
                <v-img
                  src="/img/certifications/fssc-laboratory-testing.jpg"
                  alt="Food science microbiology testing laboratory with technician conducting microbial culture analysis on sterile food samples"
                  title="Laboratory Testing and Validation for FSSC 22000 Compliance"
                  height="280"
                  cover
                  loading="lazy"
                ></v-img>
                <div class="pa-3 bg-grey-lighten-4 text-caption text-secondary text-center">
                  Routine laboratory testing and environmental pathogen swabs validate that prerequisite sanitation procedures remain fully effective.
                </div>
              </div>
            </article>

            <!-- Section 7: Required Documentation -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Audit Evidence</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                FSSC 22000 Required Documentation &amp; Records
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                External auditors evaluate documented policies, procedures, and daily operating evidence to confirm scheme conformity:
              </p>

              <v-row>
                <v-col cols="12" sm="6" v-for="d in documentationList" :key="d.category">
                  <div class="pa-4 rounded-xl border bg-white h-100">
                    <div class="text-subtitle-2 font-weight-bold text-primary mb-2 d-flex align-center gap-2">
                      <v-icon color="primary" size="18">mdi-file-document-check-outline</v-icon>
                      {{ d.category }}
                    </div>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li v-for="item in d.items" :key="item" class="mb-1">{{ item }}</li>
                    </ul>
                  </div>
                </v-col>
              </v-row>
            </article>

            <!-- Section 8: FSSC 22000 vs. ISO 22000 -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Detailed Comparison</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                FSSC 22000 vs. ISO 22000
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Although FSSC 22000 is built on ISO 22000, key additions differentiate the two schemes in commercial and regulatory markets:
              </p>

              <div class="table-responsive rounded-xl border overflow-hidden">
                <v-table density="comfortable" hover>
                  <thead class="bg-primary text-white">
                    <tr>
                      <th class="text-white font-weight-bold">Feature</th>
                      <th class="text-white font-weight-bold bg-teal-darken-3">FSSC 22000</th>
                      <th class="text-white font-weight-bold">ISO 22000:2018</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in isoVsFsscTable" :key="row.feature">
                      <td class="font-weight-bold text-dark">{{ row.feature }}</td>
                      <td class="bg-teal-lighten-5 font-weight-bold text-teal-darken-4">{{ row.fssc }}</td>
                      <td class="text-grey-darken-2">{{ row.iso }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </article>

            <!-- Section 9: FSSC 22000 vs. BRCGS -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Benchmarking</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                FSSC 22000 vs. BRCGS Food Safety
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                Both FSSC 22000 and BRCGS are benchmarked by the Global Food Safety Initiative (GFSI) and recognized by major international retailers. However, their structural approach and philosophy differ significantly:
              </p>

              <div class="pa-5 rounded-xl border bg-grey-lighten-5 mb-6">
                <v-row>
                  <v-col cols="12" md="6">
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-2">FSSC 22000 (Modular Approach):</h3>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li class="mb-2"><strong>ISO Harmonization:</strong> Shares the Annex SL High-Level Structure, making it seamless to integrate with ISO 9001, ISO 14001, and ISO 45001.</li>
                      <li class="mb-2"><strong>Non-Prescriptive:</strong> Focuses on management systems and hazard outcomes, offering facilities greater flexibility in designing compliant solutions.</li>
                      <li class="mb-2"><strong>Pass/Fail Outcome:</strong> Audit results in certification or non-conformity corrective action closure without public letter grades.</li>
                    </ul>
                  </v-col>
                  <v-col cols="12" md="6">
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-2">BRCGS Food Safety (Checklist Approach):</h3>
                    <ul class="text-caption text-grey-darken-2 pl-4 ma-0">
                      <li class="mb-2"><strong>Single Standard:</strong> A standalone, comprehensive, and highly prescriptive standard with specific operational instructions.</li>
                      <li class="mb-2"><strong>Graded Auditing:</strong> Sites receive public letter grades (AA, A, B, C, D) based on the number and severity of non-conformances.</li>
                      <li class="mb-2"><strong>Retail Dominance:</strong> Highly prevalent and widely requested across the UK, North American, and Commonwealth supermarket sectors.</li>
                    </ul>
                  </v-col>
                </v-row>
              </div>

              <div class="text-center">
                <NuxtLink to="/certifications/brcgs" class="text-decoration-none">
                  <v-btn color="primary" variant="tonal" rounded="lg" class="text-none font-weight-bold">
                    View BRCGS Food Safety Certification Guide <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </NuxtLink>
              </div>
            </article>

            <!-- Section 10: FSSC 22000 Scheme Version 6 -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Current Official Scheme</div>
              <h2 class="text-h4 font-weight-black mb-4 text-dark tracking-tight">
                FSSC 22000 Scheme Version 6: Important Changes
              </h2>

              <p class="text-body-1 text-grey-darken-2 leading-relaxed mb-6">
                <strong>Current Official Version:</strong> Published by Foundation FSSC in April 2023, <strong>FSSC 22000 Version 6</strong> became mandatory for all audits starting <strong>April 1, 2024</strong>, completely superseding Version 5.1. Version 6 aligns the scheme with the revised GFSI Benchmarking Requirements and updates category classifications in accordance with ISO 22003-1:2022.
              </p>

              <div class="v6-updates-list d-flex flex-column gap-4">
                <div class="v6-item pa-4 rounded-xl border bg-white d-flex align-start gap-3" v-for="update in v6SpecificUpdates" :key="update.title">
                  <v-avatar color="primary" size="32" rounded="circle" class="flex-shrink-0 mt-1">
                    <v-icon color="white" size="18">mdi-update</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold text-dark mb-1">{{ update.title }}</h3>
                    <p class="text-body-2 text-grey-darken-2 leading-relaxed mb-0">{{ update.description }}</p>
                  </div>
                </div>
              </div>
            </article>

            <!-- Section 11: FAQ Section (10 Questions) -->
            <article class="content-block bg-white pa-6 pa-md-10 rounded-2xl border mb-10 shadow-card">
              <div class="eyebrow-label mb-2 text-teal-darken-2">Frequently Asked Questions</div>
              <h2 class="text-h4 font-weight-black mb-6 text-dark tracking-tight">
                FSSC 22000 Certification FAQs
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

          <!-- Right Column: Sticky Sidebar & Lead Form -->
          <v-col cols="12" lg="4">
            <aside class="cert-sidebar sticky-top" style="top: 96px;">
              <!-- Lead Form Card -->
              <v-card class="pa-6 pa-md-8 rounded-2xl border bg-white mb-6 shadow-card" id="enquiry-card">
                <div class="d-flex align-center gap-2 mb-2">
                  <v-avatar color="primary" size="32">
                    <v-icon color="white" size="18">mdi-shield-check</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-black text-dark mb-0">Get FSSC 22000 Certified</h3>
                </div>
                <p class="text-caption text-grey-darken-1 mb-4">
                  Request a consultation for FSSC 22000 gap assessment, auditor training, or certification quotation.
                </p>

                <DynamicLeadForm
                  form-id="certification-inquiry"
                  source="certification_fssc_22000_page"
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
                    Talk to an Expert
                  </v-btn>
                </a>
              </v-card>

              <!-- Technical Parameters -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-4 text-dark d-flex align-center gap-2">
                  <v-icon color="primary" size="20">mdi-tune-vertical</v-icon>
                  Scheme Specifications
                </h4>

                <v-list density="compact" class="pa-0">
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Scheme Version</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Version 6 (Mandatory since April 2024)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">GFSI Recognition</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Full Benchmark Status</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Audit Cycle</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">3 Years (Annual Surveillance)</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2 border-b">
                    <v-list-item-title class="text-caption text-secondary">Unannounced Audits</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">1 Mandatory Every 3 Years</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0 py-2">
                    <v-list-item-title class="text-caption text-secondary">Public Directory</v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 font-weight-bold text-dark">Listed on Foundation FSSC Registry</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Related Training Programs -->
              <v-card class="pa-6 rounded-2xl border bg-white mb-6 shadow-card">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text-dark d-flex align-center gap-2">
                  <v-icon color="teal-darken-2" size="20">mdi-school-outline</v-icon>
                  Certified Lead Auditor Courses
                </h4>
                <p class="text-caption text-secondary mb-4">
                  Upskill your QA/QC team with recognized lead auditor credentials:
                </p>

                <div class="d-flex flex-column gap-3">
                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">FSSC 22000 Lead Auditor Course</div>
                        <div class="text-caption text-secondary">5 Days • CQI / IRCA Aligned</div>
                      </div>
                      <v-icon color="primary" size="18">mdi-arrow-right</v-icon>
                    </div>
                  </NuxtLink>

                  <NuxtLink to="/courses" class="text-decoration-none">
                    <div class="pa-3 rounded-lg border bg-grey-lighten-5 hover-card d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption font-weight-bold text-primary">HACCP &amp; Food Defense Implementation</div>
                        <div class="text-caption text-secondary">2 Days • Practical Workshop</div>
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
          <div class="eyebrow-label mb-2 text-teal-darken-2">Integrated Standards</div>
          <h2 class="text-h4 font-weight-black text-dark tracking-tight">Explore Related Food Safety &amp; Quality Certifications</h2>
          <p class="text-body-1 text-secondary">Build an integrated management system across food safety, packaging integrity, and quality assurance.</p>
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
  const message = 'Hello Brix Certifications, I would like to consult with an expert on FSSC 22000 Version 6 certification requirements, audit stages, and a quote for our facility.';
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
  { label: 'Scheme Governance', value: 'Foundation FSSC (Non-Profit)', icon: 'mdi-shield-check', color: 'teal-darken-2' },
  { label: 'Global Benchmarking', value: 'Full GFSI Recognition', icon: 'mdi-earth', color: 'primary' },
  { label: 'Current Version', value: 'FSSC 22000 Version 6', icon: 'mdi-layers-outline', color: 'orange-darken-3' },
  { label: 'Audit Cycle', value: '3-Year Formal Certification', icon: 'mdi-calendar-check', color: 'deep-purple-darken-1' }
];

// Three Scheme Elements
const threeSchemeElements = [
  {
    step: '01',
    icon: 'mdi-shield-star-outline',
    iconColor: 'primary',
    title: 'ISO 22000:2018 Management System',
    description: 'The international baseline standard providing leadership commitment, hazard analysis (HACCP), process control, communication, and continuous improvement cycles.'
  },
  {
    step: '02',
    icon: 'mdi-cog-outline',
    iconColor: 'teal-darken-2',
    title: 'Sector-Specific PRPs (ISO/TS 22002-x)',
    description: 'Tailored prerequisite requirements for hygiene, cleaning, pest control, personnel sanitation, and cross-contamination prevention suited to each industry sector.'
  },
  {
    step: '03',
    icon: 'mdi-alert-decagram-outline',
    iconColor: 'orange-darken-3',
    title: 'FSSC Additional Requirements (V6)',
    description: 'Mandatory criteria covering food fraud mitigation, food defense threat assessments, food safety culture KPIs, environmental monitoring, and equipment hygiene.'
  }
];

// Technical Requirements Breakdown
const fsscTechnicalRequirements = [
  {
    title: 'Food Safety Management System (ISO 22000 Core)',
    icon: 'mdi-layers-triple-outline',
    iconColor: 'primary',
    details: 'Implements the Plan-Do-Check-Act cycle across organizational management, leadership responsibility, resource allocation, internal communication, and continual management improvements.'
  },
  {
    title: 'Hazard Analysis & Critical Control Points (HACCP)',
    icon: 'mdi-scale-balance',
    iconColor: 'red-darken-1',
    details: 'Systematic identification and evaluation of biological, chemical, physical, and allergen hazards, with validated Critical Control Points (CCPs) and Operational PRPs (OPRPs).'
  },
  {
    title: 'Sector Prerequisite Programmes (PRPs)',
    icon: 'mdi-broom',
    iconColor: 'teal-darken-2',
    details: 'Prescriptive plant hygiene, layout, airflow, water quality, personal hygiene, waste disposal, pest control, and cleaning/disinfection procedures meeting the relevant ISO/TS 22002 standard.'
  },
  {
    title: 'Food Safety & Quality Culture (Clause 2.5.8)',
    icon: 'mdi-account-group-outline',
    iconColor: 'indigo-darken-1',
    details: 'Mandatory documented objectives, communication mechanisms, annual performance metrics, and training programmes actively fostering safety and quality awareness across all personnel.'
  },
  {
    title: 'Food Fraud Mitigation (VACCP – Clause 2.5.4)',
    icon: 'mdi-incognito',
    iconColor: 'orange-darken-3',
    details: 'Documented Vulnerability Assessment for all raw materials, packaging, and processes to identify risks of economically motivated adulteration or counterfeiting, backed by an active mitigation plan.'
  },
  {
    title: 'Food Defense Threat Assessment (TACCP – Clause 2.5.3)',
    icon: 'mdi-shield-lock-outline',
    iconColor: 'blue-grey-darken-2',
    details: 'Documented Threat Assessment identifying potential intentional contamination, sabotage, or bioterrorism vulnerabilities across the site, with physical and digital mitigation security controls.'
  },
  {
    title: 'Allergen Management Plan (Clause 2.5.6)',
    icon: 'mdi-alert-circle-outline',
    iconColor: 'amber-darken-3',
    details: 'Comprehensive allergen risk assessment, validated line-clearance and cleaning protocols, cross-contact prevention, and compliant precautionary allergen labeling (PAL).'
  },
  {
    title: 'Environmental Pathogen Monitoring (Clause 2.5.7)',
    icon: 'mdi-bacteria-outline',
    iconColor: 'deep-purple-darken-1',
    details: 'Risk-based microbiological swabbing and monitoring program evaluating surfaces, air, and zones for target pathogens (such as Listeria spp. and Salmonella spp.) in relevant processing areas.'
  }
];

// Scope Categories
const fsscCategories = [
  { code: 'C', title: 'Food & Beverage Processing', prpStandard: 'ISO/TS 22002-1', scope: 'Perishable animal and plant products, long shelf-life ambient foods, beverages, and bakery goods.' },
  { code: 'I', title: 'Food Packaging Manufacturing', prpStandard: 'ISO/TS 22002-4', scope: 'Production of plastic, paperboard, glass, aluminum, flexible films, and direct/indirect food contact materials.' },
  { code: 'D', title: 'Animal Feed & Pet Food', prpStandard: 'ISO/TS 22002-6', scope: 'Production of livestock feed, aquafeed, pet food, and animal nutrition ingredients.' },
  { code: 'G', title: 'Transport & Storage Logistics', prpStandard: 'ISO/TS 22002-5 / NEN 8059', scope: 'Warehousing, distribution facilities, and temperature-controlled logistics for food products.' },
  { code: 'K', title: 'Biochemicals & Additives', prpStandard: 'ISO/TS 22002-1', scope: 'Production of bio-cultures, enzymes, food vitamins, flavors, and nutritional supplements.' },
  { code: 'E & F', title: 'Catering & Food Trade', prpStandard: 'ISO/TS 22002-2 / BSI PAS 221', scope: 'Food service, central production kitchens, wholesalers, and e-commerce food distributors.' }
];

// Benefits
const fsscBenefits = [
  { icon: 'mdi-earth', title: 'Global Retailer & Tier-1 Acceptance', desc: 'Fulfills mandatory GFSI benchmark requirements demanded by leading supermarket conglomerates, multi-national brand owners, and export markets.' },
  { icon: 'mdi-shield-alert-outline', title: 'Recall Risk Prevention', desc: 'Identifies biological, chemical, physical, and allergen hazards systematically before products reach consumer supply chains.' },
  { icon: 'mdi-lock-check-outline', title: 'Food Defense & Fraud Protection', desc: 'Protects the integrity of incoming raw materials and finished goods against economic adulteration and intentional sabotage.' },
  { icon: 'mdi-file-sync-outline', title: 'Elimination of Redundant Audits', desc: 'Universal acceptance under GFSI eliminates repetitive, costly second-party customer audits, saving management time.' },
  { icon: 'mdi-scale-balance', title: 'Regulatory Compliance Assurance', desc: 'Maintains harmonized alignment with regional and international export regulations, including FDA FSMA and EU Food Law.' },
  { icon: 'mdi-chart-line', title: 'Operational Loss & Waste Reduction', desc: 'Version 6 requirements target systematic reduction of food loss, optimizing yield and lowering facility operating costs.' }
];

// Audit Phases
const auditPhases = [
  { title: 'Phase 1: Initial Assessment & Gap Analysis', timeline: 'Weeks 1 – 3', desc: 'Detailed diagnostic comparing existing hygiene controls, SOPs, and HACCP plans against FSSC 22000 Version 6 requirements.' },
  { title: 'Phase 2: FSMS & Sector PRP Upgrades', timeline: 'Weeks 4 – 8', desc: 'Drafting compliant prerequisite programmes (ISO/TS 22002-x), cleaning matrices, calibration workflows, and supplier controls.' },
  { title: 'Phase 3: TACCP, VACCP & Culture Implementation', timeline: 'Weeks 9 – 12', desc: 'Conducting Food Defense vulnerability assessments, Food Fraud mitigation plans, and workforce safety culture workshops.' },
  { title: 'Phase 4: Internal Audits & Management Review', timeline: 'Weeks 13 – 16', desc: 'Performing comprehensive internal audits across all shifts, addressing corrective actions (CAPA), and holding executive management reviews.' },
  { title: 'Phase 5: Stage 1 Certification Audit (Readiness)', timeline: 'Week 17', desc: 'The accredited Certification Body (CB) conducts an in-depth audit of your documentation and preparedness to confirm readiness for the site audit.' },
  { title: 'Phase 6: Stage 2 On-Site Audit & Certification', timeline: 'Weeks 20 – 24', desc: 'Full physical audit verifying that all processes and PRPs operate in real time. Upon resolving any findings, official FSSC 22000 certification is granted.' }
];

// Documentation List
const documentationList = [
  { category: 'Governance & Scope', items: ['FSMS Scope Statement & Organization Chart', 'Food Safety & Quality Policy and Objectives', 'Food Safety Team Leader Appointment', 'Internal and External Communication Procedures'] },
  { category: 'Hazard Control & PRPs', items: ['Documented Prerequisite Programmes (PRPs) Dossier', 'HACCP Plan & OPRP Hazard Analysis Records', 'Process Flow Diagrams & On-Site Verification', 'Validation Reports for All Critical Limits'] },
  { category: 'Security & Integrity', items: ['Food Defense Threat Assessment & Security Plan (TACCP)', 'Food Fraud Vulnerability Assessment & Mitigation (VACCP)', 'Allergen Management Plan & Validation Swabs', 'Environmental Pathogen Monitoring Programme (EMP)'] },
  { category: 'Operational Evidence', items: ['Traceability & Annual Mock Recall Reports', 'Calibration Logs for Monitoring Devices', 'Internal Audit Reports & Corrective Action (CAPA) Logs', 'Management Review Meeting (MRM) Minutes'] }
];

// ISO vs FSSC Table
const isoVsFsscTable = [
  { feature: 'GFSI Recognition', fssc: 'Yes (Fully Recognized & Benchmarked)', iso: 'No (Independent ISO Standard)' },
  { feature: 'PRP Requirements', fssc: 'Mandatory & Prescriptive (ISO/TS 22002-x)', iso: 'General guidance (Clause 8.2)' },
  { feature: 'Food Defense (TACCP)', fssc: 'Mandatory specific requirement (Clause 2.5.3)', iso: 'General risk management' },
  { feature: 'Food Fraud (VACCP)', fssc: 'Mandatory specific requirement (Clause 2.5.4)', iso: 'General risk management' },
  { feature: 'Food Safety Culture', fssc: 'Mandatory quantified KPIs (Clause 2.5.8)', iso: 'General leadership commitment' },
  { feature: 'Packaging Standard', fssc: 'Dedicated scheme (ISO/TS 22002-4)', iso: 'Generic application' },
  { feature: 'Retail Acceptance', fssc: 'Mandated by Top Global Supermarkets', iso: 'Regional & B2B Supply Chains' },
  { feature: 'Governance', fssc: 'Foundation FSSC (Non-Profit)', iso: 'ISO Technical Committee' }
];

// Version 6 Specific Updates
const v6SpecificUpdates = [
  {
    title: 'Food Safety and Quality Culture (Clause 2.5.8)',
    description: 'Organizations must establish, implement, and maintain a documented Food Safety and Quality Culture plan with measurable targets, structured communication mechanisms, annual performance metrics, and training across all levels.'
  },
  {
    title: 'Equipment Management & Sanitary Design (Clause 2.5.15)',
    description: 'Mandatory documentation validating that new and modified equipment meets sanitary design criteria, hygienic cleanability standards, and material compliance for food contact surfaces.'
  },
  {
    title: 'Food Loss and Waste Reduction (Clause 2.5.16)',
    description: 'A documented policy and ongoing strategy to measure, minimize, and safely handle surplus food and by-products, diverting edible surplus to safe human or animal consumption.'
  },
  {
    title: 'Quality Control Integration (Clause 2.5.9)',
    description: 'Establishes clear procedures for quality control parameters, weight/volume verification, line-start/clearance protocols, and systematic container labeling integrity.'
  },
  {
    title: 'Allergen Management Validation (Clause 2.5.6)',
    description: 'Enhanced validation requirements for allergen cleaning verifications, line-clearance protocols, and scientific justification when using Precautionary Allergen Labeling (PAL).'
  },
  {
    title: 'Environmental Monitoring Programs (Clause 2.5.7)',
    description: 'Risk-based verification of cleaning efficacy through regular microbiological swabbing for indicator organisms and target pathogens (Listeria, Salmonella) in relevant hygiene zones.'
  }
];

// FAQs (10 Questions)
const faqList = [
  {
    question: 'What is FSSC 22000 and how is it governed?',
    answer: 'FSSC 22000 (Food Safety System Certification) is a complete certification scheme for Food Safety Management Systems. It is governed by Foundation FSSC, an independent non-profit foundation based in the Netherlands, with oversight from an international Board of Stakeholders representing retailers, manufacturers, and certification bodies.'
  },
  {
    question: 'Is FSSC 22000 recognized by the Global Food Safety Initiative (GFSI)?',
    answer: 'Yes. FSSC 22000 is fully recognized and benchmarked by the Global Food Safety Initiative (GFSI). This recognition guarantees mutual acceptance by major multinational retailers, food brand owners, and restaurant chains worldwide.'
  },
  {
    question: 'What is the current official version of FSSC 22000?',
    answer: 'The current official version is FSSC 22000 Version 6 (V6), which was published in April 2023. Certification audits against Version 6 became mandatory worldwide on April 1, 2024, completely replacing Version 5.1.'
  },
  {
    question: 'How does FSSC 22000 differ from standalone ISO 22000?',
    answer: 'While both standards share the ISO 22000 management core, FSSC 22000 incorporates mandatory sector-specific Prerequisite Programmes (ISO/TS 22002 series) and FSSC Additional Requirements (such as Food Defense, Food Fraud, and Food Safety Culture). Crucially, FSSC 22000 is GFSI benchmarked, whereas ISO 22000 on its own is not.'
  },
  {
    question: 'What are the three foundational pillars of the FSSC 22000 scheme?',
    answer: 'The three pillars are: (1) ISO 22000:2018 for management system requirements and Codex HACCP; (2) Sector-specific PRPs (such as ISO/TS 22002-1 for food manufacturing or ISO/TS 22002-4 for packaging); and (3) FSSC Additional Requirements set by Foundation FSSC.'
  },
  {
    question: 'Can food packaging manufacturers achieve FSSC 22000 certification?',
    answer: 'Yes. FSSC 22000 has a dedicated category for food packaging manufacturing (Category I), combining ISO 22000 with ISO/TS 22002-4 prerequisite requirements. It applies to flexible films, paperboard, glass, metals, plastics, and closures.'
  },
  {
    question: 'How long is an FSSC 22000 certificate valid, and are unannounced audits required?',
    answer: 'An FSSC 22000 certificate is valid for three years, subject to annual surveillance audits. In each three-year certification cycle, at least one of the surveillance audits must be conducted unannounced, testing real-time operational readiness.'
  },
  {
    question: 'What are the mandatory requirements for Food Safety Culture in Version 6?',
    answer: 'Under Clause 2.5.8, organizations must establish a documented Food Safety and Quality Culture plan with measurable targets, open communication channels, annual performance evaluations, and ongoing employee training measuring cultural improvement.'
  },
  {
    question: 'What is the difference between Food Defense (TACCP) and Food Fraud (VACCP)?',
    answer: 'Food Defense (TACCP) addresses threat assessment to prevent intentional sabotage, ideological tampering, or bioterrorism. Food Fraud (VACCP) addresses vulnerability assessment to prevent economically motivated adulteration, substitution, diluting, or counterfeiting of raw materials.'
  },
  {
    question: 'How long does the implementation and certification process take?',
    answer: 'For facilities with established basic hygiene programmes, implementation, documentation, internal audits, and two-stage external certification audits typically take 4 to 7 months, depending on facility scale and process complexity.'
  }
];

// Related Standards
const relatedStandards = [
  { name: 'ISO 22000:2018', category: 'Food Safety Management', desc: 'The international management baseline combining hazard control with high-level structural governance.', color: 'primary', icon: 'mdi-certificate-outline', route: '/certifications/iso-22000' },
  { name: 'BRCGS Food Safety', category: 'Global Standard', desc: 'Leading GFSI-recognized benchmark standard emphasizing factory environment, product control, and process rigor.', color: 'orange-darken-3', icon: 'mdi-shield-check-outline', route: '/certifications/brcgs' },
  { name: 'HACCP System', category: 'Hazard Analysis', desc: 'Systematic preventative methodology controlling biological, chemical, and physical food safety hazards.', color: 'red-darken-1', icon: 'mdi-flask-outline', route: '/certifications/haccp' },
  { name: 'ISO 9001:2015 QMS', category: 'Quality Management', desc: 'Globally benchmarked quality framework driving operational consistency and customer satisfaction.', color: 'green-darken-2', icon: 'mdi-check-circle-outline', route: '/certifications/qms' }
];

// ── SEO Meta Configuration ───────────────────────────────────────
const pageTitle = 'FSSC 22000 Certification | Food Safety System Certification | Brix Certifications';
const pageDescription = 'Achieve accredited FSSC 22000 certification with Brix Certifications. Comprehensive guidance on ISO 22000, sector PRPs, GFSI compliance, Version 6 requirements, and audit stages.';
const pageUrl = 'https://brixcertifications.com/certifications/fssc-22000';
const heroImageUrl = 'https://brixcertifications.com/img/certifications/fssc-food-processing-facility.jpg';

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
        name: 'FSSC 22000 Certification and Food Safety Consultation',
        serviceType: 'Food Safety System Certification',
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
          name: 'FSSC 22000 Food Safety Certification Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'FSSC 22000 Gap Assessment & Audit Readiness'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'FSSC 22000 Lead Auditor & Internal Auditor Training'
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
            name: 'FSSC 22000 Certification',
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
  background: linear-gradient(135deg, #1B1B3A 0%, #0d202d 50%, #082824 100%);
  color: #ffffff;
}

.cert-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(0, 137, 123, 0.25) 0%, transparent 60%);
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

/* ── Pillar Cards ──────────────────────────────────────────────── */
.pillar-card {
  transition: all 0.25s ease;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.pillar-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: #00897B !important;
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
