import { Hono } from 'hono'

const app = new Hono()

app.post('/api/openai/token', async (c) => {
  try {
    const openaiApiKey = c.env?.OPENAI_API_KEY
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500)
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2025-06-03'
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return c.json({ token: data.client_secret.value })
  } catch (error) {
    console.error('Error creating OpenAI ephemeral token:', error)
    return c.json({ error: 'Failed to create ephemeral token' }, 500)
  }
})



export default app