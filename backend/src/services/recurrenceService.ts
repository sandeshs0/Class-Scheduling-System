import mongoose from 'mongoose';
import { IClass } from '../models/Class';
import ClassInstance, { IClassInstance } from '../models/ClassInstance';
import { RecurrencePattern } from '../types/recurrence.types';

class RecurrenceService {

    async generateInstances(classDoc: IClass): Promise<IClassInstance[]> {
        if (!classDoc.isRecurring) {
            return this.createSingleInstance(classDoc);
        }

        const dates = this.generateDates(classDoc.recurrence!);
        return this.createInstancesForDates(classDoc, dates);
    }

    private async createSingleInstance(classDoc: IClass): Promise<IClassInstance[]> {
        const instance = await ClassInstance.create({
            class: classDoc._id,
            instructor: classDoc.instructor,
            roomType: classDoc.roomType,
            date: classDoc.scheduledDate,
            startTime: classDoc.startTime,
            endTime: classDoc.endTime,
        })
        return [instance];
    }

    private async createInstancesForDates(classDoc: IClass, dates: Date[]): Promise<IClassInstance[]> {
        const timeSlots = classDoc.recurrence!.timeSlots;
        const instances: any[] = [];
        for (const date of dates) {
            for (const timeSlot of timeSlots) {
                instances.push({
                    class: classDoc._id,
                    instructor: classDoc.instructor,
                    roomType: classDoc.roomType,
                    date: date,
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                })
            }
        }
        if (instances.length > 0) {
            const created = await ClassInstance.insertMany(instances);
            return created as unknown as IClassInstance[];
        }
        return [];

    }


    generateDates(pattern: RecurrencePattern | undefined): Date[] {
        if (!pattern) return [];
        switch (pattern.type) {
            case 'daily':
                return this.generateDailyDates(pattern);
            case 'weekly':
                return this.generateWeeklyDates(pattern);
            case 'monthly':
                return this.generateMonthlyDates(pattern);
            case 'custom':
                return this.generateCustomDates(pattern);
            default:
                return [];
        }

    }

    private generateDailyDates(pattern: RecurrencePattern): Date[] {
        const dates: Date[] = [];
        const start = new Date(pattern.startDate);
        const end = pattern.endDate ? new Date(pattern.endDate) : this.addDays(start, 365);
        const maxOccurrences = pattern.occurrences || 365;

        let current = new Date(start);
        let count = 0;

        while (current <= end && count < maxOccurrences) {
            dates.push(new Date(current));
            current = this.addDays(current, 1);
            count++;
        }

        return dates;
    }

    private generateWeeklyDates(pattern: RecurrencePattern): Date[] {
        const dates: Date[] = [];
        const start = new Date(pattern.startDate);
        const end = pattern.endDate ? new Date(pattern.endDate) : this.addDays(start, 365);
        const maxOccurrences = pattern.occurrences || 365;

        const weekDays = pattern.weekDays || [];

        if (weekDays.length === 0) return dates;

        let current = new Date(start);
        let count = 0;

        while (current <= end && count < maxOccurrences) {
            const dayOfWeek = current.getDay();

            if (weekDays.includes(dayOfWeek)) {
                dates.push(new Date(current));
                count++;
            }

            current = this.addDays(current, 1);
        }

        return dates;
    }

    private generateMonthlyDates(pattern: RecurrencePattern): Date[] {
        const dates: Date[] = [];
        const start = new Date(pattern.startDate);
        const end = pattern.endDate ? new Date(pattern.endDate) : this.addMonths(start, 12);
        const maxOccurrences = pattern.occurrences || 365;
        const monthDays = pattern.monthDays || [];

        if (monthDays.length === 0) return dates;

        let current = new Date(start);
        let count = 0;

        while (current <= end && count < maxOccurrences) {
            const dayOfMonth = current.getDate();

            if (monthDays.includes(dayOfMonth)) {
                dates.push(new Date(current));
                count++;
            }

            current = this.addDays(current, 1);
        }

        return dates;
    }


    private generateCustomDates(pattern: RecurrencePattern): Date[] {
        const dates: Date[] = [];
        const start = new Date(pattern.startDate);
        const end = pattern.endDate ? new Date(pattern.endDate) : this.addDays(start, 365);
        const maxOccurrences = pattern.occurrences || 365;

        const customPattern = pattern.customPattern;
        if (!customPattern || !customPattern.weekDays || customPattern.weekDays.length === 0) return dates;

        const weekDays = customPattern.weekDays;
        const interval = customPattern.interval || 1; 

        let current = new Date(start);
        let weekStart = this.getWeekStart(current);
        let count = 0;

        while (current <= end && count < maxOccurrences) {
            const dayOfWeek = current.getDay();

            if (weekDays.includes(dayOfWeek)) {
                dates.push(new Date(current));
                count++;
            }

            current = this.addDays(current, 1);

            const currentWeekStart = this.getWeekStart(current);
            if (currentWeekStart.getTime() !== weekStart.getTime()) {
                if (interval > 1) {
                    current = this.addDays(current, 7 * (interval - 1));
                }
                weekStart = this.getWeekStart(current);
            }
        }

        return dates;
    }

    async deleteInstancesForClass(classId: mongoose.Types.ObjectId | string): Promise<void> {
        await ClassInstance.deleteMany({ class: new mongoose.Types.ObjectId(classId.toString()) });
    }

   
    async regenerateInstances(classDoc: IClass): Promise<IClassInstance[]> {
        await this.deleteInstancesForClass(classDoc._id as mongoose.Types.ObjectId);
        return this.generateInstances(classDoc);
    }


    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    private getWeekStart(date: Date): Date {
        const result = new Date(date);
        const day = result.getDay();
        result.setDate(result.getDate() - day);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    private dayNameToNumber(day: string): number {
        const days: { [key: string]: number } = {
            'sunday': 0, 'sun': 0,
            'monday': 1, 'mon': 1,
            'tuesday': 2, 'tue': 2,
            'wednesday': 3, 'wed': 3,
            'thursday': 4, 'thu': 4,
            'friday': 5, 'fri': 5,
            'saturday': 6, 'sat': 6,
        };
        return days[day.toLowerCase()] ?? 0;
    }
}
export default new RecurrenceService();
