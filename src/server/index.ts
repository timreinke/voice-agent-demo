import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { setDefaultOpenAIKey } from '@openai/agents'
import { documentEditorRequestSchema, runDocumentEditor } from './agents/document-editor'
import { researchRequestSchema, runResearch } from './agents/research'
import { fileSummarizerRequestSchema, runFileSummarizer } from './agents/file-summarizer'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const tokenRequestSchema = z.object({
  model: z.string().optional().default('gpt-4o-realtime-preview-2025-06-03')
})

interface OpenAISessionResponse {
  client_secret: {
    value: string
  }
}


const routes = app
  .use('/*', async (c, next) => {
    setDefaultOpenAIKey(c.env.OPENAI_API_KEY);
    await next()
  })
  .post(
    '/api/agents/document-editor',
    zValidator('json', documentEditorRequestSchema),
    async (c) => {
      try {
        const request = c.req.valid('json')
        const response = await runDocumentEditor(request)
        return c.json(response, 200)
      } catch (error) {
        console.error('Error running document editor agent:', error)
        return c.json({ error: 'Failed to edit document' }, 500)
      }
    }
  )
  .post(
    '/api/agents/research',
    zValidator('json', researchRequestSchema),
    async (c) => {
      const request = c.req.valid('json');
      const response = await runResearch(request);
      return c.json(response, response.success ? 200 : 500);
    }
  )
  .post(
    '/api/agents/file-summarizer',
    zValidator('json', fileSummarizerRequestSchema),
    async (c) => {
      const request = c.req.valid('json');
      const response = await runFileSummarizer(request);
      return c.json(response, response.success ? 200 : 500);
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