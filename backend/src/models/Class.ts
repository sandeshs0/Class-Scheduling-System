import mongoose from "mongoose";
import { RecurrencePattern, timeSlot } from "../types/recurrence.types";

export interface IClass extends mongoose.Document {
    title: string;
    description: string;
    instructor: mongoose.Types.ObjectId;
    roomType: mongoose.Types.ObjectId;
    isRecurring: boolean;
    recurrence?: RecurrencePattern;
    scheduledDate?: Date; //for one time class
    startTime?: string;
    endTime?: string;

    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const timeSlotSchema = new mongoose.Schema<timeSlot>({
    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    }
}, { _id: false })

const recurrencePatternSchema = new mongoose.Schema<RecurrencePattern>({
    type: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
        required: true
    },
    timeSlots: {
        type: [timeSlotSchema],
        required: true,
        validate: [(val: timeSlot[]) => val.length > 0, 'At least one time slot is required'],
    },
    weekDays: {
        type: [Number],
        default: [],
        validate: {
            validator: (days: number[]) => days.every(d => d >= 0 && d <= 6),
            message: 'Week days must be between 0 (Sunday) and 6 (Saturday)',
        },
    },
    monthDays: {
        type: [Number],
        default: [],
        validate: {
            validator: (days: number[]) => days.every(d => d >= 1 && d <= 31),
            message: 'Month days must be between 1 and 31',
        },
    },
    customPattern: {
        weekDays: {
            type: [Number],
            validate: {
                validator: (days: number[]) => days.every(d => d >= 0 && d <= 6),
                message: 'Week days must be between 0 (Sunday) and 6 (Saturday)',
            },
        },
        interval: {
            type: Number,
            min: 1,
            default: 1
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    occurrences: {
        type: Number,
        required: true,
        min: 1,
        max: 365,
    },
}, { _id: false })

const classSchema = new mongoose.Schema<IClass>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true
    },
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrence: {
        type: recurrencePatternSchema,

    },
    scheduledDate: {
        type: Date
    },
    startTime: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    endTime: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Indexing
classSchema.index({ instructor: 1 });
classSchema.index({ roomType: 1 });
classSchema.index({ scheduledDate: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ 'recurrence.startDate': 1, 'recurrence.endDate': 1 });

// Validation for either one time or recurring 
classSchema.pre('save', function () {
    if (this.isRecurring) {
        if (!this.recurrence) {
            throw new Error('Recurrence pattern is required for recurring classes');
        }
        this.scheduledDate = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
    } else {
        if (!this.scheduledDate || !this.startTime || !this.endTime) {
            throw new Error('Scheduled date and time are required for one time classes');
        }
        this.recurrence = undefined;
    }
})

export default mongoose.model<IClass>('Class', classSchema);