import React from 'react';
import { useQuota } from '../hooks/useQuota';
import '../styles/quota.css';

interface QuotaDisplayProps {
  volunteerId: string;
  month: number;
  year: number;
}

export function QuotaDisplay({ volunteerId, month, year }: QuotaDisplayProps) {
  const { quota, loading, error } = useQuota(volunteerId, month, year);

  if (loading) return <div className="quota-loading">Loading quota...</div>;
  if (error) return <div className="quota-error">Error: {error}</div>;
  if (!quota) return null;

  return (
    <div className="quota-display">
      <h3>Your Quota for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' })}</h3>
      <div className="quota-bar">
        <div className="quota-label">Total Shifts</div>
        <div className="quota-progress">
          <div
            className="quota-fill"
            style={{ width: `${(quota.currentSignups / quota.maxSignups) * 100}%` }}
          />
        </div>
        <div className="quota-text">
          {quota.currentSignups}/{quota.maxSignups}
          {quota.remainingQuota > 0 && ` (${quota.remainingQuota} slots left)`}
          {quota.remainingQuota === 0 && ` (FULL)`}
        </div>
      </div>
    </div>
  );
}
