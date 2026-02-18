import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Config
import './config/firebase.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import cityRoutes from './routes/city.routes.js';
import salonsRoutes from './routes/salons.route.js';
import vercelUploadRoutes from "./routes/vercelUploadRoutes.js";
import couponRoutes from './routes/coupon.routes.js';
import reviewRoutes from "./routes/review.routes.js";
import adminReviewRoutes from "./routes/admin.review.routes.js";
import { authMiddleware } from './middelwares/auth.middleware.js';

// Load environmental variables
dotenv.config();

const app = express();

// --- Configuration ----------------------------------------------------------

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// CORS
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:4200')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Length', 'X-Request-Id']
};
app.use(cors(corsOptions));

// Security & Performance
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 200,                       // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Parsing
app.use(express.json());
app.use(cookieParser());

// Custom Middleware: Request ID
app.use((req, res, next) => {
  res.setHeader('X-Request-Id', req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Public API
app.get('/', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));
app.get('/health', (_, res) => res.sendStatus(204));

app.use('/api/auth', authRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin API
app.use('/api/admin/city', cityRoutes);
app.use('/api/admin/salons', salonsRoutes);
app.use("/api/admin/upload", vercelUploadRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);

export default app;