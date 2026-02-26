import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<user>") || uri.includes("<password>") || uri.includes("your_") || uri.includes("<dbname>")) {
    console.log(
      "MongoDB URI is not set or appears to be a placeholder. Skipping DB connection. Set a valid MONGODB_URI in your .env to enable DB connectivity."
    );
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
