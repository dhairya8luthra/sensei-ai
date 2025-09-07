import 'dotenv/config'; // ensure env is loaded even if this module is evaluated first

import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import Groq from 'groq-sdk';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';
import sharp from 'sharp';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ====== Supabase (guarded) ======
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);

const supabase = SUPABASE_ENABLED ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const VIDEOS_BUCKET = process.env.SUPABASE_BUCKET_VIDEOS || 'videos';
const IMAGES_BUCKET = process.env.SUPABASE_BUCKET_IMAGES || 'images';

// ====== Groq ======
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ====== FS prep ======
const ensureDirectories = () => {
  ['outputs/slides', 'outputs/audio', 'outputs/videos', 'outputs/pptx', 'outputs/images', 'outputs/temp']
    .forEach(dir => fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true }));
};
ensureDirectories();

// ====== Small utils ======
const toPosix = (p) => p.replace(/\\/g, '/');
const escapeXml = (s='') => s
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&apos;');

async function ensureBucketExists(name, isPublic = true) {
  if (!SUPABASE_ENABLED) return;
  const { data, error } = await supabase.storage.getBucket(name);
  if (data) {
    if (isPublic && data.public === false) {
      await supabase.storage.updateBucket(name, { public: true });
    }
    return;
  }
  if (!error || error.status === 404) {
    const { error: createErr } = await supabase.storage.createBucket(name, { public: isPublic });
    if (createErr && createErr.status !== 409) throw createErr;
    console.log(`[supabase] Bucket ready: ${name} (public=${isPublic})`);
  } else {
    throw error;
  }
}
function publicUrlFrom(bucket, key) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data?.publicUrl || null;
}
async function uploadToSupabase(bucket, filePath, destPath, contentType) {
  if (!SUPABASE_ENABLED) return null;
  await ensureBucketExists(bucket, true);
  const file = fs.readFileSync(filePath);
  const { error } = await supabase.storage.from(bucket).upload(destPath, file, { contentType, upsert: true });
  if (error) throw error;
  return publicUrlFrom(bucket, destPath);
}
const expectedThumbKey = (id) => `explainer/${id}/${id}_thumbnail.jpg`;

// ====== Content helpers ======
const cleanJsonResponse = (response) =>
  (response || '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

const extractContentFromSources = async (files, youtubeLinks, textualContext) => {
  let content = textualContext || '';
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        content += '\n' + pdfData.text;
        fs.unlinkSync(file.path);
      } catch (err) { console.error('Error parsing file:', err); }
    }
  }
  if (youtubeLinks && youtubeLinks.length > 0) {
    for (const link of youtubeLinks) {
      if (link.trim()) content += `\nYouTube reference: ${link}`;
    }
  }
  return content;
};

const generateSlides = async (content, conceptTitle, targetAudience, videoDuration) => {
  const numSlides = Math.max(3, Math.min(8, Math.ceil(videoDuration / 15)));
  const perSlide = Math.ceil(videoDuration / numSlides);
  const prompt = `Create an engaging explainer script for "${conceptTitle}" for ${targetAudience} learners.
Generate ${numSlides} slides for a ${videoDuration}-second video.
Return JSON:
{
 "slides":[
  {"slide_number":1,"title":"...","bullet_points":["..",".."],"visual_description":"..","narration_script":"..","duration":${perSlide}}
 ],
 "full_script":"..."
}
Content:
${content.substring(0, 4000)}
Return ONLY JSON.`;
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 3000
  });
  const cleaned = cleanJsonResponse(completion.choices[0]?.message?.content?.trim());
  return JSON.parse(cleaned);
};

const generateAudio = async (text, outputPath) => {
  const speechFile = path.resolve(outputPath);
  const wav = await groq.audio.speech.create({
    model: 'playai-tts',
    voice: 'Atlas-PlayAI',
    response_format: 'wav',
    input: text
  });
  const buffer = Buffer.from(await wav.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  return speechFile;
};

const generatePowerPoint = async (slides, outputPath, topicTitle) => {
  const pptx = new pptxgen();
  pptx.author = 'AI Explainer Generator';
  pptx.company = 'Learning Platform';
  pptx.title = topicTitle;
  slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    if (slide.title) {
      s.addText(slide.title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 28, bold: true, color: '363636', align: 'center' });
    }
    const keyPoints = slide.key_points || slide.bullet_points || [];
    if (keyPoints.length > 0) {
      const bulletText = keyPoints.map(t => ({ text: t, options: { bullet: true } }));
      s.addText(bulletText, { x: 1, y: 1.8, w: 8, h: 3, fontSize: 18, color: '444444' });
    }
    const desc = slide.example || slide.visual_description || '';
    if (desc) {
      s.addText(`${slide.example ? 'Example:' : 'Visual:'} ${desc}`, {
        x: 1, y: 5, w: 8, h: 1.5, fontSize: 16, italic: true, color: '666666', fill: 'F5F5F5', margin: 0.1
      });
    }
    s.addText(`${idx + 1}`, { x: 9.2, y: 6.8, w: 0.5, h: 0.3, fontSize: 12, color: '999999', align: 'center' });
  });
  await pptx.writeFile(outputPath);
  return outputPath;
};

// ====== Slide → PNG without foreignObject ======
async function createSlideImages(slides, explainer_id) {
  const slideImages = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const imagePath = `outputs/images/${explainer_id}_slide_${i + 1}.png`;
    const title = (slide.title || `Slide ${i + 1}`).slice(0, 80);
    const points = (slide.key_points || slide.bullet_points || []).map(String);

    let tspans = '';
    let y = 350;
    const lineStep = 60;
    const wrapAt = 70;
    for (const raw of points) {
      const txt = escapeXml(raw);
      const chunks = txt.match(new RegExp(`.{1,${wrapAt}}(\\s|$)`, 'g')) || [txt];
      for (let c = 0; c < chunks.length; c++) {
        const line = (c === 0 ? '• ' : '  ') + chunks[c].trim();
        tspans += `<tspan x="160" y="${y}">${escapeXml(line)}</tspan>`;
        y += lineStep;
      }
      y += 10;
    }

    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <text x="960" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="#ffffff">
          ${escapeXml(title)}
        </text>
        <text font-family="Arial, sans-serif" font-size="40" fill="#ffffff">
          ${tspans}
        </text>
        <text x="1800" y="1000" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="rgba(255,255,255,0.85)">
          ${i + 1} / ${slides.length}
        </text>
      </svg>
    `;
    await sharp(Buffer.from(svg)).png().toFile(imagePath);
    slideImages.push(imagePath);
  }
  return slideImages;
}

// ====== PNGs + audio → MP4 (image2 demuxer) ======
async function createVideoFromSlides(slideImages, audioPath, outputPath, slideDuration = 5) {
  return new Promise((resolve, reject) => {
    if (!slideImages || slideImages.length === 0) return reject(new Error('No slide images provided'));

    // pattern like <id>_slide_1.png ... _slide_N.png
    const base = path.basename(slideImages[0]).split('_slide_')[0];
    const pattern = toPosix(path.resolve(`outputs/images/${base}_slide_%d.png`));

    const args = [
      '-framerate', `1/${slideDuration}`,
      '-i', pattern,
      '-i', toPosix(path.resolve(audioPath)),
      '-c:v', 'libx264',
      '-r', '30',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-y',
      toPosix(path.resolve(outputPath))
    ];

    const proc = spawn(ffmpeg, args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => (code === 0 ? resolve(outputPath) : reject(new Error(`FFmpeg exited ${code}\n${stderr}`))));
    proc.on('error', reject);
  });
}

async function generateThumbnail(videoPath, thumbnailPath) {
  return new Promise((resolve, reject) => {
    const args = ['-i', toPosix(path.resolve(videoPath)), '-ss', '00:00:01.000', '-vframes', '1', '-y', toPosix(path.resolve(thumbnailPath))];
    const p = spawn(ffmpeg, args);
    p.on('close', code => code === 0 ? resolve(thumbnailPath) : reject(new Error(`ffmpeg thumb code ${code}`)));
    p.on('error', reject);
  });
}

// ====== In-memory store (useful fallback) ======
const videoStore = new Map();

// ====== Routes ======
router.get('/test', (_req, res) => {
  res.json({
    ok: true,
    supabaseConfigured: SUPABASE_ENABLED,
    ffmpegPath: ffmpeg,
    time: new Date().toISOString()
  });
});

// 1) Generate slides
router.post('/generate-slides', upload.array('files', 10), async (req, res) => {
  try {
    const { user_id, conceptTitle, targetAudience, videoDuration, language, textualContext, youtubeLinks } = req.body;
    if (!user_id || !conceptTitle) return res.status(400).json({ error: 'user_id and conceptTitle are required' });

    const explainer_id = uuidv4();

    let parsedYouTubeLinks = [];
    try { if (youtubeLinks) parsedYouTubeLinks = JSON.parse(youtubeLinks); } catch {}

    const content = await extractContentFromSources(req.files, parsedYouTubeLinks, textualContext);
    if (!content.trim()) return res.status(400).json({ error: 'No content provided' });

    const slidesData = await generateSlides(content, conceptTitle, targetAudience, parseInt(videoDuration) || 60);

    return res.json({
      success: true,
      explainer_id,
      conceptTitle,
      slides: slidesData.slides,
      script: slidesData.full_script,
      target_audience: targetAudience,
      duration: parseInt(videoDuration) || 60,
      language,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('generate-slides error:', e);
    res.status(500).json({ error: 'Failed to generate slides', details: e.message });
  }
});

// 2) Create PowerPoint (optional)
router.post('/create-powerpoint', async (req, res) => {
  try {
    const { slides, conceptTitle, explainer_id } = req.body;
    if (!slides || !conceptTitle || !explainer_id) return res.status(400).json({ error: 'slides, conceptTitle, explainer_id required' });
    const pptPath = `outputs/pptx/${explainer_id}_${Date.now()}.pptx`;
    await generatePowerPoint(slides, pptPath, conceptTitle);
    res.json({ success: true, explainer_id, ppt_path: pptPath });
  } catch (e) {
    console.error('create-powerpoint error:', e);
    res.status(500).json({ error: 'Failed to create PowerPoint', details: e.message });
  }
});

// 3) Generate audio (exposed step if needed)
router.post('/generate-audio', async (req, res) => {
  try {
    const { script, explainer_id } = req.body;
    if (!script || !explainer_id) return res.status(400).json({ error: 'script and explainer_id are required' });
    const audioPath = `outputs/audio/${explainer_id}_${Date.now()}.wav`;
    await generateAudio(script, audioPath);
    res.json({ success: true, explainer_id, audio_path: audioPath });
  } catch (e) {
    console.error('generate-audio error:', e);
    res.status(500).json({ error: 'Failed to generate audio', details: e.message });
  }
});

// 4) Create video (real generation; Supabase upload when configured; DB insert when configured)
router.post('/create-video', async (req, res) => {
  try {
    const { explainer_id, slides, script, conceptTitle, target_audience, language, user_id } = req.body;
    if (!explainer_id || !slides || !script) return res.status(400).json({ error: 'explainer_id, slides, and script are required' });

    // Audio
    const audioPath = `outputs/audio/${explainer_id}_${Date.now()}.wav`;
    await generateAudio(script, audioPath);

    // Slides → PNG
    const slideImages = await createSlideImages(slides, explainer_id);

    // PNGs + audio → MP4
    const slideDuration = Math.max(3, Math.round((slides.reduce((s, sl) => s + (sl.duration || 0), 0) || 0) / Math.max(1, slides.length)) || 5);
    const videoPath = `outputs/videos/${explainer_id}_${Date.now()}.mp4`;
    await createVideoFromSlides(slideImages, audioPath, videoPath, slideDuration);

    // Thumbnail
    const thumbnailPath = `outputs/images/${explainer_id}_thumbnail.jpg`;
    await generateThumbnail(videoPath, thumbnailPath);

    // Upload to Supabase if configured
    let video_url = null;
    let thumbnail_url = null;
    let video_path_key = null;

    if (SUPABASE_ENABLED) {
      const videoKey = `explainer/${explainer_id}/${path.basename(videoPath)}`;
      const thumbKey = expectedThumbKey(explainer_id);
      const vpub = await uploadToSupabase(VIDEOS_BUCKET, videoPath, videoKey, 'video/mp4');
      const tpub = await uploadToSupabase(IMAGES_BUCKET, thumbnailPath, thumbKey, 'image/jpeg');
      video_url = vpub;
      thumbnail_url = tpub;
      video_path_key = videoKey;

      // Insert DB row per your schema (FK removed earlier)
      const dbRecord = {
        lesson_id: explainer_id,                 // reuse id for grouping
        user_id,
        topic_title: conceptTitle || 'Generated Explainer Video',
        slides_data: slides,
        difficulty: (target_audience || 'beginner').charAt(0).toUpperCase() + (target_audience || 'beginner').slice(1),
        video_path: videoKey,
        estimated_duration: Math.max(30, Math.round(script.split(' ').length * 0.5)),
        is_deeper_content: false,
        status: 'completed'
      };
      const { error: dbError } = await supabase.from('explainer_videos').insert(dbRecord);
      if (dbError) console.error('DB insert error (explainer_videos):', dbError);
    } else {
      // Local fallback if Supabase not configured
      console.warn('[explainer_videos] Supabase not configured — serving from local endpoints.');
      video_url = `/api/academy/video/${explainer_id}`;
      thumbnail_url = `/api/academy/thumbnail/${explainer_id}`;
    }

    // Build response
    const estimatedDuration = Math.max(30, Math.round(script.split(' ').length * 0.5));
    const videoData = {
      explainer_id,
      user_id: user_id || 'anonymous',
      title: conceptTitle || 'Generated Explainer Video',
      video_url,
      thumbnail_url,
      duration: estimatedDuration,
      language: language || 'english',
      target_audience: target_audience || 'beginner',
      status: 'completed',
      sources: [{ type: 'document', name: 'Generated content' }],
      created_at: new Date().toISOString(),
      files: { video: videoPath, thumbnail: thumbnailPath, audio: audioPath, video_path_key }
    };

    // In-memory (useful for local streaming)
    videoStore.set(explainer_id, videoData);

    // Cleanup local temp (you can keep if you want to inspect)
    try {
      fs.existsSync(audioPath) && fs.unlinkSync(audioPath);
      // keep images/video until uploaded/streamed; if you want to delete, uncomment:
      // fs.existsSync(videoPath) && fs.unlinkSync(videoPath);
      // fs.existsSync(thumbnailPath) && fs.unlinkSync(thumbnailPath);
      // slideImages.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return res.json({ success: true, videoData, message: 'Explainer video created successfully' });
  } catch (e) {
    console.error('Error creating video:', e);
    res.status(500).json({ error: 'Failed to create video', details: e.message });
  }
});

// 5) Stream video from disk (fallback while developing)
router.get('/video/:explainer_id', (req, res) => {
  const { explainer_id } = req.params;
  const vd = videoStore.get(explainer_id);
  const videoPath = vd?.files?.video;
  if (!videoPath || !fs.existsSync(videoPath)) return res.status(404).json({ error: 'Video not found' });

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    });
    file.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// 6) Serve thumbnail from disk (fallback while developing)
router.get('/thumbnail/:explainer_id', (req, res) => {
  const p = `outputs/images/${req.params.explainer_id}_thumbnail.jpg`;
  if (fs.existsSync(p)) return res.sendFile(path.resolve(p));
  return res.status(404).json({ error: 'Thumbnail not found' });
});

// 7) List videos for user
router.get('/user-explainers/:user_id', async (req, res) => {
  try {
    // If Supabase is configured, read from DB and map storage keys → public URLs
    if (SUPABASE_ENABLED) {
      const { user_id } = req.params;
      const { data, error } = await supabase
        .from('explainer_videos')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch explainer videos' });
      }

      const result = (data || []).map(v => {
        const stableId = v.explainer_id || v.lesson_id;
        const video_url = v.video_path ? publicUrlFrom(VIDEOS_BUCKET, v.video_path) : null;
        const thumbnail_url = publicUrlFrom(IMAGES_BUCKET, expectedThumbKey(stableId));
        return {
          explainer_id: stableId,
          title: v.topic_title || 'Explainer Video',
          created_at: v.created_at,
          duration: v.estimated_duration ?? 0,
          language: v.language || 'english',
          target_audience: v.difficulty || 'Beginner',
          video_url,
          thumbnail_url,
          status: v.status || 'completed',
          sources: [{ type: 'document', name: 'Generated content' }]
        };
      });

      return res.json({ user_id, explainer_videos: result });
    }

    // Otherwise, fall back to in-memory store (local dev mode)
    const { user_id } = req.params;
    const userVideos = Array.from(videoStore.values()).filter(v => !user_id || v.user_id === user_id);
    return res.json({ user_id, explainer_videos: userVideos });
  } catch (e) {
    console.error('user-explainers error:', e);
    res.status(500).json({ error: 'Failed to fetch explainer videos' });
  }
});

export default router;
