import { Response } from "express";

interface FieldError {
    field: string;
    message: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const successResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    title:string,
    data: T,
    pagination?: PaginationInfo
): Response => {
    const response: any = {
        title,
        message,
        data,
    };
    if (pagination) {
        response.pagination = pagination;
    }
    return res.status(statusCode).json(response);
}

export const errorResponse = <T>(
    res: Response,
    statusCode: number,
    title:string,
    message: string,
    errors?: FieldError[],
): Response => {
    const response: any ={
        title,
        message,
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
}

export const createPagination = (
    total: number,
    page: number,
    limit: number
): PaginationInfo => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
});
