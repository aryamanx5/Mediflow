const mongoose = require("mongoose");

// On Vercel the handler is re-invoked on a warm container, so the connection is
// cached on the global object and reused across invocations instead of opening a
// new socket per request. Locally this just runs once at boot.
let cached = global.__mongooseConn;
if (!cached) {
    cached = global.__mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not set");
        }

        cached.promise = mongoose
            .connect(process.env.MONGO_URI)
            .then((mongooseInstance) => {
                console.log("✅ MongoDB Connected Successfully");
                return mongooseInstance;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;
