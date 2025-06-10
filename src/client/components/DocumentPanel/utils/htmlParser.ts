import { parse } from "parse5";

export interface SourceInfo {
  start: number;
  end: number;
  startTag?: { startOffset: number; endOffset: number };
  endTag?: { startOffset: number; endOffset: number };
  text?: string;
}

export class HTMLParser {
  private sourceHTML: string = "";
  private parsedDocument: any = null;
  private nodeToSourceMap = new WeakMap<Node, SourceInfo>();

  parseHTML(html: string) {
    this.sourceHTML = html;
    this.nodeToSourceMap = new WeakMap();
    
    // Parse with location info
    this.parsedDocument = parse(html, { sourceCodeLocationInfo: true });
    
    return this.parsedDocument;
  }

  renderToDOM(container: HTMLElement) {
    if (!this.parsedDocument) {
      throw new Error("Must call parseHTML first");
    }

    // Clear container
    container.innerHTML = "";
    
    // Find content nodes to render (skip document structure)
    let contentNodes: any[] = [];
    if (this.parsedDocument.nodeName === "#document") {
      const htmlNode = this.parsedDocument.childNodes.find(
        (n: any) => n.nodeName === "html"
      );
      const bodyNode = htmlNode?.childNodes.find((n: any) => n.nodeName === "body");
      if (bodyNode) {
        contentNodes = bodyNode.childNodes;
      }
    } else {
      contentNodes = this.parsedDocument.childNodes || [];
    }

    // Render each content node
    contentNodes.forEach((astNode: any) => {
      if (astNode.nodeName === "#text" && !astNode.value.trim()) {
        // Skip whitespace-only text nodes at root level
        return;
      }
      const domNode = this.renderASTNode(astNode);
      if (domNode) {
        container.appendChild(domNode);
      }
    });

    // Add sentinel element at the end
    const sentinel = document.createElement("div");
    sentinel.style.height = "0";
    sentinel.style.overflow = "hidden";
    sentinel.setAttribute("data-sentinel", "true");
    sentinel.textContent = "\u200B"; // Zero-width space
    container.appendChild(sentinel);
  }

  private renderASTNode(astNode: any): Node | null {
    if (astNode.nodeName === "#text") {
      // Create text node
      const textNode = document.createTextNode(astNode.value);

      // Store mapping with source location
      if (astNode.sourceCodeLocation) {
        this.nodeToSourceMap.set(textNode, {
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
        astNode.attrs.forEach((attr: any) => {
          element.setAttribute(attr.name, attr.value);
        });
      }

      // Store mapping with source location
      if (astNode.sourceCodeLocation) {
        this.nodeToSourceMap.set(element, {
          start: astNode.sourceCodeLocation.startOffset,
          end: astNode.sourceCodeLocation.endOffset,
          startTag: astNode.sourceCodeLocation.startTag,
          endTag: astNode.sourceCodeLocation.endTag,
        });

        // Add debug attributes
        element.setAttribute(
          "data-source-start",
          astNode.sourceCodeLocation.startOffset.toString()
        );
        element.setAttribute(
          "data-source-end",
          astNode.sourceCodeLocation.endOffset.toString()
        );
        if (astNode.sourceCodeLocation.startTag) {
          element.setAttribute(
            "data-source-start-tag-end",
            astNode.sourceCodeLocation.startTag.endOffset.toString()
          );
        }
        if (astNode.sourceCodeLocation.endTag) {
          element.setAttribute(
            "data-source-end-tag-start",
            astNode.sourceCodeLocation.endTag.startOffset.toString()
          );
        }
      }

      // Render children
      if (astNode.childNodes) {
        astNode.childNodes.forEach((childAstNode: any) => {
          const childDomNode = this.renderASTNode(childAstNode);
          if (childDomNode) {
            element.appendChild(childDomNode);
          }
        });
      }

      return element;
    }
  }

  getSourceInfo(node: Node): SourceInfo | undefined {
    return this.nodeToSourceMap.get(node);
  }

  getSourceHTML(): string {
    return this.sourceHTML;
  }
}