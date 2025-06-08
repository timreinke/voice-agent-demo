# Research Agent Implementation Plan

## Overview
Add research capabilities to the voice canvas application, allowing the frontend voice agent to queue research tasks that execute synchronously on the backend while showing pending status in the UI.

## Architecture

### Flow
1. User requests research through voice interaction
2. Voice agent uses `queue_research` tool to:
   - Create a pending research Source
   - Make synchronous API call to backend research agent
   - Update Source with results when complete
3. UI shows pending status while research executes
4. Backend research agent performs web search and returns findings
5. Source is updated with results or error status

### Key Components

#### 1. Updated Source Types
```typescript
// Add status field to Source interface
interface Source {
  // ... existing fields
  status: 'pending' | 'ready' | 'error';
  error?: string; // For failed research tasks
}

// Research-specific content type
interface ResearchContent {
  type: 'research';
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
```

#### 2. Frontend Implementation

##### Voice Agent Tool
```typescript
// Add to client agent tools
{
  name: 'queue_research',
  description: 'Queue a research task to gather information on a topic',
  parameters: {
    query: { type: 'string', required: true, description: 'What to research' },
    context: { type: 'string', required: false, description: 'Additional context' }
  },
  handler: async (params) => {
    // Create pending source
    const source: Source = {
      id: generateId(),
      type: 'research',
      status: 'pending',
      createdAt: new Date(),
      source: { type: 'research', query: params.query },
      content: { type: 'research', query: params.query },
      metadata: { title: `Research: ${params.query}` }
    };
    
    Sources.addSource(source);
    
    try {
      // Make sync API call (but don't block the UI)
      const result = await api.research.execute({
        query: params.query,
        context: params.context
      });
      
      // Update source with results
      Sources.updateSource(source.id, {
        status: 'ready',
        content: {
          type: 'research',
          query: params.query,
          findings: result.findings
        },
        metadata: {
          title: result.title || `Research: ${params.query}`,
          summary: result.summary
        }
      });
      
      return { 
        taskId: source.id, 
        status: 'completed',
        summary: result.summary 
      };
      
    } catch (error) {
      // Update source with error
      Sources.updateSource(source.id, {
        status: 'error',
        error: error.message || 'Research failed'
      });
      
      return { 
        taskId: source.id, 
        status: 'failed',
        error: error.message 
      };
    }
  }
}
```

##### UI Updates
```typescript
// In SourceItem component, add status indicator
{source.status === 'pending' && (
  <span className="status-indicator pending" title="Research in progress">
    <span className="yellow-dot">●</span>
  </span>
)}
{source.status === 'error' && (
  <span className="status-indicator error" title={source.error}>
    <span className="red-dot">●</span>
  </span>
)}
```

#### 3. Backend Implementation

##### API Endpoint
```typescript
// POST /api/research
app.post('/api/research', 
  openaiKeyMiddleware,
  zValidator('json', z.object({
    query: z.string(),
    context: z.string().optional()
  })),
  async (c) => {
    const { query, context } = c.req.valid('json');
    
    try {
      const findings = await researchAgent.run({
        messages: [{
          role: 'user',
          content: `Research the following topic and provide comprehensive findings:
            
Query: ${query}
${context ? `Additional Context: ${context}` : ''}

Provide:
1. A summary of key findings
2. List of relevant sources with titles, URLs, and snippets
3. Key insights and takeaways`
        }]
      });
      
      // Parse agent response into structured format
      const result = parseResearchFindings(findings);
      
      return c.json({
        success: true,
        findings: result.findings,
        title: result.title,
        summary: result.summary
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  }
);
```

##### Research Agent
```typescript
// src/server/agents/research.ts
import { agent } from '@openai/agents';

export const researchAgent = agent({
  model: 'gpt-4o-mini',
  instructions: `You are a research assistant with access to web search.
    
Your task is to:
1. Search for comprehensive information on the given topic
2. Synthesize findings from multiple sources
3. Provide clear, structured results
4. Always cite sources with URLs
5. Focus on factual, relevant information

Format your response as JSON with:
- title: Brief title for the research
- summary: 2-3 sentence overview
- findings: Detailed findings object with sources and insights`,
  tools: { 
    web_search: {} 
  }
});
```

#### 4. API Client
```typescript
// src/client/api/research.ts
export const research = {
  execute: async (params: { query: string; context?: string }) => {
    const response = await client.api.research.$post({
      json: params
    });
    
    if (!response.ok) {
      throw new Error('Research request failed');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Research failed');
    }
    
    return data;
  }
};
```

## Implementation Steps

### Phase 1: Backend Research Agent
1. Create research agent with web_search tool
2. Implement `/api/research` endpoint
3. Add research findings parser
4. Test agent with sample queries

### Phase 2: Frontend Integration
1. Update Source types with status and ResearchContent
2. Add `queue_research` tool to voice agent
3. Implement API client for research endpoint
4. Handle success/error states in Source updates

### Phase 3: UI Status Indicators
1. Add yellow dot CSS for pending status
2. Add red dot CSS for error status  
3. Update SourceItem to show status
4. Add hover tooltips for status/errors

### Phase 4: Research Display
1. Create ResearchFindings component
2. Display structured findings in Source panel
3. Show sources with links
4. Format key insights as bullet points

## Technical Considerations

### Error Handling
- Set reasonable timeout (30 seconds) for research requests
- Graceful error messages for users
- Preserve partial results if possible

### Performance
- Tool continues immediately after creating Source
- Research happens in background on backend
- UI remains responsive during research

### User Experience
- Clear pending indication
- Informative error states
- Easy-to-scan research results
- Clickable source links

## Future Enhancements
- Cancel in-progress research
- Research templates for common queries
- Save/export research findings
- Research comparison view
- Automatic follow-up questions