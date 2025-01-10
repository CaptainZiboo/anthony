import { TextLoader } from "langchain/document_loaders/fs/text";
import * as uuid from "uuid";
import fs from "fs";
import path from "path";

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

        // Load the document using TextLoader
        const loader = new TextLoader(_path);
        const docs = await loader.load();

        // Collect metadata
        metadataList.push(docs);

        // Delete the file after processing
        fs.unlinkSync(_path);
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
