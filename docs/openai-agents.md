# OpenAI Agents SDK

This document outlines the core APIs and components for constructing agents using the OpenAI Agents SDK.

## Core Architecture

Agents are the fundamental building blocks composed of:

1. **Instructions** - System prompt defining agent behavior
2. **Model configuration** - Specific model and tuning parameters  
3. **Available tools** - Callable functions and APIs
4. **Optional context** - Dynamic data injection
5. **Output type** - Structured response schema

## Agent Construction

### Basic Agent Creation

```javascript
const agent = new Agent({
  name: 'Weather bot',
  instructions: 'You are a helpful weather bot.',
  model: 'o4-mini',
  tools: [weatherTool]
});
```

### Configuration Options

- `name`: Human-readable identifier for the agent
- `instructions`: System prompt (string or function for dynamic generation)
- `model`: Specific model or custom implementation
- `modelSettings`: Model tuning parameters
- `tools`: Array of callable functions/APIs
- `outputType`: Structured output schema (Zod compatible)
- `handoffs`: Agent delegation configuration for routing conversations

## Advanced Features

### Dynamic Instructions
Instructions can be functions that generate prompts based on context:

```javascript
const agent = new Agent({
  instructions: (context) => `You are a ${context.role} assistant.`,
  // ...other config
});
```

### Structured Output
Use Zod schemas for type-safe structured responses:

```javascript
const agent = new Agent({
  outputType: z.object({
    response: z.string(),
    confidence: z.number()
  })
});
```

### Context Dependency Injection
Generic context typing for flexible data injection:

```javascript
interface UserContext {
  userId: string;
  preferences: object;
}

const agent = new Agent<UserContext>({
  instructions: (context) => `Help user ${context.userId}`,
  // ...
});
```

## Key Capabilities

### Tool Integration
- Callable function/API list management
- Tool usage enforcement modes
- Dynamic tool availability

### Handoff Mechanisms
- Agent delegation for routing conversations
- Context preservation across handoffs
- Multi-agent coordination

### Lifecycle Events
- Event hooks for agent execution phases
- Custom validation and processing
- Monitoring and logging integration

### Guardrails
- Input/output validation
- Safety constraints
- Usage policy enforcement

## Design Patterns

### Agent Cloning
Create variations of existing agents with modified configurations:

```javascript
const specializedAgent = baseAgent.clone({
  instructions: 'You are a specialized version...',
  tools: [...baseAgent.tools, specialTool]
});
```

### Context-Aware Agents
Leverage dependency injection for dynamic behavior:

```javascript
const contextualAgent = new Agent({
  instructions: (ctx) => `Act as ${ctx.role} for ${ctx.domain}`,
  tools: (ctx) => getToolsForDomain(ctx.domain)
});
```

## Integration Considerations

- **Model Selection**: Choose appropriate models for agent complexity
- **Tool Management**: Organize tools by domain and capability
- **Context Design**: Structure context for optimal prompt generation
- **Output Validation**: Use schemas for consistent response formats
- **Performance**: Consider model settings and tool execution overhead

## Running Agents

### Basic Execution
Run agents using the `run()` utility function:

```javascript
import { run } from 'openai-agents';

const result = await run(agent, 'Your input message');
console.log(result.finalOutput);
```

### Run Configuration
- `stream`: Enable streaming events (default: false)
- `context`: Pass context object matching agent's generic type
- `maxTurns`: Safety limit for agent turns (default: 10)
- `signal`: AbortSignal for cancellation support

### Input Formats
- String: Single user message
- Array: List of input items
- RunState: For human-in-the-loop scenarios

### RunResult Structure
Non-streaming results contain:
- `finalOutput`: The agent's final output (string, JSON, or undefined)
- `history`: Complete conversation history
- `lastAgent`: The final agent that ran
- `newItems`: Generated run items during execution
- `state`: Serializable run state
- `interruptions`: Tool approval items requiring handling
- `rawResponses`: Raw model responses
- `inputGuardrailResults` / `outputGuardrailResults`: Validation results

### Multi-turn Conversations
Maintain conversation history across runs:

```javascript
let history = [{ type: 'user', content: 'Initial message' }];
for (let i = 0; i < 5; i++) {
  const result = await run(agent, history);
  history = result.history;
  history.push({ type: 'user', content: 'Follow-up message' });
}
```

### Context Usage
```javascript
const result = await run(agent, 'Process this', {
  context: { userId: '123', role: 'admin' }
});
```

## Next Steps

1. **Agent Running**: Learn execution patterns and conversation management
2. **Tool Development**: Build custom tools for specific domains
3. **Guardrail Implementation**: Add safety and validation layers
4. **TypeDoc Reference**: Explore complete API documentation

The OpenAI Agents SDK provides a comprehensive framework for building intelligent, context-aware AI agents with granular control over behavior, tool usage, and output formatting.