import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();
const upload = multer();

router.post('/pyq-analysis', upload.array('files'), async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'session_id and at least one file are required' });
    }

    // Extract and concatenate text from all uploaded PDFs
    let combinedText = '';
    const fileNames = [];
    
    for (const file of req.files) {
      try {
        const data = await pdfParse(file.buffer);
        combinedText += `\n--- FILE: ${file.originalname} ---\n`;
        combinedText += data.text + '\n';
        fileNames.push(file.originalname);
      } catch (pdfError) {
        console.error(`Error parsing PDF ${file.originalname}:`, pdfError);
        continue; // Skip this file and continue with others
      }
    }

    if (!combinedText.trim()) {
      return res.status(400).json({ error: 'No readable text found in uploaded files' });
    }

    const prompt = `
Analyze the following previous year question papers and provide a comprehensive analysis in strict JSON format.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no additional text.

Required JSON structure:
{
  "analysis_id": "string",
  "files_analyzed": ["list of file names"],
  "frequent_topics": [
    {
      "topic": "string",
      "frequency": number,
      "importance": "high|medium|low",
      "description": "string"
    }
  ],
  "repeated_concepts": [
    {
      "concept": "string",
      "occurrences": number,
      "difficulty_level": "easy|medium|hard",
      "keywords": ["array of related keywords"]
    }
  ],
  "question_patterns": [
    {
      "pattern_type": "string",
      "description": "string",
      "examples": ["array of example question types"]
    }
  ],
  "sample_exam_paper": {
    "title": "Sample Exam Based on Analysis",
    "duration": "string",
    "total_marks": number,
    "instructions": ["array of exam instructions"],
    "sections": [
      {
        "section_name": "string",
        "marks": number,
        "questions": [
          {
            "question_number": number,
            "question_text": "string",
            "marks": number,
            "difficulty": "easy|medium|hard",
            "topic": "string"
          }
        ]
      }
    ]
  },
  "statistics": {
    "total_questions_analyzed": number,
    "most_common_marks_distribution": {"1": 0, "2": 0, "5": 0, "10": 0},
    "difficulty_distribution": {"easy": 0, "medium": 0, "hard": 0},
    "topic_coverage": number
  },
  "recommendations": {
    "focus_areas": ["array of topics to focus on"],
    "study_strategy": "string",
    "time_allocation": {"topic": "percentage"}
  }
}

Question Papers Text:
${combinedText}
`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational analyst. Analyze question papers and provide detailed insights in JSON format only. Do not include any markdown formatting or code blocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4000,
    });

    let rawText = completion.choices[0]?.message?.content?.trim();
    
    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from Groq API' });
    }

    // Clean up response - remove any potential markdown formatting
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let analysisData;
    try {
      analysisData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse Groq response as JSON:', parseError);
      return res.status(502).json({ 
        error: 'Invalid JSON format from Groq API', 
        raw_response: rawText.substring(0, 500) + '...' 
      });
    }

    // Generate unique analysis ID
    const analysis_id = uuidv4();
    analysisData.analysis_id = analysis_id;
    analysisData.files_analyzed = fileNames;

    // Store analysis in Supabase
    const { error: dbError } = await supabase
      .from('pyq_analysis')
      .insert({
        analysis_id: analysis_id,
        session_id: session_id,
        files_analyzed: fileNames,
        analysis_data: analysisData,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to store analysis in database:', dbError);
      // Continue execution - don't fail the request if storage fails
    }

    // Return analysis with metadata
    return res.json({
      success: true,
      session_id: session_id,
      analysis_id: analysis_id,
      files_processed: fileNames.length,
      analysis: analysisData
    });

  } catch (error) {
    console.error('Error in PYQ analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze question papers',
      details: error.message 
    });
  }
});

export default router;