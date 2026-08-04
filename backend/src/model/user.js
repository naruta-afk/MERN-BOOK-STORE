import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        {
            IsAdmin: {
                type: Boolean,
                required: true,
                default: false,
        }
    },
    {
        timestamps: true,
    }
);
};

export default mongoose.model("User", userSchema);