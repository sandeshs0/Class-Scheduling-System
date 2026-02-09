import { Request, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../middlewares/aysncHandler';
import Class from '../models/Class';
import ClassInstance from '../models/ClassInstance';
import Instructor from '../models/Instructor';
import RoomType from '../models/RoomType';
import cacheService, { cacheService as CACHE_KEYS } from '../services/cacheService';
import recurrenceService from '../services/recurrenceService';
import { createPagination, errorResponse, successResponse } from '../utils/apiResponse';


export const createClass = asyncHandler(async (req: Request, res: Response) => {
    const {
        title, description, instructor, roomType,
        isRecurring, recurrence, scheduledDate, startTime, endTime
    } = req.body;

    // Verify instructor exists
    const instructorDoc = await Instructor.findById(instructor);
    if (!instructorDoc || !instructorDoc.isActive) {
        return errorResponse(res, 400, 'Invalid Instructor', 'Instructor not found');
    }

    // Verify room type exists
    const roomTypeDoc = await RoomType.findById(roomType);
    if (!roomTypeDoc || !roomTypeDoc.isActive) {
        return errorResponse(res, 400, 'Invalid Room Type', 'Room type not found');
    }

    // Create the class
    const classData: any = {
        title,
        description,
        instructor: new mongoose.Types.ObjectId(instructor),
        roomType: new mongoose.Types.ObjectId(roomType),
        isRecurring
    };

    if (isRecurring) {
        // Transform dates in recurrence
        classData.recurrence = {
            ...recurrence,
            startDate: new Date(recurrence.startDate),
            endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
        };
    } else {
        classData.scheduledDate = new Date(scheduledDate);
        classData.startTime = startTime;
        classData.endTime = endTime;
    }

    const newClass = await Class.create(classData);

    // Generate instances
    const instances = await recurrenceService.generateInstances(newClass);

    // Invalidate cache
    await cacheService.invalidateClasses();
    await cacheService.invalidateCalendar();

    return successResponse(res, 201, 'Class Created',
        `Class created successfully with ${instances.length} instance(s)`,
        {
            class: newClass,
            instanceCount: instances.length
        }
    );
});


export const getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Try cache
    const cacheKey = `${CACHE_KEYS.CLASSES_ALL}:${page}:${limit}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Classes Fetched', 'Loaded from cache', cached.data, cached.pagination);
    }

    const query = { isActive: true };
    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
        .populate('instructor', 'name role')
        .populate('roomType', 'name capacity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const pagination = createPagination(total, page, limit);

    await cacheService.set(cacheKey, { data: classes, pagination });

    return successResponse(res, 200, 'Classes Fetched', 'Classes loaded successfully', classes, pagination);
});


export const getClassById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const cacheKey = CACHE_KEYS.CLASS(id as string);
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Class Fetched', 'Loaded from cache', cached);
    }
    const classDoc = await Class.findById(id)
        .populate('instructor', 'name role')
        .populate('roomType', 'name capacity');
    if (!classDoc || !classDoc.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Class not found');
    }
    // Get upcoming instances
    const instances = await ClassInstance.find({
        class: classDoc._id,
        date: { $gte: new Date() },
        isCancelled: false
    })
        .sort({ date: 1 })
        .limit(20);
    const result = { class: classDoc, upcomingInstances: instances };
    await cacheService.set(cacheKey, result);

    return successResponse(res, 200, 'Class Fetched', 'Class loaded successfully', result);
});

export const getCalendar = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!startDate || !endDate) {
        return errorResponse(res, 400, 'Validation Error', 'startDate and endDate are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Try cache
    const cacheKey = `${CACHE_KEYS.CALENDAR(startDate as string, endDate as string)}:${page}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
        return successResponse(res, 200, 'Calendar Fetched', 'Loaded from cache', cached.data, cached.pagination);
    }

    // Aggregation pipeline for calendar data
    const pipeline: any[] = [
        {
            $match: {
                date: { $gte: start, $lte: end },
                isCancelled: false,
            }
        },
        {
            $lookup: {
                from: 'classes',
                localField: 'class',
                foreignField: '_id',
                as: 'classInfo'
            }
        },
        { $unwind: '$classInfo' },
        {
            $match: { 'classInfo.isActive': true }
        },
        {
            $lookup: {
                from: 'instructors',
                localField: 'instructor',
                foreignField: '_id',
                as: 'instructorInfo'
            }
        },
        { $unwind: '$instructorInfo' },
        {
            $lookup: {
                from: 'roomtypes',
                localField: 'roomType',
                foreignField: '_id',
                as: 'roomTypeInfo'
            }
        },
        { $unwind: '$roomTypeInfo' },
        {
            $project: {
                _id: 1,
                date: 1,
                startTime: 1,
                endTime: 1,
                isCancelled: 1,
                class: {
                    _id: '$classInfo._id',
                    title: '$classInfo.title',
                    description: '$classInfo.description',
                },
                instructor: {
                    _id: '$instructorInfo._id',
                    name: '$instructorInfo.name',
                },
                roomType: {
                    _id: '$roomTypeInfo._id',
                    name: '$roomTypeInfo.name',
                    capacity: '$roomTypeInfo.capacity',
                }
            }
        },
        { $sort: { date: 1, startTime: 1 } },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await ClassInstance.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    const instances = await ClassInstance.aggregate(pipeline);
    const pagination = createPagination(total, page, limit);

    await cacheService.set(cacheKey, { data: instances, pagination });

    return successResponse(res, 200, 'Calendar Fetched', 'Schedule loaded successfully', instances, pagination);
});

export const updateClass = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, instructor, roomType } = req.body;

    const classDoc = await Class.findById(id);
    if (!classDoc || !classDoc.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Class not found');
    }

    // Update fields
    if (title) classDoc.title = title;
    if (description !== undefined) classDoc.description = description;
    if (instructor) {
        const instructorDoc = await Instructor.findById(instructor);
        if (!instructorDoc || !instructorDoc.isActive) {
            return errorResponse(res, 400, 'Invalid Instructor', 'Instructor not found');
        }
        classDoc.instructor = new mongoose.Types.ObjectId(instructor);
    }
    if (roomType) {
        const roomTypeDoc = await RoomType.findById(roomType);
        if (!roomTypeDoc || !roomTypeDoc.isActive) {
            return errorResponse(res, 400, 'Invalid Room Type', 'Room type not found');
        }
        classDoc.roomType = new mongoose.Types.ObjectId(roomType);
    }

    classDoc.updatedAt = new Date();
    await classDoc.save();

    // Regenerate instances if instructor or room changed
    if (instructor || roomType) {
        await recurrenceService.regenerateInstances(classDoc);
    }

    await cacheService.invalidateClasses();
    await cacheService.invalidateCalendar();

    return successResponse(res, 200, 'Class Updated', 'Class updated successfully', classDoc);
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const classDoc = await Class.findById(id);
    if (!classDoc || !classDoc.isActive) {
        return errorResponse(res, 404, 'Not Found', 'Class not found');
    }

    // Soft delete the class
    classDoc.isActive = false;
    classDoc.updatedAt = new Date();
    await classDoc.save();

    // Delete all future instances
    await ClassInstance.deleteMany({
        class: classDoc._id,
        date: { $gte: new Date() }
    });

    await cacheService.invalidateClasses();
    await cacheService.invalidateCalendar();

    return successResponse(res, 200, 'Class Deleted', 'Class deleted successfully', { id });
});


export const cancelInstance = asyncHandler(async (req: Request, res: Response) => {
    const { instanceId } = req.params;
    const { reason } = req.body;

    const instance = await ClassInstance.findById(instanceId);
    if (!instance) {
        return errorResponse(res, 404, 'Not Found', 'Instance not found');
    }

    instance.isCancelled = true;
    instance.updatedAt = new Date();
    await instance.save();

    await cacheService.invalidateCalendar();

    return successResponse(res, 200, 'Instance Cancelled', 'Class instance cancelled successfully', instance);
});