**Note** mostly vibe coded, no code endorsed. turned into more of a UI experiment than any neat agent workflows.

https://github.com/user-attachments/assets/809dfa1b-c835-4635-b2f0-278bbbf520d4

# Agent SDK Voice Canvas

A voice-driven document drafting experiment using specialized AI agents to research inputs and collaboratively edit documents through natural conversation.

## Project Goals

This application explores a new UX paradigm where users draft documents by speaking to AI agents rather than typing. The interface presents:

- **Left pane**: Input management (URLs, text snippets, user directives)
- **Right pane**: Live document canvas (HTML output with headings, paragraphs, links, lists, emphasis)
- **Voice interaction**: Primary input method for coordinating agents and providing instructions

### Agent Architecture

The system employs multiple specialized agents:

1. **Coordinator Agent**: Main interface that orchestrates other agents based on voice commands
2. **Research Agent**: Analyzes inputs (URLs, documents, snippets) and extracts key information
3. **Editor Agent**: Takes research findings and current draft state to produce document revisions

## Architecture & Implementation Strategy

### Project Structure
```
src/
├── server/
│   ├── index.ts           # Main Worker entry point
│   ├── routes/            # API routes
│   └── middleware/        # Custom middleware
├── client/
│   ├── components/        # JSX client components
│   └── main.tsx           # Client entry point
dist/                      # Built static assets
public/                    # Additional static files
```
