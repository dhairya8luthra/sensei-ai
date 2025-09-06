// routes/upload.js
import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Multer for handling file uploads (limit = 50 MB per file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// POST /upload
router.post("/pdf_injestion", upload.array("files"), async (req, res) => {
  try {
    const { session_id, user_id } = req.body;

    if (!session_id || !user_id) {
      return res.status(400).json({ error: "session_id and user_id required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      // Validate PDF
      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Only PDFs are allowed" });
      }

      // Construct storage path: user_id/session_id/timestamp-filename.pdf
      const filePath = `${user_id}/${session_id}/${Date.now()}-${file.originalname}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("pdfs") // bucket name
        .upload(filePath, file.buffer, {
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("pdfs").getPublicUrl(filePath);

      // Insert metadata into session_files table
      const { error: dbError } = await supabase.from("session_files").insert([
        {
          session_id,
          file_name: file.originalname,
          file_path: filePath,
          file_url: data.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      results.push({
        fileName: file.originalname,
        url: data.publicUrl,
      });
    }

    res.json({ uploaded: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
