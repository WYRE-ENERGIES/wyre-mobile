export type DieselEntryKind = 'daily' | 'monthly';

export type BranchGenerator = {
  deviceId: number;
  name: string;
};

export type DieselDailyUsageEntry = {
  id: number | null;
  startDate: string;
  endDate: string;
  recordTime: string | null;
  quantity: number;
  generatorName: string | null;
  generatorIds: number[];
};

export type DieselMonthlyUsageEntry = {
  id: number | null;
  month: number;
  year: number;
  recordTime: string | null;
  quantity: number;
  startDate: string | null;
  endDate: string | null;
};

export type CreateDailyDieselEntryInput = {
  quantity: number;
  startDate: string;
  endDate: string;
  generatorIds?: number[];
};

export type CreateMonthlyDieselEntryInput = {
  quantity: number;
  startDate: string;
  endDate: string;
};

export type UpdateDailyDieselEntryInput = CreateDailyDieselEntryInput & {
  entryId: number;
};

export type UpdateMonthlyDieselEntryInput = CreateMonthlyDieselEntryInput & {
  entryId: number;
};
