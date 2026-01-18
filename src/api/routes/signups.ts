import ( Router, Request, Response ) from 'express';
import { SchedulingRulesEngine } from "../../domain/rules/scheduling-rules-engine"; 
import { SignupRepository } from "../../infrastructure/persistence/signup.repository";  
import { ShiftRepository } from "../../infrastructure/persistence/shift.repository";
import { VolunteerRepository } from "../../infrastructure/persistence/volunteer.repository";
import { Signup } from '../../domain/models/signup';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Initialize repositories
const signupRepo = new SignupRepository();
const shiftRepo = new ShiftRepository();
const volunteerRepo = new VolunteerRepository();
const rulesEngine = new SchedulingRulesEngine();

shiftRepo.initializeSampleData();
volunteerRepo.initializeSampleData();

/**
 * GET /api/shifts?month=1&year=2026
 * get all shifts for a specific month
 */
router.get('/shifts', (req: Request, res: Response) => {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1; // Default to current month
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    try {
        const shifts = shiftRepo.findByMonth(year, month);
        const allSignups = signupRepo.findAll();

        const shiftsWithCounts = shifts.map((shift) => {
            const signupCount = allSignups.filter(s => s.shift.id === shift.id).length;
            return {
                id: shift.id,
                date: shift.date,
                type: shift.type,
                maxCapacity: shift.maxCapacity,
                currentSignups: signupCount,
                spotsAvailable: Math.max(0, shift.maxCapacity - signupCount),
                startTime: shift.startTime,
                endTime: shift.endTime,
                isFull: signupCount >= shift.maxCapacity,
            };
        });
        
        res.json(shiftsWithCounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
});

/**
 * GET /api/volunteers/:id/quota?month=1&year=2026
 * Get volunteer's remaining quota for a month
 */
router.get('/volunteers/:volunteerId/quota', (req: Request, res: Response) => {
  const { volunteerId } = req.params;
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  try {
    const volunteer = volunteerRepo.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const allSignups = signupRepo.findAll();
    const volunteerSignups = allSignups.filter(
      (s) => s.volunteer.id === volunteerId
    );

    // Get signups for this month
    const monthSignups = volunteerSignups.filter((s) => {
      const shiftMonth = s.shift.getMonthYear();
      return shiftMonth.year === year && shiftMonth.month === month;
    });

    res.json({
      volunteerId,
      month,
      year,
      currentSignups: monthSignups.length,
      maxSignups: 4,
      remainingQuota: Math.max(0, 4 - monthSignups.length),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quota' });
  }
});

/**
 * POST /api/signups
 * Create a new signup with validation
 */
router.post('/signups', (req: Request, res: Response) => {
  const { volunteerId, shiftId, isEmergencyPickup } = req.body;

  try {
    // Fetch entities
    const volunteer = volunteerRepo.findById(volunteerId);
    const shift = shiftRepo.findById(shiftId);

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    // Get existing signups
    const existingSignups = signupRepo.findAll();

    // Validate against rules
    const validation = rulesEngine.validateSignup(
      volunteer,
      shift,
      existingSignups,
      isEmergencyPickup || false
    );

    if (!validation.isAllowed) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Check if already signed up
    const alreadySignedUp = existingSignups.some(
      (s) => s.volunteer.id === volunteerId && s.shift.id === shiftId
    );

    if (alreadySignedUp) {
      return res.status(400).json({
        success: false,
        errors: ['You are already signed up for this shift'],
      });
    }

    // Create signup
    const signup = new Signup(
      signupRepo.generateId(),
      volunteer,
      shift,
      new Date(),
      isEmergencyPickup || false
    );

    signupRepo.add(signup);

    res.status(201).json({
      success: true,
      signup: {
        id: signup.id,
        volunteerId: signup.volunteer.id,
        shiftId: signup.shift.id,
        signupDate: signup.signupDate,
        isEmergencyPickup: signup.isEmergencyPickup,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      errors: [error.message || 'Failed to create signup'],
    });
  }
});

/**
 * GET /api/volunteers/:id/signups?month=1&year=2026
 * Get volunteer's signups for a month
 */
router.get('/volunteers/:volunteerId/signups', (req: Request, res: Response) => {
  const { volunteerId } = req.params;
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  try {
    const allSignups = signupRepo.findAll();
    const volunteerSignups = allSignups.filter(
      (s) => s.volunteer.id === volunteerId
    );

    const monthSignups = volunteerSignups.filter((s) => {
      const shiftMonth = s.shift.getMonthYear();
      return shiftMonth.year === year && shiftMonth.month === month;
    });

    const signupData = monthSignups.map((s) => ({
      id: s.id,
      shiftId: s.shift.id,
      date: s.shift.date,
      type: s.shift.type,
      startTime: s.shift.startTime,
      endTime: s.shift.endTime,
      signupDate: s.signupDate,
      isEmergencyPickup: s.isEmergencyPickup,
    }));

    res.json({
      volunteerId,
      month,
      year,
      signups: signupData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

export default router;
