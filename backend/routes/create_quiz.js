import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const answersStore = new Map();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Sliding window helper
function slidingWindow(words, windowSize = 1000, stride = 700) {
  const chunks = [];
  for (let i = 0; i < words.length; i += stride) {
    const chunk = words.slice(i, i + windowSize);
    if (chunk.length === 0) break;
    chunks.push(chunk.join(" "));
  }
  return chunks;
}

// Gemini call helper
async function generateMCQs(textChunk) {
  const prompt = `
  Generate 5 multiple-choice questions (MCQs) in strict JSON format.
  Each question must look like this:
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "solution": "Correct option with text (e.g., 'B. Water')"
  }
  Only return a valid JSON array (no markdown fences, no explanations).
  Text: ${textChunk}
  `;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text();

  // Clean output
  rawText = rawText.replace(/``````/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    return [{ error: "Failed to parse MCQs", raw: rawText }];
  }
}

router.post("/generate-mcq", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const userId = req.user?.id || null; // adapt as per your auth
    const sessionId = uuidv4(); // create a session ID for this quiz batch

    let allMcqs = [];

    for (const file of req.files) {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      const words = pdfData.text.replace(/\s+/g, " ").split(" ");

      const chunks = slidingWindow(words);
      let mcqs = [];

      for (const chunk of chunks) {
        const questions = await generateMCQs(chunk);
        mcqs = mcqs.concat(questions);
      }

      // Save full mcqs array as JSON blob to database
      const quizId = uuidv4();

      const { error } = await supabase.from("quizzes").insert({
        quiz_id: quizId,
        session_id: sessionId,
        user_id: userId,
        quiz_data: mcqs,         // Store as JSONB column in Supabase
        created_at: new Date(),
      });

      if (error) {
        console.error("Error saving quiz JSON blob:", error);
        // Optionally handle error
      }

      // Prepare frontend quiz data without solutions
      const quizForFrontend = mcqs.map((q) => {
        if (q.question && q.options) {
          return {
            quizId: quizId,
            question: q.question,
            options: q.options,
          };
        }
        return q; // in case of errors or malformed data
      });

      allMcqs.push({
        fileName: file.originalname,
        quiz: quizForFrontend,
        quizId,             // Include quizId so frontend can reference answers later if needed
      });

      fs.unlinkSync(file.path);
    }

    res.json({ quizzes: allMcqs });
  } catch (error) {
    console.error("Error in /generate-mcq:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
