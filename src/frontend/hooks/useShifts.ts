import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface Shift {
  id: string;
  date: string;
  type: 'KAKAD' | 'ROBE';
  maxCapacity: number;
  currentSignups: number;
  spotsAvailable: number;
  startTime: string;
  endTime: string;
  isFull: boolean;
}

export function useShifts(month: number, year: number) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getShifts(month, year);
        setShifts(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load shifts');
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [month, year]);

  return { shifts, loading, error };
}