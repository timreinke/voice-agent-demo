import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents/realtime";

import { Store } from "../utils/store";
import { worker } from "../service/worker";
import { Document } from "../document";
import { z } from "zod";

import documentEditorToolDescription from "./document-editor-tool-description.txt";

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
