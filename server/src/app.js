import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import curriculumRoutes from './routes/curriculum.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/interview', interviewRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/curriculum', curriculumRoutes);

// Error Middleware
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

export default app;