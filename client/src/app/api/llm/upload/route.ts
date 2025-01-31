import * as uuid from "uuid";
import fs from "fs";
import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RedisVectorStore } from "@langchain/redis";
import { createClient } from "redis";

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "uploads/_tmp");

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    const metadataList = [];

    for (const file of files) {
      if (file instanceof File) {
        const _path = path.join(UPLOAD_DIR, uuid.v4());
        const buffer = Buffer.from(await file.arrayBuffer());

        // Save the file temporarily
        fs.writeFileSync(_path, buffer);

        try {
          // Load the document using TextLoader
          const loader = new TextLoader(_path);
          const docs = await loader.load();

          // Split the document into characters
          const splitter = new CharacterTextSplitter({
            chunkSize: 100,
            chunkOverlap: 0,
          });
          const texts = await splitter.splitDocuments(docs);

          const recursive_splitter = new RecursiveCharacterTextSplitter();

          const recursive_texts = await recursive_splitter.splitDocuments(
            texts
          );

          // if file is HTML, Markdown or JSON
          const documentSplitter =
            RecursiveCharacterTextSplitter.getSeparatorsForLanguage("js");

          console.log("Generated recursive_texts");

          const embeddings = new OllamaEmbeddings({
            model: "mxbai-embed-large",
            baseUrl: "http://localhost:11434",
          });

          const client = createClient({
            url: process.env.REDIS_URL ?? "redis://localhost:6379",
          });

          await client.connect();

          console.log("Connected to Redis");

          const store = new RedisVectorStore(embeddings, {
            redisClient: client,
            indexName: "ollama",
          });

          await store.addDocuments(recursive_texts);

          console.log("Stored documents in Redis");

          // Collect metadata
          metadataList.push({
            docs,
            recursive_texts,
          });
        } catch (error) {
          throw error;
        } finally {
          // Delete the file after processing
          fs.unlinkSync(_path);
        }
      }
    }

    return Response.json({
      message: "Files processed successfully",
      metadata: metadataList,
      status: 200,
    });
  } catch (error: unknown) {
    return Response.json({ error }, { status: 500 });
  }
}
