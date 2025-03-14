import { ChatOllama } from "@langchain/ollama";

const MODEL_NAME = "mistral";

export const llm = new ChatOllama({
  model: MODEL_NAME,
  temperature: 0,
  keepAlive: -1,
});
