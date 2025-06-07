import { FC } from "hono/jsx";
import { Agent } from "../agent";

export const App: FC = () => {
  const { isConnected } = Agent.use();

  return (
    <div className="p-5 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Agent SDK Voice Canvas</h1>

      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Voice Session Status</h2>
        <div
          className={`p-3 rounded border ${
            isConnected
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
        <button
          onClick={isConnected ? Agent.disconnect : Agent.connect}
          className={`mt-3 px-5 py-2 text-white border-none rounded cursor-pointer ${
            isConnected
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
};
