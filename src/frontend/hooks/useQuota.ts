import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface Quota {
  volunteerId: string;
  month: number;
  year: number;
  currentSignups: number;
  maxSignups: number;
  remainingQuota: number;
}

export function useQuota(volunteerId: string, month: number, year: number) {
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getQuota(volunteerId, month, year);
        setQuota(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load quota');
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, [volunteerId, month, year]);

  return { quota, loading, error };
}
