import { FC } from "hono/jsx";
import { Document } from "../app/document";
export const DocumentPanel: FC = () => {
  const { document } = Document.use();

  const handleNew = () => {
    if (
      confirm(
        "Are you sure you want to create a new document? This will clear the current content."
      )
    ) {
      Document.setDocument(Document.getDefaultDocument());
    }
  };

  return (
    <div className="h-full bg-transparent p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          <span className="text-blue-500 mr-2">📄</span>Document Canvas
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleNew}
            className="px-4 py-1.5 text-sm bg-white hover:bg-blue-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
          >
            New
          </button>
          <button className="px-4 py-1.5 text-sm bg-white hover:bg-blue-50 border border-gray-200 rounded-lg cursor-pointer shadow-sm transition-colors">
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
