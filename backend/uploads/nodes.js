import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import pinecone from "./pinecone.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});

// 1) Retrieval using studyGoal as query
export async function retrieve(state) {
  console.log("---RETRIEVE---");
  console.log("Input state:", state);

  const pineconeIndex = pinecone.Index("study-buddy");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    textKey: "text", // adjust to "pageContent" if needed
    namespace: "pdf-chunks",
  });

  const retrievedPdfDocs = await pineconeStore.similaritySearch(
    state.studyGoal,
    5
  );

  const documents = [...retrievedPdfDocs];
  console.log("Retrieved documents:", documents);
  return { documents };
}

// 2) Grade documents for relevance
export async function gradeDocuments(state) {
  console.log("---CHECK RELEVANCE---");
  console.log("Documents before grading:", state.documents);

  const docGraderSchema = z.object({
    binaryScore: z.enum(["yes", "no"]),
  });
  const gradingLLM = llm.withStructuredOutput(docGraderSchema, {
    name: "grade",
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a grader checking if the text below is relevant to the user’s study goal.
Text:
{docText}
Study goal:
{studyGoal}
Answer in 'binaryScore': "yes" or "no".
  `);

  const filteredDocs = [];
  for (const doc of state.documents || []) {
    console.log("Grading doc:", doc);
    const grade = await prompt
      .pipe(gradingLLM)
      .invoke({ docText: doc.pageContent, studyGoal: state.studyGoal });
    console.log("Grade result:", grade);
    if (grade.binaryScore === "yes") {
      filteredDocs.push(doc);
    }
  }
  console.log("Documents after grading:", filteredDocs);
  return { documents: filteredDocs };
}

// 3) Decide to generate or fallback to web search
export function decideToGenerate(state) {
  console.log("---DECIDE TO GENERATE---");
  console.log("Documents at decideToGenerate:", state.documents);
  if (!state.documents || state.documents.length === 0) {
    console.log("No documents found, transforming studyGoal.");
    return "transformQuery";
  }
  console.log("Proceeding to generate.");
  return "generate";
}

// 4) Transform studyGoal into web-search suited query
export async function transformQuery(state) {
  console.log("---TRANSFORM QUERY---");
  console.log("Original studyGoal:", state.studyGoal);
  const prompt = ChatPromptTemplate.fromTemplate(`
Rewrite the user’s study goal to be more explicit and suitable for a web search. Only give the new search query as the response:
Original:
{studyGoal}
Improved query:
`);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  let newQ = await chain.invoke({ studyGoal: state.studyGoal });
  newQ = newQ.replace(/.*"(.*?)".*/s, "$1");
  console.log("Transformed query:", newQ);
  return { studyGoal: newQ };
}

// 5) Web search using the transformed query
export async function webSearch(state) {
  console.log("---WEB SEARCH---");
  console.log("State before web search:", state);
  const tool = new TavilySearchResults({
    apiKey: process.env.TAVILY_API_KEY,
  });
  const resultsText = await tool.invoke({ input: state.studyGoal });

  const webDoc = new Document({
    pageContent: resultsText,
    metadata: { type: "webSearch" },
  });
  const combinedDocs = (state.documents || []).concat(webDoc);
  console.log("Documents after web search:", combinedDocs);
  return { documents: combinedDocs };
}

// 6) Generate study plan using all documents and studyGoal
export async function generate(state) {
  console.log("---GENERATE---");
  console.log("Documents at generate:", state.documents);

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a study advisor. Using ONLY the provided context, create a detailed and personalized study plan to help the user achieve their study goal.

Context:
{context}

User’s study goal:
{studyGoal}

Generate a step-by-step study plan tailored to the user’s study goal and the information in the context. If the context does not provide enough information to create a study plan, respond with “I’m sorry, I don’t have enough information to create a study plan.” You may optionally use the web-search tool (invoke as \`[search:web query]\`) only if necessary to supplement missing information, but prioritize the given context.

Your response should be clear, actionable, and focused on helping the user learn effectively.
  `);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const docsAsString = state.documents
    .map(
      (doc, i) =>
        `DOC #${i + 1} (type: ${doc.metadata?.type || "pdfChunk"}):\n${doc.pageContent}`
    )
    .join("\n\n");

  try {
    const generation = await chain.invoke({
      context: docsAsString,
      studyGoal: state.studyGoal,
    });
    console.log("Generated answer:", generation);
    return { generation };
  } catch (err) {
    console.error("Error in generate node:", err);
    return { generation: "" };
  }
}
