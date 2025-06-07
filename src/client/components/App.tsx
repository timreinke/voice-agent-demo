import { FC } from "hono/jsx";
import { Agent } from "../agent";

export const App: FC = () => {
  const { isConnected } = Agent.use();

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
        <button
          onClick={isConnected ? Agent.disconnect : Agent.connect}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: isConnected ? "#dc3545" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
};
