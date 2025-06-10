import { tool } from "@openai/agents";
import { z } from "zod";
import { Store } from "../utils/store";

export namespace Document {
  const defaultDocument = `
    <h1>Welcome to Document Canvas</h1>
    <p>This is your document workspace where you can create, edit, and collaborate on content.</p>
    
    <h2>Getting Started</h2>
    <p>You can start by:</p>
    <ul>
      <li>Adding sources from the left panel - paste URLs or text snippets</li>
      <li>Using voice commands to edit and generate content</li>
      <li>Working with the AI agent to transform your ideas into documents</li>
    </ul>
    
    <h2>Tips</h2>
    <p>The AI agent can help you:</p>
    <ul>
      <li>Generate content based on your sources</li>
      <li>Rewrite and improve existing text</li>
      <li>Structure and format your document</li>
      <li>Research and add relevant information</li>
    </ul>
  `;

  const state = Store.create({
    document: "",
  });

  export function use() {
    return Store.use(state);
  }

  export function getDocument() {
    return state.get().document;
  }

  export function setDocument(document: string) {
    state.set({
      ...state.get(),
      document,
    });
  }

  export function getDefaultDocument() {
    return defaultDocument;
  }

  export const Tools = [
    tool({
      name: "set_document",
      description: "Set the document HTML",
      parameters: z.object({
        document: z.string(),
      }),
      async execute(input) {
        state.set({
          ...state.get(),
          document: input.document,
        });
      },
    }),
  ];
}
