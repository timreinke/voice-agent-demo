import { Agent, webSearchTool } from "@openai/agents";
import instructions from "./research.txt";

export const researchAgent = () =>
  new Agent({
    name: "Research Assistant",
    instructions,
    model: "gpt-4o",
    tools: [webSearchTool()],
  });