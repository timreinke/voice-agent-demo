import "./style.css";
import { parse, serialize } from "parse5";

let parsedDocument = null;
let sourceHTML = "";
let nodeToSourceMap = new WeakMap();

function parseAndRender() {
  sourceHTML = document.getElementById("source-input").value;

  // Parse with location info
  parsedDocument = parse(sourceHTML, { sourceCodeLocationInfo: true });
  window.parsedDocument = parsedDocument;

  // Debug: Log the parsed structure
  console.log("Parsed document:", parsedDocument);

  // Clear previous mappings
  nodeToSourceMap = new WeakMap();

  // Render the HTML from the AST
  const documentView = document.getElementById("document-view");
  documentView.innerHTML = "";

  // Find the content to render (skip document structure)
  let contentNodes = [];
  if (parsedDocument.nodeName === "#document") {
    const htmlNode = parsedDocument.childNodes.find(
      (n) => n.nodeName === "html"
    );
    const bodyNode = htmlNode?.childNodes.find((n) => n.nodeName === "body");
    if (bodyNode) {
      contentNodes = bodyNode.childNodes;
    }
  } else {
    contentNodes = parsedDocument.childNodes || [];
  }

  // Render each content node
  contentNodes.forEach((astNode) => {
    if (astNode.nodeName === "#text" && !astNode.value.trim()) {
      // Skip whitespace-only text nodes at root level
      return;
    }
    const domNode = renderASTNode(astNode);
    if (domNode) {
      documentView.appendChild(domNode);
    }
  });

  // Add a sentinel element at the end to prevent selections from extending beyond
  const sentinel = document.createElement("div");
  sentinel.style.height = "0";
  sentinel.style.overflow = "hidden";
  sentinel.setAttribute("data-sentinel", "true");
  sentinel.textContent = "\u200B"; // Zero-width space
  documentView.appendChild(sentinel);
}

function renderASTNode(astNode) {
  if (astNode.nodeName === "#text") {
    // Create text node
    const textNode = document.createTextNode(astNode.value);

    // Store mapping with source location
    if (astNode.sourceCodeLocation) {
      nodeToSourceMap.set(textNode, {
        start: astNode.sourceCodeLocation.startOffset,
        end: astNode.sourceCodeLocation.endOffset,
        text: astNode.value,
      });
    }

    return textNode;
  } else if (astNode.nodeName === "#comment") {
    // Skip comments
    return null;
  } else {
    // Create element node
    const element = document.createElement(astNode.nodeName);

    // Add attributes
    if (astNode.attrs) {
      astNode.attrs.forEach((attr) => {
        element.setAttribute(attr.name, attr.value);
      });
    }

    // Store mapping with source location
    if (astNode.sourceCodeLocation) {
      nodeToSourceMap.set(element, {
        start: astNode.sourceCodeLocation.startOffset,
        end: astNode.sourceCodeLocation.endOffset,
        startTag: astNode.sourceCodeLocation.startTag,
        endTag: astNode.sourceCodeLocation.endTag,
      });

      // Also add data attributes for debugging
      element.setAttribute(
        "data-source-start",
        astNode.sourceCodeLocation.startOffset
      );
      element.setAttribute(
        "data-source-end",
        astNode.sourceCodeLocation.endOffset
      );
      if (astNode.sourceCodeLocation.startTag) {
        element.setAttribute(
          "data-source-start-tag-end",
          astNode.sourceCodeLocation.startTag.endOffset
        );
      }
      if (astNode.sourceCodeLocation.endTag) {
        element.setAttribute(
          "data-source-end-tag-start",
          astNode.sourceCodeLocation.endTag.startOffset
        );
      }
    }

    // Render children
    if (astNode.childNodes) {
      astNode.childNodes.forEach((childAstNode) => {
        const childDomNode = renderASTNode(childAstNode);
        if (childDomNode) {
          element.appendChild(childDomNode);
        }
      });
    }

    return element;
  }
}

function handleSelection() {
  const selection = window.getSelection();
  const selectionInfo = document.getElementById("selection-info");

  if (selection.rangeCount === 0 || selection.isCollapsed) {
    selectionInfo.innerHTML =
      "<p>Select text in the rendered document to see source mapping.</p>";
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString();

  // Find the source location
  const sourceLocation = findSourceLocation(range);

  if (sourceLocation) {
    const sourceSnippet = sourceHTML.substring(
      sourceLocation.start,
      sourceLocation.end
    );

    selectionInfo.innerHTML = `
      <h3>Selection Details</h3>
      <p><strong>Selected Text:</strong> "${selectedText}"</p>
      <p><strong>Source Position:</strong> ${sourceLocation.start} - ${
      sourceLocation.end
    }</p>
      <h4>Source Snippet:</h4>
      <pre>${escapeHtml(sourceSnippet)}</pre>
    `;
  } else {
    selectionInfo.innerHTML =
      "<p>Could not determine source location for this selection.</p>";
  }
}

function findSourceLocation(range) {
  console.log("Finding source location for range:", range);
  console.log("Start container:", range.startContainer, "offset:", range.startOffset);
  console.log("End container:", range.endContainer, "offset:", range.endOffset);
  console.log("Selected text from range:", range.toString());

  // Get source positions for start and end
  const startPos = getSourcePosition(range.startContainer, range.startOffset);
  const endPos = getSourcePosition(range.endContainer, range.endOffset);

  // console.log("Calculated positions - start:", startPos, "end:", endPos);

  if (startPos !== null && endPos !== null) {
    return {
      start: startPos,
      end: endPos,
    };
  }

  return null;
}


function getSourcePosition(container, offset) {
  // Handle text nodes - simple case
  if (container.nodeType === Node.TEXT_NODE) {
    const sourceInfo = nodeToSourceMap.get(container);
    if (sourceInfo) {
      console.log("Text node source info:", sourceInfo);
      return sourceInfo.start + offset;
    }
    return null;
  }
  
  // Handle element nodes
  if (container.nodeType === Node.ELEMENT_NODE) {
    console.log("Element node:", container, "offset:", offset);
    
    if (offset === 0) {
      // Selection is at the start of this element
      // Find the last content before this element
      const prevContent = findPreviousContent(container);
      if (prevContent) {
        return getEndPosition(prevContent);
      }
      // No previous content found, use start of this element
      const sourceInfo = nodeToSourceMap.get(container);
      return sourceInfo?.start || null;
    } else {
      // Selection is after child nodes
      const children = Array.from(container.childNodes);
      if (offset > 0 && offset <= children.length) {
        const lastRelevantChild = children[offset - 1];
        return getEndPosition(lastRelevantChild);
      }
    }
  }
  
  return null;
}

function findPreviousContent(node) {
  // Check for previous sibling first
  let current = node;
  
  while (current) {
    if (current.previousSibling) {
      const prevSibling = current.previousSibling;
      
      // Skip whitespace-only text nodes
      if (prevSibling.nodeType === Node.TEXT_NODE && 
          prevSibling.nodeValue.trim() === "") {
        current = prevSibling;
        continue;
      }
      
      // Found meaningful content
      return prevSibling;
    }
    
    // No previous sibling, move up to parent
    current = current.parentElement;
    
    // Stop if we've reached the document view
    if (!current || current.id === "document-view") {
      break;
    }
  }
  
  return null;
}

function getEndPosition(node) {
  const sourceInfo = nodeToSourceMap.get(node);
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  const parseBtn = document.getElementById("parse-btn");
  const documentView = document.getElementById("document-view");

  parseBtn.addEventListener("click", parseAndRender);

  function handleSelectionChange() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      // Check if selection is within document view
      if (documentView.contains(container)) {
        handleSelection();
      }
    }
  }

  document.addEventListener("selectionchange", handleSelectionChange);

  // Parse and render initial content
  parseAndRender();
});
