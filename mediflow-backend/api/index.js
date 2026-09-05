// Vercel serverless entry point. Every request is rewritten to this function
// (see vercel.json); the Express app in ../src/app.js does the routing exactly
// as it does locally. server.js is still the entry point for `npm start`.
const app = require("../src/app");
const connectDB = require("../src/config/database");
const { seedDemoUser } = require("../src/config/demo");

let bootstrap;

// Connect once per warm container and keep the demo user seeded. If it fails,
// clear the cache so the next request retries instead of staying broken.
function ready() {
    if (!bootstrap) {
        bootstrap = connectDB()
            .then(seedDemoUser)
            .catch((error) => {
                bootstrap = undefined;
                throw error;
            });
    }
    return bootstrap;
}

module.exports = async (req, res) => {
    try {
        await ready();
    } catch (error) {
        console.error(error.message);
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                success: false,
                message: "Database connection failed",
            })
        );
        return;
    }

    return app(req, res);
};
