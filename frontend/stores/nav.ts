import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useApi } from '@/composables/useApi';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  badge?: string | number;
  section?: string;
  target?: string;
  action?: string;
}

export const useNavStore = defineStore('nav', {
  state: () => ({
    isCollapsed: false,
    navItems: [
      // MAIN
      { label: 'Dashboard', icon: 'mdi-view-dashboard-outline', route: '/dashboard', roles: ['super_admin', 'sub_admin', 'crm_agent', 'tutor', 'student', 'employer', 'lms_user', 'placement_coordinator', 'finance_staff'] },
      // CRM
      { label: 'Leads', icon: 'mdi-account-group-outline', route: '/dashboard/leads', roles: ['super_admin', 'crm_agent'], section: 'CRM', badge: undefined },
      { label: 'Follow-ups', icon: 'mdi-calendar-check-outline', route: '/dashboard/leads/followups', roles: ['super_admin', 'crm_agent'], section: 'CRM', badge: undefined },
      
      // LMS (Tutor & Student)
      { label: 'Courses', icon: 'mdi-book-open-page-variant-outline', route: '/dashboard/tutor/courses', roles: ['tutor'], section: 'LMS' },
      { label: 'Courses', icon: 'mdi-book-open-page-variant-outline', route: '/dashboard/courses', roles: ['student'], section: 'LMS' },
      { label: 'My Learning', icon: 'mdi-play-circle-outline', route: '/dashboard/student/my-courses', roles: ['student'], section: 'LMS' },
      { label: 'Assignments', icon: 'mdi-file-edit-outline', route: '/dashboard/student/assignments', roles: ['student'], section: 'LMS', badge: undefined },
      { label: 'Students', icon: 'mdi-school-outline', route: '/dashboard/students', roles: ['super_admin', 'crm_agent'], section: 'LMS' },
      
      // ADMIN COURSES (LMS)
      { label: 'Courses', icon: 'mdi-book-open-page-variant-outline', route: '/dashboard/courses', roles: ['super_admin', 'lms_user'], section: 'LMS' },
      { label: 'Categories', icon: 'mdi-shape-outline', route: '/dashboard/admin/course-categories', roles: ['super_admin', 'lms_user'], section: 'LMS' },
      { label: 'Live Events', icon: 'mdi-video-outline', route: '/dashboard/admin/live-events', roles: ['super_admin', 'lms_user'], section: 'LMS' },
      { label: 'Live Events', icon: 'mdi-video-outline', route: '/dashboard/tutor/live-events', roles: ['tutor'], section: 'LMS' },
      { label: 'Course Approvals', icon: 'mdi-check-decagram-outline', route: '/dashboard/admin/course-approvals', roles: ['super_admin', 'lms_user'], section: 'LMS', badge: undefined },
      
      // EXAMS
      { label: 'Exams', icon: 'mdi-file-document-edit-outline', route: '/dashboard/exams', roles: ['super_admin', 'lms_user', 'tutor', 'student'], section: 'EXAMS' },
      { label: 'Talent Hunt', icon: 'mdi-earth', route: '/dashboard/admin/public-exams', roles: ['super_admin', 'lms_user'], section: 'EXAMS' },
      { label: 'Results', icon: 'mdi-trophy-outline', route: '/dashboard/exams/grading', roles: ['super_admin', 'lms_user', 'tutor'], section: 'EXAMS' },
      { label: 'Certificates', icon: 'mdi-certificate-outline', route: '/dashboard/certificates', roles: ['super_admin', 'lms_user', 'tutor', 'student'], section: 'EXAMS' },
      { label: 'Proctoring Logs', icon: 'mdi-cctv', route: '/dashboard/admin/proctoring', roles: ['super_admin', 'lms_user', 'tutor'], section: 'EXAMS' },
      { label: 'Results', icon: 'mdi-trophy-outline', route: '/dashboard/student/results', roles: ['student'], section: 'EXAMS' },
      
      // JOBS
      { label: 'Job Board', icon: 'mdi-briefcase-outline', route: '/dashboard/jobs', roles: ['super_admin', 'placement_coordinator', 'student'], section: 'JOBS' },
      { label: 'Manage Jobs', icon: 'mdi-briefcase-edit-outline', route: '/dashboard/admin/jobs', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS' },
      { label: 'Job Approvals', icon: 'mdi-briefcase-check', route: '/dashboard/admin/job-approvals', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS', badge: undefined },
      { label: 'Job Categories', icon: 'mdi-shape-outline', route: '/dashboard/admin/job-categories', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS' },
      { label: 'Manage Jobs', icon: 'mdi-briefcase-edit-outline', route: '/dashboard/employer/jobs', roles: ['employer'], section: 'JOBS' },
      { label: 'Applications', icon: 'mdi-briefcase-check-outline', route: '/dashboard/student/applications', roles: ['student'], section: 'JOBS' },
      { label: 'Candidates', icon: 'mdi-account-search', route: '/dashboard/employer/applications', roles: ['employer'], section: 'JOBS' },
      { label: 'Interviews', icon: 'mdi-account-clock-outline', route: '/dashboard/admin/interviews', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS' },
      { label: 'Interviews', icon: 'mdi-account-clock-outline', route: '/dashboard/interviews', roles: ['student'], section: 'JOBS' },
      { label: 'Interviews', icon: 'mdi-account-clock-outline', route: '/dashboard/employer/interviews', roles: ['employer'], section: 'JOBS' },
      { label: 'Placements', icon: 'mdi-medal-outline', route: '/dashboard/placements', roles: ['student'], section: 'JOBS' },
      
      // FINANCE
      { label: 'Analytics', icon: 'mdi-chart-line', route: '/dashboard/admin/finance', roles: ['super_admin'], section: 'FINANCE' },
      { label: 'Expenses', icon: 'mdi-currency-usd-off', route: '/dashboard/admin/finance/expenses', roles: ['super_admin', 'finance_staff'], section: 'FINANCE' },
      { label: 'Student Accounts', icon: 'mdi-account-group-outline', route: '/dashboard/students', roles: ['finance_staff'], section: 'FINANCE' },
      { label: 'Invoices', icon: 'mdi-receipt', route: '/dashboard/admin/invoices', roles: ['super_admin', 'finance_staff'], section: 'FINANCE' },
      { label: 'Offline Payments', icon: 'mdi-bank-transfer', route: '/dashboard/admin/finance/offline-payments', roles: ['super_admin', 'finance_staff'], badge: undefined, section: 'FINANCE' },
      { label: 'Payments', icon: 'mdi-receipt', route: '/dashboard/student/payments', roles: ['student'], section: 'FINANCE' },
      
      // USERS
      { label: 'Tutors', icon: 'mdi-account-tie', route: '/dashboard/admin/tutors', roles: ['super_admin', 'lms_user'], section: 'LMS' },
      { label: 'Tutor Approvals', icon: 'mdi-account-clock', route: '/dashboard/admin/tutor-approvals', roles: ['super_admin', 'lms_user'], section: 'LMS', badge: undefined },
      { label: 'Course Q&A', icon: 'mdi-forum', route: '/dashboard/tutor/qa', roles: ['tutor'], section: 'LMS', badge: undefined },
      { label: 'Course Q&A', icon: 'mdi-forum', route: '/dashboard/admin/qa', roles: ['super_admin', 'lms_user'], section: 'LMS', badge: undefined },
      { label: 'Employers', icon: 'mdi-domain', route: '/dashboard/admin/employers', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS' },
      { label: 'Employer Approvals', icon: 'mdi-domain-plus', route: '/dashboard/admin/employer-approvals', roles: ['super_admin', 'placement_coordinator'], section: 'JOBS', badge: undefined },
      
      // ANNOUNCEMENTS
      { label: 'Notice Board', icon: 'mdi-bullhorn-outline', route: '/dashboard/admin/notice-board', roles: ['super_admin'], section: 'ANNOUNCEMENTS' },

      // SETTINGS
      { label: 'System Users', icon: 'mdi-account-group', route: '/dashboard/admin/settings/system-users', roles: ['super_admin'], section: 'SETTINGS' },
      { label: 'Profile', icon: 'mdi-account-outline', route: '/dashboard/profile', roles: ['super_admin', 'sub_admin', 'tutor', 'student', 'employer', 'crm_agent', 'placement_coordinator', 'finance_staff', 'lms_user', 'support_staff'], section: 'SETTINGS' },
      { label: 'Logout', icon: 'mdi-logout', action: 'logout', roles: ['super_admin', 'sub_admin', 'tutor', 'student', 'employer', 'crm_agent', 'placement_coordinator', 'finance_staff', 'lms_user', 'support_staff'], section: 'SETTINGS' },
    ] as NavItem[]
  }),
  getters: {
    filteredNavItems: (state) => {
      const authStore = useAuthStore();
      const role = authStore.userRole;
      
      return state.navItems
        .filter(item => {
          // Check standard roles
          if (item.roles.includes(role)) return true;
          
          // Sub Admin dynamic permissions
          if (role === 'sub_admin') {
            const perms = authStore.user?.permissions || {};
            if (item.label === 'Students' && perms.students?.view) return true;
            if (item.label === 'Tutors' && perms.tutors?.view) return true;
            if (item.label === 'Courses' && perms.courses?.view) return true;
            if (item.label === 'Employers' && perms.employers?.view) return true;
            if (item.section === 'JOBS' && perms.jobs?.view) return true;
            if (item.section === 'CRM' && perms.crm?.view) return true;
            if (item.section === 'EXAMS' && perms.exams?.view) return true;
            if (item.section === 'FINANCE' && perms.finance?.view) return true;
            if (item.label === 'Dashboard') return true;
          }
          
          return false;
        })
        .map(item => {
          // Dynamically point "Dashboard" to the role-specific landing page
          if (item.label === 'Dashboard' && item.route === '/dashboard') {
            let roleRoute = '/dashboard';
            if (role === 'super_admin' || role === 'sub_admin') roleRoute = '/dashboard/admin';
            else if (role === 'tutor') roleRoute = '/dashboard/tutor';
            else if (role === 'student') roleRoute = '/dashboard/student';
            else if (role === 'employer') roleRoute = '/dashboard/employer';
            else if (role === 'crm_agent') roleRoute = '/dashboard/crm';
            else if (role === 'lms_user') roleRoute = '/dashboard/lms';
            else if (role === 'placement_coordinator') roleRoute = '/dashboard/admin/placements';
            else if (role === 'finance_staff') roleRoute = '/dashboard/admin/finance';
            return { ...item, route: roleRoute };
          }

          // Dynamically point "Courses" to the role-specific courses page
          if (item.label === 'Courses' && item.route === '/dashboard/courses') {
            // super_admin goes to /dashboard/courses (all courses)
            // tutor uses /dashboard/tutor/courses which is hardcoded above
            if (role === 'student') return { ...item, route: '/dashboard/courses' };
          }

          // Dynamically point "Profile" to the role-specific profile/settings page
          if (item.label === 'Profile' && item.route === '/dashboard/profile') {
            let profileRoute = '/dashboard/profile';
            if (role === 'student') profileRoute = '/dashboard/student/settings';
            else if (role === 'tutor') profileRoute = '/dashboard/tutor/settings';
            else if (role === 'super_admin' || role === 'sub_admin' || role === 'crm_agent' || role === 'placement_coordinator' || role === 'finance_staff' || role === 'lms_user' || role === 'support_staff') profileRoute = '/dashboard/admin/settings';
            else if (role === 'employer') profileRoute = '/dashboard/employer/company/profile';
            return { ...item, route: profileRoute };
          }

          return item;
        });
    },
    sections(): string[] {
      // Just map from filteredNavItems instead of duplicating logic
      return [...new Set(this.filteredNavItems.map((item: any) => item.section || ''))];
    }
  },
  actions: {
    async fetchBadges() {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const api = useApi();

      // 2. Fetch CRM Leads & Follow-ups
      if (['super_admin', 'crm_agent'].includes(authStore.userRole)) {
        try {
          const { data } = await api.get('/crm/stats');
          const leadsItem = this.navItems.find(i => i.label === 'Leads');
          if (leadsItem) {
            leadsItem.badge = data.openLeads > 0 ? data.openLeads : undefined;
          }
          const followupsItem = this.navItems.find(i => i.label === 'Follow-ups');
          if (followupsItem) {
            followupsItem.badge = data.todayFollowups > 0 ? data.todayFollowups : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch CRM stats badge counts:', err);
        }
      }

      // 3. Fetch Assignments
      if (authStore.userRole === 'student') {
        try {
          const { data } = await api.get('/lms/student/assignments');
          const pendingCount = Array.isArray(data) ? data.filter((a: any) => !a.submission_status).length : 0;
          const item = this.navItems.find(i => i.label === 'Assignments');
          if (item) {
            item.badge = pendingCount > 0 ? pendingCount : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch assignments badge count:', err);
        }
      }

      // 4. Fetch Tutor Approval badge (pending count)
      if (authStore.userRole === 'super_admin') {
        try {
          const { data } = await api.get('/admin/tutor-approvals');
          const pendingCount = Array.isArray(data) ? data.length : 0;
          const item = this.navItems.find(i => i.label === 'Tutor Approvals');
          if (item) {
            item.badge = pendingCount > 0 ? pendingCount : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch tutor approval badge count:', err);
        }

        // Fetch Employer Approval badge
        try {
          const { data } = await api.get('/admin/employer-approvals');
          const pendingCount = Array.isArray(data) ? data.length : 0;
          const item = this.navItems.find(i => i.label === 'Employer Approvals');
          if (item) {
            item.badge = pendingCount > 0 ? pendingCount : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch employer approval badge count:', err);
        }

        // Fetch Job Approval badge
        try {
          const { data } = await api.get('/admin/job-approvals');
          const pendingCount = Array.isArray(data) ? data.length : 0;
          const item = this.navItems.find(i => i.label === 'Job Approvals');
          if (item) {
            item.badge = pendingCount > 0 ? pendingCount : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch job approval badge count:', err);
        }

        // Fetch Course Approvals badge
        try {
          const { data } = await api.get('/admin/courses/pending-approvals');
          const pendingCount = Array.isArray(data) ? data.length : 0;
          const item = this.navItems.find(i => i.label === 'Course Approvals');
          if (item) {
            item.badge = pendingCount > 0 ? pendingCount : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch course approval badge count:', err);
        }

        // Fetch Admin Q&A unanswered badge
        try {
          const { data } = await api.get('/lms/qa/admin/qa/stats');
          const unanswered = data.pending ?? 0;
          const qaItem = this.navItems.find(i => i.label === 'Course Q&A' && i.route === '/dashboard/admin/qa');
          if (qaItem) {
            qaItem.badge = unanswered > 0 ? unanswered : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch admin Q&A badge count:', err);
        }
      }

      // Fetch Tutor Q&A unanswered badge
      if (authStore.userRole === 'tutor') {
        try {
          const { data } = await api.get('/lms/qa/tutor/qa/stats');
          const unanswered = data.unanswered ?? 0;
          const qaItem = this.navItems.find(i => i.label === 'Course Q&A' && i.route === '/dashboard/tutor/qa');
          if (qaItem) {
            qaItem.badge = unanswered > 0 ? unanswered : undefined;
          }
        } catch (err) {
          console.error('Failed to fetch tutor Q&A badge count:', err);
        }
      }
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
      }
    },
    initSidebar() {
      this.isCollapsed = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sidebarCollapsed');
      }
    }
  }
});
