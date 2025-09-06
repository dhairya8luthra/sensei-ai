import express from "express";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai"; // import Gemini client properly

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Adjusted function to send analysis data and instructions to Gemini and get insights
async function getGeminiInsights(analysisData) {
  const prompt = `
You are an educational assistant analyzing quiz results.

For each question where the user gave a wrong answer, provide two lines:
1. "wrong answer: <question text>"
2. "recommendation: <specific recommendation for this weak area>"

Repeat this format for all wrong answers.

At the end, provide a line:
"overall recommendation: <general advice to improve user's quiz performance>"

Do not include any other text, formatting, or markup. Only plain text responses in this repeated pattern.

Quiz Data:
${JSON.stringify(analysisData, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text();

  return rawText.trim();
}

router.post('/calculate-score', async (req, res) => {
  try {
    const { session_id, quiz_id, solution } = req.body;

    if (!session_id || !quiz_id || !solution || !Array.isArray(solution)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch quiz_data
    const { data, error } = await supabase
      .from('quizzes')
      .select('quiz_data')
      .eq('quiz_id', quiz_id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const quizData = data.quiz_data;

    let score = 0;

    // Build array with questions, options, correct and user answers for AI analysis
    const analysisData = solution.map(userAnswer => {
      const question = quizData.find(q => q.question === userAnswer.question);
      const correctOption = question ? question.solution.split('.')[0].trim() : null;
      const isCorrect = (correctOption === userAnswer.solution);
      if (isCorrect) score++;
      return {
        question: userAnswer.question,
        options: question ? question.options : [],
        correct_solution: question ? question.solution : null,
        user_solution: userAnswer.solution,
        is_correct: isCorrect
      };
    });

    // Get AI insights on weak areas
    const insightsResponse = await getGeminiInsights(analysisData);

    return res.json({
      session_id,
      quiz_id,
      score,
      insights: insightsResponse
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
