import { retriever } from "@/ai/store";
import { createRetrieverTool } from "langchain/tools/retriever";

export const retriever_tool = createRetrieverTool(retriever, {
  name: "search_knowledge",
  description: "Search knowledge from the retriever vector store",
});
