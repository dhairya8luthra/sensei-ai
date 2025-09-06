import express from 'express';
import pingRoute from './routes/ping.js';
import pingSupabaseRoute from './routes/ping_supabase.js';
import pdfInjestion from './routes/pdf_ingestion.js';
import generateQuiz from './routes/create_quiz.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifySupabaseToken } from './middleware/authMiddleware.js';
const app = express();


dotenv.config();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json()); // for JSON request bodies

app.use('/api', pingRoute);
app.use('/api', pingSupabaseRoute);
app.use('/api', pdfInjestion);
app.use('/api', generateQuiz);
// Protected API route
app.get('/api/protected', verifySupabaseToken, (req, res) => {
  res.json({ message: `Server is running good. Hello ${req.user.email}` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
