import { FC, useState, useEffect } from "hono/jsx";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { hc } from "hono/client";
import type { AppType } from "../../server/index";

export const App: FC = () => {
  const [session, setSession] = useState<RealtimeSession | null>(null);

  useEffect(() => {
    const initVoiceSession = async () => {
      try {
        console.log("Initializing voice session...");

        // Create typed client
        const client = hc<AppType>(window.location.origin);

        // Get ephemeral token with typed RPC
        const tokenResponse = await client.api.openai.token.$post({
          json: {},
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get ephemeral token");
        }

        const { token } = await tokenResponse.json();
        console.log("Got ephemeral token");

        const agent = new RealtimeAgent({
          name: "Assistant",
          instructions: "You are a helpful assistant.",
        });

        // Create RealtimeSession
        const realtimeSession = new RealtimeSession(agent);
        realtimeSession.on("agent_start", (event) => {
          console.log("Agent start", event);
        });
        realtimeSession.on("agent_end", (event) => {
          console.log("Agent end", event);
        });
        realtimeSession.on("agent_handoff", (event) => {
          console.log("Agent handoff", event);
        });
        realtimeSession.on("agent_tool_end", (event) => {
          console.log("Agent tool end", event);
        });
        realtimeSession.on("agent_tool_start", (event) => {
          console.log("Agent tool start", event);
        });
        realtimeSession.on("audio", (event) => {
          console.log("Audio", event);
        });
        realtimeSession.on("audio_interrupted", (event) => {
          console.log("Audio interrupted", event);
        });
        realtimeSession.on("audio_start", (event) => {
          console.log("Audio start", event);
        });
        realtimeSession.on("audio_stopped", (event) => {
          console.log("Audio stopped", event);
        });
        realtimeSession.on("error", (event) => {
          console.log("Error", event);
        });
        realtimeSession.on("guardrail_tripped", (event) => {
          console.log("Guardrail tripped", event);
        });
        realtimeSession.on("history_added", (event) => {
          console.log("History added", event);
        });
        realtimeSession.on("history_updated", (event) => {
          console.log("History updated", event);
        });
        realtimeSession.on("tool_approval_requested", (event) => {
          console.log("Tool approval requested", event);
        });
        realtimeSession.on("transport_event", (event) => {
          console.log("Transport event", event);
        });

        // Connect to the session
        await realtimeSession.connect({
          apiKey: token,
        });
        setSession(realtimeSession);
      } catch (error) {
        console.error("Failed to initialize voice session:", error);
      }
    };
    initVoiceSession();
  }, [setSession]);

  const isConnected = session !== null;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Agent SDK Voice Canvas</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Voice Session Status</h2>
        <div
          style={{
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
            color: isConnected ? "#155724" : "#721c24",
            border: `1px solid ${isConnected ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
    </div>
  );
};
