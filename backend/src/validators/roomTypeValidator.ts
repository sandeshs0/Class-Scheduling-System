import { z } from 'zod';

export const createRoomTypeSchema = z.object({
    name: z
        .string({ error: 'Name is required' })
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
    capacity: z
        .number({ error: 'Capacity is required' })
        .min(1, 'Capacity must be at least 1'),
});

export const updateRoomTypeSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).trim().optional(),
    capacity: z.number().min(1).optional(),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;