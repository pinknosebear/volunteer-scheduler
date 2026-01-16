import { Shift } from '../../../domain/models/shift';
import { ShiftType } from '../../../domain/types';

describe('Shift Model', () => {
    it('should create a valid Shift', () => {
        const date = new Date(2026, 0, 15); // January 15, 2026
        const shift = new Shift("1", date, ShiftType.KAKAD, 1, '06:00', '08:00');

        expect(shift.id).toBe("1");
        expect(shift.type).toBe(ShiftType.KAKAD);
        expect(shift.maxCapacity).toBe(1);
    });

    it('should throw error for non-positive max capacity', () => {
        const date = new Date(2026, 0, 15); // January 15, 2026
        expect(() => {
            new Shift("1", date, ShiftType.ROBE, 0, '06:00', '08:00');
        }).toThrow("Max capacity must be greater than 0");
    });

    it('should correctly identify Thursday shifts', () => {
        const thursday = new Date(2026, 0, 15); 
        const shift = new Shift('1', thursday, ShiftType.ROBE, 4, '8:00', '10:00');// January 15, 2026 (Thursday)

        expect(shift.isThursday()).toBe(true);  
    });

      it('should correctly identify non-Thursday shifts', () => {
    const monday = new Date(2026, 0, 12); // Jan 12, 2026 is a Monday
    const shift = new Shift('1', monday, ShiftType.ROBE, 4, '08:00', '10:00');

    expect(shift.isThursday()).toBe(false);
    }); 

    it('should return correct month and year', () => {
        const date = new Date(2026, 0, 15); // January 15, 2026
        const shift = new Shift("1", date, ShiftType.KAKAD, 1, '06:00', '08:00');

        const monthYear = shift.getMonthYear();
        expect(monthYear.month).toBe(1); // January is month 1
        expect(monthYear.year).toBe(2026);
    });
});