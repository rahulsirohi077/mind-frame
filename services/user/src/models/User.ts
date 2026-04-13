import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    instagram?: string;
    facebook?: string;
    linkedIn?: string;
    bio: string;
}

const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    instagram: String,
    facebook: String,
    linkedIn: String,
    bio: String
},{
    timestamps: true
});

const User =  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", schema);

export default User;