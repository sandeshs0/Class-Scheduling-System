export interface RoomType {
    _id: string;
    name: string;
    description?: string;
    capacity: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoomTypeDTO {
    name: string;
    description?: string;
    capacity: number;
}

export interface Instructor {
    _id: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInstructorDTO {
    name: string;
    role: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
}
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrencePattern {
    type: RecurrenceType;
    timeSlots: TimeSlot[];
    weekDays?: number[];
    monthDays?: number[];
    customPattern?: {
        weekDays?: number[];
        interval?: number;
    };
    startDate: string;
    endDate: string;
    occurrences: number;
}

export interface Class {
    _id: string;
    title: string;
    description?: string;
    instructor: Instructor | string;
    roomType: RoomType | string;
    isRecurring: boolean;
    recurrence?: RecurrencePattern;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClassDTO {
    title: string;
    description?: string;
    instructor: string;
    roomType: string;
    isRecurring: boolean;
    recurrence?: Omit<RecurrencePattern, 'occurrences'> & { occurrences?: number };
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
}

export interface ClassInstance {
    _id: string;
    class: Class | string;
    instructor: Instructor | string;
    roomType: RoomType | string;
    date: string;
    startTime: string;
    endTime: string;
    isCancelled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}
