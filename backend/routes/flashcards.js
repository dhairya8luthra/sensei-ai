import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid'; 
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to fetch YouTube transcript using web scraping
async function getYouTubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`Fetching transcript for video ID: ${videoId}`);
    
    const transcriptServices = [
      {
        name: 'youtubetotranscript.com',
        url: `https://youtubetotranscript.com/transcript?v=${videoId}`,
        selector: '#transcript'
      },
      {
        name: 'youtubetranscript.com',
        url: `https://youtubetranscript.com/?v=${videoId}`,
        selector: '.transcript-text, .transcript-content, #transcript-content'
      }
    ];

    for (const service of transcriptServices) {
      try {
        console.log(`Trying ${service.name}...`);
        
        const response = await axios.get(service.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 10000
        });

        if (response.status === 200) {
          const $ = cheerio.load(response.data);
          let transcriptText = $(service.selector).text().trim();
          
          if (!transcriptText) {
            const altSelectors = [
              '.transcript',
              '.transcript-text',
              '.transcript-content',
              '#transcript-content',
              '[data-transcript]',
              '.mt-4.text-lg.font-semibold.cursor-pointer.select-text'
            ];
            
            for (const selector of altSelectors) {
              transcriptText = $(selector).text().trim();
              if (transcriptText) break;
            }
          }

          if (transcriptText && transcriptText.length > 50) {
            transcriptText = transcriptText
              .replace(/\s+/g, ' ')
              .replace(/\[.*?\]/g, '')
              .replace(/♪.*?♪/g, '')
              .replace(/\d{1,2}:\d{2}/g, '')
              .trim();

            console.log(`Successfully fetched transcript from ${service.name}: ${transcriptText.length} characters`);
            return transcriptText;
          }
        }
      } catch (serviceError) {
        console.log(`Failed to fetch from ${service.name}:`, serviceError.message);
        continue;
      }
    }
    
    throw new Error('No transcripts available for this video from any service.');
    
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}

// Enhanced transcript fetcher
async function getYouTubeTranscriptEnhanced(url) {
  try {
    const result = await getYouTubeTranscript(url);
    if (result && result.length > 50) {
      return result;
    }
    throw new Error('Transcript too short or unavailable');
  } catch (error) {
    throw error;
  }
}

// Generate flashcards from content
async function generateFlashcards(content, sourceType = 'PDF') {
  const prompt = `Create educational flashcards from this ${sourceType} content. Focus on key concepts, definitions, important facts, and actionable insights.

Format as a JSON array where each flashcard has a front (question/term) and back (answer/definition):
[
  {
    "front": "What is...",
    "back": "Answer or explanation..."
  },
  {
    "front": "Define...",
    "back": "Definition..."
  }
]

Guidelines:
- Create 8-12 flashcards maximum
- Focus on the most important concepts
- Make questions clear and specific
- Provide concise but complete answers
- Include practical applications where relevant
- Avoid overly complex or obscure details

Content: ${content.substring(0, 3000)}`;

  try {
    const result = await model.generateContent(prompt);
    let rawText = result.response.text();

    rawText = rawText.replace(/```json|```/g, "").trim();
    const flashcards = JSON.parse(rawText);
    
    const validFlashcards = flashcards.filter(card => 
      card && 
      typeof card === 'object' && 
      card.front && 
      card.back && 
      typeof card.front === 'string' && 
      typeof card.back === 'string'
    );

    return validFlashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [{
      front: `Key concept from ${sourceType}`,
      back: "Review the content for important details and concepts."
    }];
  }
}

// Main flashcard generation endpoint
router.post('/generate-flashcards', upload.array('files'), async (req, res) => {
  try {
    const { session_id, trainingTitle, textualContext, user_id } = req.body;
    
    let youtubeLinks = [];
    if (req.body.youtubeLinks) {
      try {
        youtubeLinks = JSON.parse(req.body.youtubeLinks);
      } catch (e) {
        console.error('Error parsing YouTube links:', e);
      }
    }

    // Generate a proper UUID for session_id (like in dojos.js)
    const actualSessionId = uuidv4();
    console.log(`Generated new session_id: ${actualSessionId} (original was: ${session_id})`);

    const hasFiles = req.files && req.files.length > 0;
    const hasYouTubeLinks = youtubeLinks && youtubeLinks.length > 0;
    const hasTextualContext = textualContext && textualContext.trim().length > 0;

    if (!hasFiles && !hasYouTubeLinks && !hasTextualContext) {
      return res.status(400).json({ 
        error: 'At least one content source is required (PDF files, YouTube links, or textual context)' 
      });
    }

    let allContent = '';
    let sources = [];

    // Process PDF files
    if (hasFiles) {
      console.log(`Processing ${req.files.length} PDF files for flashcards...`);
      
      for (const file of req.files) {
        try {
          const dataBuffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(dataBuffer);
          
          if (pdfData.text && pdfData.text.trim().length > 50) {
            allContent += pdfData.text + '\n\n';
            sources.push({ type: 'PDF', name: file.originalname });
          }
          
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`Error processing PDF file ${file.originalname}:`, error);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    // Process YouTube links
    if (hasYouTubeLinks) {
      console.log(`Processing ${youtubeLinks.length} YouTube links for flashcards...`);
      
      for (const [index, link] of youtubeLinks.entries()) {
        if (!link.trim()) continue;
        
        try {
          const transcriptText = await getYouTubeTranscriptEnhanced(link);
          
          if (transcriptText.length >= 100) {
            allContent += transcriptText + '\n\n';
            const videoId = extractVideoId(link);
            sources.push({ 
              type: 'YouTube', 
              name: `Video ${videoId ? videoId.substring(0, 8) : index + 1}`,
              url: link 
            });
          }
        } catch (error) {
          console.error(`Error processing YouTube link for flashcards ${link}:`, error);
        }
      }
    }

    // Process textual context
    if (hasTextualContext) {
      console.log('Processing textual context for flashcards...');
      allContent += textualContext.trim() + '\n\n';
      sources.push({ 
        type: 'Text', 
        name: trainingTitle || 'Custom Content' 
      });
    }

    if (allContent.trim().length < 100) {
      return res.status(400).json({ 
        error: 'Not enough content extracted from the provided sources to generate meaningful flashcards' 
      });
    }

    // Generate flashcards from combined content
    console.log('Generating flashcards from combined content...');
    const flashcards = await generateFlashcards(allContent, sources.map(s => s.type).join(', '));

    if (!flashcards || flashcards.length === 0) {
      return res.status(500).json({ 
        error: 'No flashcards could be generated from the provided content' 
      });
    }

    const flashcard_set_id = uuidv4();
    
    // Prepare the insert data (like in dojos.js)
    const insertData = {
      session_id: actualSessionId, // Use the generated UUID
      flashcard_set_id: flashcard_set_id,
      flashcards: flashcards,
      sources: sources,
      title: trainingTitle || 'Generated Flashcards',
      created_at: new Date()
    };

    // Add user_id if provided
    if (user_id) {
      insertData.user_id = user_id;
    }

    // Store flashcards in Supabase
    const { data, error: dbError } = await supabase
      .from('flashcards')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store flashcards in database:', dbError);
      return res.status(500).json({ 
        error: 'Failed to store flashcards in database', 
        details: dbError.message 
      });
    }

    console.log(`Generated ${flashcards.length} flashcards from ${sources.length} sources`);

    return res.status(201).json({
      message: `Successfully generated ${flashcards.length} flashcards`,
      session_id: actualSessionId, // Return the actual UUID used
      original_session_id: session_id, // Return original for reference
      flashcard_set_id: flashcard_set_id,
      flashcards: flashcards,
      sources: sources,
      title: trainingTitle || 'Generated Flashcards',
      total_flashcards: flashcards.length,
      created_at: data.created_at
    });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return res.status(500).json({ 
      error: 'Failed to generate flashcards',
      details: error.message 
    });
  }
});

// Get all flashcards for a specific user
router.get('/user-flashcards/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20, session_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build the query
    let query = supabase
      .from('flashcards')
      .select(`
        flashcard_set_id,
        session_id,
        title,
        flashcards,
        sources,
        created_at
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    // Add session filter if provided
    if (session_id) {
      query = query.eq('session_id', session_id);
    }

    // Add pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching user flashcards:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch flashcards',
        details: error.message 
      });
    }

    // Get total count for pagination
    let totalQuery = supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (session_id) {
      totalQuery = totalQuery.eq('session_id', session_id);
    }

    const { count: totalCount } = await totalQuery;

    // Format the response with additional metadata
    const formattedFlashcards = data.map(flashcardSet => ({
      flashcard_set_id: flashcardSet.flashcard_set_id,
      session_id: flashcardSet.session_id,
      title: flashcardSet.title,
      total_flashcards: flashcardSet.flashcards ? flashcardSet.flashcards.length : 0,
      sources: flashcardSet.sources || [],
      created_at: flashcardSet.created_at,
      preview: flashcardSet.flashcards && flashcardSet.flashcards.length > 0 
        ? {
            front: flashcardSet.flashcards[0].front,
            back: flashcardSet.flashcards[0].back
          } 
        : null
    }));

    res.json({
      message: 'User flashcards retrieved successfully',
      user_id: user_id,
      session_id: session_id || null,
      total_flashcard_sets: totalCount || 0,
      current_page: parseInt(page),
      total_pages: Math.ceil((totalCount || 0) / parseInt(limit)),
      flashcard_sets_per_page: parseInt(limit),
      flashcard_sets: formattedFlashcards
    });

  } catch (error) {
    console.error('Error in /user-flashcards:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get all sessions for a user
router.get('/user-sessions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get all unique sessions for the user from multiple tables
    const [flashcardsResult, quizzesResult, dojosResult] = await Promise.all([
      // Get sessions from flashcards table
      supabase
        .from('flashcards')
        .select('session_id, created_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false }),
      
      // Get sessions from quizzes table
      supabase
        .from('quizzes')
        .select('session_id, created_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false }),
      
      // Get sessions from dojo_sessions table (corrected table name)
      supabase
        .from('dojo_sessions')
        .select('session_id, created_at, session_name as dojo_name')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
    ]);

    // Combine and deduplicate sessions
    const allSessions = new Map();

    // Process flashcards sessions
    if (flashcardsResult.data) {
      flashcardsResult.data.forEach(item => {
        if (item.session_id) {
          if (!allSessions.has(item.session_id)) {
            allSessions.set(item.session_id, {
              session_id: item.session_id,
              created_at: item.created_at,
              has_flashcards: true,
              has_quizzes: false,
              dojo_info: null
            });
          } else {
            allSessions.get(item.session_id).has_flashcards = true;
          }
        }
      });
    }

    // Process quizzes sessions
    if (quizzesResult.data) {
      quizzesResult.data.forEach(item => {
        if (item.session_id) {
          if (!allSessions.has(item.session_id)) {
            allSessions.set(item.session_id, {
              session_id: item.session_id,
              created_at: item.created_at,
              has_flashcards: false,
              has_quizzes: true,
              dojo_info: null
            });
          } else {
            allSessions.get(item.session_id).has_quizzes = true;
          }
        }
      });
    }

    // Process dojos sessions
    if (dojosResult.data) {
      dojosResult.data.forEach(item => {
        if (item.session_id) {
          if (!allSessions.has(item.session_id)) {
            allSessions.set(item.session_id, {
              session_id: item.session_id,
              created_at: item.created_at,
              has_flashcards: false,
              has_quizzes: false,
              dojo_info: {
                name: item.dojo_name
              }
            });
          } else {
            allSessions.get(item.session_id).dojo_info = {
              name: item.dojo_name
            };
          }
        }
      });
    }

    // Convert to array and sort by created_at
    const sessionsArray = Array.from(allSessions.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply pagination
    const totalSessions = sessionsArray.length;
    const paginatedSessions = sessionsArray.slice(offset, offset + parseInt(limit));

    // Get detailed counts for each session
    const sessionsWithCounts = await Promise.all(
      paginatedSessions.map(async (session) => {
        const [flashcardCount, quizCount] = await Promise.all([
          // Count flashcard sets in this session
          supabase
            .from('flashcards')
            .select('flashcard_set_id', { count: 'exact' })
            .eq('session_id', session.session_id)
            .eq('user_id', user_id),
          
          // Count quizzes in this session
          supabase
            .from('quizzes')
            .select('quiz_id', { count: 'exact' })
            .eq('session_id', session.session_id)
            .eq('user_id', user_id)
        ]);

        return {
          ...session,
          flashcard_sets_count: flashcardCount.count || 0,
          quizzes_count: quizCount.count || 0,
          total_items: (flashcardCount.count || 0) + (quizCount.count || 0)
        };
      })
    );

    const response = {
      message: 'User sessions retrieved successfully',
      user_id: user_id,
      total_sessions: totalSessions,
      current_page: parseInt(page),
      total_pages: Math.ceil(totalSessions / parseInt(limit)),
      sessions_per_page: parseInt(limit),
      sessions: sessionsWithCounts
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user sessions',
      details: error.message 
    });
  }
});

// Get flashcards by session ID
router.get('/session-flashcards/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { user_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false });

    // Add user_id filter if provided for extra security
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching flashcards:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch flashcards',
        details: error.message 
      });
    }

    res.json({
      message: 'Flashcards retrieved successfully',
      session_id: session_id,
      user_id: user_id || null,
      total_sets: data.length,
      flashcard_sets: data
    });

  } catch (error) {
    console.error('Error in /session-flashcards:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get specific flashcard set
router.get('/flashcard-set/:flashcard_set_id', async (req, res) => {
  try {
    const { flashcard_set_id } = req.params;
    const { user_id } = req.query;

    if (!flashcard_set_id) {
      return res.status(400).json({ error: 'Flashcard set ID is required' });
    }

    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('flashcard_set_id', flashcard_set_id);

    // Add user_id filter if provided for extra security
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching flashcard set:', error);
      return res.status(404).json({ 
        error: 'Flashcard set not found',
        details: error.message 
      });
    }

    res.json({
      message: 'Flashcard set retrieved successfully',
      ...data
    });

  } catch (error) {
    console.error('Error in /flashcard-set:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;