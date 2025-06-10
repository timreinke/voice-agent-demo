import { Agent, run, AgentInputItem } from "@openai/agents";
import { z } from "zod";
import instructions from "./file-summarizer.txt";

export const fileSummarizerRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  base64Data: z.string()
});

export type FileSummarizerRequest = z.infer<typeof fileSummarizerRequestSchema>;

export interface FileSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  contentType: string;
  suggestedActions: string[];
}

export interface FileSummarizerResponse {
  success: boolean;
  summary?: FileSummary;
  error?: string;
}

export function fileSummarizerAgent() {
  return new Agent({
    name: "file-summarizer",
    model: "gpt-4o-mini",
    instructions,
    tools: []
  });
}

function parseFileSummary(agentOutput: string): FileSummary {
  try {
    const jsonMatch = agentOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in agent output');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.title || !parsed.summary || !parsed.keyPoints) {
      throw new Error('Invalid file summary structure');
    }
    
    return parsed as FileSummary;
  } catch (error) {
    console.error('Failed to parse file summary:', error);
    console.error('Agent output:', agentOutput);
    
    return {
      title: 'File Analysis',
      summary: 'Unable to parse file summary properly.',
      keyPoints: ['File uploaded successfully but analysis failed'],
      contentType: 'Unknown',
      suggestedActions: ['Review file content manually']
    };
  }
}

export async function runFileSummarizer(request: FileSummarizerRequest): Promise<FileSummarizerResponse> {
  try {
    const { filename, mimeType, base64Data } = request;
    
    // Create data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Create input for agent (following test-file-upload.ts format)
    const input: AgentInputItem[] = [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_file",
            file: dataUrl,
            providerData: {
              filename: filename,
            }
          },
          {
            type: "input_text",
            text: "Please analyze this file and provide a structured summary as specified in your instructions."
          }
        ]
      }
    ];
    
    // Run the file summarizer agent
    const result = await run(fileSummarizerAgent(), input);
    
    // Parse the summary
    const summary = parseFileSummary(result.finalOutput || "");
    
    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error running file summarizer agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File summarization failed'
    };
  }
}