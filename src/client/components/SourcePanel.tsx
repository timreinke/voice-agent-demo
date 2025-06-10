import { FC } from "hono/jsx";
import { useState, useRef } from "hono/jsx";
import { Sources } from "../app/sources";
import type { Source, URLContent, SnippetContent, FileContent } from "../app/sources";
import { SourceItem } from "./SourceItem";
import { generateId } from "../app/utils/id";
import { Agent } from "../app/agent";
import { worker } from "../app/service/worker";

export const SourcePanel: FC = () => {
  const { sources } = Sources.use();

  return (
    <div className="h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          <span className="text-indigo-500 mr-2">⚡</span>Input Sources
        </h2>
      </div>

      <div className="px-6 pb-4 space-y-3">
        <SourceInput />
        <FileUpload />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
          {sources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 italic">
              No sources yet. Add a URL or text snippet to get started.
            </p>
          ) : (
            sources.map((source) => (
              <SourceItem key={source.id} source={source} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FileUpload: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Create pending source immediately
    const fileSource: Source = {
      id: generateId("source"),
      type: "file",
      createdAt: new Date(),
      source: { type: "user", method: "file" },
      content: {
        type: "file",
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      } as FileContent,
      metadata: {
        title: file.name,
        summary: "Processing file..."
      },
      status: 'pending',
    };

    Sources.addSource(fileSource);

    // Convert file to base64 and send to backend
    try {
      const base64Data = await fileToBase64(file);
      
      const response = await worker.api.file.summarize.$post({
        json: {
          filename: file.name,
          mimeType: file.type,
          base64Data: base64Data.split(',')[1], // Remove data URL prefix
        },
      });

      if (!response.ok) {
        throw new Error('Failed to summarize file');
      }

      const result = await response.json();

      if (result.success) {
        // Update source with summary
        Sources.updateSource(fileSource.id, {
          content: {
            ...fileSource.content,
            summary: result.summary,
          } as FileContent,
          metadata: {
            title: result.summary.title,
            summary: result.summary.summary,
          },
          status: 'ready',
        });

        // Send file summary to RealtimeAgent conversation
        const message = `File '${file.name}' has been uploaded and analyzed. Summary: ${result.summary.summary}. The file contains ${result.summary.contentType.toLowerCase()} content. Key points: ${result.summary.keyPoints.join(', ')}. What would you like to do with this file?`;
        Agent.sendMessage(message);
      } else {
        Sources.updateSource(fileSource.id, {
          status: 'error',
          error: result.error || 'Failed to summarize file',
        });
      }
    } catch (error) {
      Sources.updateSource(fileSource.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to process file',
      });
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
      >
        <span>📎</span>
        <span>Upload File</span>
      </label>
      <p className="text-xs text-gray-500 text-center mt-1">
        Upload documents, images, or other files for analysis
      </p>
    </div>
  );
};

const SourceInput: FC = () => {
  const [input, setInput] = useState("");

  const isUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const detectedType = input.trim() ? (isUrl(input.trim()) ? "url" : "snippet") : null;

  const handleAdd = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const isUrlInput = isUrl(trimmedInput);
    
    const newSource: Source = {
      id: generateId("source"),
      type: isUrlInput ? "url" : "snippet",
      createdAt: new Date(),
      source: { type: "user", method: "type" },
      content: isUrlInput 
        ? { type: "url", url: trimmedInput } as URLContent
        : { type: "snippet", text: trimmedInput } as SnippetContent,
      metadata: {},
      status: 'ready',
    };

    Sources.addSource(newSource);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-xs text-gray-600 h-6">
        {detectedType && (
          <span className={`px-3 py-1 rounded-lg font-medium ${
            detectedType === "url" 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200" 
              : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
          }`}>
            {detectedType === "url" ? "🔗 URL detected" : "📝 Text detected"}
          </span>
        )}
      </div>
      <textarea
        value={input}
        onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
        onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleAdd()}
        placeholder="Paste a URL or enter text..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
      <button
        onClick={handleAdd}
        disabled={!input.trim()}
        className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium disabled:from-gray-300 disabled:to-gray-300 hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
      >
        {detectedType === "url" ? "Add URL" : detectedType === "snippet" ? "Add Text" : "Add Source"}
      </button>
      <p className="text-xs text-gray-500 text-center">
        Tip: Ctrl+Enter to quickly add
      </p>
    </div>
  );
};
