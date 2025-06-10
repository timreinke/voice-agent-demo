import { Agent } from "@openai/agents";
import instructions from "./file-summarizer.txt";

export function fileSummarizerAgent() {
  return new Agent({
    name: "file-summarizer",
    model: "gpt-4o-mini",
    instructions,
    tools: []
  });
}