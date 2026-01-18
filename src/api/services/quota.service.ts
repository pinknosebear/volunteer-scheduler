import { Volunteer } from "../../domain/models/volunteer";
import { Shift } from "../../domain/models/shift";
import { Signup } from "../../domain/models/signup";
import { ShiftType } from "../../domain/types";

/** 
 * Calculate remaining quota for a volunteer
 */
export class QuotaService {
    calculateQuota(volunteer: Volunteer, month: number, year: number, signups: Signup[]) {
        const monthSignups = signups.filter((signup) => {
            if (signup.volunteer.id != volunteer.id) return false;
            const shiftMonth = signup.shift.getMonthYear();
            return shiftMonth.year === year && shiftMonth.month === month;
        });

        const kakadCount = monthSignups.filter(
            (s) => s.shift.type === ShiftType.KAKAD
        ).length;
        const robeCount = monthSignups.filter(
            (s) => s.shift.type === ShiftType.ROBE
        ).length;
        const totalCount = monthSignups.length;

        return {
            kakak: {
                current: kakadCount,
                max: 2,
                remaining: Math.max(0, 2-kakadCount), 
            },
            robe: {
                current: robeCount,
                max: 4,
                remaining: Math.max(0, 4-robeCount), 
            },
            total: {
                current: totalCount,
                max: 4, 
                remaining: Math.max(0, 4-totalCount),
            },
        };
    }
}