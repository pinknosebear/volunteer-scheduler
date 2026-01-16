
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

    // Check if volunteers contact info is valid
    isValid(): boolean {
        return (
            this.id.length > 0 &&
            this.name.length > 0 &&
            this.phoneNumber.length > 0 
        );
    }
}