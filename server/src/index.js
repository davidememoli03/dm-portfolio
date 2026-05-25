import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { adminAnalyticsRouter } from './routes/admin-analytics.js';
import { adminAuthRouter } from './routes/admin-auth.js';
import { adminDashboardRouter } from './routes/admin-dashboard.js';
import { adminMessagesRouter } from './routes/admin-messages.js';
import { analyticsRouter } from './routes/analytics.js';
import { contactRouter } from './routes/contact.js';
import { portfolioRouter } from './routes/portfolio.js';

const app = express();

app.set('trust proxy', 1);

const corsOrigins = process.env.CORS_ORIGINS
  ?.split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

app.use('/api', portfolioRouter);
app.use('/api/contact', contactRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/messages', adminMessagesRouter);
app.use('/api/admin/analytics', adminAnalyticsRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${config.port}`);
});
