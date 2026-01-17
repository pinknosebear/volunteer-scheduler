
# Getting Started - Phase 1 Implementation

Hi! You're about to build the core foundation of the volunteer scheduling system. This guide will walk you through Phase 1 step by step.

## What You're Building in Phase 1

The core models and rules engine - think of this as the "brain" of the system that knows all the scheduling rules and can validate if a volunteer can sign up for a shift.

### The 4 Main Things to Build:
1. **Volunteer Model** - Represents a person who volunteers (with name, contact info, etc.)
2. **Shift Model** - Represents a shift (date, time, type - Kakad or Robe, capacity)
3. **Signup Model** - Represents when a volunteer signs up for a shift
4. **Scheduling Rules Engine** - The logic that checks if a signup is allowed

---

## Step 1: Set Up Your Project

### 1.1 Initialize the Node.js project (if not already done)

```bash
npm init -y
```

This creates a `package.json` file. Now add the dependencies you'll need:

```bash
npm install typescript @types/node --save-dev
npm install jest @types/jest ts-jest --save-dev
```

### 1.2 Create TypeScript configuration

Create a file called `tsconfig.json` in the root:

```json
{

"compilerOptions": {

"target": "ES2020",

"module": "commonjs",

"lib": ["ES2020"],

"outDir": "./dist",

"rootDir": "./src",

"resolveJsonModule": true,

"types": ["jest", "node"],

"esModuleInterop": true,

"forceConsistentCasingInFileNames": true,

"strict": true,

"skipLibCheck": true,

"declaration": true,

"declarationMap": true,

"sourceMap": true

},

"include": ["src/**/*"],

"exclude": ["node_modules", "dist"]

}
```

### 1.3 Create Jest configuration

Create a file called `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 1.4 Create the directory structure

```bash
mkdir -p src/domain/models
mkdir -p src/domain/rules
mkdir -p src/domain/types
mkdir -p src/__tests__/unit
mkdir -p src/__tests__/integration
```

### 1.5 Update package.json scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Step 2: Create Shared Types

Create the file `src/domain/types/index.ts`:

```typescript
// Shift types - the kind of shift being worked
export enum ShiftType {
  KAKAD = 'KAKAD',  // Early morning shift
  ROBE = 'ROBE',    // Other shifts
}

// Days of week
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

// Represents a calendar month and year
export interface MonthYear {
  year: number;
  month: number; // 1-12
}

// Signup window period
export interface SignupWindow {
  startDate: Date;
  endDate: Date;
  forMonth: MonthYear; // The month people are signing up FOR
}
```

### Test it

Create `src/__tests__/unit/types.test.ts`:

```typescript
import { ShiftType, DayOfWeek } from '../../domain/types';

describe('Types', () => {
  it('should define ShiftType enum', () => {
    expect(ShiftType.KAKAD).toBe('KAKAD');
    expect(ShiftType.ROBE).toBe('ROBE');
  });

  it('should define DayOfWeek enum', () => {
    expect(DayOfWeek.THURSDAY).toBe(4);
  });
});
```

Run: `npm test`

---

## Step 3: Create the Volunteer Model

Create `src/domain/models/volunteer.ts`:

```typescript
export class Volunteer {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly phoneNumber: string, // For WhatsApp/SMS reminders
    readonly email: string,
  ) {
    if (!name || name.trim() === '') {
      throw new Error('Volunteer name is required');
    }
    if (!phoneNumber || phoneNumber.trim() === '') {
      throw new Error('Phone number is required');
    }
  }

  // Check if a volunteer's contact info is valid
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.name.length > 0 &&
      this.phoneNumber.length > 0
    );
  }
}
```

### Test the Volunteer Model

Create `src/__tests__/unit/models/volunteer.test.ts`:

```typescript
import { Volunteer } from '../../../domain/models/volunteer';

describe('Volunteer Model', () => {
  it('should create a valid volunteer', () => {
    const volunteer = new Volunteer(
      '1',
      'John Doe',
      '+1234567890',
      'john@example.com'
    );

    expect(volunteer.id).toBe('1');
    expect(volunteer.name).toBe('John Doe');
    expect(volunteer.isValid()).toBe(true);
  });

  it('should throw error if name is empty', () => {
    expect(() => {
      new Volunteer('1', '', '+1234567890', 'john@example.com');
    }).toThrow('Volunteer name is required');
  });

  it('should throw error if phone number is empty', () => {
    expect(() => {
      new Volunteer('1', 'John Doe', '', 'john@example.com');
    }).toThrow('Phone number is required');
  });
});
```

Run: `npm test -- volunteer.test.ts`

---

## Step 4: Create the Shift Model

Create `src/domain/models/shift.ts`:

```typescript
import { ShiftType } from '../types';

export class Shift {
  constructor(
    readonly id: string,
    readonly date: Date,
    readonly type: ShiftType,
    readonly maxCapacity: number,
    readonly startTime: string, // e.g., "06:00"
    readonly endTime: string,   // e.g., "08:00"
  ) {
    if (maxCapacity <= 0) {
      throw new Error('Shift capacity must be greater than 0');
    }
  }

  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  getDayOfWeek(): number {
    return this.date.getDay();
  }

  // Get month and year this shift belongs to
  getMonthYear(): { year: number; month: number } {
    return {
      year: this.date.getFullYear(),
      month: this.date.getMonth() + 1, // getMonth() returns 0-11
    };
  }

  // Check if this shift is on a Thursday
  isThursday(): boolean {
    return this.getDayOfWeek() === 4; // 4 = Thursday
  }
}
```

### Test the Shift Model

Create `src/__tests__/unit/models/shift.test.ts`:

```typescript
import { Shift } from '../../../domain/models/shift';
import { ShiftType } from '../../../domain/types';

describe('Shift Model', () => {
  it('should create a valid shift', () => {
    const date = new Date(2026, 0, 15); // January 15, 2026
    const shift = new Shift('1', date, ShiftType.KAKAD, 1, '06:00', '08:00');

    expect(shift.id).toBe('1');
    expect(shift.type).toBe(ShiftType.KAKAD);
    expect(shift.maxCapacity).toBe(1);
  });

  it('should throw error if capacity is 0 or negative', () => {
    const date = new Date(2026, 0, 15);
    expect(() => {
      new Shift('1', date, ShiftType.ROBE, 0, '08:00', '10:00');
    }).toThrow('Shift capacity must be greater than 0');
  });

  it('should correctly identify Thursday shifts', () => {
    const thursday = new Date(2026, 0, 15); // Jan 15, 2026 is a Thursday
    const shift = new Shift('1', thursday, ShiftType.ROBE, 4, '08:00', '10:00');

    expect(shift.isThursday()).toBe(true);
  });

  it('should correctly identify non-Thursday shifts', () => {
    const monday = new Date(2026, 0, 12); // Jan 12, 2026 is a Monday
    const shift = new Shift('1', monday, ShiftType.ROBE, 4, '08:00', '10:00');

    expect(shift.isThursday()).toBe(false);
  });

  it('should return correct month and year', () =>
    const date = new Date(2026, 0, 15);
    const shift = new Shift('1', date, ShiftType.KAKAD, 1, '06:00', '08:00');

    const monthYear = shift.getMonthYear();
    expect(monthYear.year).toBe(2026);
    expect(monthYear.month).toBe(1); // January
  });
});
```

Run: `npm test -- shift.test.ts`

---

## Step 5: Create the Signup Model

Create `src/domain/models/signup.ts`:

```typescript
import { Volunteer } from './volunteer';
import { Shift } from './shift';

export class Signup {
  constructor(
    readonly id: string,
    readonly volunteer: Volunteer,
    readonly shift: Shift,
    readonly signupDate: Date,
    readonly isEmergencyPickup: boolean = false,
  ) {
    if (!volunteer) {
      throw new Error('Volunteer is required');
    }
    if (!shift) {
      throw new Error('Shift is required');
    }
  }

  // Get the volunteer's ID
  getVolunteerId(): string {
    return this.volunteer.id;
  }

  // Get the shift's ID
  getShiftId(): string {
    return this.shift.id;
  }

  // Check if this signup is within the normal signup window
  // (vs an emergency pickup after the month starts)
  isNormalSignup(): boolean {
    return !this.isEmergencyPickup;
  }
}
```

### Test the Signup Model

Create `src/__tests__/unit/models/signup.test.ts`:

```typescript
import { Signup } from '../../../domain/models/signup';
import { Volunteer } from '../../../domain/models/volunteer';
import { Shift } from '../../../domain/models/shift';
import { ShiftType } from '../../../domain/types';

describe('Signup Model', () => {
  let volunteer: Volunteer;
  let shift: Shift;

  beforeEach(() => {
    volunteer = new Volunteer('1', 'John Doe', '+1234567890', 'john@example.com');
    shift = new Shift(
      '1',
      new Date(2026, 0, 15),
      ShiftType.ROBE,
      4,
      '08:00',
      '10:00'
    );
  });

  it('should create a valid signup', () => {
    const signup = new Signup('1', volunteer, shift, new Date());
	
    expect(signup.getVolunteerId()).toBe('1');
    expect(signup.getShiftId()).toBe('1');
    expect(signup.isNormalSignup()).toBe(true);
  });

  it('should throw error if volunteer is missing', () => {
    expect(() => {
      new Signup('1', null as any, shift, new Date());
    }).toThrow('Volunteer is required');
  });

  it('should throw error if shift is missing', () => {
    expect(() => {
      new Signup('1', volunteer, null as any, new Date());
    }).toThrow('Shift is required');
  });

  it('should identify emergency pickups', () => {
    const signup = new Signup('1', volunteer, shift, new Date(), true);

    expect(signup.isEmergencyPickup).toBe(true);
    expect(signup.isNormalSignup()).toBe(false);
  });
});
```

Run: `npm test -- signup.test.ts`

---

## Step 6: Create the Scheduling Rules Engine

This is the most important part! Create `src/domain/rules/scheduling-rules-engine.ts`:

```typescript
import { Volunteer } from '../models/volunteer';
import { Shift } from '../models/shift';
import { Signup } from '../models/signup';
import { ShiftType } from '../types';

export class SchedulingRulesEngine {
  /**
   * Check if a volunteer can sign up for a shift.
   * This validates ALL the scheduling rules at once.
   *
   * Returns: { isAllowed: boolean, reason?: string }
   */
  validateSignup(
    volunteer: Volunteer,
    shift: Shift,
    existingSignups: Signup[],
    isEmergencyPickup: boolean = false
  ): { isAllowed: boolean; reason?: string } {
    // Emergency pickups bypass monthly rules
    if (isEmergencyPickup) {
      // But still check the daily Robe limit
      const robeRule = this.checkMaxRobePerDay(volunteer, shift, existingSignups);
      if (!robeRule.isAllowed) {
        return robeRule;
      }
      return { isAllowed: true };
    }

    // For normal signups, check all rules
    const kakadRule = this.checkMaxKakadPerMonth(volunteer, shift, existingSignups);
    if (!kakadRule.isAllowed) return kakadRule;

    const totalRule = this.checkMaxTotalPerMonth(volunteer, shift, existingSignups);
    if (!totalRule.isAllowed) return totalRule;

    const thursdayRule = this.checkMaxThursdayPerMonth(volunteer, shift, existingSignups);
    if (!thursdayRule.isAllowed) return thursdayRule;

    const robeRule = this.checkMaxRobePerDay(volunteer, shift, existingSignups);
    if (!robeRule.isAllowed) return robeRule;

    return { isAllowed: true };
  }

  /**
   * Rule: Max 2 Kakad shifts per volunteer per month
   */
  private checkMaxKakadPerMonth(
    volunteer: Volunteer,
    shift: Shift,
    existingSignups: Signup[]
  ): { isAllowed: boolean; reason?: string } {
    if (shift.type !== ShiftType.KAKAD) {
      return { isAllowed: true }; // This rule only applies to Kakad shifts
    }

    const shiftMonth = shift.getMonthYear();

    const kakadCount = existingSignups.filter((signup) => {
      const isSameVolunteer = signup.getVolunteerId() === volunteer.id;
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
        reason: `Cannot sign up: You already have ${kakadCount} Kakad shifts this month (max is ${MAX_KAKAD})`,
      };
    }

    return { isAllowed: true };
  }

  /**
   * Rule: Max 4 total shifts per volunteer per month
   */
  private checkMaxTotalPerMonth(
    volunteer: Volunteer,
    shift: Shift,
    existingSignups: Signup[]
  ): { isAllowed: boolean; reason?: string } {
    const shiftMonth = shift.getMonthYear();

    const totalCount = existingSignups.filter((signup) => {
      const isSameVolunteer = signup.getVolunteerId() === volunteer.id;
      const isSameMonth =
        signup.shift.getMonthYear().year === shiftMonth.year &&
        signup.shift.getMonthYear().month === shiftMonth.month;

      return isSameVolunteer && isSameMonth;
    }).length;

    const MAX_TOTAL = 4;
    if (totalCount >= MAX_TOTAL) {
      return {
        isAllowed: false,
        reason: `Cannot sign up: You already have ${totalCount} shifts this month (max is ${MAX_TOTAL})`,
      };
    }

    return { isAllowed: true };
  }

  /**
   * Rule: Max 2 Thursday shifts per volunteer per month
   */
  private checkMaxThursdayPerMonth(
    volunteer: Volunteer,
    shift: Shift,
    existingSignups: Signup[]
  ): { isAllowed: boolean; reason?: string } {
    if (!shift.isThursday()) {
      return { isAllowed: true }; // This rule only applies to Thursday shifts
    }

    const shiftMonth = shift.getMonthYear();

    const thursdayCount = existingSignups.filter((signup) => {
      const isSameVolunteer = signup.getVolunteerId() === volunteer.id;
      const isThursday = signup.shift.isThursday();
      const isSameMonth =
        signup.shift.getMonthYear().year === shiftMonth.year &&
        signup.shift.getMonthYear().month === shiftMonth.month;

      return isSameVolunteer && isThursday && isSameMonth;
    }).length;

    const MAX_THURSDAY = 2;
    if (thursdayCount >= MAX_THURSDAY) {
      return {
        isAllowed: false,
        reason: `Cannot sign up: You already have ${thursdayCount} Thursday shifts this month (max is ${MAX_THURSDAY})`,
      };
    }

    return { isAllowed: true };
  }

  /**
   * Rule: Max 1 Robe shift per volunteer per day
   */
  private checkMaxRobePerDay(
    volunteer: Volunteer,
    shift: Shift,
    existingSignups: Signup[]
  ): { isAllowed: boolean; reason?: string } {
    if (shift.type !== ShiftType.ROBE) {
      return { isAllowed: true }; // This rule only applies to Robe shifts
    }

    const sameDay = existingSignups.filter((signup) => {
      const isSameVolunteer = signup.getVolunteerId() === volunteer.id;
      const isRobe = signup.shift.type === ShiftType.ROBE;
      const isSameDay =
        signup.shift.date.getTime() === shift.date.getTime();

      return isSameVolunteer && isRobe && isSameDay;
    }).length;

    if (sameDay > 0) {
      return {
        isAllowed: false,
        reason: 'Cannot sign up: You already have a Robe shift on this day (max 1 per day)',
      };
    }

    return { isAllowed: true };
  }
}
```

### Test the Rules Engine (This is Important!)

Create `src/__tests__/unit/rules/scheduling-rules-engine.test.ts`:

```typescript
import { SchedulingRulesEngine } from '../../../domain/rules/scheduling-rules-engine';
import { Volunteer } from '../../../domain/models/volunteer';
import { Shift } from '../../../domain/models/shift';
import { Signup } from '../../../domain/models/signup';
import { ShiftType } from '../../../domain/types';

describe('SchedulingRulesEngine', () => {
  let engine: SchedulingRulesEngine;
  let volunteer: Volunteer;

  beforeEach(() => {
    engine = new SchedulingRulesEngine();
    volunteer = new Volunteer(
      '1',
      'John Doe',
      '+1234567890',
      'john@example.com'
    );
  });

  describe('Max 2 Kakad shifts per month', () => {
    it('should allow signup when volunteer has 0 Kakad shifts', () => {
      const shift = new Shift(
        '1',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups: Signup[] = [];

      const result = engine.validateSignup(volunteer, shift, existingSignups);

      expect(result.isAllowed).toBe(true);
    });

    it('should allow signup when volunteer has 1 Kakad shift', () => {
      const existingShift = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '2',
        new Date(2026, 0, 20),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has 2 Kakad shifts', () => {
      const shift1 = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '3',
        new Date(2026, 0, 25),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('2 Kakad shifts this month');
    });

    it('should only count Kakad shifts in the same month', () => {
      const shift1 = new Shift(
        '1',
        new Date(2025, 11, 25), // December 2025
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2025, 11, 30), // December 2025
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const newShift = new Shift(
        '3',
        new Date(2026, 0, 15), // January 2026 - different month!
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(true); // Different month, so allowed
    });
  });

  describe('Max 4 total shifts per month', () => {
    it('should allow signup when volunteer has < 4 shifts', () => {
      const shifts = Array.from({ length: 3 }, (_, i) =>
        new Shift(
          `${i}`,
          new Date(2026, 0, i + 10),
          i === 0 ? ShiftType.KAKAD : ShiftType.ROBE,
          i === 0 ? 1 : 4,
          '06:00',
          '08:00'
        )
      );
      const existingSignups = shifts.map(
        (shift, i) => new Signup(`s${i}`, volunteer, shift, new Date())
      );

      const newShift = new Shift(
        '4',
        new Date(2026, 0, 25),
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has 4 shifts', () => {
      const shifts = Array.from({ length: 4 }, (_, i) =>
        new Shift(
          `${i}`,
          new Date(2026, 0, i + 10),
          i === 0 ? ShiftType.KAKAD : ShiftType.ROBE,
          i === 0 ? 1 : 4,
          '06:00',
          '08:00'
        )
      );
      const existingSignups = shifts.map(
        (shift, i) => new Signup(`s${i}`, volunteer, shift, new Date())
      );

      const newShift = new Shift(
        '5',
        new Date(2026, 0, 25),
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('4 shifts this month');
    });
  });

  describe('Max 2 Thursday shifts per month', () => {
    it('should allow signup on Thursday when volunteer has < 2', () => {
      const thursday1 = new Date(2026, 0, 8); // Thursday
      const thursday2 = new Date(2026, 0, 1); // Also Thursday
      const existingShift = new Shift(
        '1',
        thursday1,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '2',
        thursday2,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup on Thursday when volunteer has 2', () => {
      const thursday1 = new Date(2026, 0, 1);
      const thursday2 = new Date(2026, 0, 8);
      const thursday3 = new Date(2026, 0, 15);

      const shift1 = new Shift(
        '1',
        thursday1,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const shift2 = new Shift(
        '2',
        thursday2,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '3',
        thursday3,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('2 Thursday shifts');
    });
  });

  describe('Max 1 Robe shift per day', () => {
    it('should allow signup when volunteer has no Robe shifts on that day', () => {
      const date = new Date(2026, 0, 15);
      const newShift = new Shift(
        '1',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );

      const result = engine.validateSignup(volunteer, newShift, []);

      expect(result.isAllowed).toBe(true);
    });

    it('should reject signup when volunteer has Robe shift on same day', () => {
      const date = new Date(2026, 0, 15);
      const existingShift = new Shift(
        '1',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const newShift = new Shift(
        '2',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, existingShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, newShift, existingSignups);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('Robe shift on this day');
    });

    it('should allow Kakad and Robe on same day', () => {
      const date = new Date(2026, 0, 15);
      const kakadShift = new Shift(
        '1',
        date,
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const robeShift = new Shift(
        '2',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, kakadShift, new Date()),
      ];

      const result = engine.validateSignup(volunteer, robeShift, existingSignups);

      expect(result.isAllowed).toBe(true); // Kakad doesn't block Robe
    });
  });

  describe('Emergency pickups', () => {
    it('should bypass monthly rules but enforce daily Robe limit', () => {
      // Create a volunteer with max Kakad already
      const shift1 = new Shift(
        '1',
        new Date(2026, 0, 10),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const shift2 = new Shift(
        '2',
        new Date(2026, 0, 15),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const existingSignups = [
        new Signup('s1', volunteer, shift1, new Date()),
        new Signup('s2', volunteer, shift2, new Date()),
      ];

      // Try emergency Kakad (should be allowed, rules bypassed)
      const emergencyKakad = new Shift(
        '3',
        new Date(2026, 0, 20),
        ShiftType.KAKAD,
        1,
        '06:00',
        '08:00'
      );
      const result1 = engine.validateSignup(
        volunteer,
        emergencyKakad,
        existingSignups,
        true // emergency
      );

      expect(result1.isAllowed).toBe(true); // Bypassed max Kakad rule

      // But daily Robe limit still applies
      const date = new Date(2026, 0, 25);
      const robeShift1 = new Shift(
        '4',
        date,
        ShiftType.ROBE,
        4,
        '08:00',
        '10:00'
      );
      const robeShift2 = new Shift(
        '5',
        date,
        ShiftType.ROBE,
        4,
        '10:00',
        '12:00'
      );
      const signupsWithRobe = [
        ...existingSignups,
        new Signup('s3', volunteer, robeShift1, new Date()),
      ];

      const result2 = engine.validateSignup(
        volunteer,
        robeShift2,
        signupsWithRobe,
        true // emergency
      );

      expect(result2.isAllowed).toBe(false); // Daily limit still enforced
      expect(result2.reason).toContain('Robe shift on this day');
    });
  });
});
```

Run the full test suite: `npm test`

---

## Step 7: Commit Phase 1

Once all tests pass, commit your work:

```bash
git checkout -b feature/phase-1-core-models
git add -A
git commit -m "feat: implement core models and scheduling rules engine"
```

Then create a pull request (we'll do this next).

---

## What's Next?

Once Phase 1 is complete and committed:
1. You'll have the foundation for everything else
2. Phase 2 will build a signup form on top of this engine
3. All other phases will depend on these models and rules

## Tips for Success

1. **Run tests frequently** - `npm test:watch` will auto-run tests as you save
2. **Read error messages carefully** - They tell you exactly what's wrong
3. **Test your edge cases** - The tests above cover all the important scenarios
4. **Keep models simple** - Don't add features until you need them
5. **Commit often** - Helps with rollbacks if something breaks

Good luck! Let me know when you're ready to move to Phase 2.
