import { HTMLParser, SourceInfo } from "./htmlParser";

export interface SelectionResult {
  selectedText: string;
  sourceSnippet: string;
}

export class SelectionMapper {
  constructor(private parser: HTMLParser) {}

  mapSelectionToSource(selection: Selection): SelectionResult | null {
    if (selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // Find the source location
    const sourceLocation = this.findSourceLocation(range);

    if (sourceLocation) {
      const sourceSnippet = this.parser.getSourceHTML().substring(
        sourceLocation.start,
        sourceLocation.end
      );

      return {
        selectedText,
        sourceSnippet,
      };
    }

    return null;
  }

  private findSourceLocation(range: Range): { start: number; end: number } | null {
    // Get source positions for start and end
    const startPos = this.getSourcePosition(range.startContainer, range.startOffset);
    const endPos = this.getSourcePosition(range.endContainer, range.endOffset);

    if (startPos !== null && endPos !== null) {
      return {
        start: startPos,
        end: endPos,
      };
    }

    return null;
  }

  private getSourcePosition(container: Node, offset: number): number | null {
    // Handle text nodes - simple case
    if (container.nodeType === Node.TEXT_NODE) {
      const sourceInfo = this.parser.getSourceInfo(container);
      if (sourceInfo) {
        return sourceInfo.start + offset;
      }
      return null;
    }

    // Handle element nodes
    if (container.nodeType === Node.ELEMENT_NODE) {
      if (offset === 0) {
        // Selection is at the start of this element
        // Find the last content before this element
        const prevContent = this.findPreviousContent(container);
        if (prevContent) {
          return this.getEndPosition(prevContent);
        }
        // No previous content found, use start of this element
        const sourceInfo = this.parser.getSourceInfo(container);
        return sourceInfo?.start || null;
      } else {
        // Selection is after child nodes
        const children = Array.from(container.childNodes);
        if (offset > 0 && offset <= children.length) {
          const lastRelevantChild = children[offset - 1];
          return this.getEndPosition(lastRelevantChild);
        }
      }
    }

    return null;
  }

  private findPreviousContent(node: Node): Node | null {
    // Check for previous sibling first
    let current = node;

    while (current) {
      if (current.previousSibling) {
        const prevSibling = current.previousSibling;

        // Skip whitespace-only text nodes
        if (
          prevSibling.nodeType === Node.TEXT_NODE &&
          (prevSibling as Text).nodeValue?.trim() === ""
        ) {
          current = prevSibling;
          continue;
        }

        // Found meaningful content
        return prevSibling;
      }

      // No previous sibling, move up to parent
      current = current.parentElement as Node;

      // Stop if we've reached a document view or root
      if (!current || (current instanceof Element && current.getAttribute("data-document-container"))) {
        break;
      }
    }

    return null;
  }

  private getEndPosition(node: Node): number | null {
    const sourceInfo = this.parser.getSourceInfo(node);
    if (!sourceInfo) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      // For text nodes, return the end position
      return sourceInfo.end;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // For elements, prefer the start of the end tag if available
      // This allows for content to be inserted or the tag to be removed
      if (sourceInfo.endTag) {
        return sourceInfo.endTag.startOffset;
      }
      // Fallback to end position
      return sourceInfo.end;
    }

    return null;
  }
}