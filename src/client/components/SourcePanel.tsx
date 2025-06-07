import { FC } from "hono/jsx";

export const SourcePanel: FC = () => {
  return (
    <div className="h-full bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Sources</h2>
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Voice Input</h3>
          <p className="text-sm text-gray-500">Voice controls will appear here</p>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Text Input</h3>
          <p className="text-sm text-gray-500">Text input controls will appear here</p>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Settings</h3>
          <p className="text-sm text-gray-500">Configuration options will appear here</p>
        </div>
      </div>
    </div>
  );
};