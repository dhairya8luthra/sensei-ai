import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid'; 
import { createClient } from '@supabase/supabase-js';
const router = express.Router();
const upload = multer();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
router.post('/generate-flashcards', upload.array('files'), async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'session_id and at least one file are required' });
    }

    // Extract and concatenate text from all uploaded PDFs
    let combinedText = '';
    for (const file of req.files) {
      const data = await pdfParse(file.buffer);
      combinedText += data.text + '\n';
    }

    const prompt = `Create flashcards for all important tasks found in this text in the following JSON format:
[
  "flashcard: <content>",
  "flashcard: <content>"
]
Here is the text:
${combinedText}
`;

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();

    // Strip markdown code block if present
    rawText = rawText.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let flashcards;
    try {
      flashcards = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return res.status(502).json({ error: 'Invalid JSON format from Gemini API', raw_response: rawText });
    }

    // Generate numeric ID for flashcard set (since DB expects bigint)
    const flashcard_set_id = uuidv4(); 
    
    // Store flashcards in Supabase
    const { error: dbError } = await supabase
      .from('flashcards')
      .insert({
        session_id: session_id,
        flashcard_set_id: flashcard_set_id,
        flashcards: flashcards,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to store flashcards in database:', dbError);
      return res.status(500).json({ error: 'Failed to store flashcards in database', details: dbError.message });
    }

    // Return flashcards JSON with metadata
    return res.json({
      session_id: session_id,
      flashcard_set_id: flashcard_set_id,
      flashcards: flashcards,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

export default router;