import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Create a new dojo session
router.post('/create-dojo-session', async (req, res) => {
  try {
    const { user_id, session_name } = req.body;

    // Validate required fields
    if (!user_id || !session_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id and session_name are required' 
      });
    }

    // Validate session name length
    if (session_name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Session name cannot be empty' 
      });
    }

    const session_id = uuidv4();

    // Insert into dojo_sessions table
    const { data, error } = await supabase
      .from('dojo_sessions')
      .insert({
        session_id,
        user_id,
        session_name: session_name.trim(),
        created_at: new Date(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dojo session:', error);
      return res.status(500).json({ 
        error: 'Failed to create dojo session',
        details: error.message 
      });
    }

    res.status(201).json({
      message: 'Dojo session created successfully',
      session: data
    });

  } catch (error) {
    console.error('Error in /create-dojo-session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get all dojo sessions for a user
router.get('/user-sessions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const { data, error } = await supabase
      .from('dojo_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch user sessions',
        details: error.message 
      });
    }

    res.json({
      message: 'User sessions retrieved successfully',
      sessions: data
    });

  } catch (error) {
    console.error('Error in /user-sessions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;