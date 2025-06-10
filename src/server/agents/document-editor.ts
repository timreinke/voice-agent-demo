import { Agent } from "@openai/agents";
import instructions from "./document-editor.txt";
import { researchAgent } from "./research";

export const documentEditorAgent = () =>
  new Agent({
    name: "Document Editor",
    instructions,
    model: "gpt-4o",
    tools: [
      // TODO: doesn't add to the Sources list, would need to wire that up somehow
      researchAgent().asTool({
        toolName: "research",
        toolDescription: "Research the given topic and provide comprehensive findings. The input should be a well formulated question. Call this if the user's change request requires additional information.",
      })
    ],
  });
