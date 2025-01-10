import { TextLoader } from "langchain/document_loaders/fs/text";
import { v4 as uuidv4 } from "uuid";
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
        const tempFilePath = path.join(UPLOAD_DIR, `${uuidv4()}_${file.name}`);
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Save the file temporarily
        fs.writeFileSync(tempFilePath, fileBuffer);

        // Load the document using TextLoader
        const loader = new TextLoader(tempFilePath);
        const docs = await loader.load();

        // Collect metadata
        const metadata = {
          filename: file.name,
          size: file.size,
          mimetype: file.type,
          content: docs,
        };

        metadataList.push(metadata);

        // Delete the file after processing
        fs.unlinkSync(tempFilePath);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Files processed successfully",
        metadata: metadataList,
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    return Response.json({ error, status: 500 });
  }
}
