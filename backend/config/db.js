const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error(
                "MONGODB_URI is missing. Check backend/.env file."
            );
        }

        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(mongoURI);

        console.log("MongoDB Atlas connected successfully!");

    } catch (error) {

        console.error("MongoDB connection failed:", error.message);

        throw error;
    }
};

module.exports = connectDB;