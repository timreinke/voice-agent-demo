import { FC } from "hono/jsx";
import { Agent } from "../agent";

export const StatusBar: FC = () => {
  const { isConnected } = Agent.use();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">Agent SDK Voice Canvas</h1>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
      
      <button
        onClick={isConnected ? Agent.disconnect : Agent.connect}
        className={`px-4 py-2 text-sm font-medium text-white border-none rounded cursor-pointer transition-colors ${
          isConnected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
};