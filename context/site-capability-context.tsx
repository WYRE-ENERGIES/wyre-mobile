import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { getBranchId, isSolarCustomer } from '@/lib/auth-user';
import { fetchSolarOverview } from '@/lib/solar-api';
import { useAppSelector } from '@/redux/hooks';

type SiteCapabilities = {
  hasSolar: boolean;
  checkingSolar: boolean;
};

const SiteCapabilityContext = createContext<SiteCapabilities>({
  hasSolar: false,
  checkingSolar: false,
});

export function SiteCapabilityProvider({ children }: { children: ReactNode }) {
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const solarOnly = isSolarCustomer(userData);
  const [probedSolar, setProbedSolar] = useState(false);
  const [checkingSolar, setCheckingSolar] = useState(!solarOnly && branchId != null);

  useEffect(() => {
    if (solarOnly) {
      setProbedSolar(true);
      setCheckingSolar(false);
      return;
    }
    if (!branchId) {
      setProbedSolar(false);
      setCheckingSolar(false);
      return;
    }

    let cancelled = false;
    setProbedSolar(false);
    setCheckingSolar(true);
    fetchSolarOverview(branchId)
      .then(() => {
        if (!cancelled) setProbedSolar(true);
      })
      .catch(() => {
        if (!cancelled) setProbedSolar(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingSolar(false);
      });

    return () => {
      cancelled = true;
    };
  }, [branchId, solarOnly]);

  return (
    <SiteCapabilityContext.Provider
      value={{ hasSolar: solarOnly || probedSolar, checkingSolar }}>
      {children}
    </SiteCapabilityContext.Provider>
  );
}

export function useSiteCapabilities() {
  return useContext(SiteCapabilityContext);
}
