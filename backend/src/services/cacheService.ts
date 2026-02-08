import redis from "../config/redisConfig";


export const cacheService = {
    ROOM_TYPES_ALL: 'roomTypes:all',
    ROOM_TYPE: (id: string) => `roomType:${id}`,
    INSTRUCTORS_ALL: 'instructors:all',
    INSTRUCTOR: (id: string) => `instructor:${id}`,
    CLASSES_ALL: 'classes:all',
    CLASS: (id: string) => `class:${id}`,
    CALENDAR: (start: string, end: string) => `calendar:${start}:${end}`,
}

const DEFAULT_TTL = 300;

class CacheService {
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        }
        catch (error) {
            console.log("Cache Get Error: ", error);
            return null;
        }
    }

    async set(key: string, data: any, ttl: number = DEFAULT_TTL): Promise<void> {
        try {
            await redis.setex(key, ttl, JSON.stringify(data));
        }
        catch (error) {
            console.log("Cache Set Error: ", error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        }
        catch (error) {
            console.log("Cache Delete Error: ", error);
        }
    }

    async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(keys);
            }
        }
        catch (error) {
            console.log("Cache Delete Pattern Error: ", error);
        }
    }

    async delAll(): Promise<void> {
        try {
            await redis.flushall();
        }
        catch (error) {
            console.log("Cache Delete All Error: ", error);
        }
    }

    async invalidateRoomTypes(): Promise<void> {
        await this.delPattern('roomTypes:*');
    }

    async invalidateInstructors(): Promise<void> {
        await this.delPattern('instructors:*');
    }

    async invalidateClasses(): Promise<void> {
        await this.delPattern('classes:*');
    }

    async invalidateCalendar(): Promise<void> {
        await this.delPattern('calendar:*');
    }
}

export default new CacheService();
