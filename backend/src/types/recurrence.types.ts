export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface timeSlot{
    startTime:string;
    endTime:string;
}

export interface RecurrencePattern {
    type: RecurrenceType;
    timeSlots: timeSlot[];
    weekDays?: number[];
    monthDays?: number[];
    customPattern?: {
        weekDays?: number[];
        interval?: number;  
    }
    startDate: Date;
    endDate?: Date;
    occurrences?: number;
}