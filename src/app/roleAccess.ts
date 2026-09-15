export type AppRole = 'admin' | 'doctor' | 'nurse' | 'lab-tech' | 'receptionist';

export const ROLE_PAGES: Record<AppRole, string[]> = {
  admin: ['/', '/patients', '/doctors', '/appointments', '/records', '/transactions', '/inventory', '/settings'],
  doctor: ['/', '/patients', '/appointments', '/records', '/settings'],
  nurse: ['/', '/patients', '/appointments', '/records', '/settings'],
  'lab-tech': ['/', '/patients', '/records', '/inventory', '/settings'],
  receptionist: ['/', '/patients', '/doctors', '/appointments', '/transactions', '/settings'],
};

export function normalizeRole(role?: string): AppRole {
  const normalized = (role ?? '').toLowerCase().replace(/[_ ]/g, '-');
  if (normalized === 'administrator' || normalized === 'admin') return 'admin';
  if (normalized === 'lab-tech' || normalized === 'lab-technician' || normalized === 'labtech') return 'lab-tech';
  if (normalized === 'doctor' || normalized === 'nurse' || normalized === 'receptionist') return normalized;
  return 'receptionist';
}

export function canAccess(role: string | undefined, path: string) {
  return ROLE_PAGES[normalizeRole(role)].includes(path);
}