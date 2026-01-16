import { SchedulingRulesEngine } from '../../../domain/rules/scheduling-rules-engine';
import { Volunteer } from '../../../domain/models/volunteer';
import { Shift } from '../../../domain/models/shift';
import { Signup } from '../../../domain/models/signup';
import { ShiftType } from '../../../domain/types';

describe('SchedulingRulesEngine', () => {
  let engine: SchedulingRulesEngine;
  let volunteer: Volunteer;

  beforeEach(() => {
    engine = new SchedulingRulesEngine();
    volunteer = new Volunteer(
      '1',
      'John Doe',
      '+1234567890',
      'john@example.com'
    );
  });

  describe('Max 2 Kakad shifts per month', () => {
    it('should allow signup when volunteer has 0 Kakad shifts', () => {
      const shift = new Shift(
        '1',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups: Signup[] = [];

      const result = engine.validateSignup(volunteer, shift, existingSignups);
      expect(result).toBeDefined(); 
      expect(result.isAllowed).toBe(true);
    });

    it('should allow signup when volunteer has 1 Kakad shift', () => {
      const existingShift = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '2',
        new Date(2026, 0, 20),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined(); 
      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has 2 Kakad shifts', () => {
      const shift1 = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '3',
        new Date(2026, 0, 25),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined(); 
      expect(result.isAllowed).toBe(false);
      expect(result.errors[0]).toContain('2 Kakad shifts this month');
    });

    it('should only count Kakad shifts in the same month', () => {
      const shift1 = new Shift(
        '1',
        new Date(2025, 11, 25), // December 2025
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2025, 11, 30), // December 2025
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '3',
        new Date(2026, 0, 15), // January 2026 - different month!
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true); // Different month, so allowed
    });
  });

  describe('Max 4 total shifts per month', () => {
    it('should allow signup when volunteer has < 4 shifts', () => {
      const shifts = Array.from({ length: 3 }, (_, i) =>
        new Shift(
          `${i}`,
          new Date(2026, 0, i + 10),
          i === 0 ? ShiftType.KAKAD : ShiftType.ROBE,
          i === 0 ? 1 : 4,
          '06:00',
          '08:00'
        )
      );
      const existingSignups = shifts.map(
        (shift, i) => new Signup(`s${i}`, volunteer, shift, new Date())
      );

      const newShift = new Shift(
        '4',
        new Date(2026, 0, 25),
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has 4 shifts', () => {
      const shifts = Array.from({ length: 4 }, (_, i) =>
        new Shift(
          `${i}`,
          new Date(2026, 0, i + 10),
          i === 0 ? ShiftType.KAKAD : ShiftType.ROBE,
          i === 0 ? 1 : 4,
          '06:00',
          '08:00'
        )
      );
      const existingSignups = shifts.map(
        (shift, i) => new Signup(`s${i}`, volunteer, shift, new Date())
      );

      const newShift = new Shift(
        '5',
        new Date(2026, 0, 25),
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(false);
      expect(result.errors[0]).toContain('4 shifts this month');
    });
  });

  describe('Max 2 Thursday shifts per month', () => {
    it('should allow signup on Thursday when volunteer has < 2', () => {
      const thursday1 = new Date(2026, 0, 8); // Thursday
      const thursday2 = new Date(2026, 0, 1); // Also Thursday
      const existingShift = new Shift(
        '1',
        thursday1,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '2',
        thursday2,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup on Thursday when volunteer has 2', () => {
      const thursday1 = new Date(2026, 0, 1);
      const thursday2 = new Date(2026, 0, 8);
      const thursday3 = new Date(2026, 0, 15);

      const shift1 = new Shift(
        '1',
        thursday1,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const shift2 = new Shift(
        '2',
        thursday2,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '3',
        thursday3,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(false);
      expect(result.errors[0]).toContain('2 Thursday shifts');
    });
  });

  describe('Max 1 Robe shift per day', () => {
    it('should allow signup when volunteer has no Robe shifts on that day', () => {
      const date = new Date(2026, 0, 15);
      const newShift = new Shift(
        '1',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, []);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has Robe shift on same day', () => {
      const date = new Date(2026, 0, 15);
      const existingShift = new Shift(
        '1',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '2',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(false);
      expect(result.errors[0]).toContain('Robe shift on this day');
    });

    it('should allow Kakad and Robe on same day', () => {
      const date = new Date(2026, 0, 15);
      const kakadShift = new Shift(
        '1',
        date,
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const robeShift = new Shift(
        '2',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, kakadShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, robeShift, existingSignups);
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true); // Kakad doesn't block Robe
    });
  });

  describe('Emergency pickups', () => {
    it('should bypass monthly rules but enforce daily Robe limit', () => {
      // Create a volunteer with max Kakad already
      const shift1 = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      // Try emergency Kakad (should be allowed, rules bypassed)
      const emergencyKakad = new Shift(
        '3',
        new Date(2026, 0, 20),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const result1 = engine.validateSignup(
        volunteer,
        emergencyKakad,
        existingSignups,
        true // emergency
      );
      expect(result1).toBeDefined();
      expect(result1.isAllowed).toBe(true); // Bypassed max Kakad rule

      // But daily Robe limit still applies
      const date = new Date(2026, 0, 25);
      const robeShift1 = new Shift(
        '4',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const robeShift2 = new Shift(
        '5',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const signupsWithRobe = [
        ...existingSignups,
        new Signup('s3', volunteer, robeShift1, new Date()),
      ];

      const result2 = engine.validateSignup(
        volunteer,
        robeShift2,
        signupsWithRobe,
        true // emergency
      );
      expect(result2).toBeDefined();
      expect(result2.isAllowed).toBe(false); // Daily limit still enforced
      expect(result2.errors[0]).toContain('Robe shift on this day');
    });
  });
});
