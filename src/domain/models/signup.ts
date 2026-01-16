import { Volunteer } from "./volunteer";
import { Shift } from "./shift";

export class Signup {
    constructor(
        readonly id: string,
        readonly volunteer: Volunteer,
        readonly shift: Shift,
        readonly signupDate: Date,
        readonly isEmergencyPickup: boolean = false,
    ) {
        if (!volunteer) {
            throw new Error("Volunteer is required");
        }
        if (!shift) {
            throw new Error("Shift is required");
        }
    }

    //get volunteer's id
    getVolunteerId(): string {
        return this.volunteer.id;
    }

    //get shift's id
    getShiftId(): string {
        return this.shift.id;
    }

    //check if signup is in normal signup window vs emergency poickup
    isNormalSignup(): boolean {
        return !this.isEmergencyPickup;
    }
}
