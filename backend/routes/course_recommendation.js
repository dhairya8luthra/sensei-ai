import express from "express";
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
const upload = multer();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();

// Load and parse CSV data
let coursesData = [];

function loadCoursesData() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'upgrad_courses_with_url.csv');
    const csvData     = fs.readFileSync(csvFilePath, 'utf8');

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      // Remove transformHeader entirely
      // transformHeader: undefined
    });

    coursesData = parsed.data;
    console.log(`Loaded ${coursesData.length} courses from CSV`);
  } catch (error) {
    console.error('Error loading courses data:', error);
    coursesData = [];
  }
}


// Initialize courses data on startup
loadCoursesData();

router.post('/recommend-courses',upload.none(), async (req, res) => {
  try {
    const { session_id, user_input } = req.body;
    
    if (!session_id || !user_input) {
      return res.status(400).json({ error: 'session_id and user_input are required' });
    }

    const coursesContext = coursesData
  .slice(0, 50)
  .map(course => ({
    course_name: course['Course Name'],
    course_description: [
      course['Description Line 1'],
      course['Description Line 2'],
      course['Description Line 3']
    ]
    .filter(Boolean)                     // remove any empty lines
    .join(' '),                          // concatenate with a space
    course_link: course['url'],
    duration: course['Duration']
  }))
  .filter(c => c.course_name && c.course_description);


    if (coursesContext.length === 0) {
      console.error('No courses available after filtering');
      return res.status(503).json({
        error: 'No courses available after filtering. Please check CSV data structure.',
        debug_info: {
          raw_courses_count: coursesData.length,
          sample_raw_course: coursesData[0] || null,
          available_columns: coursesData[0] ? Object.keys(coursesData[0]) : []
        }
      });
    }

    // Then check
    if (coursesContext.length === 0) {
      console.error('No courses available after filtering');
      return res.status(503).json({ 
        error: 'No courses available after filtering. Please check CSV data structure.',
        debug_info: {
          raw_courses_count: coursesData.length,
          sample_raw_course: coursesData[0] || null,
          available_columns: coursesData[0] ? Object.keys(coursesData[0]) : []
        }
      });
    }

    const prompt = `
You are an expert educational counselor for upGrad. Based on the user's career goals and interests, recommend the most suitable courses from the available upGrad catalog.

User Input: "${user_input}"

Available Courses (with course links provided in the CSV data):
${JSON.stringify(coursesContext, null, 2)}

IMPORTANT: You must respond with ONLY a valid JSON object in the exact format below. Do not include any markdown, code blocks, or additional text.

Required JSON format:
{
  "recommendations": [
    {
      "course_name": "exact course name from the available courses",
      "course_description": "detailed description explaining why this course matches the user's goals and what they will learn",
      "course_link": "exact course_link URL provided in the CSV data above"
    }
  ]
}

Critical Guidelines:
1. Select 3-5 most relevant courses from the provided list
2. Use EXACT course names from the available courses data
3. Use EXACT course_link URLs that are provided in the CSV data above - do not generate or modify links
4. The course_link field contains the actual URLs from the CSV file - you must copy them exactly as provided
5. Write compelling course descriptions that explain relevance to user's goals
6. Ensure the JSON is valid and properly formatted
7. Do not add any text outside the JSON structure
8. If a course doesn't have a course_link in the data, use an empty string ""
9. NEVER create or modify course links - only use the exact course_link values from the provided data

Remember: The course_link field in the data above contains the actual course URLs from the CSV file. Use them exactly as provided.

Return only the JSON object, nothing else.
`;

    // Call Groq API for recommendations
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational counselor specializing in upGrad courses. You must respond with ONLY valid JSON in the exact format requested. No markdown, no code blocks, no additional text - just pure JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
    });

    let rawResponse = completion.choices[0]?.message?.content?.trim();
    
    if (!rawResponse) {
      return res.status(502).json({ error: 'Empty response from recommendation service' });
    }

    // Clean up response - remove any markdown formatting
    if (rawResponse.startsWith("```json")) {
      rawResponse = rawResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (rawResponse.startsWith("```")) {
      rawResponse = rawResponse.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    // Remove any leading/trailing whitespace and newlines
    rawResponse = rawResponse.trim();

    let recommendations;
    try {
      recommendations = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', rawResponse);
      return res.status(502).json({ 
        error: 'Invalid response format from recommendation service',
        raw_response: rawResponse.substring(0, 500) + '...'
      });
    }

    // Validate the response structure
    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      return res.status(502).json({ 
        error: 'Invalid recommendation structure received',
        expected: 'JSON with recommendations array'
      });
    }

    // Validate each recommendation has required fields
    const validRecommendations = recommendations.recommendations.filter(rec => 
      rec.course_name && rec.course_description
    );

    if (validRecommendations.length === 0) {
      return res.status(502).json({ 
        error: 'No valid recommendations received',
        details: 'All recommendations missing required fields'
      });
    }

    // Generate recommendation ID
    const recommendation_id = uuidv4();

    // Store recommendation in database
    const { error: dbError } = await supabase
      .from('course_recommendations')
      .insert({
        recommendation_id: recommendation_id,
        session_id: session_id,
        user_input: user_input,
        recommendations_data: { recommendations: validRecommendations },
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to store recommendation:', dbError);
      // Continue execution
    }

    // Return response in the new format
    return res.json({
      success: true,
      recommendation_id: recommendation_id,
      session_id: session_id,
      user_query: user_input,
      total_courses_analyzed: coursesData.length, // Show total CSV courses, not filtered context
      recommendations: validRecommendations,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in course recommendation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate course recommendations',
      details: error.message 
    });
  }
});

// Endpoint to get recommendation history
router.get('/recommendation-history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const { data, error } = await supabase
      .from('course_recommendations')
      .select('recommendation_id, user_input, created_at')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      session_id: session_id,
      recommendation_history: data || []
    });

  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    return res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
});

// Endpoint to get specific recommendation details
router.get('/recommendation/:recommendation_id', async (req, res) => {
  try {
    const { recommendation_id } = req.params;
    
    const { data, error } = await supabase
      .from('course_recommendations')
      .select('*')
      .eq('recommendation_id', recommendation_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    return res.json(data);

  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return res.status(500).json({ error: 'Failed to fetch recommendation details' });
  }
});

// Endpoint to reload courses data (useful for updating CSV)
router.post('/reload-courses', async (req, res) => {
  try {
    loadCoursesData();
    return res.json({
      success: true,
      message: `Reloaded ${coursesData.length} courses from CSV`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reload courses data' });
  }
});

// Endpoint to get available courses (for debugging/verification)
router.get('/courses', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const paginatedCourses = coursesData.slice(offset, offset + limit);
    
    return res.json({
      total_courses: coursesData.length,
      page: page,
      limit: limit,
      courses: paginatedCourses
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

export default router;