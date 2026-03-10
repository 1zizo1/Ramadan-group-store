import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import connectDB from "./config/db.js";

//route imorts
import authRoutes from "./route/authRoutes.js"
import userRoutes from "./route/userRoutes.js"
import brandRoutes from "./route/brandRoutes.js"
import categoreyRoutes from "./route/categoryRoutes.js"
import productRoutes from "./route/productRoutes.js"
import bannerRoutes from "./routes/bannerRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"
import swaggerUI from "swagger-ui-express"
import {specs} from "./config/swagger.js"
// Load env vars
dotenv.config();

// Connect to database
connectDB()
const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  // Add production URLs

  // Add localhost for development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081", // iOS simulator
  "http://10.0.2.2:8081", // Android emulator
  "http://10.0.2.2:8000", // Android emulator direct access
  // "http://192.168.1.100:8081", // Replace with your actual local IP for physical devices
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Increase body size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Debug middleware for order routes

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/categories", categoreyRoutes)
app.use("/api/products", productRoutes)
app.use("/api/banners", bannerRoutes);
//stats
app.use("/api/stats", statsRoutes);
// orderRoutes
app.use("/api/orders", orderRoutes);
// cartRoutes
// app.use("/api/cart", cartRoutes);
//wishlist
// app.use("/api/wishlist", wishlistRoutes);
// analyticsRoutes
// app.use("/api/analytics", analyticsRoutes);
// paymentRoutes
// app.use("/api/payments", paymentRoutes);

// API Documentation
app.use("/api/docs",
  swaggerUI.serve, swaggerUI.setup(specs,
    {
      explorer: true,
      customCss: ".swagger-ui .topbar {display:none}",
      customSiteTitle: "RamadanGroup Api documentaion "
    }))
// Home route
app.get("/", (req, res) => {
  // const projectInfo = {
  //   name: "🍼 BabyShop E-commerce API",
  //   version: "1.0.0",
  //   description: "Backend API server for BabyShop e-commerce platform",
  //   status: "Running",
  //   environment: process.env.NODE_ENV || "development",
  //   port: PORT,
  //   endpoints: {
  //     documentation: `/api-docs`,
  //     health: `/health`,
  //     api: `/api/v1`,
  //   },
  //   features: [
  //     "🔐 JWT Authentication",
  //     "📦 Product Management",
  //     "🛍️ Order Processing",
  //     "👥 User Management",
  //     "☁️ Cloudinary Integration",
  //     "📊 MongoDB Database",
  //     "📖 Swagger Documentation",
  //   ],
  //   applications: {
  //     "Admin Dashboard": process.env.ADMIN_URL || "http://localhost:5173",
  //     "Client Website": process.env.CLIENT_URL || "http://localhost:3000",
  //     "Mobile App": "React Native Application",
  //     "API Server": `http://localhost:${PORT} (You are here)`,
  //   },
  //   quickStart: {
  //     development: "npm run dev",
  //     production: "npm start",
  //     documentation: `Visit http://localhost:${PORT}/api-docs for API documentation`,
  //   },
  //   message:
  //     "🚀 BabyShop API is running successfully! Remove this placeholder and start building your API endpoints.",
  // };
  res.send({ message: "server is running.." })
  // res.json(projectInfo);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀  API Server is running!`);
});
