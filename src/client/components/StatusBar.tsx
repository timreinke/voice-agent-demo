import { FC } from "hono/jsx";
import { Agent } from "../app/agent";

export const StatusBar: FC = () => {
  const { isConnected } = Agent.use();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">
        Agent SDK Voice Canvas
      </h1>

      <button
        onClick={isConnected ? Agent.disconnect : Agent.connect}
        className={`px-4 py-2 text-sm font-medium text-white border-none rounded cursor-pointer transition-colors ${
          isConnected
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-slate-600 hover:bg-slate-700"
        }`}
      >
        {isConnected ? "🟢 Disconnect" : "🔴 Connect"}
      </button>
    </div>
  );
};
