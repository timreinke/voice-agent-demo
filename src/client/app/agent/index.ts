import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents/realtime";

import { Store } from "../utils/store";
import { worker } from "../service/worker";
import { Document } from "../document";
import { z } from "zod";
import { Sources } from "../sources";
import { generateId } from "../utils/id";

import documentEditorToolDescription from "./document-editor-tool-description.txt";
import researchToolDescription from "./research-tool-description.txt";

export namespace Agent {
  const state = Store.create<{
    session: RealtimeSession | null;
  }>({
    session: null,
  });

  const TOOLS = [
    tool({
      name: "document-editor",
      description: documentEditorToolDescription,
      parameters: z.object({
        instructions: z.string(),
      }),
      strict: true,
      execute: async ({ instructions }) => {
        const document = Document.getDocument();
        const response = await worker.agents["document-editor"].$post({
          json: { document, instructions },
        });

        if (response.status !== 200) {
          console.log(response.text());
          return {
            success: false,
            error: "Failed to edit document",
          };
        }

        const { newDocument } = await response.json();
        Document.setDocument(newDocument);

        return {
          success: true,
          newDocument,
        };
      },
    }),
    tool({
      name: "queue_research",
      description: researchToolDescription,
      parameters: z.object({
        query: z.string().describe("What to research"),
      }),
      strict: true,
      execute: async ({ query }) => {
        // Create pending research source
        const source = {
          id: generateId("research"),
          type: "research" as const,
          status: "pending" as const,
          createdAt: new Date(),
          source: { type: "research" as const, query },
          content: { type: "research" as const, query },
          metadata: { title: `Research: ${query}` },
        };
        
        Sources.addSource(source);
        
        try {
          // Make research API call
          const response = await worker.api.research.$post({
            json: { query },
          });
          
          if (!response.ok) {
            throw new Error("Research request failed");
          }
          
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || "Research failed");
          }
          
          // Update source with results
          Sources.updateSource(source.id, {
            status: "ready",
            content: {
              type: "research",
              query,
              findings: data.findings,
            },
            metadata: {
              title: data.title || `Research: ${query}`,
              summary: data.summary,
            },
          });
          
          return {
            taskId: source.id,
            status: "completed",
            summary: data.summary,
            sourcesFound: data.findings.sources.length,
          };
          
        } catch (error) {
          // Update source with error
          Sources.updateSource(source.id, {
            status: "error",
            error: error instanceof Error ? error.message : "Research failed",
          });
          
          return {
            taskId: source.id,
            status: "failed",
            error: error instanceof Error ? error.message : "Research failed",
          };
        }
      },
    }),
  ];

  export function use() {
    const s = Store.use(state);
    return {
      isConnected: s.session !== null,
    };
  }

  export async function connect() {
    const s = state.get();

    if (s.session) {
      return;
    }

    const tokenResponse = await worker.api.openai.token.$post({
      json: {},
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get ephemeral token");
    }

    const { token } = await tokenResponse.json();

    const agent = new RealtimeAgent({
      name: "Assistant",
      instructions: "You are a helpful assistant.",
      tools: TOOLS,
    });

    const session = new RealtimeSession(agent);

    await session.connect({
      apiKey: token,
    });

    state.set({
      session,
    });
  }

  export function disconnect() {
    console.log("disconnect");
    const s = state.get();
    if (!s.session) {
      return;
    }

    s.session.close();

    state.set({
      session: null,
    });
  }
}
