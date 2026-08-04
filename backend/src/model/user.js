import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adressShema = new mongoose.Schema(
    
    {
        street : String,
        city : String,
        state : String,
        postalCode : String,
        contry : String,
    },
    {
        _id : false
    }
);

const userSchema = new mongoose.Schema(
{
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        match : [/\S+@\S+\.\S+/, "P;ease use a valid email address"],
    },
    password : {
        type : String,
        required : true,
        minlength : [6, "Password should be at least 6 characters long"],
        select : false
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, trim: true },
    address: addressSchema,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }

);


export default mongoose.model("User", userSchema);