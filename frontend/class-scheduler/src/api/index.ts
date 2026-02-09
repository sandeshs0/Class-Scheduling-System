import axios from 'axios';
import type {
    Class,
    ClassInstance,
    CreateClassDTO,
    CreateInstructorDTO,
    CreateRoomTypeDTO,
    Instructor,
    RoomType,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============ Room Types ============
export const roomTypeApi = {
    getAll: async (): Promise<RoomType[]> => {
        const response = await api.get('/room-types');
        return response.data.data || response.data;
    },

    getById: async (id: string): Promise<RoomType> => {
        const response = await api.get(`/room-types/${id}`);
        return response.data.data || response.data;
    },

    create: async (data: CreateRoomTypeDTO): Promise<RoomType> => {
        const response = await api.post('/room-types', data);
        return response.data.data || response.data;
    },

    update: async (id: string, data: Partial<CreateRoomTypeDTO>): Promise<RoomType> => {
        const response = await api.put(`/room-types/${id}`, data);
        return response.data.data || response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/room-types/${id}`);
    },
};

// ============ Instructors ============
export const instructorApi = {
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

// ============ Classes ============
export const classApi = {
    getAll: async (): Promise<Class[]> => {
        const response = await api.get('/classes');
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

export default api;
