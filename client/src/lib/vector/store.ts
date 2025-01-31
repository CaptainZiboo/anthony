import { RedisVectorStore } from "@langchain/redis";
import { redis } from "../redis";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large",
  baseUrl: "http://localhost:11434",
});

export const store = new RedisVectorStore(embeddings, {
  redisClient: redis,
  indexName: "ollama",
});

export const llm = new ChatOllama({
  model: "llama3.1",
  temperature: 0,
});

export const retriever = store.asRetriever();

const contextualizeQSystemPrompt =
  "Given a chat history and the latest user question " +
  "which might reference context in the chat history, " +
  "formulate a standalone question which can be understood " +
  "without the chat history. Do NOT answer the question, " +
  "just reformulate it if needed and otherwise return it as is.";

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
