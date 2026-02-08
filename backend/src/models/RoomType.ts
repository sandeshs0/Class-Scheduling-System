import mongoose from "mongoose";

export interface IRoomType extends mongoose.Document {
    name: string;
    description: string;
    capacity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const roomTypeSchema = new mongoose.Schema<IRoomType>({

    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})
// Indexes
roomTypeSchema.index({ isActive: 1 });
roomTypeSchema.index({ name: 'text' });

const RoomType = mongoose.model<IRoomType>('RoomType', roomTypeSchema);

export default RoomType;
