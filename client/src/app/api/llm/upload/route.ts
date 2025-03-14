import * as uuid from "uuid";
import fs from "fs";
import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  LatexTextSplitter,
  MarkdownTextSplitter,
  RecursiveCharacterTextSplitter,
  SupportedTextSplitterLanguage,
  SupportedTextSplitterLanguages,
  TokenTextSplitter,
} from "langchain/text_splitter";
import { redis } from "@/lib/redis";
import { store } from "@/ai/store";

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "uploads/_tmp");

const isCodeExtension = (
  extension: string
): extension is SupportedTextSplitterLanguage => {
  return extension in SupportedTextSplitterLanguages;
};

const getDocuments = async (file: File) => {
  const extension = path.extname(file.name);
  const _path = path.join(UPLOAD_DIR, `${uuid.v4()}_${file.name}`);

  try {
    const array_buffer = await file.arrayBuffer();
    const buffer = Buffer.from(array_buffer);

    // Save the file temporarily
    fs.writeFileSync(_path, buffer);

    let documents;

    // Load the file as documents
    switch (extension) {
      case ".csv":
        const csv_loader = new CSVLoader(_path);
        documents = await csv_loader.load();
        break;
      case ".json":
        const json_loader = new JSONLoader(_path);
        documents = await json_loader.load();
        break;
      case ".pdf":
        const pdf_loader = new PDFLoader(_path);
        documents = await pdf_loader.load();
        break;
      default:
        const loader = new TextLoader(_path);
        documents = await loader.load();
        break;
    }

    // Split the document into characters
    switch (extension) {
      case ".md":
        const markdown_splitter = new MarkdownTextSplitter();
        documents = await markdown_splitter.splitDocuments(documents);
        break;
      case ".txt":
        const token_splitter = new TokenTextSplitter();
        documents = await token_splitter.splitDocuments(documents);
        break;
      case ".tex":
        const latex_splitter = new LatexTextSplitter();
        documents = await latex_splitter.splitDocuments(documents);
        break;
      default:
        if (isCodeExtension(extension)) {
          const code_splitter = RecursiveCharacterTextSplitter.fromLanguage(
            extension,
            {}
          );
          documents = await code_splitter.splitDocuments(documents);
        }

        const recursive_splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        documents = await recursive_splitter.splitDocuments(documents);
        break;
    }

    return documents;
  } finally {
    // Delete the file after processing
    fs.unlinkSync(_path);
  }
};

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    for (const file of files) {
      if (file instanceof File) {
        const documents = await getDocuments(file);

        if (!redis.isOpen) await redis.connect();

        await store.addDocuments(documents);
      }
    }

    return Response.json(
      {
        message: "Files processed successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
