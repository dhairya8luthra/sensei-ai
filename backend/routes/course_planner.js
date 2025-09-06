import express from "express";
import multer from "multer";
import { app as cragApp } from "../uploads/graph.js";

const router = express.Router();
const upload = multer(); // in-memory storage for files

router.post("/course-planner", upload.single("materials"), async (req, res) => {
  try {
    // For form-data with file:
    // req.body contains text fields user_id, studyGoal
    // req.file contains the uploaded file object

    const { user_id, studyGoal } = req.body;
    const materialsFileBuffer = req.file?.buffer; // file content in a Buffer

    if (!user_id || !studyGoal || !materialsFileBuffer) {
      return res.status(400).json({ error: "Missing required fields or file" });
    }

    // Prepare initial state with file buffer instead of raw file field
    const initialState = {
      user_id,
      studyGoal,
      materials: materialsFileBuffer,
      documents: [],
      generation: "",
    };

    const stateStream = await cragApp.stream(initialState, {
      recursionLimit: 10,
    });

    let finalState;
    for await (const partialState of stateStream) {
      finalState = partialState;
    }

    console.log("Final CRAG state:", finalState);

    return res.json({ answer: finalState.generate.generation });
  } catch (err) {
    console.error("CRAG error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
