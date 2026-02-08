import { Request, Response } from 'express';
import asyncHandler from '../middlewares/aysncHandler';
import RoomType from '../models/RoomType';
import cacheService, { cacheService as CACHE_KEYS } from '../services/cacheService';
import { createPagination, errorResponse, successResponse } from '../utils/apiResponse';

// @desc    Create a new room type
// @route   POST /api/room-types
export const createRoomType = asyncHandler(async (req: Request, res: Response) => {
    // Body is already validated by middleware!
    const { name, description, capacity } = req.body;

    // Check for duplicate name
    const existingRoom = await RoomType.findOne({ name: name.toLowerCase() });
    if (existingRoom) {
        return errorResponse(res, 400, 'Duplicate Error', 'Room type with this name already exists');
    }

    const roomType = await RoomType.create({ name, description, capacity });

    // Invalidate cache
    await cacheService.invalidateRoomTypes();

    return successResponse(res, 201, 'Room Type Created', 'Room type has been created successfully', roomType);
});

// @desc    Get all room types
// @route   GET /api/room-types
export const getAllRoomTypes = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Try cache first
    const cacheKey = `${CACHE_KEYS.ROOM_TYPES_ALL}:${page}:${limit}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Room Types Fetched', 'Loaded from cache', cached.data, cached.pagination);
    }

    const query = { isActive: true };
    const total = await RoomType.countDocuments(query);
    const roomTypes = await RoomType.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const pagination = createPagination(total, page, limit);

    // Cache the result
    await cacheService.set(cacheKey, { data: roomTypes, pagination });

    return successResponse(res, 200, 'Room Types Fetched', 'Room types loaded successfully', roomTypes, pagination);
});

// @desc    Get single room type
// @route   GET /api/room-types/:id
export const getRoomTypeById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const cacheKey = CACHE_KEYS.ROOM_TYPE(id);
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Room Type Fetched', 'Loaded from cache', cached);
    }

    const roomType = await RoomType.findById(id);

    if (!roomType || !roomType.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Room type not found');
    }

    await cacheService.set(cacheKey, roomType);

    return successResponse(res, 200, 'Room Type Fetched', 'Room type loaded successfully', roomType);
});

// @desc    Update room type
// @route   PUT /api/room-types/:id
export const updateRoomType = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, description, capacity } = req.body;

    const roomType = await RoomType.findById(id);

    if (!roomType || !roomType.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Room type not found');
    }

    // Check for duplicate name
    if (name && name.toLowerCase() !== roomType.name) {
        const existing = await RoomType.findOne({ name: name.toLowerCase(), _id: { $ne: id } });
        if (existing) {
            return errorResponse(res, 400, 'Duplicate Error', 'Room type with this name already exists');
        }
    }

    if (name) roomType.name = name;
    if (description !== undefined) roomType.description = description;
    if (capacity) roomType.capacity = capacity;
    roomType.updatedAt = new Date();

    await roomType.save();
    await cacheService.invalidateRoomTypes();

    return successResponse(res, 200, 'Room Type Updated', 'Room type updated successfully', roomType);
});

export const deleteRoomType = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const roomType = await RoomType.findById(id);

    if (!roomType || !roomType.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Room type not found');
    }

    roomType.isActive = false;
    roomType.updatedAt = new Date();
    await roomType.save();

    await cacheService.invalidateRoomTypes();

    return successResponse(res, 200, 'Room Type Deleted', 'Room type deleted successfully', { id });
});