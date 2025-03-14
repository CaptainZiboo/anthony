import { tools } from "./tools";
import { llm } from "./llm";

export const model = llm.bindTools(tools);
