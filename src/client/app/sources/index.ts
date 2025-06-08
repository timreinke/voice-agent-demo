import { Store } from "../utils/store";

export namespace Sources {
  interface State {
    sources: Source[];
  }

  const state = Store.create<State>({
    sources: [],
  });

  export function use() {
    return Store.use(state);
  }

  export function getSources(): Source[] {
    return state.get().sources;
  }

  export function addSource(source: Source) {
    state.set({
      sources: [...state.get().sources, source],
    });
  }

  export function updateSource(id: string, updates: Partial<Source>) {
    state.set({
      sources: state
        .get()
        .sources.map((input) =>
          input.id === id ? { ...input, ...updates } : input
        ),
    });
  }

  export function removeSource(id: string) {
    state.set({
      sources: state.get().sources.filter((source) => source.id !== id),
    });
  }

  export function getSourceById(id: string): Source | undefined {
    return state.get().sources.find((source) => source.id === id);
  }
}

export type SourceType = "url" | "snippet" | "search_result" | "research";

export type SourceSource =
  | { type: "user"; method: "voice" | "paste" | "type" }
  | { type: "agent"; agentId: string }
  | { type: "research"; query: string };

export interface Source {
  id: string;
  type: SourceType;
  createdAt: Date;
  source: SourceSource;
  content: SourceContent;
  metadata: SourceMetadata;
  notes?: string;
  status: 'pending' | 'ready' | 'error';
  error?: string;
}

export type SourceContent = URLContent | SnippetContent | SearchResultContent | ResearchContent;

export interface URLContent {
  type: "url";
  url: string;
  fetchedContent?: string;
}

export interface SnippetContent {
  type: "snippet";
  text: string;
}

export interface SearchResultContent {
  type: "search_result";
  query: string;
  url: string;
  snippet: string;
}

export interface ResearchContent {
  type: "research";
  query: string;
  findings?: {
    summary: string;
    sources: Array<{
      title: string;
      url: string;
      snippet: string;
      relevance: string;
    }>;
    keyInsights: string[];
  };
}

export interface SourceMetadata {
  title?: string;
  summary?: string;
}
