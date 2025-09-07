import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const router = express.Router();
const upload = multer();
const groq = new Groq({ apiKey: process.env.KIMI_API_KEY });

router.post('/translate-pdf', upload.single('file'), async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id || !req.file) {
      return res.status(400).json({ error: 'session_id and PDF file are required' });
    }

    // Extract text from PDF
    let pdfText = '';
    try {
      const data = await pdfParse(req.file.buffer);
      pdfText = data.text;
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError);
      return res.status(400).json({ error: 'Failed to parse PDF file. Please ensure it contains readable text.' });
    }

    if (!pdfText.trim()) {
      return res.status(400).json({ error: 'No readable text found in the PDF file' });
    }

    // Prepare translation prompt
    const prompt = `
Please translate the following English text to Hindi. Maintain the structure and formatting as much as possible. Keep technical terms and proper nouns appropriately translated or transliterated.

Text to translate:
${pdfText}
`;

    // Call Groq API with Kimi model
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in English to Hindi translation. Translate accurately while preserving the meaning and context. For technical terms, use appropriate Hindi equivalents or transliteration."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "moonshotai/kimi-k2-instruct",
        temperature: 0.3,
        max_tokens: 4000,
      });

      const translatedText = completion.choices[0]?.message?.content?.trim();
      
      if (!translatedText) {
        return res.status(502).json({ error: 'Empty response from translation service' });
      }

      // Generate unique translation ID
      const translation_id = uuidv4();

      // Store translation in Supabase
      const { error: dbError } = await supabase
        .from('pdf_translations')
        .insert({
          translation_id: translation_id,
          session_id: session_id,
          original_filename: req.file.originalname,
          original_text: pdfText,
          translated_text: translatedText,
          source_language: 'english',
          target_language: 'hindi',
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store translation in database:', dbError);
        // Continue execution - don't fail the request if storage fails
      }

      // Return translation result
      return res.json({
        success: true,
        translation_id: translation_id,
        session_id: session_id,
        original_filename: req.file.originalname,
        original_language: 'English',
        translated_language: 'Hindi',
        translated_text: translatedText,
        word_count: pdfText.split(' ').length,
        created_at: new Date().toISOString()
      });

    } catch (groqError) {
      console.error('Groq API error:', groqError);
      
      if (groqError.status === 401) {
        return res.status(500).json({ error: 'Invalid API key for translation service' });
      }
      
      if (groqError.status === 429) {
        return res.status(429).json({ error: 'Translation service rate limit exceeded. Please try again later.' });
      }
      
      return res.status(502).json({ 
        error: 'Translation service error',
        details: groqError.message || 'Unknown error occurred'
      });
    }

  } catch (error) {
    console.error('Error in PDF translation:', error);
    return res.status(500).json({ 
      error: 'Failed to translate PDF',
      details: error.message 
    });
  }
});

// Additional endpoint to get translation history
router.get('/translation-history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const { data, error } = await supabase
      .from('pdf_translations')
      .select('translation_id, original_filename, source_language, target_language, created_at')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      session_id: session_id,
      translations: data || []
    });

  } catch (error) {
    console.error('Error fetching translation history:', error);
    return res.status(500).json({ error: 'Failed to fetch translation history' });
  }
});

// Endpoint to get specific translation
router.get('/translation/:translation_id', async (req, res) => {
  try {
    const { translation_id } = req.params;
    
    const { data, error } = await supabase
      .from('pdf_translations')
      .select('*')
      .eq('translation_id', translation_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    return res.json(data);

  } catch (error) {
    console.error('Error fetching translation:', error);
    return res.status(500).json({ error: 'Failed to fetch translation' });
  }
});

export default router;