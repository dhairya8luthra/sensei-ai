import { Router } from 'express';
import { supabase } from '../supabase/supabaseClient.js';

const router = Router();


router.get('/ping/supabase', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');
  console.log(data, error);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'hello', tests: data });
});

export default router;
