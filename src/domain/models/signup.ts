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
}
