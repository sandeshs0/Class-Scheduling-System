import { Request, Response } from 'express';
import asyncHandler from '../middlewares/aysncHandler';
import Instructor from '../models/Instructor';
import cacheService, { cacheService as CACHE_KEYS } from '../services/cacheService';
import { createPagination, errorResponse, successResponse } from '../utils/apiResponse';

// @desc    Create a new instructor
// @route   POST /api/instructors
export const createInstructor = asyncHandler(async (req: Request, res: Response) => {
    const { name, role } = req.body;

    const instructor = await Instructor.create({ name, role });

    // Invalidate cache
    await cacheService.invalidateInstructors();

    return successResponse(res, 201, 'Instructor Created', 'Instructor has been created successfully', instructor);
});

// @desc    Get all instructors
// @route   GET /api/instructors
export const getAllInstructors = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Try cache first
    const cacheKey = `${CACHE_KEYS.INSTRUCTORS_ALL}:${page}:${limit}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Instructors Fetched', 'Loaded from cache', cached.data, cached.pagination);
    }

    const query = { isActive: true };
    const total = await Instructor.countDocuments(query);
    const instructors = await Instructor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const pagination = createPagination(total, page, limit);

    // Cache the result
    await cacheService.set(cacheKey, { data: instructors, pagination });

    return successResponse(res, 200, 'Instructors Fetched', 'Instructors loaded successfully', instructors, pagination);
});

// @desc    Get single instructor
// @route   GET /api/instructors/:id
export const getInstructorById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const cacheKey = CACHE_KEYS.INSTRUCTOR(id);
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Instructor Fetched', 'Loaded from cache', cached);
    }

    const instructor = await Instructor.findById(id);

    if (!instructor || !instructor.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Instructor not found');
    }

    await cacheService.set(cacheKey, instructor);

    return successResponse(res, 200, 'Instructor Fetched', 'Instructor loaded successfully', instructor);
});

// @desc    Update instructor
// @route   PUT /api/instructors/:id
export const updateInstructor = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, role } = req.body;

    const instructor = await Instructor.findById(id);

    if (!instructor || !instructor.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Instructor not found');
    }

    if (name) instructor.name = name;
    if (role) instructor.role = role;
    instructor.updatedAt = new Date();

    await instructor.save();
    await cacheService.invalidateInstructors();

    return successResponse(res, 200, 'Instructor Updated', 'Instructor updated successfully', instructor);
});

// @desc    Delete instructor (soft delete)
// @route   DELETE /api/instructors/:id
export const deleteInstructor = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const instructor = await Instructor.findById(id);

    if (!instructor || !instructor.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Instructor not found');
    }

    instructor.isActive = false;
    instructor.updatedAt = new Date();
    await instructor.save();

    await cacheService.invalidateInstructors();

    return successResponse(res, 200, 'Instructor Deleted', 'Instructor deleted successfully', { id });
});