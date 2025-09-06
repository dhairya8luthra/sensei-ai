import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/calculate-score', async (req, res) => {
  try {
    const { session_id, quiz_id, solution } = req.body;

    if (!session_id || !quiz_id || !solution || !Array.isArray(solution)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch quiz_data for the given quiz_id
    const { data, error } = await supabase
      .from('quizzes')
      .select('quiz_data')
      .eq('quiz_id', quiz_id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const quizData = data.quiz_data; // This is an array of question objects

    let score = 0;

    solution.forEach(userAnswer => {
      // Match question text from quizData
      const question = quizData.find(q => q.question === userAnswer.question);
      if (question) {
        // Extract correct option letter from solution string e.g. "B. Water" => "B"
        const correctOption = question.solution.split('.')[0].trim();
        if (correctOption === userAnswer.solution) {
          score++;
        }
      }
    });

    res.json({ session_id, quiz_id, score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
