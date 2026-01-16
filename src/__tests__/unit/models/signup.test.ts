import { Signup } from "../../../domain/models/signup";
import { Volunteer } from "../../../domain/models/volunteer";
import { Shift } from "../../../domain/models/shift";
import { ShiftType } from "../../../domain/types";

describe('Signup Model', () => {
    let volunteer: Volunteer;
    let shift: Shift;

    beforeEach(() => {
        volunteer = new Volunteer("1", "John Doe", "+1234567890", "john@example.com");
        shift = new Shift("1", new Date(2026, 0, 15), ShiftType.ROBE, 4, '08:00', '10:00');
    });

    it ('should create a valid Signup', () => {
        const signup = new Signup('1', volunteer, shift, new Date());
        expect(signup).toBeDefined();
        expect(signup.volunteer.id).toBe('1');
        expect(signup.shift.id).toBe('1');
        expect(signup.isEmergencyPickup).toBe(false);
    });

    it('should throw error for missing volunteer', () => {
        expect(() => {
            new Signup('1', null as any, shift, new Date());
        }).toThrow('Volunteer is required');
    });

    it('should throw error for missing shift', () => {
        expect(() => {
            new Signup('1', volunteer, null as any, new Date());
        }).toThrow('Shift is required');
    });

    it('should identify emergency pickups', () => {
        const signup = new Signup('1', volunteer, shift, new Date(), true);
        expect(signup).toBeDefined();
        expect(signup.isEmergencyPickup).toBe(true);
    });
});