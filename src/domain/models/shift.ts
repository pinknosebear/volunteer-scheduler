import { ShiftType } from '../types';

export class Shift {
    constructor(
        readonly id: string,
        readonly date: Date,
        readonly type: ShiftType,
        readonly maxCapacity: number,
        readonly startTime: string,
        readonly endTime: string
    ) {
        if (maxCapacity <= 0) {
            throw new Error("Max capacity must be greater than 0");
        }
    }

    getDayOfWeek(): number {
        return this.date.getDay();
    }

    getMonthYear(): { month: number; year: number } {
        return {
            month: this.date.getMonth() + 1,
            year: this.date.getFullYear()
        };
    }

    isThursday(): boolean {
        return this.getDayOfWeek() === 4;
    }
}
