import { Signup } from '../../domain/models/signup';
import { Volunteer } from '../../domain/models/volunteer';
import { Shift } from '../../domain/models/shift';

/**
 * In-memory repository for signups.
 * In production, this would interact with a database.
 */
export class SignupRepository {
  private signups: Map<string, Signup> = new Map();
  private nextId = 1;

  /**
   * Add a new signup
   */
  add(signup: Signup): Signup {
    this.signups.set(signup.id, signup);
    return signup;
  }

  /**
   * Get all signups for a volunteer
   */
  findByVolunteer(volunteerId: string): Signup[] {
    return Array.from(this.signups.values()).filter(
      (signup) => signup.volunteer.id === volunteerId
    );
  }

  /**
   * Get all signups for a shift
   */
  findByShift(shiftId: string): Signup[] {
    return Array.from(this.signups.values()).filter(
      (signup) => signup.shift.id === shiftId
    );
  }

  /**
   * Get all signups
   */
  findAll(): Signup[] {
    return Array.from(this.signups.values());
  }

  /**
   * Generate unique ID
   */
  generateId(): string {
    return `signup-${this.nextId++}`;
  }
}
