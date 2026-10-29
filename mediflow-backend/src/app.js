const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();

// Vercel sits in front of the app, so trust its forwarded client IP (needed
// for per-IP rate limiting).
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());

// Comma-separated list of allowed frontend origins, e.g.
// CORS_ORIGINS=https://mediflow.vercel.app,http://localhost:5173
// Unset means any origin may call the API (auth is a Bearer token, not a cookie).
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));

app.use(express.json({ limit: "100kb" }));

// Never send internal error text (stack details, DB messages) to the client
// on a 500. Validation errors (4xx) still pass through unchanged.
app.use((req, res, next) => {
    const json = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 500 && body && typeof body === "object") {
            console.error(`${req.method} ${req.originalUrl}:`, body.message);
            body = { ...body, message: "Something went wrong. Please try again." };
        }
        return json(body);
    };
    next();
});

// Slow down password guessing and signup spam.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please wait a few minutes and try again.",
    },
});

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");


app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


module.exports = app;
