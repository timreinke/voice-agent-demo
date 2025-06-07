import { FC } from "hono/jsx";
import { useState } from "hono/jsx";
import { Sources } from "../app/sources";
import type { Source, URLContent, SnippetContent } from "../app/sources";
import { SourceItem } from "./SourceItem";
import { generateId } from "../app/utils/id";

export const SourcePanel: FC = () => {
  const { sources } = Sources.use();
  const [urlInput, setUrlInput] = useState("");
  const [snippetInput, setSnippetInput] = useState("");
  const [activeTab, setActiveTab] = useState<"url" | "snippet">("url");

  const handleAddURL = () => {
    if (!urlInput.trim()) return;

    const newSource: Source = {
      id: generateId("source"),
      type: "url",
      createdAt: new Date(),
      source: { type: "user", method: "type" },
      content: {
        type: "url",
        url: urlInput.trim(),
      } as URLContent,
      metadata: {},
    };

    Sources.addSource(newSource);
    setUrlInput("");
  };

  const handleAddSnippet = () => {
    if (!snippetInput.trim()) return;

    const newSource: Source = {
      id: generateId("source"),
      type: "snippet",
      createdAt: new Date(),
      source: { type: "user", method: "type" },
      content: {
        type: "snippet",
        text: snippetInput.trim(),
      } as SnippetContent,
      metadata: {},
    };

    Sources.addSource(newSource);
    setSnippetInput("");
  };

  const handleAddNote = (id: string, note: string) => {
    Sources.updateSource(id, { notes: note });
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Input Sources</h2>
      </div>

      <div className="px-6 pb-4">
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => setActiveTab("url")}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === "url"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Add URL
          </button>
          <button
            onClick={() => setActiveTab("snippet")}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === "snippet"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Add Snippet
          </button>
        </div>

        {activeTab === "url" ? (
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddURL()}
              placeholder="Enter URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleAddURL}
              disabled={!urlInput.trim()}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-gray-300"
            >
              Add URL
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={snippetInput}
              onInput={(e) =>
                setSnippetInput((e.target as HTMLTextAreaElement).value)
              }
              placeholder="Enter text snippet..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
            />
            <button
              onClick={handleAddSnippet}
              disabled={!snippetInput.trim()}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-gray-300"
            >
              Add Snippet
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
          {sources.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No sources yet. Add a URL or text snippet to get started.
            </p>
          ) : (
            sources.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                onRemove={Sources.removeSource}
                onAddNote={handleAddNote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
