import { z } from 'zod';

export const createInstructorSchema = z.object({
    name: z
        .string({ error: 'Name is required' })
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    role: z
        .string({ error: 'Role is required' })
        .min(1, 'Role is required')
        .trim(),
});

export const updateInstructorSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    role: z.string().min(1).trim().optional(),
});

export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;
export type UpdateInstructorInput = z.infer<typeof updateInstructorSchema>;