import { FC } from "hono/jsx";
import { Workspace } from "../app/workspace";
export const DocumentPanel: FC = () => {
  const { document } = Workspace.use();

  const handleNew = () => {
    if (confirm("Are you sure you want to create a new document? This will clear the current content.")) {
      Workspace.setDocument(Workspace.getDefaultDocument());
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Document Canvas</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleNew}
            className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border border-gray-300 rounded cursor-pointer">
            New
          </button>
          <button className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border border-gray-300 rounded cursor-pointer">
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-auto">
        <div className="document-content p-8 max-w-4xl mx-auto">
          <div dangerouslySetInnerHTML={{ __html: document }} />
        </div>
      </div>
    </div>
  );
};
