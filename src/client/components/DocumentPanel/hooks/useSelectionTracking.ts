import { useEffect, useRef, useCallback } from "hono/jsx";
import { Document } from "../../../app/document";
import { HTMLParser } from "../utils/htmlParser";
import { SelectionMapper } from "../utils/selectionMapper";

export function useSelectionTracking(containerRef: { current: HTMLElement | null }) {
  const parserRef = useRef<HTMLParser | null>(null);
  const mapperRef = useRef<SelectionMapper | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || !containerRef.current || !mapperRef.current) return;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Check if selection is within document container
        if (containerRef.current.contains(container)) {
          const result = mapperRef.current.mapSelectionToSource(selection);
          
          if (result) {
            console.log("Selection Info:", {
              selectedText: result.selectedText,
              sourceSnippet: result.sourceSnippet,
            });
            
            // Update store with source snippet
            Document.setCurrentSelection(result.sourceSnippet);
          } else {
            Document.setCurrentSelection(null);
          }
        }
      } else {
        Document.setCurrentSelection(null);
      }
    };

    // Add selection change listener
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [containerRef]);

  const renderHTML = useCallback((html: string) => {
    if (!containerRef.current) return;

    // Initialize parser and mapper
    parserRef.current = new HTMLParser();
    mapperRef.current = new SelectionMapper(parserRef.current);

    // Parse and render
    parserRef.current.parseHTML(html);
    parserRef.current.renderToDOM(containerRef.current);
  }, [containerRef]);

  return { renderHTML };
}