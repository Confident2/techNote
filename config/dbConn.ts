import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URI as string);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

export default connectDB;
