import { useCallback, useEffect, useState } from 'react';

import {
  canEditDieselEntry,
  createDailyDieselEntry,
  createMonthlyDieselEntry,
  dieselEntryError,
  fetchBranchGenerators,
  fetchDieselDailyUsageEntries,
  fetchDieselMonthlyUsageEntries,
  updateDailyDieselEntry,
  updateMonthlyDieselEntry,
} from '@/lib/diesel-entry-api';
import type {
  BranchGenerator,
  CreateDailyDieselEntryInput,
  CreateMonthlyDieselEntryInput,
  DieselDailyUsageEntry,
  DieselMonthlyUsageEntry,
  UpdateDailyDieselEntryInput,
  UpdateMonthlyDieselEntryInput,
} from '@/lib/diesel-entry-types';

type DieselEntriesState = {
  generators: BranchGenerator[];
  dailyEntries: DieselDailyUsageEntry[];
  monthlyEntries: DieselMonthlyUsageEntry[];
  loading: boolean;
  refreshing: boolean;
  submitting: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submitDaily: (input: CreateDailyDieselEntryInput) => Promise<boolean>;
  submitMonthly: (input: CreateMonthlyDieselEntryInput) => Promise<boolean>;
  editDaily: (input: UpdateDailyDieselEntryInput) => Promise<boolean>;
  editMonthly: (input: UpdateMonthlyDieselEntryInput) => Promise<boolean>;
  isEditable: (recordTime: string | null | undefined) => boolean;
};

export function useDieselEntries(branchId: number | null): DieselEntriesState {
  const [generators, setGenerators] = useState<BranchGenerator[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DieselDailyUsageEntry[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<DieselMonthlyUsageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!branchId) {
        setGenerators([]);
        setDailyEntries([]);
        setMonthlyEntries([]);
        setLoading(false);
        setRefreshing(false);
        setError('No branch is selected for this account.');
        return;
      }

      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [nextGenerators, nextDaily, nextMonthly] = await Promise.all([
          fetchBranchGenerators(branchId),
          fetchDieselDailyUsageEntries(branchId),
          fetchDieselMonthlyUsageEntries(branchId),
        ]);
        setGenerators(nextGenerators);
        setDailyEntries(nextDaily);
        setMonthlyEntries(nextMonthly);
      } catch (caught) {
        setError(dieselEntryError(caught, 'Unable to load diesel entries.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [branchId],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const runMutation = useCallback(
    async (operation: () => Promise<void>, fallback: string) => {
      if (!branchId) {
        setError('No branch is selected for this account.');
        return false;
      }
      setSubmitting(true);
      setError(null);
      try {
        await operation();
        await load('refresh');
        return true;
      } catch (caught) {
        setError(dieselEntryError(caught, fallback));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [branchId, load],
  );

  const submitDaily = useCallback(
    (input: CreateDailyDieselEntryInput) =>
      runMutation(() => createDailyDieselEntry(branchId!, input), 'Unable to save daily diesel entry.'),
    [branchId, runMutation],
  );

  const submitMonthly = useCallback(
    (input: CreateMonthlyDieselEntryInput) =>
      runMutation(
        () => createMonthlyDieselEntry(branchId!, input),
        'Unable to save monthly diesel entry.',
      ),
    [branchId, runMutation],
  );

  const editDaily = useCallback(
    (input: UpdateDailyDieselEntryInput) =>
      runMutation(() => updateDailyDieselEntry(branchId!, input), 'Unable to update daily diesel entry.'),
    [branchId, runMutation],
  );

  const editMonthly = useCallback(
    (input: UpdateMonthlyDieselEntryInput) =>
      runMutation(
        () => updateMonthlyDieselEntry(branchId!, input),
        'Unable to update monthly diesel entry.',
      ),
    [branchId, runMutation],
  );

  return {
    generators,
    dailyEntries,
    monthlyEntries,
    loading,
    refreshing,
    submitting,
    error,
    refresh,
    submitDaily,
    submitMonthly,
    editDaily,
    editMonthly,
    isEditable: canEditDieselEntry,
  };
}
