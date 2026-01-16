import { Volunteer } from "../../../domain/models/volunteer";

describe('Volunteer Model', () => {
    it('should create a valid Volunteer', () => {
        const volunteer = new Volunteer(
            "1",
            "John Doe",
            "+1234567890",
            "john@example.com"
        );

        expect(volunteer.id).toBe("1");
        expect(volunteer.name).toBe("John Doe");

        expect(volunteer.isValid()).toBe(true);
    });

    it('should throw error for missing name', () => {
        expect(() => {
            new Volunteer(
                "1",
                "",
                "+1234567890",
                "john@example.com"
            );
        }).toThrow("Name is required");
    });

    it('should throw error for missing phone number', () => {
        expect(() => {
            new Volunteer(
                "1",
                "John Doe",
                "",
                "john@example.com"
            );
        }).toThrow("Phone number is required");
    }); 
});
