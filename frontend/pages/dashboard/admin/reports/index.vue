<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Analytics & System Reports</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-0">
          Generate comprehensive reports, monitor progression, and export data across all operational domains.
        </p>
      </div>

      <!-- Quick Export & Date Range Presets -->
      <div class="d-flex align-center flex-wrap gap-2">
        <SegmentControl
          v-model="datePreset"
          :options="[
            { label: 'This Month', value: 'this_month' },
            { label: 'Last Month', value: 'last_month' },
            { label: 'Quarter', value: 'this_quarter' },
            { label: 'Year', value: 'this_year' },
            { label: 'Custom', value: 'custom' }
          ]"
          @update:model-value="onPresetChange"
        />

        <!-- Custom Date Pickers -->
        <v-text-field
          v-if="datePreset === 'custom'"
          v-model="startDate"
          type="date"
          label="From"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          style="width: 140px;"
          @change="fetchActiveReport"
        ></v-text-field>

        <v-text-field
          v-if="datePreset === 'custom'"
          v-model="endDate"
          type="date"
          label="To"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          style="width: 140px;"
          @change="fetchActiveReport"
        ></v-text-field>

        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-download-outline"
          class="text-capitalize font-weight-bold"
          :loading="exporting"
          @click="exportCurrentReport"
        >
          Export CSV
        </v-btn>
      </div>
    </div>

    <!-- Domain Navigation Tabs -->
    <v-card flat class="rounded-xl border bg-white mb-6">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        density="comfortable"
        @update:model-value="fetchActiveReport"
      >
        <v-tab value="students" class="text-capitalize font-weight-bold px-5">
          <v-icon start size="18">mdi-school-outline</v-icon>
          Student Course Progress
        </v-tab>
        <v-tab value="crm" class="text-capitalize font-weight-bold px-5">
          <v-icon start size="18">mdi-account-group-outline</v-icon>
          CRM & Leads
        </v-tab>
        <v-tab value="exams" class="text-capitalize font-weight-bold px-5">
          <v-icon start size="18">mdi-file-document-edit-outline</v-icon>
          Exams & Assessments
        </v-tab>
        <v-tab value="jobs" class="text-capitalize font-weight-bold px-5">
          <v-icon start size="18">mdi-briefcase-outline</v-icon>
          Jobs & Placements
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- TAB 1: STUDENT COURSE PROGRESS REPORT -->
    <div v-if="activeTab === 'students'">
      <!-- KPI Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="2">
          <v-card
            variant="outlined"
            class="rounded-xl pa-3 bg-blue-lighten-5 border-blue h-100 cursor-pointer kpi-card"
            :class="{ 'border-primary border-2': studentsFilter.status === 'all' && studentsFilter.examStatus === 'all' }"
            @click="filterByKpi('all')"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-primary text-uppercase">Total Enrolled</div>
                <div class="text-h4 font-weight-black text-blue-darken-4 mt-1">{{ studentsData?.summary?.totalStudents || 0 }}</div>
              </div>
              <v-avatar color="primary" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-school-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card
            variant="outlined"
            class="rounded-xl pa-3 bg-cyan-lighten-5 border-cyan h-100 cursor-pointer kpi-card"
            :class="{ 'border-primary border-2': studentsFilter.status === 'joined_this_month' }"
            @click="filterByKpi('joined')"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-cyan-darken-3 text-uppercase">Joined Period</div>
                <div class="text-h4 font-weight-black text-cyan-darken-4 mt-1">{{ studentsData?.summary?.joinedInPeriod || 0 }}</div>
              </div>
              <v-avatar color="cyan-darken-1" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-account-plus-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card
            variant="outlined"
            class="rounded-xl pa-3 bg-amber-lighten-5 border-amber h-100 cursor-pointer kpi-card"
            :class="{ 'border-primary border-2': studentsFilter.status === 'ongoing' }"
            @click="filterByKpi('ongoing')"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-amber-darken-3 text-uppercase">Ongoing</div>
                <div class="text-h4 font-weight-black text-amber-darken-4 mt-1">{{ studentsData?.summary?.ongoingCount || 0 }}</div>
              </div>
              <v-avatar color="amber" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-progress-clock</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card
            variant="outlined"
            class="rounded-xl pa-3 bg-emerald-lighten-5 border-emerald h-100 cursor-pointer kpi-card"
            :class="{ 'border-primary border-2': studentsFilter.status === 'completed_this_month' }"
            @click="filterByKpi('completed')"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-success text-uppercase">Completed</div>
                <div class="text-h4 font-weight-black text-success mt-1">{{ studentsData?.summary?.completedInPeriod || 0 }}</div>
              </div>
              <v-avatar color="success" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-check-circle-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card
            variant="outlined"
            class="rounded-xl pa-3 bg-teal-lighten-5 border-teal h-100 cursor-pointer kpi-card"
            :class="{ 'border-primary border-2': studentsFilter.examStatus === 'passed' }"
            @click="filterByKpi('passed')"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-teal-darken-3 text-uppercase">Passed Exams</div>
                <div class="text-h4 font-weight-black text-teal-darken-4 mt-1">{{ studentsData?.summary?.passedExamsInPeriod || 0 }}</div>
              </div>
              <v-avatar color="teal" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-certificate-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-purple-lighten-5 border-purple h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-purple-darken-3 text-uppercase">Completion Rate</div>
                <div class="text-h4 font-weight-black text-purple-darken-4 mt-1">{{ studentsData?.summary?.completionRate || 0 }}%</div>
              </div>
              <v-avatar color="purple" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-percent-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>


      <!-- Filter Bar -->
      <v-card flat class="pa-4 mb-6 rounded-xl border bg-white">
        <div class="d-flex align-center flex-wrap gap-3">
          <v-select
            v-model="studentsFilter.courseId"
            :items="[{ title: 'All Courses', value: 'all' }, ...filterOptions.courses.map((c: any) => ({ title: c.title, value: c.id }))]"
            label="Course"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 220px;"
            @update:model-value="fetchStudentsReport"
          ></v-select>

          <v-select
            v-model="studentsFilter.status"
            :items="[
              { title: 'All Statuses', value: 'all' },
              { title: 'Joined in Period', value: 'joined_this_month' },
              { title: 'Ongoing Learners', value: 'ongoing' },
              { title: 'Completed Courses', value: 'completed_this_month' }
            ]"
            label="Progression Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 190px;"
            @update:model-value="fetchStudentsReport"
          ></v-select>

          <v-select
            v-model="studentsFilter.examStatus"
            :items="[
              { title: 'All Exam Statuses', value: 'all' },
              { title: 'Exam Passed', value: 'passed' },
              { title: 'Certificate Received', value: 'certificate_received' },
              { title: 'Need to Attend Once Again', value: 'need_to_attend_again' },
              { title: 'Scheduled', value: 'scheduled' },
              { title: 'Approved / Ready', value: 'approved' },
              { title: 'Request Pending', value: 'pending' },
              { title: 'Rejected', value: 'rejected' },
              { title: 'Not Requested', value: 'not_requested' }
            ]"
            label="Exam Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 210px;"
            @update:model-value="fetchStudentsReport"
          ></v-select>

          <v-text-field
            v-model="studentsFilter.search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search student or course..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            clearable
            style="width: 220px;"
            @input="debounceFetchStudents"
          ></v-text-field>

          <v-spacer></v-spacer>
          <div class="text-caption text-grey font-weight-medium">
            Showing <strong>{{ studentsData?.studentsList?.length || 0 }}</strong> students
          </div>
        </div>
      </v-card>

      <!-- Students Table -->
      <div class="apple-table-card">
        <div v-if="loading" class="pa-12 text-center">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-3 text-secondary font-weight-bold">Loading student course progression...</div>
        </div>
        <v-data-table
          v-else
          :headers="studentHeaders"
          :items="studentsData?.studentsList || []"
          density="comfortable"
          class="bg-transparent"
        >
          <template v-slot:item.student_name="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-subtitle-2 text-grey-darken-3">{{ item.student_name }}</div>
              <div class="text-caption text-secondary">{{ item.student_email }}</div>
              <div v-if="item.student_phone" class="text-caption text-grey">{{ item.student_phone }}</div>
            </div>
          </template>

          <template v-slot:item.course_title="{ item }">
            <div class="font-weight-bold text-body-2">{{ item.course_title }}</div>
          </template>

          <template v-slot:item.enrolled_at="{ item }">
            <div class="text-caption font-weight-medium">{{ formatDate(item.enrolled_at) }}</div>
          </template>

          <template v-slot:item.completion_percentage="{ item }">
            <div style="min-width: 110px;">
              <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
                <span>{{ item.completion_percentage }}%</span>
                <span v-if="item.completion_percentage >= 100" class="text-success">Done</span>
              </div>
              <v-progress-linear
                :model-value="item.completion_percentage"
                :color="item.completion_percentage >= 100 ? 'success' : (item.completion_percentage > 40 ? 'primary' : 'amber')"
                height="6"
                rounded
              ></v-progress-linear>
            </div>
          </template>

          <template v-slot:item.progress_status="{ item }">
            <v-chip
              :color="item.progress_status === 'completed' ? 'success' : (item.progress_status === 'ongoing' ? 'amber' : 'primary')"
              size="small"
              class="font-weight-bold text-capitalize"
              variant="flat"
            >
              {{ item.progress_status }}
            </v-chip>
          </template>

          <template v-slot:item.exam_status="{ item }">
            <v-chip
              :color="getExamStatusColor(item.exam_status)"
              size="small"
              class="font-weight-bold"
              variant="flat"
            >
              <v-icon start size="14">{{ getExamStatusIcon(item.exam_status) }}</v-icon>
              {{ getExamStatusLabel(item.exam_status) }}
            </v-chip>
          </template>

          <template v-slot:item.cert_number="{ item }">
            <span v-if="item.cert_number" class="text-caption font-weight-bold text-primary">{{ item.cert_number }}</span>
            <span v-else class="text-caption text-grey">—</span>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- TAB 2: CRM & LEADS PIPELINE REPORT -->
    <div v-else-if="activeTab === 'crm'">
      <!-- KPI Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-blue-lighten-5 border-blue h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-primary text-uppercase">Total Leads</div>
                <div class="text-h4 font-weight-black text-blue-darken-4 mt-1">{{ crmData?.summary?.totalLeads || 0 }}</div>
              </div>
              <v-avatar color="primary" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-account-group-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-emerald-lighten-5 border-emerald h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-success text-uppercase">Converted</div>
                <div class="text-h4 font-weight-black text-success mt-1">{{ crmData?.summary?.convertedCount || 0 }}</div>
              </div>
              <v-avatar color="success" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-account-check-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-purple-lighten-5 border-purple h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-purple-darken-3 text-uppercase">Conversion Rate</div>
                <div class="text-h4 font-weight-black text-purple-darken-4 mt-1">{{ crmData?.summary?.conversionRate || 0 }}%</div>
              </div>
              <v-avatar color="purple" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-percent-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-amber-lighten-5 border-amber h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-amber-darken-3 text-uppercase">Open Leads</div>
                <div class="text-h4 font-weight-black text-amber-darken-4 mt-1">{{ crmData?.summary?.openCount || 0 }}</div>
              </div>
              <v-avatar color="amber" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-clock-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-cyan-lighten-5 border-cyan h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-cyan-darken-3 text-uppercase">Called / Active</div>
                <div class="text-h4 font-weight-black text-cyan-darken-4 mt-1">{{ (crmData?.summary?.calledCount || 0) + (crmData?.summary?.interestedCount || 0) }}</div>
              </div>
              <v-avatar color="cyan-darken-1" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-phone-in-talk-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-deep-orange-lighten-5 border-deep-orange h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-deep-orange-darken-3 text-uppercase">Lost / Rejected</div>
                <div class="text-h4 font-weight-black text-deep-orange-darken-4 mt-1">{{ crmData?.summary?.rejectedCount || 0 }}</div>
              </div>
              <v-avatar color="deep-orange" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-close-circle-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Agent Performance Table -->
      <v-card flat class="rounded-xl border bg-white pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon start size="20" color="primary">mdi-account-tie</v-icon>
          Counselor & Agent Performance
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="font-weight-bold">Agent Name</th>
              <th class="font-weight-bold text-center">Assigned Leads</th>
              <th class="font-weight-bold text-center">Contacted</th>
              <th class="font-weight-bold text-center">Interested</th>
              <th class="font-weight-bold text-center">Converted</th>
              <th class="font-weight-bold text-right">Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agent in (crmData?.agentPerformance || [])" :key="agent.agent_id">
              <td class="font-weight-bold">{{ agent.agent_name }}</td>
              <td class="text-center">{{ agent.assigned_leads }}</td>
              <td class="text-center">{{ agent.contacted_leads }}</td>
              <td class="text-center">{{ agent.interested_leads }}</td>
              <td class="text-center text-success font-weight-bold">{{ agent.converted_leads }}</td>
              <td class="text-right">
                <v-chip color="success" size="small" variant="flat" class="font-weight-bold">
                  {{ agent.conversion_rate_pct }}%
                </v-chip>
              </td>
            </tr>
            <tr v-if="!crmData?.agentPerformance?.length">
              <td colspan="6" class="text-center text-grey py-3">No agent lead assignments recorded in this period.</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Filter Bar -->
      <v-card flat class="pa-4 mb-6 rounded-xl border bg-white">
        <div class="d-flex align-center flex-wrap gap-3">
          <v-select
            v-model="crmFilter.status"
            :items="[
              { title: 'All Statuses', value: 'all' },
              { title: 'Open', value: 'open' },
              { title: 'Called', value: 'called' },
              { title: 'Interested', value: 'interested' },
              { title: 'Converted', value: 'converted' },
              { title: 'Rejected / Lost', value: 'rejected' }
            ]"
            label="Lead Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 170px;"
            @update:model-value="fetchCrmReport"
          ></v-select>

          <v-select
            v-model="crmFilter.source"
            :items="[
              { title: 'All Sources', value: 'all' },
              { title: 'Website', value: 'website' },
              { title: 'WhatsApp', value: 'whatsapp' },
              { title: 'Manual', value: 'manual' }
            ]"
            label="Source"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 160px;"
            @update:model-value="fetchCrmReport"
          ></v-select>

          <v-select
            v-model="crmFilter.agentId"
            :items="[{ title: 'All Agents', value: 'all' }, ...filterOptions.agents.map((a: any) => ({ title: a.name, value: a.id }))]"
            label="Assigned To"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 180px;"
            @update:model-value="fetchCrmReport"
          ></v-select>

          <v-text-field
            v-model="crmFilter.search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search lead name, email..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            clearable
            style="width: 220px;"
            @input="debounceFetchCrm"
          ></v-text-field>

          <v-spacer></v-spacer>
          <div class="text-caption text-grey font-weight-medium">
            Showing <strong>{{ crmData?.leadsList?.length || 0 }}</strong> leads
          </div>
        </div>
      </v-card>

      <!-- Leads Table -->
      <div class="apple-table-card">
        <div v-if="loading" class="pa-12 text-center">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-3 text-secondary font-weight-bold">Loading CRM pipeline data...</div>
        </div>
        <v-data-table
          v-else
          :headers="crmHeaders"
          :items="crmData?.leadsList || []"
          density="comfortable"
          class="bg-transparent"
        >
          <template v-slot:item.lead_name="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-subtitle-2">{{ item.lead_name }}</div>
              <div class="text-caption text-secondary">{{ item.email }}</div>
              <div v-if="item.phone" class="text-caption text-grey">{{ item.phone }}</div>
            </div>
          </template>

          <template v-slot:item.interested_course="{ item }">
            <div class="font-weight-medium text-body-2">{{ item.interested_course || 'General' }}</div>
          </template>

          <template v-slot:item.source="{ item }">
            <v-chip size="small" variant="tonal" class="text-capitalize font-weight-bold">
              {{ item.source }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getCrmStatusColor(item.status)"
              size="small"
              class="font-weight-bold text-capitalize"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.assigned_agent="{ item }">
            <span class="text-caption font-weight-bold text-grey-darken-2">{{ item.assigned_agent || 'Unassigned' }}</span>
          </template>

          <template v-slot:item.created_at="{ item }">
            <span class="text-caption">{{ formatDate(item.created_at) }}</span>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- TAB 3: EXAMS & ASSESSMENTS REPORT -->
    <div v-else-if="activeTab === 'exams'">
      <!-- KPI Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-blue-lighten-5 border-blue h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-primary text-uppercase">Total Attempts</div>
                <div class="text-h4 font-weight-black text-blue-darken-4 mt-1">{{ examsData?.summary?.totalAttempts || 0 }}</div>
              </div>
              <v-avatar color="primary" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-file-document-edit-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-emerald-lighten-5 border-emerald h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-success text-uppercase">Passed</div>
                <div class="text-h4 font-weight-black text-success mt-1">{{ examsData?.summary?.totalPassed || 0 }}</div>
              </div>
              <v-avatar color="success" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-check-decagram-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-teal-lighten-5 border-teal h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-teal-darken-3 text-uppercase">Pass Rate</div>
                <div class="text-h4 font-weight-black text-teal-darken-4 mt-1">{{ examsData?.summary?.passRate || 0 }}%</div>
              </div>
              <v-avatar color="teal" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-trophy-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-deep-orange-lighten-5 border-deep-orange h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-deep-orange-darken-3 text-uppercase">Failed</div>
                <div class="text-h4 font-weight-black text-deep-orange-darken-4 mt-1">{{ examsData?.summary?.totalFailed || 0 }}</div>
              </div>
              <v-avatar color="deep-orange" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-close-circle-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-purple-lighten-5 border-purple h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-purple-darken-3 text-uppercase">Avg Score</div>
                <div class="text-h4 font-weight-black text-purple-darken-4 mt-1">{{ examsData?.summary?.avgScore || 0 }}</div>
              </div>
              <v-avatar color="purple" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-chart-bell-curve</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Exam Breakdown Table -->
      <v-card flat class="rounded-xl border bg-white pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon start size="20" color="primary">mdi-format-list-checks</v-icon>
          Exam-wise Performance Overview
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="font-weight-bold">Exam Title</th>
              <th class="font-weight-bold">Course</th>
              <th class="font-weight-bold text-center">Attempts</th>
              <th class="font-weight-bold text-center">Passed</th>
              <th class="font-weight-bold text-center">Failed</th>
              <th class="font-weight-bold text-center">Pass Rate %</th>
              <th class="font-weight-bold text-right">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ex in (examsData?.examBreakdown || [])" :key="ex.exam_id">
              <td class="font-weight-bold">{{ ex.exam_title }}</td>
              <td>{{ ex.course_title || 'General' }}</td>
              <td class="text-center font-weight-bold">{{ ex.total_attempts }}</td>
              <td class="text-center text-success font-weight-bold">{{ ex.passed_count }}</td>
              <td class="text-center text-error font-weight-bold">{{ ex.failed_count }}</td>
              <td class="text-center">
                <v-chip :color="ex.pass_rate_pct >= 60 ? 'success' : 'amber'" size="small" variant="flat" class="font-weight-bold">
                  {{ ex.pass_rate_pct }}%
                </v-chip>
              </td>
              <td class="text-right font-weight-bold">{{ ex.avg_score }}</td>
            </tr>
            <tr v-if="!examsData?.examBreakdown?.length">
              <td colspan="7" class="text-center text-grey py-3">No exam attempt data found in this date range.</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Filter Bar -->
      <v-card flat class="pa-4 mb-6 rounded-xl border bg-white">
        <div class="d-flex align-center flex-wrap gap-3">
          <v-select
            v-model="examsFilter.examId"
            :items="[{ title: 'All Exams', value: 'all' }, ...filterOptions.exams.map((e: any) => ({ title: e.title, value: e.id }))]"
            label="Exam"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 250px;"
            @update:model-value="fetchExamsReport"
          ></v-select>

          <v-text-field
            v-model="examsFilter.search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search student or exam..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            clearable
            style="width: 240px;"
            @input="debounceFetchExams"
          ></v-text-field>

          <v-spacer></v-spacer>
          <div class="text-caption text-grey font-weight-medium">
            Showing <strong>{{ examsData?.attemptsList?.length || 0 }}</strong> attempts
          </div>
        </div>
      </v-card>

      <!-- Exam Attempts Table -->
      <div class="apple-table-card">
        <div v-if="loading" class="pa-12 text-center">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-3 text-secondary font-weight-bold">Loading exam evaluation records...</div>
        </div>
        <v-data-table
          v-else
          :headers="examHeaders"
          :items="examsData?.attemptsList || []"
          density="comfortable"
          class="bg-transparent"
        >
          <template v-slot:item.student_name="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-subtitle-2">{{ item.student_name }}</div>
              <div class="text-caption text-secondary">{{ item.student_email }}</div>
            </div>
          </template>

          <template v-slot:item.exam_title="{ item }">
            <div class="font-weight-bold text-body-2">{{ item.exam_title }}</div>
            <div class="text-caption text-secondary">{{ item.course_title }}</div>
          </template>

          <template v-slot:item.attempt_date="{ item }">
            <span class="text-caption font-weight-medium">{{ formatDate(item.attempt_date) }}</span>
          </template>

          <template v-slot:item.score="{ item }">
            <span class="font-weight-bold">{{ item.score }} / {{ item.total_marks || 100 }}</span>
          </template>

          <template v-slot:item.passed="{ item }">
            <v-chip
              :color="item.passed ? 'success' : 'error'"
              size="small"
              class="font-weight-bold text-capitalize"
              variant="flat"
            >
              {{ item.passed ? 'Passed' : 'Failed' }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- TAB 4: JOBS & PLACEMENTS REPORT -->
    <div v-else-if="activeTab === 'jobs'">
      <!-- KPI Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-blue-lighten-5 border-blue h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-primary text-uppercase">Active Openings</div>
                <div class="text-h4 font-weight-black text-blue-darken-4 mt-1">{{ jobsData?.summary?.totalActiveJobs || 0 }}</div>
              </div>
              <v-avatar color="primary" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-briefcase-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-cyan-lighten-5 border-cyan h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-cyan-darken-3 text-uppercase">Applications</div>
                <div class="text-h4 font-weight-black text-cyan-darken-4 mt-1">{{ jobsData?.summary?.totalApplications || 0 }}</div>
              </div>
              <v-avatar color="cyan-darken-1" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-file-account-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-amber-lighten-5 border-amber h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-amber-darken-3 text-uppercase">Shortlisted</div>
                <div class="text-h4 font-weight-black text-amber-darken-4 mt-1">{{ jobsData?.summary?.shortlistedCount || 0 }}</div>
              </div>
              <v-avatar color="amber" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-star-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-purple-lighten-5 border-purple h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-purple-darken-3 text-uppercase">Interviews</div>
                <div class="text-h4 font-weight-black text-purple-darken-4 mt-1">{{ jobsData?.summary?.interviewsCount || 0 }}</div>
              </div>
              <v-avatar color="purple" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-account-clock-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-emerald-lighten-5 border-emerald h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-success text-uppercase">Placed</div>
                <div class="text-h4 font-weight-black text-success mt-1">{{ jobsData?.summary?.placedCount || 0 }}</div>
              </div>
              <v-avatar color="success" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-medal-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-card variant="outlined" class="rounded-xl pa-3 bg-teal-lighten-5 border-teal h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-teal-darken-3 text-uppercase">Placement Rate</div>
                <div class="text-h4 font-weight-black text-teal-darken-4 mt-1">{{ jobsData?.summary?.placementRate || 0 }}%</div>
              </div>
              <v-avatar color="teal" size="38" rounded="lg">
                <v-icon color="white" size="20">mdi-percent-outline</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Top Hiring Companies -->
      <v-card flat class="rounded-xl border bg-white pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon start size="20" color="primary">mdi-domain</v-icon>
          Top Hiring Companies
        </div>
        <v-row>
          <v-col v-for="comp in (jobsData?.topCompanies || []).slice(0, 4)" :key="comp.company" cols="12" sm="6" md="3">
            <div class="pa-3 rounded-lg border bg-grey-lighten-5">
              <div class="font-weight-bold text-subtitle-2 text-truncate" :title="comp.company">{{ comp.company }}</div>
              <div class="d-flex justify-space-between text-caption text-secondary mt-2">
                <span>Jobs: <strong>{{ comp.active_postings }}</strong></span>
                <span>Applications: <strong>{{ comp.applications_received }}</strong></span>
                <span class="text-success">Shortlisted: <strong>{{ comp.shortlisted_candidates }}</strong></span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Filter Bar -->
      <v-card flat class="pa-4 mb-6 rounded-xl border bg-white">
        <div class="d-flex align-center flex-wrap gap-3">
          <v-select
            v-model="jobsFilter.categoryId"
            :items="[{ title: 'All Categories', value: 'all' }, ...filterOptions.categories.map((c: any) => ({ title: c.name, value: c.id }))]"
            label="Job Category"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 220px;"
            @update:model-value="fetchJobsReport"
          ></v-select>

          <v-select
            v-model="jobsFilter.status"
            :items="[
              { title: 'All Statuses', value: 'all' },
              { title: 'Applied', value: 'applied' },
              { title: 'Viewed', value: 'viewed' },
              { title: 'Shortlisted', value: 'shortlisted' },
              { title: 'Rejected', value: 'rejected' }
            ]"
            label="Application Status"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="width: 180px;"
            @update:model-value="fetchJobsReport"
          ></v-select>

          <v-text-field
            v-model="jobsFilter.search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search candidate, company..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            clearable
            style="width: 240px;"
            @input="debounceFetchJobs"
          ></v-text-field>

          <v-spacer></v-spacer>
          <div class="text-caption text-grey font-weight-medium">
            Showing <strong>{{ jobsData?.applicationsList?.length || 0 }}</strong> applications
          </div>
        </div>
      </v-card>

      <!-- Applications Table -->
      <div class="apple-table-card">
        <div v-if="loading" class="pa-12 text-center">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-3 text-secondary font-weight-bold">Loading job application data...</div>
        </div>
        <v-data-table
          v-else
          :headers="jobHeaders"
          :items="jobsData?.applicationsList || []"
          density="comfortable"
          class="bg-transparent"
        >
          <template v-slot:item.applicant_name="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-subtitle-2">{{ item.applicant_name }}</div>
              <div class="text-caption text-secondary">{{ item.applicant_email }}</div>
              <div v-if="item.applicant_phone" class="text-caption text-grey">{{ item.applicant_phone }}</div>
            </div>
          </template>

          <template v-slot:item.job_title="{ item }">
            <div class="font-weight-bold text-body-2">{{ item.job_title }}</div>
            <div class="text-caption font-weight-medium text-primary">{{ item.company }}</div>
          </template>

          <template v-slot:item.category_name="{ item }">
            <span class="text-caption text-secondary">{{ item.category_name || 'General' }}</span>
          </template>

          <template v-slot:item.applied_at="{ item }">
            <span class="text-caption font-weight-medium">{{ formatDate(item.applied_at) }}</span>
          </template>

          <template v-slot:item.experience_years="{ item }">
            <span class="text-caption">{{ item.experience_years }} yrs</span>
          </template>

          <template v-slot:item.application_status="{ item }">
            <v-chip
              :color="getJobStatusColor(item.application_status)"
              size="small"
              class="font-weight-bold text-capitalize"
              variant="flat"
            >
              {{ item.application_status }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useApi } from '@/composables/useApi';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  role: ['super_admin', 'sub_admin', 'lms_user', 'crm_agent', 'placement_coordinator', 'tutor']
});

const api = useApi();
const loading = ref(false);
const exporting = ref(false);

const activeTab = ref('students');
const datePreset = ref('this_month');
const startDate = ref('');
const endDate = ref('');

// Filter Options
const filterOptions = reactive({
  courses: [] as any[],
  categories: [] as any[],
  agents: [] as any[],
  exams: [] as any[]
});

// Domain Filter States
const studentsFilter = reactive({ courseId: 'all', status: 'all', examStatus: 'all', search: '' });
const crmFilter = reactive({ status: 'all', source: 'all', agentId: 'all', search: '' });
const examsFilter = reactive({ examId: 'all', search: '' });
const jobsFilter = reactive({ categoryId: 'all', status: 'all', search: '' });

// Data Holders
const studentsData = ref<any>(null);
const crmData = ref<any>(null);
const examsData = ref<any>(null);
const jobsData = ref<any>(null);

// Table Headers
const studentHeaders = [
  { title: 'Student', key: 'student_name' },
  { title: 'Course', key: 'course_title' },
  { title: 'Enrolled Date', key: 'enrolled_at' },
  { title: 'Progress', key: 'completion_percentage' },
  { title: 'Status', key: 'progress_status' },
  { title: 'Exam Status', key: 'exam_status' },
  { title: 'Certificate', key: 'cert_number' }
];

const crmHeaders = [
  { title: 'Lead Details', key: 'lead_name' },
  { title: 'Target Course', key: 'interested_course' },
  { title: 'Source', key: 'source' },
  { title: 'Status', key: 'status' },
  { title: 'Assigned Agent', key: 'assigned_agent' },
  { title: 'Date Added', key: 'created_at' }
];

const examHeaders = [
  { title: 'Student', key: 'student_name' },
  { title: 'Exam & Course', key: 'exam_title' },
  { title: 'Attempt Date', key: 'attempt_date' },
  { title: 'Score', key: 'score' },
  { title: 'Result', key: 'passed' }
];

const jobHeaders = [
  { title: 'Candidate', key: 'applicant_name' },
  { title: 'Job & Company', key: 'job_title' },
  { title: 'Category', key: 'category_name' },
  { title: 'Applied Date', key: 'applied_at' },
  { title: 'Experience', key: 'experience_years' },
  { title: 'Status', key: 'application_status' }
];

// Presets Handler
const onPresetChange = (preset: string) => {
  const now = dayjs();
  if (preset === 'this_month') {
    startDate.value = now.startOf('month').format('YYYY-MM-DD');
    endDate.value = now.endOf('month').format('YYYY-MM-DD');
  } else if (preset === 'last_month') {
    const lastMonth = now.subtract(1, 'month');
    startDate.value = lastMonth.startOf('month').format('YYYY-MM-DD');
    endDate.value = lastMonth.endOf('month').format('YYYY-MM-DD');
  } else if (preset === 'this_quarter') {
    startDate.value = now.subtract(3, 'month').startOf('month').format('YYYY-MM-DD');
    endDate.value = now.format('YYYY-MM-DD');
  } else if (preset === 'this_year') {
    startDate.value = now.startOf('year').format('YYYY-MM-DD');
    endDate.value = now.endOf('year').format('YYYY-MM-DD');
  }
  fetchActiveReport();
};

const filterByKpi = (type: string) => {
  if (type === 'all') {
    studentsFilter.status = 'all';
    studentsFilter.examStatus = 'all';
  } else if (type === 'joined') {
    studentsFilter.status = 'joined_this_month';
    studentsFilter.examStatus = 'all';
  } else if (type === 'ongoing') {
    studentsFilter.status = 'ongoing';
    studentsFilter.examStatus = 'all';
  } else if (type === 'completed') {
    studentsFilter.status = 'completed_this_month';
    studentsFilter.examStatus = 'all';
  } else if (type === 'passed') {
    studentsFilter.status = 'all';
    studentsFilter.examStatus = 'passed';
  }
  fetchStudentsReport();
};

// Fetchers
const fetchFiltersMeta = async () => {
  try {
    const res = await api.get('/reports/filters-meta');
    const data = res.data || res;
    filterOptions.courses = data.courses || [];
    filterOptions.categories = data.categories || [];
    filterOptions.agents = data.agents || [];
    filterOptions.exams = data.exams || [];
  } catch (err) {
    console.error('Failed to load filter metadata:', err);
  }
};

const fetchStudentsReport = async () => {
  loading.value = true;
  try {
    const res = await api.get('/reports/students-courses', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        courseId: studentsFilter.courseId,
        status: studentsFilter.status,
        examStatus: studentsFilter.examStatus,
        search: studentsFilter.search
      }
    });
    studentsData.value = res.data || res;
  } catch (err) {
    console.error('Error fetching students report:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCrmReport = async () => {
  loading.value = true;
  try {
    const res = await api.get('/reports/crm', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        source: crmFilter.source,
        status: crmFilter.status,
        agentId: crmFilter.agentId,
        search: crmFilter.search
      }
    });
    crmData.value = res.data || res;
  } catch (err) {
    console.error('Error fetching CRM report:', err);
  } finally {
    loading.value = false;
  }
};

const fetchExamsReport = async () => {
  loading.value = true;
  try {
    const res = await api.get('/reports/exams', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        examId: examsFilter.examId,
        search: examsFilter.search
      }
    });
    examsData.value = res.data || res;
  } catch (err) {
    console.error('Error fetching exams report:', err);
  } finally {
    loading.value = false;
  }
};

const fetchJobsReport = async () => {
  loading.value = true;
  try {
    const res = await api.get('/reports/jobs', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        categoryId: jobsFilter.categoryId,
        status: jobsFilter.status,
        search: jobsFilter.search
      }
    });
    jobsData.value = res.data || res;
  } catch (err) {
    console.error('Error fetching jobs report:', err);
  } finally {
    loading.value = false;
  }
};

const fetchActiveReport = () => {
  if (activeTab.value === 'students') fetchStudentsReport();
  else if (activeTab.value === 'crm') fetchCrmReport();
  else if (activeTab.value === 'exams') fetchExamsReport();
  else if (activeTab.value === 'jobs') fetchJobsReport();
};

// Debounce Search Helpers
let searchTimeout: any = null;
const debounceFetchStudents = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchStudentsReport, 350);
};
const debounceFetchCrm = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchCrmReport, 350);
};
const debounceFetchExams = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchExamsReport, 350);
};
const debounceFetchJobs = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchJobsReport, 350);
};

// Color Helpers
const getExamStatusLabel = (st: string) => {
  switch (st) {
    case 'passed': return 'Exam Passed';
    case 'certificate_received': return 'Certificate Received';
    case 'need_to_attend_again': return 'Need to Attend Once Again';
    case 'scheduled': return 'Scheduled';
    case 'approved': return 'Approved / Ready';
    case 'pending': return 'Request Pending';
    case 'rejected': return 'Rejected';
    case 'not_requested': return 'Not Requested';
    default: return st || 'Not Requested';
  }
};

const getExamStatusColor = (st: string) => {
  switch (st) {
    case 'passed': return 'teal';
    case 'certificate_received': return 'indigo';
    case 'need_to_attend_again': return 'deep-orange';
    case 'scheduled': return 'info';
    case 'approved': return 'success';
    case 'pending': return 'amber';
    case 'rejected': return 'error';
    default: return 'grey-lighten-2';
  }
};

const getExamStatusIcon = (st: string) => {
  switch (st) {
    case 'passed': return 'mdi-check-decagram';
    case 'certificate_received': return 'mdi-certificate';
    case 'need_to_attend_again': return 'mdi-refresh-circle';
    case 'scheduled': return 'mdi-calendar-check';
    case 'approved': return 'mdi-check-circle-outline';
    case 'pending': return 'mdi-clock-alert-outline';
    case 'rejected': return 'mdi-close-circle-outline';
    default: return 'mdi-minus-circle-outline';
  }
};

const getCrmStatusColor = (st: string) => {
  switch (st) {
    case 'converted': return 'success';
    case 'open': return 'amber';
    case 'called': return 'info';
    case 'interested': return 'cyan';
    case 'rejected':
    case 'not_interested': return 'error';
    default: return 'grey';
  }
};

const getJobStatusColor = (st: string) => {
  switch (st) {
    case 'shortlisted': return 'amber';
    case 'placed': return 'success';
    case 'viewed': return 'info';
    case 'rejected': return 'error';
    case 'applied': return 'primary';
    default: return 'grey';
  }
};

const formatDate = (date: string) => date ? dayjs(date).format('MMM D, YYYY') : '—';

// CSV Export Generator
const exportCurrentReport = () => {
  exporting.value = true;
  try {
    let rows: any[] = [];
    let filename = `report_${activeTab.value}_${dayjs().format('YYYY-MM-DD')}.csv`;

    if (activeTab.value === 'students') {
      const list = studentsData.value?.studentsList || [];
      rows = list.map((s: any) => ({
        'Student Name': s.student_name,
        'Email': s.student_email,
        'Phone': s.student_phone || '',
        'Course': s.course_title,
        'Enrolled Date': formatDate(s.enrolled_at),
        'Completion Date': formatDate(s.completed_at),
        'Progress %': `${s.completion_percentage}%`,
        'Status': s.progress_status,
        'Exam Status': getExamStatusLabel(s.exam_status),
        'Certificate Number': s.cert_number || 'N/A'
      }));
    } else if (activeTab.value === 'crm') {
      const list = crmData.value?.leadsList || [];
      rows = list.map((l: any) => ({
        'Lead Name': l.lead_name,
        'Email': l.email || '',
        'Phone': l.phone || '',
        'Interested Course': l.interested_course || '',
        'Source': l.source,
        'Status': l.status,
        'Assigned Agent': l.assigned_agent || 'Unassigned',
        'Date Created': formatDate(l.created_at)
      }));
    } else if (activeTab.value === 'exams') {
      const list = examsData.value?.attemptsList || [];
      rows = list.map((e: any) => ({
        'Student Name': e.student_name,
        'Email': e.student_email,
        'Exam Title': e.exam_title,
        'Course': e.course_title || '',
        'Attempt Date': formatDate(e.attempt_date),
        'Score': e.score,
        'Total Marks': e.total_marks || 100,
        'Result': e.passed ? 'PASSED' : 'FAILED'
      }));
    } else if (activeTab.value === 'jobs') {
      const list = jobsData.value?.applicationsList || [];
      rows = list.map((j: any) => ({
        'Candidate Name': j.applicant_name,
        'Email': j.applicant_email,
        'Phone': j.applicant_phone || '',
        'Job Title': j.job_title,
        'Company': j.company,
        'Category': j.category_name || '',
        'Applied Date': formatDate(j.applied_at),
        'Experience (Years)': j.experience_years || 0,
        'Status': j.application_status
      }));
    }

    if (!rows.length) {
      alert('No records available to export for the current filters.');
      exporting.value = false;
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to generate CSV export:', err);
    alert('An error occurred while generating the CSV report.');
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  onPresetChange('this_month');
  fetchFiltersMeta();
});
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.cursor-pointer { cursor: pointer; }
.border-2 { border-width: 2px !important; }

.kpi-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.border-blue { border-color: rgba(33, 150, 243, 0.4) !important; }
.border-cyan { border-color: rgba(0, 188, 212, 0.4) !important; }
.border-amber { border-color: rgba(255, 193, 7, 0.4) !important; }
.border-emerald { border-color: rgba(76, 175, 80, 0.4) !important; }
.border-teal { border-color: rgba(0, 150, 136, 0.4) !important; }
.border-purple { border-color: rgba(156, 39, 176, 0.4) !important; }
.border-deep-orange { border-color: rgba(255, 87, 34, 0.4) !important; }

.apple-table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
