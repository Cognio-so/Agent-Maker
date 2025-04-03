const mongoose = require("mongoose");

// Global connection promise that can be awaited
let dbConnectionPromise = null;

const connectDB = async () => {
    // Return existing connection promise if it exists
    if (dbConnectionPromise) {
        return dbConnectionPromise;
    }

    // Create new connection promise
    dbConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        // Remove bufferCommands: false to allow buffering
    });
    
    try {
        await dbConnectionPromise;
        console.log("MongoDB connected successfully");
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            dbConnectionPromise = null; // Reset on error
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            dbConnectionPromise = null; // Reset on disconnect
        });
        
        return dbConnectionPromise;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        dbConnectionPromise = null;
        throw error;
    }
};

module.exports = connectDB;
