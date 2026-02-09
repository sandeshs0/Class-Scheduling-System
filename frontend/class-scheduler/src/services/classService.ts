import type { Class, ClassInstance, CreateClassDTO } from '../types';
import api from './api';

export const classService = {
    getAll: async (): Promise<Class[]> => {
        const response = await api.get('/classes');
        return response.data.data || response.data;
    },

    getCalendar: async (startDate: string, endDate: string): Promise<any[]> => {
        const response = await api.get('/classes/calendar', {
            params: { startDate, endDate },
        });
        return response.data.data || response.data;
    },

    getById: async (id: string): Promise<Class> => {
        const response = await api.get(`/classes/${id}`);
        return response.data.data || response.data;
    },

    create: async (data: CreateClassDTO): Promise<Class> => {
        const response = await api.post('/classes', data);
        return response.data.data || response.data;
    },

    update: async (id: string, data: Partial<CreateClassDTO>): Promise<Class> => {
        const response = await api.put(`/classes/${id}`, data);
        return response.data.data || response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/classes/${id}`);
    },

    getInstances: async (startDate: string, endDate: string): Promise<ClassInstance[]> => {
        const response = await api.get('/classes/instances', {
            params: { startDate, endDate },
        });
        return response.data.data || response.data;
    },
};
