// server.js — merged: keep MAIN behavior for everything except video;
// use VIDEO_MAKR routes for video features.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Auth middleware (from main)
import { verifySupabaseToken } from './middleware/authMiddleware.js';

// === VIDEO_MAKR routes (video features) ===
import explainerVideosRouter from './routes/explainer_videos.js';
import academyVideosRoutes from './routes/academy_videos.js';

// === MAIN routes (everything else) ===
import pingRoute from './routes/ping.js';
import pingSupabaseRoute from './routes/ping_supabase.js';
import pdfInjestion from './routes/pdf_ingestion.js';
import generateQuiz from './routes/create_quiz.js';
import dojoRoutes from './routes/dojos.js';
import evaluateQuiz from './routes/evaluate_quiz.js';
import generateFlashcard from './routes/flashcards.js';
import pyqAnalysis from './routes/pyq_analysis.js';
import translatePDF from './routes/notes_translation.js';
import courseRecommendation from './routes/course_recommendation.js';
import studyPlan from './routes/course_planner.js';
import generateLectureScript from './routes/generate_scripts_for_lectures.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Needed for serving static files from /outputs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from outputs directory (video_makr behavior)
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// --- VIDEO routes (keep from video_makr) ---
app.use('/api/explainers', explainerVideosRouter);
app.use('/api/academy', academyVideosRoutes);

// --- MAIN routes (keep main’s behavior/mount points) ---
app.use('/api', pingRoute);
app.use('/api', pingSupabaseRoute);
app.use('/api', pdfInjestion);
app.use('/api', generateQuiz);
app.use('/api', dojoRoutes);
app.use('/api', evaluateQuiz);
app.use('/api/flashcards', generateFlashcard);
app.use('/api', pyqAnalysis);
app.use('/api', translatePDF);
app.use('/api', courseRecommendation);
app.use('/api', studyPlan);
app.use('/api', generateLectureScript);

// Protected route (main)
app.get('/api/protected', verifySupabaseToken, (req, res) => {
  res.json({ message: `Server is running good. Hello ${req.user.email}` });
});

// Health check (video_makr)
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((error, _req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${CORS_ORIGIN}`);
});

export default app;
