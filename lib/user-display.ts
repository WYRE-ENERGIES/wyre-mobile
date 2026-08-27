export type ProfileUserData = Record<string, unknown> | null | undefined;

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  return null;
}

export function getUserInitials(userData: ProfileUserData): string {
  const username =
    asString(userData?.username) ??
    (asString(userData?.email)?.split('@')[0] ?? '');

  if (!username) return '?';

  const parts = username.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(userData: ProfileUserData): string {
  return asString(userData?.username) ?? asString(userData?.email) ?? 'User';
}

export function getUserProfilePhotoUrl(userData: ProfileUserData): string | null {
  return (
    asString(userData?.profile_photo_url) ??
    asString(userData?.profile_photo) ??
    asString(userData?.profile_image) ??
    asString(userData?.avatar_url) ??
    asString(userData?.avatar) ??
    asString(userData?.photo_url)
  );
}

export function getUserRoleLabel(userData: ProfileUserData): string | null {
  return asString(userData?.role_text);
}

export function getUserEmail(userData: ProfileUserData): string | null {
  return asString(userData?.email);
}

export function getUserId(userData: ProfileUserData): string | null {
  return asString(userData?.user_id) ?? asString(userData?.id);
}

export function getOrganisationName(userData: ProfileUserData): string | null {
  return asString(userData?.client) ?? asString(userData?.organisation);
}

export function getClientType(userData: ProfileUserData): string | null {
  return asString(userData?.client_type);
}

export function getBranchLabel(userData: ProfileUserData): string | null {
  return (
    asString(userData?.branch_name) ??
    asString(userData?.branch)
  );
}

export function getSolarCustomerLabel(userData: ProfileUserData): string | null {
  const value = asBoolean(userData?.is_solar_customer);
  if (value === null) return null;
  return value ? 'Yes' : 'No';
}

export type ProfileField = {
  label: string;
  value: string;
};

export function getAccountFields(userData: ProfileUserData): ProfileField[] {
  const fields: ProfileField[] = [];
  const username = asString(userData?.username);
  const role = getUserRoleLabel(userData);
  const userId = getUserId(userData);
  const solar = getSolarCustomerLabel(userData);
  const email = getUserEmail(userData);

  if (username) fields.push({ label: 'Username', value: username });
  if (role) fields.push({ label: 'Role', value: role });
  if (userId) fields.push({ label: 'User ID', value: userId });
  if (solar) fields.push({ label: 'Solar Customer', value: solar });
  if (email) fields.push({ label: 'Email', value: email });

  return fields;
}

export function getOrganisationFields(userData: ProfileUserData): ProfileField[] {
  const fields: ProfileField[] = [];
  const organisation = getOrganisationName(userData);
  const clientType = getClientType(userData);
  const branch = getBranchLabel(userData);

  if (organisation) {
    fields.push({ label: 'Organisation', value: organisation });
    fields.push({ label: 'Client', value: organisation });
  }
  if (clientType) fields.push({ label: 'Client Type', value: clientType });
  if (branch) fields.push({ label: 'Branch', value: branch });

  return fields;
}
