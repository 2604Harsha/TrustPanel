

require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});


const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");



const connectDB = require("./config/db");



const createAdmin = require("./utils/createAdmin");



const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

const PORT = process.env.PORT || 5000;



if (!process.env.MONGODB_URI) {
    console.error("ERROR: MONGODB_URI is missing.");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is missing.");
    process.exit(1);
}



const allowedOrigins = [
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];

const configuredOrigin = process.env.CLIENT_URL?.trim();

if (configuredOrigin && !allowedOrigins.includes(configuredOrigin)) {
    allowedOrigins.push(configuredOrigin);
}

app.use(
    cors({
        origin: (origin, callback) => {

            
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error("Blocked CORS origin:", origin);

            return callback(
                new Error("Not allowed by CORS: " + origin)
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);



app.use(helmet());


app.use(express.json({ limit: "10mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);

app.use(cookieParser());



app.use((req, res, next) => {

    console.log(
        `${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
    );

    next();
});



app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Northstar Authentication API is running",
        database:
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Disconnected",
        environment: process.env.NODE_ENV || "development"
    });

});


app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin", adminRoutes);


app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl
    });

});


app.use((err, req, res, next) => {

    console.error("SERVER ERROR:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal Server Error"
                : err.message
    });

});



const startServer = async () => {

    try {

        console.log("----------------------------------");
        console.log("STARTING NORTHSTAR BACKEND");
        console.log("----------------------------------");

        console.log("Environment variables loaded.");

        console.log(
            "MongoDB URI available:",
            Boolean(process.env.MONGODB_URI)
        );

        console.log("Connecting to MongoDB Atlas...");

        
        await connectDB();

        console.log("MongoDB Atlas connected successfully.");

        
        console.log("Checking administrator account...");

        await createAdmin();

        console.log("Administrator account ready.");

        
        const server = app.listen(PORT, () => {

            console.log("----------------------------------");
            console.log("NORTHSTAR BACKEND STARTED");
            console.log("----------------------------------");

            console.log(`Server: http://localhost:${PORT}`);

            console.log(
                `Health: http://localhost:${PORT}/api/health`
            );

            console.log("Allowed frontend origins:");

            allowedOrigins.forEach(origin => {
                console.log(` - ${origin}`);
            });

            console.log("MongoDB: Connected");
            console.log("Admin: Ready");

            console.log("----------------------------------");

        });

        const shutdown = async () => {

            console.log("Shutting down server...");

            server.close(async () => {

                try {
                    await mongoose.disconnect();

                    console.log("Database disconnected.");
                } catch (error) {
                    console.error(error.message);
                }

                process.exit(0);
            });

        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error) {

        console.error("----------------------------------");
        console.error("BACKEND STARTUP FAILED");
        console.error("----------------------------------");

        console.error(error.message);

        process.exit(1);
    }

};



startServer();

module.exports = app;
