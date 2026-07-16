export function getUserInitials(userData: Record<string, unknown> | null | undefined): string {
  const username =
    typeof userData?.username === 'string'
      ? userData.username.trim()
      : typeof userData?.email === 'string'
        ? userData.email.trim().split('@')[0]
        : '';

  if (!username) return '?';

  const parts = username.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(userData: Record<string, unknown> | null | undefined): string {
  if (typeof userData?.username === 'string' && userData.username.trim()) {
    return userData.username.trim();
  }

  if (typeof userData?.email === 'string' && userData.email.trim()) {
    return userData.email.trim();
  }

  return 'User';
}

export function getUserRoleLabel(userData: Record<string, unknown> | null | undefined): string | null {
  if (typeof userData?.role_text === 'string' && userData.role_text.trim()) {
    return userData.role_text.trim();
  }

  return null;
}
