
export class Volunteer {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly phoneNumber: string,
        readonly email: string,
    ) {
        if (!name || name.trim() === '') {
            throw new Error("Name is required");
        }
        if (!phoneNumber || phoneNumber.trim() === '') {
            throw new Error("Phone number is required");
        }
    }
}