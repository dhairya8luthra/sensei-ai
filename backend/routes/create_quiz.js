import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch"; // or native fetch in Node 18+

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const router = express.Router();
const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function slidingWindow(words, windowSize = 1000, stride = 700) {
  const chunks = [];
  for (let i = 0; i < words.length; i += stride) {
    const chunk = words.slice(i, i + windowSize);
    if (chunk.length === 0) break;
    chunks.push(chunk.join(" "));
  }
  return chunks;
}

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

  rawText = rawText.replace(/``````/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    return [{ error: "Failed to parse MCQs", raw: rawText }];
  }
}

// Replace transcript fetching with Supadata free API
async function someTranscriptApiCall(videoId) {
  try {
    const res = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`, {
      headers: {
        "x-api-key": process.env.SUPADATA_API_KEY,
      },
    });
    if (!res.ok) {
      throw new Error(`Supadata API error: ${res.statusText}`);
    }
    const data = await res.json();
    // Adjust based on actual data structure returned by Supadata API
    // Assuming data.transcript is an array of {text: "..."} parts:
    if (data && Array.isArray(data.transcript)) {
      return { transcriptText: data.transcript.map((p) => p.text).join(" ") };
    }
    return { transcriptText: "" };
  } catch (err) {
    console.error("Error fetching transcript from Supadata:", err);
    return { transcriptText: "" };
  }
}

async function fetchYouTubeTranscript(youtubeUrl) {
  console.log("Received YouTube URL:", youtubeUrl);
  const videoId = extractVideoIdFromUrl(youtubeUrl);
  console.log("Extracted video ID:", videoId);
  if (!videoId) {
    return "";
  }
  const transcriptResponse = await someTranscriptApiCall(videoId);
  console.log("Transcript response:", transcriptResponse);
  return transcriptResponse?.transcriptText || "";
}

router.post("/generate-mcq", upload.array("files"), async (req, res) => {
  try {
    const youtubeUrl = req.body.youtubeUrl;

    if ((!req.files || req.files.length === 0) && !youtubeUrl) {
      return res.status(400).json({ error: "No files or YouTube URL provided" });
    }

    const userId = req.user?.id || null;
    const sessionId = uuidv4();

    let pdfText = "";
    if (req.files && req.files.length > 0) {
      const dataBuffer = fs.readFileSync(req.files[0].path);
      const pdfData = await pdfParse(dataBuffer);
      pdfText = pdfData.text.replace(/\s+/g, " ");
      fs.unlinkSync(req.files[0].path);
    }

    let transcriptText = "";
    if (youtubeUrl) {
      transcriptText = await fetchYouTubeTranscript(youtubeUrl);
    }
    console.log("Final transcript text:", transcriptText);

    const allQuizzes = [];

    if (pdfText) {
      const pdfMcqs = await generateMCQs(pdfText);
      const quizIdPdf = uuidv4();
      allQuizzes.push({ source: "pdf", quizId: quizIdPdf, quiz: pdfMcqs });
      await supabase.from("quizzes").insert({
        quiz_id: quizIdPdf,
        session_id: sessionId,
        user_id: userId,
        quiz_data: pdfMcqs,
        created_at: new Date(),
      });
    }

    if (transcriptText) {
      const ytMcqs = await generateMCQs(transcriptText);
      const quizIdYt = uuidv4();
      allQuizzes.push({ source: "youtube", quizId: quizIdYt, quiz: ytMcqs });
      await supabase.from("quizzes").insert({
        quiz_id: quizIdYt,
        session_id: sessionId,
        user_id: userId,
        quiz_data: ytMcqs,
        created_at: new Date(),
      });
    }

    const quizzesForFrontend = allQuizzes.map(({ source, quizId, quiz }) => ({
      source,
      quizId,
      quiz: quiz.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    }));

    return res.json({ quizzes: quizzesForFrontend });
  } catch (error) {
    console.error("Error in /generate-mcq:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

function extractVideoIdFromUrl(url) {
  const regex = /(?:v=|\/embed\/|\.be\/)([-\w]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default router;
