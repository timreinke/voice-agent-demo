import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

import { Store } from "../utils/store";
import { worker } from "../service/worker";
import { Workspace } from "../workspace";

export namespace Agent {
  const state = Store.create<{
    session: RealtimeSession | null;
  }>({
    session: null,
  });

  const TOOLS = [
    ...Workspace.Tools,
  ]

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
