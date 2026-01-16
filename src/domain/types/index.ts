// shift types - kind of shifts being worked
export enum ShiftType {
    KAKAD = 'KAKAD',
    ROBE = 'ROBE',
}

// days of week
export enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}

// represents a calendar month and year
export interface MonthYear {
    month: number; // 0-11
    year: number;  // full year, e.g., 2023
}   

// signup window period
export interface SignupWindow {
    startDate: Date;
    endDate: Date;
    forMonth: MonthYear;
}