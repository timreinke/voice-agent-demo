import { FC, useState, useEffect } from 'hono/jsx'
import { RealtimeSession } from '@openai/agents'

export const App: FC = () => {
  const [message, setMessage] = useState('')
  const [health, setHealth] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [session, setSession] = useState<RealtimeSession | null>(null)

  useEffect(() => {
    const initVoiceSession = async () => {
      try {
        console.log('Initializing voice session...')
        
        // Get ephemeral token
        const tokenResponse = await fetch('/api/openai/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (!tokenResponse.ok) {
          throw new Error('Failed to get ephemeral token')
        }
        
        const { token } = await tokenResponse.json()
        console.log('Got ephemeral token')
  
        // Create RealtimeSession
        const realtimeSession = new RealtimeSession({
          apiKey: token,
          model: 'gpt-4o-realtime-preview-2025-06-03'
        })
  
        // Set up event listeners
        realtimeSession.on('connected', () => {
          console.log('Voice session connected')
          setIsConnected(true)
        })
  
        realtimeSession.on('disconnected', () => {
          console.log('Voice session disconnected')
          setIsConnected(false)
        })
  
        realtimeSession.on('error', (error) => {
          console.error('Voice session error:', error)
          setIsConnected(false)
        })
  
        realtimeSession.on('conversation.item.created', (event) => {
          console.log('Conversation item created:', event)
        })
  
        realtimeSession.on('conversation.item.completed', (event) => {
          console.log('Conversation item completed:', event)
        })
  
        realtimeSession.on('response.audio.delta', (event) => {
          console.log('Audio delta received:', event)
        })
  
        // Connect to the session
        await realtimeSession.connect()
        setSession(realtimeSession)
        
      } catch (error) {
        console.error('Failed to initialize voice session:', error)
        setIsConnected(false)
      }
    }  
    initVoiceSession()
  }, [
    setIsConnected, setSession
  ])



  const handleEcho = async () => {
    try {
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await response.json()
      alert(`Echo: ${JSON.stringify(data.echo)}`)
    } catch (err) {
      console.error('Echo failed:', err)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Agent SDK Voice Canvas</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Voice Session Status</h2>
        <div style={{ 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          color: isConnected ? '#155724' : '#721c24',
          border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Health Status</h2>
        <pre>{health ? JSON.stringify(health, null, 2) : 'Loading...'}</pre>
      </div>
      
      <div>
        <h2>Echo Test</h2>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message"
          style={{ padding: '8px', marginRight: '8px', width: '200px' }}
        />
        <button onClick={handleEcho} style={{ padding: '8px 16px' }}>
          Send Echo
        </button>
      </div>
    </div>
  )
}
  const initVoiceSession = async () => {
    try {
      console.log('Initializing voice session...')
      
      // Get ephemeral token
      const tokenResponse = await fetch('/api/openai/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get ephemeral token')
      }
      
      const { token } = await tokenResponse.json()
      console.log('Got ephemeral token')

      // Create RealtimeSession
      const realtimeSession = new RealtimeSession({
        apiKey: token,
        model: 'gpt-4o-realtime-preview-2025-06-03'
      })

      // Set up event listeners
      realtimeSession.on('connected', () => {
        console.log('Voice session connected')
        setIsConnected(true)
      })

      realtimeSession.on('disconnected', () => {
        console.log('Voice session disconnected')
        setIsConnected(false)
      })

      realtimeSession.on('error', (error) => {
        console.error('Voice session error:', error)
        setIsConnected(false)
      })

      realtimeSession.on('conversation.item.created', (event) => {
        console.log('Conversation item created:', event)
      })

      realtimeSession.on('conversation.item.completed', (event) => {
        console.log('Conversation item completed:', event)
      })

      realtimeSession.on('response.audio.delta', (event) => {
        console.log('Audio delta received:', event)
      })

      // Connect to the session
      await realtimeSession.connect()
      setSession(realtimeSession)
      
    } catch (error) {
      console.error('Failed to initialize voice session:', error)
      setIsConnected(false)
    }
  }