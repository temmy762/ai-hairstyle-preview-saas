export type AIGenerationRequest = {
  inputImagePath: string;
  prompt?: string;
  styleReferencePath?: string;
  variations?: number;
  generationType: "prompt" | "style-reference";
};

export type AIGenerationResponse = {
  outputImagePath: string;
  processingTime: number;
  generationType: "prompt" | "style-reference";
};

export interface IAIService {
  generateHairstyle(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  generateFromStyleReference(
    inputImagePath: string,
    styleReferencePath: string,
    variations?: number
  ): Promise<AIGenerationResponse>;
}

export class StubAIService implements IAIService {
  async generateHairstyle(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const startTime = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    let placeholderImage: string;
    
    if (request.generationType === "style-reference" && request.styleReferencePath) {
      placeholderImage = this.createStyleReferencePlaceholder(request.styleReferencePath);
      console.log(`[StubAIService] Generated style-reference placeholder`);
      console.log(`[StubAIService] Style reference: ${request.styleReferencePath.substring(0, 50)}...`);
    } else {
      placeholderImage = this.createPlaceholderImage(request.prompt || "No prompt provided");
      console.log(`[StubAIService] Generated prompt-based placeholder for: "${request.prompt}"`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[StubAIService] Processing time: ${processingTime}ms`);

    return {
      outputImagePath: placeholderImage,
      processingTime,
      generationType: request.generationType,
    };
  }

  async generateFromStyleReference(
    inputImagePath: string,
    styleReferencePath: string,
    variations: number = 1
  ): Promise<AIGenerationResponse> {
    const startTime = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const placeholderImage = this.createStyleReferencePlaceholder(styleReferencePath);

    const processingTime = Date.now() - startTime;

    console.log(`[StubAIService] Style transfer completed`);
    console.log(`[StubAIService] Input: ${inputImagePath.substring(0, 50)}...`);
    console.log(`[StubAIService] Style: ${styleReferencePath.substring(0, 50)}...`);
    console.log(`[StubAIService] Processing time: ${processingTime}ms`);

    return {
      outputImagePath: placeholderImage,
      processingTime,
      generationType: "style-reference",
    };
  }

  private createPlaceholderImage(prompt: string): string {
    const canvas = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#f3f4f6"/>
        <text x="256" y="200" font-family="Arial" font-size="24" fill="#6b7280" text-anchor="middle">
          AI Generated Result
        </text>
        <text x="256" y="250" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle">
          Prompt: ${this.escapeXml(prompt.substring(0, 40))}${prompt.length > 40 ? '...' : ''}
        </text>
        <text x="256" y="300" font-family="Arial" font-size="14" fill="#d1d5db" text-anchor="middle">
          [Placeholder - Real AI Not Integrated]
        </text>
      </svg>
    `;

    const base64 = Buffer.from(canvas).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  private createStyleReferencePlaceholder(styleReferencePath: string): string {
    const canvas = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#fef3c7"/>
        <text x="256" y="180" font-family="Arial" font-size="24" fill="#92400e" text-anchor="middle">
          Style Transfer Result
        </text>
        <text x="256" y="230" font-family="Arial" font-size="16" fill="#b45309" text-anchor="middle">
          Hair Style Reference Applied
        </text>
        <rect x="206" y="250" width="100" height="100" fill="#fbbf24" stroke="#d97706" stroke-width="2" rx="8"/>
        <text x="256" y="305" font-family="Arial" font-size="12" fill="#78350f" text-anchor="middle">
          Style Sample
        </text>
        <text x="256" y="380" font-family="Arial" font-size="14" fill="#d97706" text-anchor="middle">
          [Placeholder - Real AI Not Integrated]
        </text>
      </svg>
    `;

    const base64 = Buffer.from(canvas).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

import { OpenAIService } from "./openai-ai-service";
import { GeminiAIService } from "./gemini-ai-service";

function createAIService(): IAIService {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (geminiKey) {
    console.log("[AIService] Using Google Gemini 2.5 Flash Image");
    return new GeminiAIService(geminiKey);
  }
  
  if (openaiKey) {
    console.log("[AIService] Using OpenAI (fallback)");
    return new OpenAIService(openaiKey);
  }
  
  console.log("[AIService] No API key found, using Stub AI Service");
  return new StubAIService();
}

export const aiService: IAIService = createAIService();
