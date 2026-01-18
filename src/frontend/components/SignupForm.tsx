import React, { useState } from 'react';
import { apiClient } from '../api/client';
import '../styles/form.css';

interface SignupFormProps {
  volunteerId: string;
  shiftId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SignupForm({
  volunteerId,
  shiftId,
  onSuccess,
  onCancel,
}: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);

  if (!shiftId) {
    return <div className="form-message">Select a shift to sign up</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await apiClient.createSignup(
        volunteerId,
        shiftId,
        isEmergency
      );

      if (response.data.success) {
        onSuccess();
      } else {
        setErrors(response.data.errors || ['Signup failed']);
      }
    } catch (error: any) {
      setErrors([error.message || 'Failed to sign up']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h3>Confirm Shift Signup</h3>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, idx) => (
            <div key={idx} className="error-message">
              ❌ {error}
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
          />
          This is an emergency pickup
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Submitting...' : 'Sign Up'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}