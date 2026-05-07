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

// ---------- Security Middleware ----------
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS — environment-based
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "https://taskflow-ethara-ai.vercel.app",
  "https://taskflow-ethara-2204dfsyp-pagidalasakirans-projects.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

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
