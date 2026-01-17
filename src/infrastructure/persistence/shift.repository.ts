import { Shift } from '../../domain/models/shift';

/**
 * Mock shift repository.
 * In production, would load from database.
 */
export class ShiftRepository {
  private shifts: Map<string, Shift> = new Map();

  /**
   * Initialize with sample shifts for a month
   */
  initializeSampleData() {
    // Sample shifts for January 2026
    const shiftId = (i: number) => `shift-${i}`;
    const kakadShift = (id: string, day: number) =>
      new Shift(id, new Date(2026, 0, day), 'KAKAD' as any, 1, '06:00', '08:00');

    const robeShift = (id: string, day: number) =>
      new Shift(id, new Date(2026, 0, day), 'ROBE' as any, 4, '08:00', '17:00');

    // Add sample shifts
    this.shifts.set('shift-1', kakadShift('shift-1', 5));   // Jan 5
    this.shifts.set('shift-2', kakadShift('shift-2', 12));  // Jan 12
    this.shifts.set('shift-3', robeShift('shift-3', 10));   // Jan 10
    this.shifts.set('shift-4', robeShift('shift-4', 15));   // Jan 15 (Thursday)
    this.shifts.set('shift-5', robeShift('shift-5', 22));   // Jan 22
  }

  /**
   * Get shifts for a specific month
   */
  findByMonth(year: number, month: number): Shift[] {
    return Array.from(this.shifts.values()).filter((shift) => {
      const shiftMonth = shift.getMonthYear();
      return shiftMonth.year === year && shiftMonth.month === month;
    });
  }

  /**
   * Get all shifts
   */
  findAll(): Shift[] {
    return Array.from(this.shifts.values());
  }

  /**
   * Get shift by ID
   */
  findById(id: string): Shift | undefined {
    return this.shifts.get(id);
  }

  /**
   * Add a shift (for testing)
   */
  add(shift: Shift): void {
    this.shifts.set(shift.id, shift);
  }
}
