const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000
    });

    console.log("MongoDB connected");
    console.log("Host:", conn.connection.host);
};

module.exports = connectDB;
