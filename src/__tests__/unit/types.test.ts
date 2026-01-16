
import { ShiftType, DayOfWeek } 
from "../../domain/types";

describe('Types', () => {
    it('should define ShiftType enum ', () => {
        expect(ShiftType.KAKAD).toBe('KAKAD');
        expect(ShiftType.ROBE).toBe('ROBE');
    });

    it('should define DayOfWeek enum ', () => {
        expect(DayOfWeek.THURSDAY).toBe(4);
    });
});


