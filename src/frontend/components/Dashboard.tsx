import React, { useState } from 'react';
import { ShiftCalendar } from '../components/ShiftCalendar';
import { QuotaDisplay } from '../components/QuotaDisplay';
import { SignupForm } from '../components/SignupForm';
import '../styles/dashboard.css';

const DEMO_VOLUNTEER_ID = 'vol-1'; // In production, get from auth

export function Dashboard() {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const handleSelectShift = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setShowForm(true);
  };

  const handleSignupSuccess = () => {
    setMessage({ type: 'success', text: '✅ Successfully signed up!' });
    setShowForm(false);
    setSelectedShiftId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedShiftId(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Volunteer Shift Signup</h1>
        <p>Sign up for shifts that match your availability</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-main">
          <QuotaDisplay volunteerId={DEMO_VOLUNTEER_ID} month={month} year={year} />
          <ShiftCalendar
            month={month}
            year={year}
            onSelectShift={handleSelectShift}
          />
        </div>

        {showForm && (
          <div className="dashboard-sidebar">
            <SignupForm
              volunteerId={DEMO_VOLUNTEER_ID}
              shiftId={selectedShiftId}
              onSuccess={handleSignupSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
