import { Volunteer } from '../../domain/models/volunteer';

/**
 * Mock volunteer repository.
 */
export class VolunteerRepository {
  private volunteers: Map<string, Volunteer> = new Map();

  /**
   * Initialize with sample volunteers
   */
  initializeSampleData() {
    const volunteers = [
      new Volunteer('vol-1', 'Alice Johnson', '+1234567890', 'alice@example.com'),
      new Volunteer('vol-2', 'Bob Smith', '+1987654321', 'bob@example.com'),
      new Volunteer('vol-3', 'Carol White', '+1555555555', 'carol@example.com'),
    ];

    volunteers.forEach((v) => this.volunteers.set(v.id, v));
  }

  /**
   * Get volunteer by ID
   */
  findById(id: string): Volunteer | undefined {
    return this.volunteers.get(id);
  }

  /**
   * Get all volunteers
   */
  findAll(): Volunteer[] {
    return Array.from(this.volunteers.values());
  }

  /**
   * Add volunteer (for testing)
   */
  add(volunteer: Volunteer): void {
    this.volunteers.set(volunteer.id, volunteer);
  }
}
