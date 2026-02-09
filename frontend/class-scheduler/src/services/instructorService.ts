import type { CreateInstructorDTO, Instructor } from '../types';
import api from './api';

export const instructorService = {
    getAll: async (): Promise<Instructor[]> => {
        const response = await api.get('/instructors');
        return response.data.data || response.data;
    },

    getById: async (id: string): Promise<Instructor> => {
        const response = await api.get(`/instructors/${id}`);
        return response.data.data || response.data;
    },

    create: async (data: CreateInstructorDTO): Promise<Instructor> => {
        const response = await api.post('/instructors', data);
        return response.data.data || response.data;
    },

    update: async (id: string, data: Partial<CreateInstructorDTO>): Promise<Instructor> => {
        const response = await api.put(`/instructors/${id}`, data);
        return response.data.data || response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/instructors/${id}`);
    },
};
