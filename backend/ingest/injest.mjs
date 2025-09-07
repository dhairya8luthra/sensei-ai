// ingestion.mjs (ESM)
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { PineconeStore } from "@langchain/pinecone";
import pinecone from "../pinecone.mjs"; // must export an initialized client
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPdfFromPath(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function loadPdfFromBuffer(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// Accepts either a filesystem path (string) or a Buffer (e.g., from multer)
// options: { filename?: string; namespace?: string }
export async function runIngestion(pdfInput, options = {}) {
  const namespace = options.namespace ?? "pdf-chunks";
  const filename =
    options.filename ??
    (typeof pdfInput === "string" ? path.basename(pdfInput) : "uploaded.pdf");

  // 1) Extract text
  const text = Buffer.isBuffer(pdfInput)
    ? await loadPdfFromBuffer(pdfInput)
    : await loadPdfFromPath(pdfInput);

  if (!text || !text.trim()) {
    throw new Error("No text extracted from PDF.");
  }

  // 2) Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  let docs = await splitter.createDocuments([text]);

  // Add helpful metadata
  docs = docs.map((d, i) => ({
    ...d,
    metadata: {
      ...(d.metadata || {}),
      source: filename,
      chunk: i,
    },
  }));

  // 3) Embeddings
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  // 4) Pinecone index (must already exist and match 384-dim)
  const pineconeIndex = pinecone.Index("study-buddy");

  // 5) Upsert into Pinecone
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace,
  });

  console.log(`PDF ingestion done for ${filename} into namespace "${namespace}"`);
}
