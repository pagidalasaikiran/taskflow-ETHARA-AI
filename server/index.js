const config = require('./config/config');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();
app.set("trust proxy", 1);

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    ip: req.ip,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  next();
});

// ---------- Security Middleware ----------
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Global error handlers for crash prevention and logging
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

// CORS — environment-based
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "https://taskflow-ethara-ai.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`[CORS CHECK]: Origin=${origin}`);
    
    // Allow if no origin (like mobile apps or curl) or if it's in our allowlist
    if (!origin) return callback(null, true);

    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isVercel = origin.endsWith('.vercel.app'); // Permissive for all vercel apps during debug
    
    if (isLocal || isVercel || allowedOrigins.includes(origin)) {
      console.log(`[CORS ALLOWED]: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED]: Origin ${origin} not in allowlist`);
      callback(null, false); // Return false instead of error to avoid 500
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting — DISABLED FOR DEBUGGING
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);
*/

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', environment: config.NODE_ENV });
});

// Catch-all for unmatched API routes
app.all('/api/*', (req, res) => {
  console.warn(`[UNMATCHED ROUTE]: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found on this server`
  });
});

// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = config.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
