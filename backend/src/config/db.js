import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.CONNECTION_URI || process.env.CONNECTION_STRING;
    if (!uri) {
      throw new Error("MongoDB connection string is missing. Set CONNECTION_URI or CONNECTION_STRING in the backend .env file.");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;