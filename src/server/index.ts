import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { run, setDefaultOpenAIKey } from '@openai/agents'
import { documentEditorAgent } from './agents/document-editor'
import { researchAgent } from './agents/research'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const tokenRequestSchema = z.object({
  model: z.string().optional().default('gpt-4o-realtime-preview-2025-06-03')
})

const documentEditorRequestSchema = z.object({
  document: z.string(),
  instructions: z.string()
})

const researchRequestSchema = z.object({
  query: z.string(),
  context: z.string().optional()
})

interface OpenAISessionResponse {
  client_secret: {
    value: string
  }
}

interface ResearchFindings {
  title: string
  summary: string
  findings: {
    summary: string
    sources: Array<{
      title: string
      url: string
      snippet: string
      relevance: string
    }>
    keyInsights: string[]
  }
}

function parseResearchFindings(agentOutput: string): ResearchFindings {
  try {
    // The agent should return valid JSON, but let's be defensive
    const jsonMatch = agentOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in agent output');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!parsed.title || !parsed.summary || !parsed.findings) {
      throw new Error('Invalid research findings structure');
    }
    
    return parsed as ResearchFindings;
  } catch (error) {
    console.error('Failed to parse research findings:', error);
    console.error('Agent output:', agentOutput);
    
    // Return a fallback structure
    return {
      title: 'Research Results',
      summary: 'Unable to parse research findings properly.',
      findings: {
        summary: agentOutput.substring(0, 500) + (agentOutput.length > 500 ? '...' : ''),
        sources: [],
        keyInsights: ['Research completed but results could not be parsed properly']
      }
    };
  }
}

const routes = app
  .use('/*', async (c, next) => {
    setDefaultOpenAIKey(c.env.OPENAI_API_KEY);
    await next()
  })
  .post(
    '/agents/document-editor',
    zValidator('json', documentEditorRequestSchema),
    async (c) => {
      try {
        const { document, instructions } = c.req.valid('json')
        
        // Format the initial message with the document and instructions
        const initialMessage = `Document to edit:
${document}

Instructions:
${instructions}`
        
        // Run the agent
        const result = await run(documentEditorAgent(), initialMessage)
        
        return c.json({ 
          newDocument: result.finalOutput || "",
        }, 200)
      } catch (error) {
        console.error('Error running document editor agent:', error)
        return c.json({ error: 'Failed to edit document' }, 500)
      }
    }
  )
  .post(
    '/api/research',
    zValidator('json', researchRequestSchema),
    async (c) => {
      try {
        setDefaultOpenAIKey(c.env.OPENAI_API_KEY);
        const { query, context } = c.req.valid('json');
        
        // Format the research request
        const researchPrompt = `Research the following topic and provide comprehensive findings:

Query: ${query}
${context ? `Additional Context: ${context}` : ''}

Provide:
1. A summary of key findings
2. List of relevant sources with titles, URLs, and snippets
3. Key insights and takeaways`;
        
        // Run the research agent
        const result = await run(researchAgent(), researchPrompt);
        
        // Parse the findings
        const findings = parseResearchFindings(result.finalOutput || "");
        
        return c.json({
          success: true,
          findings: findings.findings,
          title: findings.title,
          summary: findings.summary
        });
        
      } catch (error) {
        console.error('Error running research agent:', error);
        return c.json({
          success: false,
          error: error instanceof Error ? error.message : 'Research failed'
        }, 500);
      }
    }
  )
  .post(
    '/api/openai/token',
    zValidator('json', tokenRequestSchema),
    async (c) => {
    try {
      const openaiApiKey = c.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        return c.json({ error: 'OpenAI API key not configured' }, 500)
      }

      const { model } = c.req.valid('json')

      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json() as OpenAISessionResponse
      return c.json({ token: data.client_secret.value })
    } catch (error) {
      console.error('Error creating OpenAI ephemeral token:', error)
      return c.json({ error: 'Failed to create ephemeral token' }, 500)
    }
  }
)

export type AppType = typeof routes
export default app