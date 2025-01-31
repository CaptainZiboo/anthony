import { chat } from "@/ai";
import { v4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message } = body;

    const id = body.chat_id || v4();

    console.log("chat_id", id);

    const response = await chat(message, id);

    return Response.json({
      response,
      id,
    });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
