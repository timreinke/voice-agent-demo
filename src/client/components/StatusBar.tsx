import { FC } from "hono/jsx";
import { Agent } from "../app/agent";

export const StatusBar: FC = () => {
  const { isConnected } = Agent.use();

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">
        <span className="text-blue-600">◈</span> Agent SDK Voice Canvas
      </h1>

      <button
        onClick={isConnected ? Agent.disconnect : Agent.connect}
        className={`px-5 py-2.5 text-sm font-medium text-white border-none rounded-full cursor-pointer transition-colors ${
          isConnected
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
        }`}
      >
        {isConnected ? "🟢 Disconnect" : "🔴 Connect"}
      </button>
    </div>
  );
};
