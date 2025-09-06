import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { v4 as uuidv4 } from 'uuid';
import Groq from "groq-sdk";
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';
import sharp from 'sharp';
// Use the CommonJS require for pptxgenjs 3.12.0
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Ensure necessary directories exist
const ensureDirectories = () => {
  const dirs = ['outputs/slides', 'outputs/audio', 'outputs/videos', 'outputs/pptx', 'outputs/images', 'outputs/temp'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Helper function to clean JSON response from markdown
const cleanJsonResponse = (response) => {
  if (!response) return null;
  
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Helper function to extract content from sources
const extractContentFromSources = async (files, youtubeLinks, textualContext) => {
  let content = textualContext || '';

  // Extract from files
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        content += '\n' + pdfData.text;
        // Clean up file
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  }

  // Extract from YouTube links (placeholder - you can implement youtube-transcript later)
  if (youtubeLinks && youtubeLinks.length > 0) {
    for (const link of youtubeLinks) {
      if (link.trim()) {
        content += `\nYouTube reference: ${link}`;
        // TODO: Implement YouTube transcript extraction
      }
    }
  }

  return content;
};

// Helper function to create slide images from content
const createSlideImages = async (slides, explainer_id) => {
  const slideImages = [];
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const imagePath = `outputs/images/${explainer_id}_slide_${i + 1}.png`;
    
    // Safely handle title and points
    const title = slide.title || `Slide ${i + 1}`;
    const points = slide.key_points || slide.bullet_points || [];
    
    // Create bullet points HTML
    const bulletPointsHtml = points.map(point => 
      `<div style="margin-bottom: 30px; font-size: 40px; line-height: 1.4;">• ${point}</div>`
    ).join('');
    
    // Create a simple slide image using SVG
    const svgContent = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        
        <!-- Title -->
        <text x="960" y="180" font-family="Arial, sans-serif" font-size="64" font-weight="bold" text-anchor="middle" fill="white">
          ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
        </text>
        
        <!-- Content -->
        <foreignObject x="100" y="280" width="1720" height="700">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: Arial; padding: 40px;">
            ${bulletPointsHtml}
          </div>
        </foreignObject>
        
        <!-- Slide number -->
        <text x="1800" y="1000" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="rgba(255,255,255,0.7)">
          ${i + 1} / ${slides.length}
        </text>
      </svg>
    `;
    
    // Convert SVG to PNG
    try {
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(imagePath);
      
      slideImages.push(imagePath);
      console.log(`Created slide image: ${imagePath}`);
    } catch (error) {
      console.error(`Error creating slide ${i + 1}:`, error);
      throw new Error(`Failed to create slide image ${i + 1}`);
    }
  }
  
  return slideImages;
};

// Helper function to create video from slides and audio
const createVideoFromSlides = async (slideImages, audioPath, outputPath, slideDuration = 5) => {
  return new Promise((resolve, reject) => {
    if (!slideImages || slideImages.length === 0) {
      reject(new Error('No slide images provided'));
      return;
    }

    // Create a text file for ffmpeg to read slide timings
    const slideListPath = `outputs/temp/slides_${Date.now()}.txt`;
    let slideList = '';
    
    slideImages.forEach((imagePath) => {
      slideList += `file '${path.resolve(imagePath)}'\n`;
      slideList += `duration ${slideDuration}\n`;
    });
    
    // Add the last image again (ffmpeg requirement)
    slideList += `file '${path.resolve(slideImages[slideImages.length - 1])}'`;
    
    fs.writeFileSync(slideListPath, slideList);
    
    const ffmpegArgs = [
      '-f', 'concat',
      '-safe', '0',
      '-i', slideListPath,
      '-i', audioPath,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-y',
      outputPath
    ];
    
    console.log('FFmpeg command:', ffmpeg, ffmpegArgs.join(' '));
    
    const ffmpegProcess = spawn(ffmpeg, ffmpegArgs);
    
    let stderr = '';
    
    ffmpegProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('FFmpeg stderr:', data.toString());
    });
    
    ffmpegProcess.on('close', (code) => {
      // Clean up temp file
      if (fs.existsSync(slideListPath)) {
        fs.unlinkSync(slideListPath);
      }
      
      if (code === 0) {
        console.log('Video created successfully:', outputPath);
        resolve(outputPath);
      } else {
        console.error('FFmpeg stderr output:', stderr);
        reject(new Error(`FFmpeg exited with code ${code}. Error: ${stderr}`));
      }
    });
    
    ffmpegProcess.on('error', (error) => {
      console.error('FFmpeg process error:', error);
      reject(error);
    });
  });
};

// Helper function to generate thumbnail
const generateThumbnail = async (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-i', videoPath,
      '-ss', '00:00:01.000',
      '-vframes', '1',
      '-y',
      thumbnailPath
    ];
    
    const ffmpegProcess = spawn(ffmpeg, ffmpegArgs);
    
    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Thumbnail created successfully:', thumbnailPath);
        resolve(thumbnailPath);
      } else {
        reject(new Error(`Thumbnail generation failed with code ${code}`));
      }
    });
    
    ffmpegProcess.on('error', (error) => {
      reject(error);
    });
  });
};

// Helper function to extract topics from content using Llama 3.3
const extractTopicsFromContent = async (content, numTopics = 4) => {
  const prompt = `Analyze the following document content and extract ${numTopics} distinct, important topics that would make good educational explainer videos.

For each topic, provide:
1. Topic title (concise, clear)
2. Brief description (1-2 sentences)
3. Key concepts that should be covered
4. Difficulty level (Beginner/Intermediate/Advanced)

Format as JSON array:
[
  {
    "title": "Topic Title",
    "description": "Brief description of what this topic covers",
    "key_concepts": ["concept1", "concept2", "concept3"],
    "difficulty": "Beginner",
    "estimated_duration": "2-3 minutes"
  }
]

Document content:
${content.substring(0, 3000)}

Return only the JSON array, no additional text or markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content analyzer. Extract key topics from documents that would make excellent educational videos. Return only valid JSON without any markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    const cleanedResponse = cleanJsonResponse(response);
    
    console.log('Raw response:', response);
    console.log('Cleaned response:', cleanedResponse);
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error extracting topics:', error);
    console.error('Response was:', completion.choices[0]?.message?.content);
    throw new Error('Failed to extract topics from content');
  }
};

// Helper function to generate detailed content for a specific topic
const generateTopicContent = async (topic, fullContent) => {
  const prompt = `Create detailed educational content for the topic "${topic.title}" based on the provided document.

Generate 5-7 slides with the following structure for each slide:
- Slide title
- 2-3 key points
- Practical example
- Narration script (30-45 seconds of speech)

Format as JSON:
{
  "topic_title": "${topic.title}",
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "example": "Practical example text",
      "narration_script": "Detailed script for text-to-speech (30-45 seconds worth)",
      "estimated_duration": 30
    }
  ]
}

Focus specifically on: ${topic.description}
Key concepts to cover: ${topic.key_concepts.join(', ')}

Document content:
${fullContent.substring(0, 4000)}

Make the content engaging, educational, and suitable for ${topic.difficulty} level learners.
Return only valid JSON without any markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in breaking down complex topics into digestible video content. Return only valid JSON without any markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 3000,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    const cleanedResponse = cleanJsonResponse(response);
    
    console.log('Topic content raw response:', response);
    console.log('Topic content cleaned response:', cleanedResponse);
    
    // Parse and validate the response
    const parsedResponse = JSON.parse(cleanedResponse);
    
    // Ensure we have the correct structure
    if (parsedResponse.slides && Array.isArray(parsedResponse.slides)) {
      return parsedResponse;
    } else if (Array.isArray(parsedResponse)) {
      // If we accidentally got just the slides array, wrap it
      return {
        topic_title: topic.title,
        slides: parsedResponse
      };
    } else {
      throw new Error('Invalid response structure');
    }
    
  } catch (error) {
    console.error('Error generating topic content:', error);
    console.error('Response was:', completion.choices[0]?.message?.content);
    throw new Error('Failed to generate detailed content for topic');
  }
};

// Helper function to generate slides using Groq
const generateSlides = async (content, conceptTitle, targetAudience, videoDuration) => {
  const numSlides = Math.max(3, Math.min(8, Math.ceil(videoDuration / 15))); // 15 seconds per slide
  
  const prompt = `Create an engaging explainer video script for "${conceptTitle}" targeted at ${targetAudience} level learners.

Generate ${numSlides} slides for a ${videoDuration}-second video with the following structure:

For each slide, provide:
1. Slide title (clear and engaging)
2. Key bullet points (2-3 points max)
3. Visual description (what should be shown)
4. Narration script (engaging, conversational tone, ${Math.ceil(videoDuration / numSlides)} seconds worth)

Format as JSON:
{
  "concept_title": "${conceptTitle}",
  "target_audience": "${targetAudience}",
  "total_duration": ${videoDuration},
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "bullet_points": ["Point 1", "Point 2"],
      "visual_description": "What to show visually",
      "narration_script": "Engaging script for narration (${Math.ceil(videoDuration / numSlides)} seconds)",
      "duration": ${Math.ceil(videoDuration / numSlides)}
    }
  ],
  "full_script": "Complete narration script for the entire video"
}

Content to base the explainer on:
${content.substring(0, 4000)}

Make it educational, engaging, and appropriate for ${targetAudience} level.
Return only valid JSON without any markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator who specializes in creating engaging explainer videos. Create clear, concise, and educational content. Return only valid JSON without any markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 3000,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    const cleanedResponse = cleanJsonResponse(response);
    
    console.log('Slides raw response:', response);
    console.log('Slides cleaned response:', cleanedResponse);
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error generating slides:', error);
    console.error('Response was:', completion.choices[0]?.message?.content);
    throw new Error('Failed to generate slides');
  }
};

// Helper function to generate audio using Groq TTS
const generateAudio = async (text, outputPath) => {
  try {
    const speechFile = path.resolve(outputPath);
    
    const wav = await groq.audio.speech.create({
      model: "playai-tts",
      voice: "Atlas-PlayAI",
      response_format: "wav",
      input: text,
    });

    const buffer = Buffer.from(await wav.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    
    console.log(`Audio generated: ${speechFile}`);
    return speechFile;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error('Failed to generate audio');
  }
};

// Helper function to generate PowerPoint from slides
const generatePowerPoint = async (slides, outputPath, topicTitle) => {
  try {
    console.log('PowerPoint generation input:', { slides, outputPath, topicTitle });
    
    // Validate input
    if (!slides || !Array.isArray(slides)) {
      throw new Error('Slides must be an array');
    }
    
    if (slides.length === 0) {
      throw new Error('No slides provided');
    }

    // Create a new PptxGenJS instance
    const pptx = new pptxgen();
    
    pptx.author = "AI Explainer Generator";
    pptx.company = "Learning Platform";
    pptx.title = topicTitle;

    slides.forEach((slide, index) => {
      console.log(`Processing slide ${index + 1}:`, slide);
      
      const pptSlide = pptx.addSlide();
      
      // Add slide title
      if (slide.title) {
        pptSlide.addText(slide.title, {
          x: 0.5, y: 0.5, w: 9, h: 1,
          fontSize: 28, bold: true, color: "363636", align: "center"
        });
      }

      // Add key points as bullet list
      const keyPoints = slide.key_points || slide.bullet_points || [];
      if (keyPoints.length > 0) {
        const bulletText = keyPoints.map(point => ({ text: point, options: { bullet: true } }));
        pptSlide.addText(bulletText, {
          x: 1, y: 1.8, w: 8, h: 3,
          fontSize: 18, color: "444444"
        });
      }

      // Add example or visual description
      const description = slide.example || slide.visual_description || '';
      if (description) {
        pptSlide.addText(`${slide.example ? 'Example:' : 'Visual:'} ${description}`, {
          x: 1, y: 5, w: 8, h: 1.5,
          fontSize: 16, italic: true, color: "666666",
          fill: "F5F5F5", margin: 0.1
        });
      }

      // Add slide number
      pptSlide.addText(`${index + 1}`, {
        x: 9.2, y: 6.8, w: 0.5, h: 0.3,
        fontSize: 12, color: "999999", align: "center"
      });
    });

    await pptx.writeFile(outputPath);
    console.log(`PowerPoint generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    console.error('Slides data:', slides);
    throw new Error('Failed to generate PowerPoint');
  }
};

// Store for created videos (in production, use a database)
const videoStore = new Map();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Explainer videos API is working!',
    timestamp: new Date().toISOString(),
    pptxgen_loaded: typeof pptxgen !== 'undefined',
    ffmpeg_available: !!ffmpeg
  });
});

// 1. Generate slides (what frontend expects)
router.post('/generate-slides', upload.array('files', 10), async (req, res) => {
  try {
    const { 
      user_id, 
      conceptTitle, 
      targetAudience, 
      videoDuration, 
      language, 
      textualContext,
      youtubeLinks 
    } = req.body;
    
    if (!user_id || !conceptTitle) {
      return res.status(400).json({ error: 'user_id and conceptTitle are required' });
    }

    const explainer_id = uuidv4();
    
    // Parse YouTube links if provided
    let parsedYouTubeLinks = [];
    try {
      if (youtubeLinks) {
        parsedYouTubeLinks = JSON.parse(youtubeLinks);
      }
    } catch (e) {
      parsedYouTubeLinks = [];
    }

    // Extract content from all sources
    const content = await extractContentFromSources(req.files, parsedYouTubeLinks, textualContext);
    
    if (!content.trim()) {
      return res.status(400).json({ error: 'No content provided' });
    }

    // Generate slides
    const slidesData = await generateSlides(
      content, 
      conceptTitle, 
      targetAudience, 
      parseInt(videoDuration) || 60
    );

    return res.json({
      success: true,
      explainer_id: explainer_id,
      conceptTitle: conceptTitle,
      slides: slidesData.slides,
      script: slidesData.full_script,
      target_audience: targetAudience,
      duration: parseInt(videoDuration) || 60,
      language: language,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating slides:', error);
    return res.status(500).json({ 
      error: 'Failed to generate slides',
      details: error.message 
    });
  }
});

// 2. Create PowerPoint
router.post('/create-powerpoint', async (req, res) => {
  try {
    const { slides, conceptTitle, explainer_id } = req.body;
    
    if (!slides || !conceptTitle || !explainer_id) {
      return res.status(400).json({ error: 'slides, conceptTitle, and explainer_id are required' });
    }

    // Create PowerPoint
    const pptPath = `outputs/pptx/${explainer_id}_${Date.now()}.pptx`;
    await generatePowerPoint(slides, pptPath, conceptTitle);

    return res.json({
      success: true,
      explainer_id: explainer_id,
      ppt_path: pptPath,
      message: 'PowerPoint created successfully'
    });

  } catch (error) {
    console.error('Error creating PowerPoint:', error);
    return res.status(500).json({ 
      error: 'Failed to create PowerPoint',
      details: error.message 
    });
  }
});

// 3. Generate audio
router.post('/generate-audio', async (req, res) => {
  try {
    const { script, language, explainer_id } = req.body;
    
    if (!script || !explainer_id) {
      return res.status(400).json({ error: 'script and explainer_id are required' });
    }

    const audioPath = `outputs/audio/${explainer_id}_${Date.now()}.wav`;
    await generateAudio(script, audioPath);

    return res.json({
      success: true,
      explainer_id: explainer_id,
      audio_path: audioPath,
      message: 'Audio generated successfully'
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return res.status(500).json({ 
      error: 'Failed to generate audio',
      details: error.message 
    });
  }
});

// 4. Create video (UPDATED - now actually creates videos)
router.post('/create-video', async (req, res) => {
  try {
    const { explainer_id, slides, script, conceptTitle, target_audience, language } = req.body;
    
    if (!explainer_id || !slides || !script) {
      return res.status(400).json({ error: 'explainer_id, slides, and script are required' });
    }

    console.log('Creating video for explainer:', explainer_id);

    // Generate audio from script
    const audioPath = `outputs/audio/${explainer_id}_${Date.now()}.wav`;
    await generateAudio(script, audioPath);

    // Create slide images
    const slideImages = await createSlideImages(slides, explainer_id);

    // Create video
    const videoPath = `outputs/videos/${explainer_id}_${Date.now()}.mp4`;
    await createVideoFromSlides(slideImages, audioPath, videoPath);

    // Generate thumbnail
    const thumbnailPath = `outputs/images/${explainer_id}_thumbnail.jpg`;
    await generateThumbnail(videoPath, thumbnailPath);

    // Calculate actual duration (estimate based on script length)
    const estimatedDuration = Math.max(30, script.split(' ').length * 0.5); // ~0.5 seconds per word

    // Store video data
    const videoData = {
      explainer_id: explainer_id,
      title: conceptTitle || 'Generated Explainer Video',
      video_url: `/api/explainers/video/${explainer_id}`,
      thumbnail_url: `/api/explainers/thumbnail/${explainer_id}`,
      duration: Math.round(estimatedDuration),
      language: language || 'english',
      target_audience: target_audience || 'beginner',
      status: 'completed',
      sources: [{ type: 'document', name: 'Generated content' }],
      created_at: new Date().toISOString(),
      files: {
        video: videoPath,
        thumbnail: thumbnailPath,
        audio: audioPath
      }
    };



    videoStore.set(explainer_id, videoData);

    return res.json({
      success: true,
      ...videoData,
      message: 'Explainer video created successfully'
    });

  } catch (error) {
    console.error('Error creating video:', error);
    return res.status(500).json({ 
      error: 'Failed to create video',
      details: error.message 
    });
  }
});

router.get('/stored-videos', (req, res) => {
  const videos = Array.from(videoStore.values());
  res.json({
    success: true,
    count: videos.length,
    videos: videos
  });
});
// 5. Serve video files
router.get('/video/:explainer_id', (req, res) => {
  try {
    const { explainer_id } = req.params;
    
    // Check if we have the video in our store
    const videoData = videoStore.get(explainer_id);
    if (videoData && fs.existsSync(videoData.files.video)) {
      const videoPath = videoData.files.video;
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
      return;
    }
    
    // Fallback: search for video files by explainer_id
    const videoFiles = fs.readdirSync('outputs/videos').filter(file => 
      file.includes(explainer_id) && file.endsWith('.mp4')
    );
    
    if (videoFiles.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const videoPath = `outputs/videos/${videoFiles[0]}`;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error serving video:', error);
    res.status(500).json({ error: 'Failed to serve video' });
  }
});

// 6. Serve thumbnail files
router.get('/thumbnail/:explainer_id', (req, res) => {
  try {
    const { explainer_id } = req.params;
    
    // Check if we have the thumbnail in our store
    const videoData = videoStore.get(explainer_id);
    if (videoData && fs.existsSync(videoData.files.thumbnail)) {
      return res.sendFile(path.resolve(videoData.files.thumbnail));
    }
    
    const thumbnailPath = `outputs/images/${explainer_id}_thumbnail.jpg`;
    
    if (fs.existsSync(thumbnailPath)) {
      res.sendFile(path.resolve(thumbnailPath));
    } else {
      res.status(404).json({ error: 'Thumbnail not found' });
    }
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    res.status(500).json({ error: 'Failed to serve thumbnail' });
  }
});

// 7. Get user explainers (for Academy page)
router.get('/user-explainers/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Get videos from store (in production, use database)
    const userVideos = Array.from(videoStore.values()).filter(video => 
      video.user_id === user_id || true // For now, return all videos
    );
    
    // Add some mock data if no videos exist
    const mockExplainers = userVideos.length > 0 ? userVideos : [
      {
        explainer_id: uuidv4(),
        title: "Machine Learning Basics",
        created_at: new Date().toISOString(),
        duration: 120,
        language: "english",
        target_audience: "beginner",
        video_url: "outputs/videos/sample1.mp4",
        thumbnail_url: "outputs/slides/sample1_thumb.jpg",
        status: "completed",
        sources: [
          { type: "document", name: "ML_Introduction.pdf" },
          { type: "youtube", name: "ML Overview Video" }
        ]
      },
      {
        explainer_id: uuidv4(),
        title: "Data Structures Overview",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        duration: 90,
        language: "english",
        target_audience: "intermediate",
        video_url: "outputs/videos/sample2.mp4",
        thumbnail_url: "outputs/slides/sample2_thumb.jpg",
        status: "completed",
        sources: [
          { type: "document", name: "DataStructures.pdf" }
        ]
      }
    ];

    return res.json({
      user_id: user_id,
      explainer_videos: mockExplainers
    });

  } catch (error) {
    console.error('Error fetching user explainers:', error);
    return res.status(500).json({ error: 'Failed to fetch explainer videos' });
  }
});

// 8. Get specific explainer video
router.get('/explainer-video/:explainer_id', async (req, res) => {
  try {
    const { explainer_id } = req.params;
    
    // Check if we have the video in our store
    const videoData = videoStore.get(explainer_id);
    if (videoData) {
      return res.json(videoData);
    }
    
    // Mock explainer video data
    const mockExplainer = {
      explainer_id: explainer_id,
      title: "Sample Explainer Video",
      video_url: `/api/academy/video/${explainer_id}`,
      thumbnail_url: `/api/academy/thumbnail/${explainer_id}`,
      duration: 120,
      language: "english",
      target_audience: "beginner",
      status: "completed",
      created_at: new Date().toISOString()
    };

    return res.json(mockExplainer);
  } catch (error) {
    console.error('Error fetching explainer video:', error);
    return res.status(500).json({ error: 'Failed to fetch explainer video' });
  }
});

// 9. Download PowerPoint file
router.get('/download-pptx/:explainer_id', async (req, res) => {
  try {
    const { explainer_id } = req.params;
    
    // Find the PowerPoint file
    const pptxFiles = fs.readdirSync('outputs/pptx').filter(file => 
      file.includes(explainer_id) && file.endsWith('.pptx')
    );
    
    if (pptxFiles.length === 0) {
      return res.status(404).json({ error: 'PowerPoint file not found' });
    }
    
    const pptxPath = `outputs/pptx/${pptxFiles[0]}`;
    res.download(pptxPath, `explainer_${explainer_id}.pptx`);
  } catch (error) {
    console.error('Error downloading PowerPoint:', error);
    return res.status(500).json({ error: 'Failed to download PowerPoint file' });
  }
});

// Legacy endpoints (for backward compatibility)
router.get('/user-lessons/:user_id', async (req, res) => {
  // Redirect to the correct endpoint
  return res.redirect(`/api/explainers/user-explainers/${req.params.user_id}`);
});

// Legacy create lesson endpoint
router.post('/create-lesson', upload.single('file'), async (req, res) => {
  try {
    const { user_id, lesson_title, textual_content } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const lesson_id = uuidv4();
    const session_id = uuidv4();
    let fullContent = textual_content || '';

    // Extract content from PDF if provided
    if (req.file) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        fullContent += '\n' + pdfData.text;
        fs.unlinkSync(req.file.path); // Clean up
      } catch (pdfError) {
        console.error('Error parsing PDF:', pdfError);
        return res.status(400).json({ error: 'Failed to parse PDF file' });
      }
    }

    if (!fullContent.trim()) {
      return res.status(400).json({ error: 'Content is required (PDF or text)' });
    }

    console.log(`Creating lesson for user: ${user_id}`);

    // Extract 3-4 main topics from content
    const topics = await extractTopicsFromContent(fullContent, 4);
    
    if (!topics || topics.length === 0) {
      return res.status(500).json({ error: 'Failed to extract topics from content' });
    }

    // Generate detailed content for the first topic as a test
    const firstTopicContent = await generateTopicContent(topics[0], fullContent);
    
    // Ensure we have slides array
    const slidesToUse = firstTopicContent.slides || [];
    
    if (slidesToUse.length === 0) {
      throw new Error('No slides generated for the topic');
    }
    
    // Generate PowerPoint for the first topic
    const pptxPath = `outputs/pptx/${lesson_id}_${Date.now()}.pptx`;
    await generatePowerPoint(slidesToUse, pptxPath, topics[0].title);
    
    // Generate audio for the first slide as a test
    const firstSlide = slidesToUse[0];
    const audioPath = `outputs/audio/${lesson_id}_test_${Date.now()}.wav`;
    await generateAudio(firstSlide.narration_script, audioPath);

    return res.json({
      success: true,
      lesson_id: lesson_id,
      session_id: session_id,
      title: lesson_title || 'Generated Lesson',
      topics_extracted: topics,
      first_topic_content: firstTopicContent,
      pptx_generated: pptxPath,
      audio_generated: audioPath,
      message: 'Lesson topics extracted and first topic processed successfully!'
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    return res.status(500).json({ 
      error: 'Failed to create lesson',
      details: error.message 
    });
  }
});

export default router;