import { Agent, run } from "@openai/agents";
import { z } from "zod";
import instructions from "./document-editor.txt";
import { researchAgent } from "./research";

export const documentEditorRequestSchema = z.object({
  document: z.string(),
  instructions: z.string(),
  currentSelection: z.string().optional()
});

export type DocumentEditorRequest = z.infer<typeof documentEditorRequestSchema>;

export interface DocumentEditorResponse {
  newDocument: string;
}

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

export async function runDocumentEditor(request: DocumentEditorRequest): Promise<DocumentEditorResponse> {
  const { document, instructions, currentSelection } = request;
  
  // Format the initial message with the document and instructions
  const initialMessage = `Document to edit:
${document}

Instructions:
${instructions}${currentSelection ? `

Current Selection:
${currentSelection}` : ''}`;
  
  // Run the agent
  const result = await run(documentEditorAgent(), initialMessage);

  let sanitizedOutput = result.finalOutput || "";
  if (sanitizedOutput.startsWith("```html\n")) {
    sanitizedOutput = sanitizedOutput.substring(7);
  }
  if (sanitizedOutput.endsWith("\n```")) {
    sanitizedOutput = sanitizedOutput.substring(0, sanitizedOutput.length - 4);
  }
  
  return { 
    newDocument: sanitizedOutput,
  };
}
