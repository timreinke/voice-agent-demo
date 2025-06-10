import { Agent, webSearchTool, run } from "@openai/agents";
import { z } from "zod";
import instructions from "./research.txt";

export const researchRequestSchema = z.object({
  query: z.string(),
  context: z.string().optional()
});

export type ResearchRequest = z.infer<typeof researchRequestSchema>;

export interface ResearchFindings {
  title: string;
  summary: string;
  findings: {
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

export interface ResearchResponse {
  success: boolean;
  findings?: ResearchFindings['findings'];
  title?: string;
  summary?: string;
  error?: string;
}

export const researchAgent = () =>
  new Agent({
    name: "Research Assistant",
    instructions,
    model: "gpt-4o",
    tools: [webSearchTool()],
  });

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

export async function runResearch(request: ResearchRequest): Promise<ResearchResponse> {
  try {
    const { query, context } = request;
    
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
    
    return {
      success: true,
      findings: findings.findings,
      title: findings.title,
      summary: findings.summary
    };
  } catch (error) {
    console.error('Error running research agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Research failed'
    };
  }
}