import mongoose from "mongoose";

export interface IClassInstance extends mongoose.Document {
    class: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    roomType: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    isCancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const classInstanceSchema = new mongoose.Schema<IClassInstance>({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
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
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
classInstanceSchema.index({ class: 1 });
classInstanceSchema.index({ instructor: 1, date: 1 });
classInstanceSchema.index({ roomType: 1, date: 1 });
classInstanceSchema.index({ date: 1 });
classInstanceSchema.index({ date: 1, isCancelled: 1 });

const ClassInstance = mongoose.model<IClassInstance>('ClassInstance', classInstanceSchema);

export default ClassInstance;
