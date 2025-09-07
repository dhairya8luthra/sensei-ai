import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import express from "express";
import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});
const router = express.Router();

// Assuming you have your llm defined somewhere accessible here
// import or define llm before using this route

router.post('/generate-lecture-script', async (req, res) => {
  try {
    const { studyPlan } = req.body;

    if (!studyPlan || typeof studyPlan !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'studyPlan' in request body" });
    }

    const topicRegex = /\d+\.\s+(.*)/g;
    let match;
    const topics = [];

    while ((match = topicRegex.exec(studyPlan)) !== null) {
      topics.push(match[1].trim());
    }

    if (topics.length === 0) {
      topics.push(studyPlan); // fallback: entire study plan as one topic
    }

    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert educator. Create a detailed lecture script for the following topic. The script should be clear and comprehensive for students learning this subject.

Topic:
{topic}

Lecture Script:
    `);

    const scripts = {};
    for (const topic of topics) {
      const chain = prompt.pipe(llm).pipe(new StringOutputParser());
      const script = await chain.invoke({ topic });
      scripts[topic] = script;
    }

    // Respond with structured JSON
    return res.json({
      success: true,
      lectures: Object.entries(scripts).map(([topic, lectureScript]) => ({
        topic,
        lectureScript,
      })),
    });
  } catch (err) {
    console.error("Error generating lecture scripts:", err);
    return res.status(500).json({ error: "Failed to generate lecture scripts" });
  }
});

export default router;
