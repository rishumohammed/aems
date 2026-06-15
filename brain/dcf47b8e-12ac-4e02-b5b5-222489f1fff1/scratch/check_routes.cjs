const fs = require('fs');
const path = require('path');

const navItems = [
    { label: 'View Website', route: '/' },
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Students', route: '/dashboard/students' },
    { label: 'My Courses', route: '/dashboard/tutor/courses' },
    { label: 'Create Course', route: '/dashboard/courses/create' },
    { label: 'My Students', route: '/dashboard/tutor/students' },
    { label: 'Reviews', route: '/dashboard/tutor/reviews' },
    { label: 'Earnings', route: '/dashboard/tutor/earnings' },
    { label: 'Resources', route: '/dashboard/tutor/resources' },
    { label: 'Leads', route: '/dashboard/crm' },
    { label: 'Follow-ups', route: '/dashboard/crm/followups' },
    { label: 'Lead Forms', route: '/dashboard/crm/forms' },
    { label: 'Tutor Approvals', route: '/dashboard/admin/tutor-approvals' },
    { label: 'Explore Courses', route: '/dashboard/courses' },
    { label: 'My Learning', route: '/dashboard/student' },
    { label: 'My Enrolled Courses', route: '/dashboard/student/my-courses' },
    { label: 'Quizzes', route: '/dashboard/tutor/quizzes' },
    { label: 'Live Sessions', route: '/dashboard/sessions' },
    { label: 'Exam Portal', route: '/dashboard/exams' },
    { label: 'Results & Grading', route: '/dashboard/exams/grading' },
    { label: 'Proctoring Logs', route: '/dashboard/admin/proctoring' },
    { label: 'Certificates', route: '/dashboard/certificates' },
    { label: 'Manage Jobs', route: '/dashboard/admin/jobs' },
    { label: 'My Jobs', route: '/dashboard/employer/jobs' },
    { label: 'Browse Jobs', route: '/dashboard/jobs' },
    { label: 'My Applications', route: '/dashboard/student/applications' },
    { label: 'Invoices', route: '/dashboard/admin/invoices' },
    { label: 'Expenses', route: '/dashboard/expenses' },
    { label: 'Financial Reports', route: '/dashboard/admin/finance' },
    { label: 'My Payments', route: '/dashboard/student/payments' },
    { label: 'Categories', route: '/dashboard/admin/categories' },
    { label: 'Users', route: '/dashboard/admin/users' },
    { label: 'Settings', route: '/dashboard/admin/settings' },
];

const pagesDir = 'c:\\App\\NEW LMS\\aems\\frontend\\pages';

navItems.forEach(item => {
    let relPath = item.route === '/' ? 'index.vue' : item.route.substring(1).replace(/\//g, path.sep);
    
    let fullPath = path.join(pagesDir, relPath + '.vue');
    let dirPath = path.join(pagesDir, relPath, 'index.vue');
    
    if (!fs.existsSync(fullPath) && !fs.existsSync(dirPath)) {
        console.log(`[BROKEN] ${item.label}: ${item.route} (Tried ${fullPath} or ${dirPath})`);
    } else {
        // console.log(`[OK] ${item.label}: ${item.route}`);
    }
});
