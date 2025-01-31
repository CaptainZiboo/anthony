import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { call_model, should_continue, StateAnnotation } from "./agents";
import { tool_node } from "./tools";

// Define a new graph
export const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", call_model)
  .addNode("tools", tool_node)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", should_continue)
  .addEdge("tools", "agent");

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
// Note that we're (optionally) passing the memory when compiling the graph
const app = workflow.compile({ checkpointer });

export const chat = async (query: string, thread_id: string) => {
  console.log("thread_id", thread_id);

  // Use the Runnable
  const state = await app.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    { configurable: { thread_id: thread_id } }
  );

  return state.messages[state.messages.length - 1].content;
};
