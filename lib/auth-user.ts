export function getBranchId(
  userData: Record<string, unknown> | null | undefined,
): number | null {
  if (!userData) return null;

  const id = userData.branch_id;
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function isSolarCustomer(
  userData: Record<string, unknown> | null | undefined,
): boolean {
  return userData?.is_solar_customer === true;
}
