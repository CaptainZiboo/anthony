import { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";

const MODEL_NAME = "llama3.1";

export const llm = new ChatOllama({
  model: MODEL_NAME,
  temperature: 0,
});

export const model = llm.bindTools(tools);
