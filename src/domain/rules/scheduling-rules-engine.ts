import { Volunteer } from "../models/volunteer";
import { Shift } from "../models/shift";
import { Signup } from "../models/signup";    
import { ShiftType } from '../types';  

export class SchedulingRulesEngine {
    /**
     * Checks if volunteer can sign up for shift
     * This validates all scheduling rules at once
     * Returns { isAllowed: boolean, errors: string[] }
     */
    validateSignup(
        volunteer: Volunteer,
        shift: Shift,
        existingSignups: Signup[],
        isEmergencyPickup: boolean = false
    ): { isAllowed: boolean, errors: string[] } {
        // Emergency pickups bypass monthly rules
        if (isEmergencyPickup) {
            // Still check daily Robe limit
            const robeRule = this.checkMaxRobePerDay(volunteer, shift, existingSignups);
            if (!robeRule.isAllowed) {
                return robeRule;
            }
            return { isAllowed: true, errors: [] };
        }

        // Normal signup window rules
        const kakadRule = this.checkMaxKakadsPerMonth(volunteer, shift, existingSignups);
        if (!kakadRule.isAllowed) return kakadRule;

        const totalRule = this.checkMaxTotalPerMonth(volunteer, shift, existingSignups);
        if (!totalRule.isAllowed) return totalRule;

        const thursdayRule = this.checkMaxThursdayPerMonth(volunteer, shift, existingSignups);
        if (!thursdayRule.isAllowed) return thursdayRule;

        const robeRule = this.checkMaxRobePerDay(volunteer, shift, existingSignups);
        if (!robeRule.isAllowed) return robeRule;

        return { isAllowed: true, errors: [] };
    }

    /**
     * Rule: Max 2 Kakad shifts per volunteer per month
     */
    private checkMaxKakadsPerMonth(
        volunteer: Volunteer,
        shift: Shift,
        existingSignups: Signup[]
    ): { isAllowed: boolean; errors: string[] } {
        if (shift.type !== ShiftType.KAKAD) {
            return { isAllowed: true, errors: [] };
        }

        const shiftMonth = shift.getMonthYear();

        const kakadCount = existingSignups.filter((signup) => {
            const isSameVolunteer = signup.volunteer.id === volunteer.id;
            const isKakad = signup.shift.type === ShiftType.KAKAD;
            const isSameMonth =
                signup.shift.getMonthYear().year === shiftMonth.year &&
                signup.shift.getMonthYear().month === shiftMonth.month;

            return isSameVolunteer && isKakad && isSameMonth;
        }).length;

        const MAX_KAKAD = 2;
        if (kakadCount >= MAX_KAKAD) {
            return {
                isAllowed: false,
                errors: [`Cannot sign up: You already have ${kakadCount} Kakad shifts this month (max is ${MAX_KAKAD})`],
            };
        }

        return { isAllowed: true, errors: [] };
    }
    /**
     * Rule: Max 4 total shifts per volunteer per month
     */
    private checkMaxTotalPerMonth(
        volunteer: Volunteer,
        shift: Shift,
        existingSignups: Signup[]
    ): { isAllowed: boolean, errors: string[] } {
        const shiftMonth = shift.getMonthYear();

        const totalCount = existingSignups.filter((signup) => {
            const isSameVolunteer = signup.volunteer.id === volunteer.id;
            const isSameMonth =
                signup.shift.getMonthYear().year === shiftMonth.year &&
                signup.shift.getMonthYear().month === shiftMonth.month;

            return isSameVolunteer && isSameMonth;
        }).length;

        const MAX_TOTAL = 4;
        if (totalCount >= MAX_TOTAL) {
            return {
                isAllowed: false,
                errors: [`Cannot sign up: You already have ${totalCount} shifts this month (max is ${MAX_TOTAL})`]
            };
        }

        return { isAllowed: true, errors: [] };
    }

    /**
     * Rule: Max 2 Thursday shifts per volunteer per month
     */
    private checkMaxThursdayPerMonth(
        volunteer: Volunteer,
        shift: Shift,
        existingSignups: Signup[]
    ): { isAllowed: boolean; errors: string[] } {
        if (!shift.isThursday()) {
            return { isAllowed: true, errors: [] };
        }

        const shiftMonth = shift.getMonthYear();

        const thursdayCount = existingSignups.filter((signup) => {
            const isSameVolunteer = signup.volunteer.id === volunteer.id;
            const isThursday = signup.shift.isThursday();
            const isSameMonth = signup.shift.getMonthYear().year === shiftMonth.year && signup.shift.getMonthYear().month === shiftMonth.month;

            return isSameVolunteer && isThursday && isSameMonth;
        }).length;

        const MAX_THURSDAY = 2;
        if (thursdayCount >= MAX_THURSDAY) {
            return {
                isAllowed: false,
                errors: [`Cannot sign up: You already have ${thursdayCount} Thursday shifts this month (max is ${MAX_THURSDAY})`],
            };
        }

        return { isAllowed: true, errors: [] };
    }

    /**
     * Rule: Max 1 Robe shift per volunteer per day
     */
    private checkMaxRobePerDay(
        volunteer: Volunteer,
        shift: Shift,
        existingSignups: Signup[]
    ): { isAllowed: boolean; errors: string[] } {
        if (shift.type !== ShiftType.ROBE) {
            return { isAllowed: true, errors: [] };
        }

        const sameDay = existingSignups.filter((signup) => {
            const isSameVolunteer = signup.volunteer.id === volunteer.id;
            const isRobe = signup.shift.type === ShiftType.ROBE;
            const isSameDay = signup.shift.date.getTime() === shift.date.getTime();

            return isSameVolunteer && isRobe && isSameDay;
        }).length;

        if (sameDay > 0) {
            return {
                isAllowed: false,
                errors: ['Cannot sign up: You already have a Robe shift on this day (max 1 per day)'],
            };
        }

        return { isAllowed: true, errors: [] };
    }
}