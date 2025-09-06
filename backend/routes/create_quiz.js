import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import axios from 'axios';
import * as cheerio from 'cheerio';

const answersStore = new Map();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const router = express.Router();
const upload = multer({ dest: "uploads/" });

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
    
    // Try multiple transcript services
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
          timeout: 10000 // 10 second timeout
        });

        if (response.status === 200) {
          const $ = cheerio.load(response.data);
          
          // Try the main selector first
          let transcriptText = $(service.selector).text().trim();
          
          // If that doesn't work, try alternative selectors
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
            // Clean up the transcript
            transcriptText = transcriptText
              .replace(/\s+/g, ' ')
              .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
              .replace(/♪.*?♪/g, '') // Remove music notes
              .replace(/\d{1,2}:\d{2}/g, '') // Remove timestamps
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
    
    // If all services fail, throw error
    throw new Error('No transcripts available for this video from any service. The video may not have captions enabled.');
    
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    
    // Provide more specific error messages
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to transcript services. Please check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Transcript service timed out. Please try again later.');
    } else if (error.response && error.response.status === 404) {
      throw new Error('Video not found or transcripts are not available for this video.');
    } else {
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
  }
}

// Alternative function to fetch transcript using a different approach
async function getTranscriptFromAPI(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`Fetching transcript via API for video ID: ${videoId}`);
    
    // You can also try other free transcript APIs
    const apiEndpoints = [
      `https://api.youtubetranscript.com/transcript?video_id=${videoId}`,
      `https://transcript-api.herokuapp.com/api/transcript?video_id=${videoId}`,
      // Add more API endpoints as needed
    ];

    for (const apiUrl of apiEndpoints) {
      try {
        const response = await axios.get(apiUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TranscriptBot/1.0)',
          }
        });

        if (response.data && response.data.transcript) {
          return response.data.transcript;
        } else if (response.data && typeof response.data === 'string') {
          return response.data;
        }
      } catch (apiError) {
        console.log(`API endpoint failed: ${apiUrl}`, apiError.message);
        continue;
      }
    }

    throw new Error('No API endpoints returned valid transcripts');
  } catch (error) {
    console.error('API transcript fetch failed:', error);
    throw error;
  }
}

// Enhanced transcript fetcher that tries multiple methods
async function getYouTubeTranscriptEnhanced(url) {
  const methods = [
    { name: 'Web Scraping', func: getYouTubeTranscript },
    { name: 'API Endpoints', func: getTranscriptFromAPI }
  ];

  for (const method of methods) {
    try {
      console.log(`Trying ${method.name} for transcript...`);
      const result = await method.func(url);
      if (result && result.length > 50) {
        console.log(`Successfully got transcript via ${method.name}`);
        return result;
      }
    } catch (error) {
      console.log(`${method.name} failed:`, error.message);
      continue;
    }
  }

  throw new Error('All transcript fetching methods failed. Video may not have captions available.');
}

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
async function generateMCQs(textChunk, sourceType = 'PDF') {
  const prompt = `
  Generate 5 multiple-choice questions (MCQs) from this ${sourceType} content in strict JSON format.
  Each question must look like this:
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "solution": "Correct option with text (e.g., 'B. Water')"
  }
  
  Guidelines:
  - Questions should test understanding, not just memorization
  - Make options challenging but fair
  - Ensure one clear correct answer
  - Cover different aspects of the content
  
  Only return a valid JSON array (no markdown fences, no explanations).
  
  Content: ${textChunk}
  `;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text();

  // Clean output
  rawText = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('Failed to parse MCQs:', err);
    return [{ error: "Failed to parse MCQs", raw: rawText }];
  }
}

// Fetch all quizzes from a dojo session
router.get("/session-quizzes/:session_id", async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Fetch all quizzes for the given session_id
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching session quizzes:", error);
      return res.status(500).json({ 
        error: "Failed to fetch quizzes",
        details: error.message 
      });
    }

    // Format the response to match frontend expectations
    const formattedQuizzes = data.map(quiz => {
      // Extract quiz data without solutions for frontend
      const quizForFrontend = quiz.quiz_data.map((q) => {
        if (q.question && q.options) {
          return {
            quizId: quiz.quiz_id,
            question: q.question,
            options: q.options,
          };
        }
        return q; // in case of errors or malformed data
      });

      return {
        quizId: quiz.quiz_id,
        sessionId: quiz.session_id,
        userId: quiz.user_id,
        quiz: quizForFrontend,
        createdAt: quiz.created_at,
        fileName: quiz.file_name || `Quiz ${quiz.quiz_id.slice(0, 8)}`,
      };
    });

    res.json({
      message: "Quizzes retrieved successfully",
      sessionId: session_id,
      totalQuizzes: formattedQuizzes.length,
      quizzes: formattedQuizzes
    });

  } catch (error) {
    console.error("Error in /session-quizzes:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

router.post("/generate-mcq", upload.array("files"), async (req, res) => {
  try {
    const sessionId = req.body.sessionId;
    const userId = req.body.userId;
    const trainingTitle = req.body.trainingTitle;
    const textualContext = req.body.textualContext;
    
    // Parse YouTube links from form data
    let youtubeLinks = [];
    if (req.body.youtubeLinks) {
      try {
        youtubeLinks = JSON.parse(req.body.youtubeLinks);
      } catch (e) {
        console.error('Error parsing YouTube links:', e);
      }
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Check if we have any content sources
    const hasFiles = req.files && req.files.length > 0;
    const hasYouTubeLinks = youtubeLinks && youtubeLinks.length > 0;
    const hasTextualContext = textualContext && textualContext.trim().length > 0;

    if (!hasFiles && !hasYouTubeLinks && !hasTextualContext) {
      return res.status(400).json({ 
        error: "At least one content source is required (PDF files, YouTube links, or textual context)" 
      });
    }

    let allMcqs = [];

    // Process PDF files
    if (hasFiles) {
      console.log(`Processing ${req.files.length} PDF files...`);
      
      for (const file of req.files) {
        try {
          const dataBuffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(dataBuffer);
          const words = pdfData.text.replace(/\s+/g, " ").split(" ");

          const chunks = slidingWindow(words);
          let mcqs = [];

          for (const chunk of chunks) {
            const questions = await generateMCQs(chunk, 'PDF');
            mcqs = mcqs.concat(questions.filter(q => !q.error));
          }

          // Save quiz to database
          const quizId = uuidv4();
          
          const { error } = await supabase.from("quizzes").insert({
            quiz_id: quizId,
            session_id: sessionId,
            user_id: userId,
            quiz_data: mcqs,
            file_name: file.originalname,
            source_type: 'PDF',
            created_at: new Date(),
          });

          if (error) {
            console.error("Error saving PDF quiz:", error);
          } else {
            console.log(`Saved ${mcqs.length} questions from PDF: ${file.originalname}`);
          }

          // Prepare frontend quiz data
          const quizForFrontend = mcqs.map((q) => {
            if (q.question && q.options) {
              return {
                quizId: quizId,
                question: q.question,
                options: q.options,
              };
            }
            return q;
          });

          allMcqs.push({
            fileName: file.originalname,
            quiz: quizForFrontend,
            quizId,
            sourceType: 'PDF'
          });

          // Clean up uploaded file
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`Error processing PDF file ${file.originalname}:`, error);
          // Clean up file even if processing failed
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    // Process YouTube links
    if (hasYouTubeLinks) {
      console.log(`Processing ${youtubeLinks.length} YouTube links...`);
      
      const successfulTranscripts = [];
      const failedTranscripts = [];
      
      for (const [index, link] of youtubeLinks.entries()) {
        if (!link.trim()) continue;
        
        try {
          console.log(`Fetching transcript for: ${link}`);
          const transcriptText = await getYouTubeTranscriptEnhanced(link);
          
          if (transcriptText.length < 100) {
            console.warn(`Transcript too short for ${link}, skipping...`);
            failedTranscripts.push({ link, reason: 'Transcript too short (less than 100 characters)' });
            continue;
          }

          // Process transcript in chunks
          const words = transcriptText.replace(/\s+/g, " ").split(" ");
          const chunks = slidingWindow(words, 800, 600); // Smaller chunks for video content
          let mcqs = [];

          for (const chunk of chunks) {
            const questions = await generateMCQs(chunk, 'YouTube Video');
            mcqs = mcqs.concat(questions.filter(q => !q.error));
          }

          if (mcqs.length === 0) {
            failedTranscripts.push({ link, reason: 'No valid questions could be generated from transcript' });
            continue;
          }

          // Save quiz to database
          const quizId = uuidv4();
          const videoId = extractVideoId(link);
          const fileName = `YouTube Video ${videoId ? videoId.substring(0, 8) : index + 1}`;
          
          const { error } = await supabase.from("quizzes").insert({
            quiz_id: quizId,
            session_id: sessionId,
            user_id: userId,
            quiz_data: mcqs,
            file_name: fileName,
            source_type: 'YouTube',
            source_url: link,
            created_at: new Date(),
          });

          if (error) {
            console.error("Error saving YouTube quiz:", error);
            failedTranscripts.push({ link, reason: `Database error: ${error.message}` });
          } else {
            console.log(`Saved ${mcqs.length} questions from YouTube: ${link}`);
            
            // Prepare frontend quiz data
            const quizForFrontend = mcqs.map((q) => {
              if (q.question && q.options) {
                return {
                  quizId: quizId,
                  question: q.question,
                  options: q.options,
                };
              }
              return q;
            });

            allMcqs.push({
              fileName: fileName,
              quiz: quizForFrontend,
              quizId,
              sourceType: 'YouTube',
              sourceUrl: link
            });
            
            successfulTranscripts.push({ link, questionsGenerated: mcqs.length });
          }

        } catch (error) {
          console.error(`Error processing YouTube link ${link}:`, error);
          failedTranscripts.push({ link, reason: error.message });
          // Continue with other links even if one fails
        }
      }
      
      // Log summary
      console.log(`YouTube processing complete: ${successfulTranscripts.length} successful, ${failedTranscripts.length} failed`);
      if (failedTranscripts.length > 0) {
        console.log('Failed transcripts:', failedTranscripts);
      }
    }

    // Process textual context
    if (hasTextualContext) {
      console.log('Processing textual context...');
      
      try {
        const words = textualContext.replace(/\s+/g, " ").split(" ");
        const chunks = slidingWindow(words, 500, 400); // Smaller chunks for context
        let mcqs = [];

        for (const chunk of chunks) {
          const questions = await generateMCQs(chunk, 'Text Context');
          mcqs = mcqs.concat(questions.filter(q => !q.error));
        }

        // Save quiz to database
        const quizId = uuidv4();
        const fileName = `Context: ${trainingTitle || 'Custom Content'}`;
        
        const { error } = await supabase.from("quizzes").insert({
          quiz_id: quizId,
          session_id: sessionId,
          user_id: userId,
          quiz_data: mcqs,
          file_name: fileName,
          source_type: 'Text',
          created_at: new Date(),
        });

        if (error) {
          console.error("Error saving text context quiz:", error);
        } else {
          console.log(`Saved ${mcqs.length} questions from text context`);
        }

        // Prepare frontend quiz data
        const quizForFrontend = mcqs.map((q) => {
          if (q.question && q.options) {
            return {
              quizId: quizId,
              question: q.question,
              options: q.options,
            };
          }
          return q;
        });

        allMcqs.push({
          fileName: fileName,
          quiz: quizForFrontend,
          quizId,
          sourceType: 'Text'
        });

      } catch (error) {
        console.error('Error processing textual context:', error);
      }
    }

    console.log(`Total quizzes created: ${allMcqs.length}`);
    res.json({ 
      quizzes: allMcqs,
      message: `Successfully created ${allMcqs.length} quizzes from various sources`,
      summary: {
        totalQuizzes: allMcqs.length,
        sources: allMcqs.map(q => ({ type: q.sourceType, name: q.fileName }))
      }
    });

  } catch (error) {
    console.error("Error in /generate-mcq:", error);
    res.status(500).json({ 
      error: "Something went wrong", 
      details: error.message 
    });
  }
});

// Store answers endpoint
router.post("/store-answers", (req, res) => {
  try {
    const { session_id, quiz_id, answers } = req.body;
    
    if (!session_id || !quiz_id || !answers) {
      return res.status(400).json({ 
        error: "session_id, quiz_id, and answers are required" 
      });
    }

    const key = `${session_id}_${quiz_id}`;
    answersStore.set(key, answers);
    
    console.log(`Stored answers for ${key}:`, answers);
    
    res.json({ 
      message: "Answers stored successfully",
      session_id,
      quiz_id,
      stored_answers: Object.keys(answers).length
    });
  } catch (error) {
    console.error("Error storing answers:", error);
    res.status(500).json({ 
      error: "Failed to store answers",
      details: error.message 
    });
  }
});

// Calculate score endpoint
router.post("/calculate-score", async (req, res) => {
  try {
    const { session_id, quiz_id, solution } = req.body;
    
    if (!session_id || !quiz_id || !solution) {
      return res.status(400).json({ 
        error: "session_id, quiz_id, and solution are required" 
      });
    }

    console.log(`Calculating score for session: ${session_id}, quiz: ${quiz_id}`);
    console.log('Solution received:', solution);

    // Fetch the correct answers from database
    const { data, error } = await supabase
      .from("quizzes")
      .select("quiz_data")
      .eq("quiz_id", quiz_id)
      .eq("session_id", session_id)
      .single();

    if (error) {
      console.error("Error fetching quiz data:", error);
      return res.status(404).json({ 
        error: "Quiz not found",
        details: error.message 
      });
    }

    const quizData = data.quiz_data;
    let score = 0;
    let insights = [];

    // Calculate score and generate insights
    for (const userAnswer of solution) {
      const matchingQuestion = quizData.find(q => q.question === userAnswer.question);
      
      if (matchingQuestion) {
        const correctAnswer = matchingQuestion.solution;
        const userSolution = userAnswer.solution;
        
        // Extract the letter part for comparison
        const correctLetter = correctAnswer.split('.')[0].trim();
        const userLetter = userSolution.trim();
        
        if (correctLetter === userLetter) {
          score++;
        } else {
          insights.push(`wrong answer: ${userAnswer.question} - You chose ${userSolution}, but the correct answer is ${correctAnswer}. Please review this topic and pay close attention to the initial operations performed.`);
        }
      }
    }

    // Generate overall insights
    const percentage = Math.round((score / solution.length) * 100);
    let overallInsight = "";
    
    if (percentage >= 80) {
      overallInsight = "overall recommendation: Excellent work! You have a strong understanding of the material.";
    } else if (percentage >= 60) {
      overallInsight = "overall recommendation: Good effort! Review the topics you missed to strengthen your understanding.";
    } else {
      overallInsight = "overall recommendation: Consider reviewing the material more thoroughly. Focus on the concepts behind the questions you missed.";
    }
    
    insights.push(overallInsight);

    const result = {
      session_id,
      quiz_id,
      score,
      total_questions: solution.length,
      percentage,
      insights: insights.join('\n')
    };

    console.log('Score calculation result:', result);

    res.json(result);

  } catch (error) {
    console.error("Error calculating score:", error);
    res.status(500).json({ 
      error: "Failed to calculate score",
      details: error.message 
    });
  }
});

export default router;