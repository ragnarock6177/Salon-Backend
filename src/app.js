import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import cityRoutes from './routes/city.routes.js';
import salonsRoutes from './routes/salons.route.js';
import uploadRoutes from "./routes/upload.routes.js";
import couponRoutes from './routes/coupon.routes.js';
import salonMembershipsRoutes from "./routes/salon_memberships.routes.js";
import customerMembershipRoutes from "./routes/customer_memberships.routes.js";
import { authMiddleware } from './middelwares/auth.middleware.js';
import './config/firebase.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== 'test') {
  // use morgan 'combined' in production, 'dev' in development
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:4200')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

// Middleware
// app.use(cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:4200',
//     credentials: true
// }));

// --- Performance middlewares ------------------------------------------------
app.use(compression()); 

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 200,                       // limit each IP
  standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
});

app.use('/api/', apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  res.setHeader('X-Request-Id', req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  res.once('finish', () => {
    const delta = Date.now() - start;
    // minimal console tracing; replace with structured logger later
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${delta}ms`);
  });
  next();
});

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/admin/city', cityRoutes);
app.use('/api/admin/salons', salonsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin/upload", express.static("uploads"), uploadRoutes);

app.use("/api/coupons", couponRoutes);
app.use("/api/memberships", salonMembershipsRoutes);
app.use("/api/customer-memberships", authMiddleware, customerMembershipRoutes);

app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));
app.get('/health', (req, res) => res.sendStatus(204));

// Serve static files from uploads folder

export default app;
