import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

/**
 * Kullanıcı rolüne göre uygun sayfaya yönlendirme yapar
 *
 * @param role Kullanıcı rolü
 * @param router Next.js router
 */
export function navigateBasedOnRole(role: string, router: AppRouterInstance): void {
  // Super admin rolü için özel yönlendirme
  if (role === 'super_admin') {
    router.push('/super-admin');
    return;
  }

  // Admin rolü için yönlendirme
  if (role === 'admin') {
    router.push('/admin');
    return;
  }

  // Öğretmen rolü için yönlendirme
  if (role === 'teacher') {
    router.push('/dashboard');
    return;
  }

  // Öğrenci rolü için yönlendirme
  if (role === 'student') {
    router.push('/ogrenci');
    return;
  }

  // Veli rolü için yönlendirme
  if (role === 'parent') {
    router.push('/veli');
    return;
  }

  // Varsayılan olarak ana sayfaya yönlendir
  router.push('/');
}
