import mongoose from "mongoose";

export interface IInstructor extends mongoose.Document{
    name:string;
    role:string;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const instructorSchema = new mongoose.Schema<IInstructor>({

    name:{
        type:String,
        required:true,
        trim:true,
    },
    role:{
        type:String,
        required:true,
        trim:true,
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    },
})

// Indexes
instructorSchema.index({isActive:1});
instructorSchema.index({name:'text'});

const Instructor = mongoose.model<IInstructor>('Instructor',instructorSchema);

export default Instructor;
