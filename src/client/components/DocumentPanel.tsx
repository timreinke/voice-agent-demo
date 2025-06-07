import { FC } from "hono/jsx";

export const DocumentPanel: FC = () => {
  return (
    <div className="h-full bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Document Canvas</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer">
            New
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer">
            Save
          </button>
        </div>
      </div>
      
      <div className="h-full border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">Document workspace</p>
            <p className="text-sm">Generated content will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};