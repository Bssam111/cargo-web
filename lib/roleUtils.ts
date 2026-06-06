import { UserRole } from '@/types';

/**
 * Normalizes the user role from Firestore data.
 * Handles both the legacy `role` string field and the newer `roles` array field.
 */
export function getUserRole(data: Record<string, unknown>): UserRole | undefined {
  if (Array.isArray(data.roles) && data.roles.length > 0) {
    return data.roles[0] as UserRole;
  }
  if (typeof data.role === 'string') {
    return data.role as UserRole;
  }
  return undefined;
}
