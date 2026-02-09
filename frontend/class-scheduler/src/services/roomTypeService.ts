import type { CreateRoomTypeDTO, RoomType } from '../types';
import api from './api';

export const roomTypeService = {
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
