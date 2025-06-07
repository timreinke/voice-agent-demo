import { Agent } from "@openai/agents";
import instructions from "./document-editor.txt";

export const documentEditorAgent = () =>
  new Agent({
    name: "Document Editor",
    instructions,
    model: "gpt-4o-mini",
    tools: [],
  });
