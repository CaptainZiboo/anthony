import { RedisVectorStore } from "@langchain/redis";
import { redis } from "@/lib/redis";
import { llm } from "@/ai/llm";
import { OllamaEmbeddings } from "@langchain/ollama";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large",
  baseUrl: "http://localhost:11434",
});

export const store = new RedisVectorStore(embeddings, {
  redisClient: redis,
  indexName: "ollama",
});

export const retriever = store.asRetriever();

const contextualizeQSystemPrompt =
  "You are the virtual assistant for the city of Anthony. " +
  "Your role is to provide accurate and helpful information based on the data available in the vector store. " +
  "Act naturally and respond to user questions in a simple and efficient manner. " +
  "Ensure your responses are concise and to the point. " +
  "Respond in the same language as the question. " +
  "If the information is not available in the vector store, simply state that the information is not available. " +
  "Avoid unnecessary details and keep your responses brief.";

const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
  ["system", contextualizeQSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

const historyAwareRetriever = await createHistoryAwareRetriever({
  llm,
  retriever,
  rephrasePrompt: contextualizeQPrompt,
});

export const vector = {
  store,
  embeddings,
};
