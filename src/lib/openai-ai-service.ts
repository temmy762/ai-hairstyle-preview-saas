import OpenAI from "openai";
import type { IAIService, AIGenerationRequest, AIGenerationResponse } from "./ai-service";

export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    this.openai = new OpenAI({ apiKey });
  }

  private async prepareImageUrl(imageUrl: string): Promise<string> {
    // If it's already a data URL, return as-is
    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // If it's an HTTP/HTTPS URL, fetch and convert to base64
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      try {
        console.log(`[OpenAI] Fetching image from URL: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log(`[OpenAI] Image converted to base64 data URL (${base64.length} chars)`);
        return dataUrl;
      } catch (error) {
        console.error(`[OpenAI] Error fetching image:`, error);
        throw new Error(`Failed to prepare image: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return imageUrl;
  }

  async generateHairstyle(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const startTime = Date.now();

    try {
      if (request.generationType === "style-reference" && request.styleReferencePath) {
        return await this.generateFromStyleReference(
          request.inputImagePath,
          request.styleReferencePath,
          request.variations
        );
      }

      const prompt = this.buildPromptForGeneration(request);
      const imageDataUrl = await this.prepareImageUrl(request.inputImagePath);

      console.log(`[OpenAI] Analyzing image and generating hairstyle with prompt: "${request.prompt}"`);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "No response generated";

      console.log(`[OpenAI] Generation completed`);

      const outputImagePath = this.createResultImage(text, request.prompt || "");
      const processingTime = Date.now() - startTime;

      return {
        outputImagePath,
        processingTime,
        generationType: "prompt",
      };
    } catch (error) {
      console.error("[OpenAI] Error during generation:", error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateFromStyleReference(
    inputImagePath: string,
    styleReferencePath: string,
    variations: number = 1
  ): Promise<AIGenerationResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPromptForStyleTransfer();
      const inputImageDataUrl = await this.prepareImageUrl(inputImagePath);
      const styleImageDataUrl = await this.prepareImageUrl(styleReferencePath);

      console.log(`[OpenAI] Performing style transfer with image analysis`);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: inputImageDataUrl,
                },
              },
              { type: "text", text: "Reference hairstyle to achieve:" },
              {
                type: "image_url",
                image_url: {
                  url: styleImageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "No response generated";

      console.log(`[OpenAI] Style transfer completed`);

      const outputImagePath = this.createResultImage(text, "Style Transfer");
      const processingTime = Date.now() - startTime;

      return {
        outputImagePath,
        processingTime,
        generationType: "style-reference",
      };
    } catch (error) {
      console.error("[OpenAI] Error during style transfer:", error);
      throw new Error(`Style transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private buildPromptForGeneration(request: AIGenerationRequest): string {
    const basePrompt = `You are a professional hairstylist AI assistant. Analyze the provided client photo and describe in detail how they would look with the following hairstyle transformation: "${request.prompt}".

Provide a detailed, vivid, and professional description including:

1. **Current Hair Analysis**: Briefly describe the client's current hair (length, texture, face shape)
2. **Proposed Transformation**: Describe the "${request.prompt}" style in detail
3. **How It Will Look**: Explain specifically how this style will look on THIS client based on their features
4. **Cutting Technique**: Detail the cutting methods needed (fade levels, layering, texturizing)
5. **Styling Details**: Describe texture, volume, movement, and finishing
6. **Face Shape Compatibility**: Explain why this style works (or adaptations needed) for their face shape
7. **Color & Finish**: Describe color tones, highlights, and overall finish
8. **Maintenance & Styling Tips**: Provide practical daily styling advice
9. **Professional Recommendations**: Suggest specific products and techniques

Be specific, detailed, and enthusiastic. Create a vivid mental picture that helps the client visualize their transformation based on their actual appearance.`;

    return basePrompt;
  }

  private buildPromptForStyleTransfer(): string {
    return `You are a professional hairstylist AI assistant. Analyze both images provided:
1. The client's current photo
2. The reference hairstyle they want to achieve

Provide a detailed, professional analysis of how to transform the client's hair to match the reference style:

1. **Client Analysis**: Describe the client's current hair, face shape, and features
2. **Reference Style Analysis**: Describe the key characteristics of the desired hairstyle
3. **Compatibility Assessment**: Explain how well this style suits the client's features
4. **Adaptation Strategy**: Detail any modifications needed to make the style work for this specific client
5. **Transformation Steps**: Outline the cutting and styling process
6. **Color Matching**: Describe color adjustments if needed
7. **Styling Techniques**: Explain how to achieve and maintain the look
8. **Professional Tips**: Share expert recommendations for best results

Be specific about how the reference style will adapt to THIS client's unique features. Create a detailed visualization of the transformation.`;
  }

  private createResultImage(description: string, prompt: string): string {
    const canvas = `
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="1000" fill="url(#grad1)"/>
        
        <rect x="40" y="40" width="720" height="920" fill="white" rx="20"/>
        
        <text x="400" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#667eea" text-anchor="middle">
          AI Hairstyle Preview
        </text>
        
        <text x="400" y="140" font-family="Arial, sans-serif" font-size="16" fill="#764ba2" text-anchor="middle">
          Powered by OpenAI GPT-4 Vision
        </text>
        
        <line x1="100" y1="160" x2="700" y2="160" stroke="#e0e0e0" stroke-width="2"/>
        
        <text x="80" y="200" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
          Requested Style:
        </text>
        <text x="80" y="230" font-family="Arial, sans-serif" font-size="14" fill="#666" font-style="italic">
          ${this.escapeXml(prompt.substring(0, 80))}${prompt.length > 80 ? '...' : ''}
        </text>
        
        <text x="80" y="280" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
          AI Analysis &amp; Recommendations:
        </text>
        
        ${this.wrapText(description, 80, 320, 640, 14)}
        
        <rect x="60" y="880" width="680" height="60" fill="#f0f0f0" rx="10"/>
        <text x="400" y="915" font-family="Arial, sans-serif" font-size="12" fill="#666" text-anchor="middle">
          Professional AI-powered hairstyle consultation based on your photo analysis
        </text>
      </svg>
    `;

    const base64 = Buffer.from(canvas).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, fontSize: number): string {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    const maxCharsPerLine = Math.floor(maxWidth / (fontSize * 0.6));

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const maxLines = 30;
    const displayLines = lines.slice(0, maxLines);
    
    return displayLines
      .map((line, index) => {
        const yPos = y + index * (fontSize + 8);
        return `<text x="${x}" y="${yPos}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#444">${this.escapeXml(line)}</text>`;
      })
      .join("\n        ");
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
