const mongoose = require("mongoose");

// Cache the MongoDB connection
let cachedConnection = null;

const connectDB = async () => {
    // If a connection exists, use it
    if (cachedConnection) {
        console.log("Using existing MongoDB connection");
        return cachedConnection;
    }

    try {
        // If no connection, create a new one
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Longer timeout for Vercel
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Reduced pool size for serverless
            bufferCommands: false, // Disable command buffering
        });
        
        console.log("MongoDB connected successfully");
        cachedConnection = mongoose.connection;
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            cachedConnection = null; // Reset on error
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cachedConnection = null; // Reset on disconnect
        });

        return cachedConnection;

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
