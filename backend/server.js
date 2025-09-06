import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from "@supabase/supabase-js";
// Import routes
import explainerVideosRouter from './routes/explainer_videos.js';
import dojosRouter from './routes/dojos.js';
import flashcardsRouter from './routes/flashcards.js';
import createQuizRouter from './routes/create_quiz.js';
import evaluateQuizRouter from './routes/evaluate_quiz.js';
import pdfIngestionRouter from './routes/pdf_ingestion.js';
import pingRouter from './routes/ping.js';
import pingSupabaseRouter from './routes/ping_supabase.js';
import academyVideosRoutes from './routes/academy_videos.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from outputs directory
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Routes
app.use('/api/explainers', explainerVideosRouter);
app.use('/api/dojos', dojosRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/quiz', createQuizRouter);
app.use('/api/evaluate', evaluateQuizRouter);
app.use('/api/pdf', pdfIngestionRouter);
app.use('/api/ping', pingRouter);
app.use('/api/ping-supabase', pingSupabaseRouter);
app.use('/api/academy', academyVideosRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export default app;