import { ToolNode } from "@langchain/langgraph/prebuilt";
import { retriever_tool } from "./search";

export const tools = [retriever_tool];

export const tool_node = new ToolNode(tools);
