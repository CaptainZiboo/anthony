import {
  AIMessage,
  BaseMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { model } from "../model";

const SYSTEM_MESSAGE = `
    You are the virtual assistant for the city of Anthony. 
    Your role is to provide accurate and helpful information based on the data available in the vector store.
    You have access to a retrieval tool that allows you to search for relevant information in the Redis vector store.

    REQUEST:

    1. Answer the questions based on the data available in the vector store.
    
    2. Ensure your responses are accurate, concise, and conversational.

    3. Respond in the same language as the question.

    4. Use a natural and friendly tone in your responses.

    5. Do not include any unnecessary information.

    6. If the information is not available in the vector store, inform the user that the information is not available.

    You have tools to search in the vector store and retrieve data to answer the questions.

    SUMMARY:
`;

export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// Define the function that determines whether to continue or not
// We can extract the state typing via `StateAnnotation.State`
export function should_continue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const last_message: AIMessage = messages[messages.length - 1];

  // If the LLM makes a tool call, then we route to the "tools" node
  if (last_message.tool_calls?.length) {
    return "tools";
  }

  // Otherwise, we stop (reply to the user)
  return "__end__";
}

// Define the function that calls the model
export async function call_model(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_MESSAGE),
    ...messages,
  ]);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}
