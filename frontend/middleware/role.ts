import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  const role = authStore.userRole;

  if (to.path === '/dashboard') {
    switch (role) {
      case 'super_admin':
        return navigateTo('/dashboard/admin');
      case 'crm_agent':
        return navigateTo('/dashboard/leads');
      case 'tutor':
        return navigateTo('/dashboard/tutor');
      case 'student':
        return navigateTo('/dashboard/student');
      case 'employer':
        return navigateTo('/dashboard/employer');
      default:
        return navigateTo('/login');
    }
  }

  // Check if route has metadata role restrictions
  const allowedRoles = to.meta.role as string[] | undefined;
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`User role '${role}' is not allowed to access path '${to.path}'. Redirecting to /dashboard.`);
    return navigateTo('/dashboard');
  }

  // Basic role-based route protection
  const pathParts = to.path.split('/');
  if (pathParts[2] === 'admin' && role !== 'super_admin') {
    // Tutors are allowed to manage certificates and proctoring
    if (role === 'tutor' && (pathParts[3] === 'certificates' || pathParts[3] === 'proctoring')) {
      return;
    }
    return navigateTo('/dashboard');
  }
  if (pathParts[2] === 'leads' && !['super_admin', 'crm_agent'].includes(role)) {
    return navigateTo('/dashboard');
  }
});
