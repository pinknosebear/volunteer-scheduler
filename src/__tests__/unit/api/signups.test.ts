import { SignupRepository } from '../../../infrastructure/persistence/signup.repository';
import { ShiftRepository } from '../../../infrastructure/persistence/shift.repository';
import { VolunteerRepository } from '../../../infrastructure/persistence/volunteer.repository';
import { SchedulingRulesEngine } from '../../../domain/rules/scheduling-rules-engine';
import { Volunteer } from '../../../domain/models/volunteer';
import { Shift } from '../../../domain/models/shift';
import { Signup } from '../../../domain/models/signup';
import { ShiftType } from '../../../domain/types';

describe('Signup API Integration', () => {
  let signupRepo: SignupRepository;
  let shiftRepo: ShiftRepository;
  let volunteerRepo: VolunteerRepository;
  let rulesEngine: SchedulingRulesEngine;

  beforeEach(() => {
    signupRepo = new SignupRepository();
    shiftRepo = new ShiftRepository();
    volunteerRepo = new VolunteerRepository();
    rulesEngine = new SchedulingRulesEngine();

    shiftRepo.initializeSampleData();
    volunteerRepo.initializeSampleData();
  });

  describe('POST /api/signups', () => {
    it('should create a valid signup', () => {
      const volunteer = volunteerRepo.findById('vol-1')!;
      const shifts = shiftRepo.findByMonth(2026, 1);
      const shift = shifts[0];

      const signup = new Signup(
        signupRepo.generateId(),
        volunteer,
        shift,
        new Date()
      );

      signupRepo.add(signup);

      const stored = signupRepo.findByVolunteer('vol-1');
      expect(stored).toHaveLength(1);
      expect(stored[0].shift.id).toBe(shift.id);
    });

    it('should reject signup if rules violated', () => {
      const volunteer = volunteerRepo.findById('vol-1')!;
      const shifts = shiftRepo.findByMonth(2026, 1);

      // Create 2 Kakad signups
      const kakadShifts = shifts.filter((s) => s.type === ShiftType.KAKAD);
      kakadShifts.slice(0, 2).forEach((shift) => {
        signupRepo.add(
          new Signup(signupRepo.generateId(), volunteer, shift, new Date())
        );
      });

      // Try to add a 3rd Kakad shift
      const newKakadShift = new Shift(
        'shift-new',
        new Date(2026, 0, 28),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );

      const result = rulesEngine.validateSignup(
        volunteer,
        newKakadShift,
        signupRepo.findAll()
      );

      expect(result.isAllowed).toBe(false);
      expect(result.errors[0]).toContain('2 Kakad shifts');
    });
  });

  describe('GET /api/shifts', () => {
    it('should return shifts for a month', () => {
      const shifts = shiftRepo.findByMonth(2026, 1);
      expect(shifts.length).toBeGreaterThan(0);
    });

    it('should include signup counts', () => {
      const volunteer = volunteerRepo.findById('vol-1')!;
      const shifts = shiftRepo.findByMonth(2026, 1);
      const shift = shifts[0];

      signupRepo.add(new Signup(signupRepo.generateId(), volunteer, shift, new Date()));

      const signupsForShift = signupRepo.findByShift(shift.id);
      expect(signupsForShift).toHaveLength(1);
    });
  });

  describe('GET /api/volunteers/:id/quota', () => {
    it('should calculate remaining quota correctly', () => {
      const volunteer = volunteerRepo.findById('vol-1')!;
      const shifts = shiftRepo.findByMonth(2026, 1);

      // Sign up for 2 shifts
      shifts.slice(0, 2).forEach((shift) => {
        signupRepo.add(
          new Signup(signupRepo.generateId(), volunteer, shift, new Date())
        );
      });

      const allSignups = signupRepo.findAll();
      const volunteerSignups = allSignups.filter(
        (s) => s.volunteer.id === 'vol-1'
      );

      expect(volunteerSignups).toHaveLength(2);
    });
  });
});
