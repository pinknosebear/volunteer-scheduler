import React, { useState } from 'react';
import { useShifts } from '../hooks/useShifts';
import '../styles/calendar.css';

interface ShiftCalendarProps {
  onSelectShift: (shiftId: string) => void;
  month: number;
  year: number;
}

export function ShiftCalendar({ onSelectShift, month, year }: ShiftCalendarProps) {
  const { shifts, loading, error } = useShifts(month, year);

  if (loading) return <div className="calendar-loading">Loading shifts...</div>;
  if (error) return <div className="calendar-error">Error: {error}</div>;

  // Group shifts by date
  const shiftsByDate = new Map<string, typeof shifts>();
  shifts.forEach((shift) => {
    const date = new Date(shift.date).toDateString();
    if (!shiftsByDate.has(date)) {
      shiftsByDate.set(date, []);
    }
    shiftsByDate.get(date)!.push(shift);
  });

  return (
    <div className="shift-calendar">
      <h2>Available Shifts - {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>

      <div className="shifts-grid">
        {Array.from(shiftsByDate.entries()).map(([date, dayShifts]) => (
          <div key={date} className="shift-day">
            <h3>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
            <div className="shifts-list">
              {dayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className={`shift-card ${shift.isFull ? 'full' : ''}`}
                  onClick={() => !shift.isFull && onSelectShift(shift.id)}
                >
                  <div className="shift-type">{shift.type}</div>
                  <div className="shift-time">{shift.startTime} - {shift.endTime}</div>
                  <div className="shift-capacity">
                    {shift.currentSignups}/{shift.maxCapacity} signed up
                  </div>
                  {shift.isFull && <div className="shift-full-badge">FULL</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}