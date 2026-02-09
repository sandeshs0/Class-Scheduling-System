import { z } from 'zod';

// Time slot schema (HH:mm format)
const timeSlotSchema = z.object({
    startTime: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
    endTime: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
}).refine(data => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
});

// Recurrence pattern schema
const recurrenceSchema = z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
    timeSlots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
    weekDays: z.array(z.number().min(0).max(6)).optional(),
    monthDays: z.array(z.number().min(1).max(31)).optional(),
    customPattern: z.object({
        weekDays: z.array(z.number().min(0).max(6)),
        interval: z.number().min(1).default(1),
    }).optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()).optional(),
    occurrences: z.number().min(1).max(365).optional(),
});

// Create one-time class
export const createOneTimeClassSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    instructor: z.string().min(1, 'Instructor ID is required'),
    roomType: z.string().min(1, 'Room type ID is required'),
    isRecurring: z.literal(false),
    scheduledDate: z.string().or(z.date()),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
    maxStudents: z.number().min(1).optional(),
}).refine(data => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
});

// Create recurring class
export const createRecurringClassSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    instructor: z.string().min(1, 'Instructor ID is required'),
    roomType: z.string().min(1, 'Room type ID is required'),
    isRecurring: z.literal(true),
    recurrence: recurrenceSchema,
    maxStudents: z.number().min(1).optional(),
});

// Combined schema - either one-time or recurring
export const createClassSchema = z.discriminatedUnion('isRecurring', [
    createOneTimeClassSchema,
    createRecurringClassSchema,
]);

// Update class schema (all fields optional)
export const updateClassSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    instructor: z.string().optional(),
    roomType: z.string().optional(),
    maxStudents: z.number().min(1).optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;