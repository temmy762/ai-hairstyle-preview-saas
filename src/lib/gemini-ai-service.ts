import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IAIService, AIGenerationRequest, AIGenerationResponse } from "./ai-service";

export class GeminiAIService implements IAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      }
    });
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

      const prompt = this.buildPromptForImageGeneration(request);
      const imageData = await this.fetchImageAsBase64(request.inputImagePath);

      console.log(`[GeminiAI] Generating hairstyle image with prompt: "${request.prompt}"`);

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ]);

      const response = await result.response;
      
      console.log(`[GeminiAI] Image generation completed`);

      const outputImagePath = await this.extractGeneratedImage(response);
      const processingTime = Date.now() - startTime;

      return {
        outputImagePath,
        processingTime,
        generationType: "prompt",
      };
    } catch (error) {
      console.error("[GeminiAI] Error during generation:", error);
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
      const prompt = this.buildPromptForStyleTransferImage();
      const inputImageData = await this.fetchImageAsBase64(inputImagePath);
      const styleImageData = await this.fetchImageAsBase64(styleReferencePath);

      console.log(`[GeminiAI] Performing style transfer image generation`);

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: inputImageData,
          },
        },
        "Reference hairstyle to apply:",
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: styleImageData,
          },
        },
      ]);

      const response = await result.response;
      
      console.log(`[GeminiAI] Style transfer image generation completed`);

      const outputImagePath = await this.extractGeneratedImage(response);
      const processingTime = Date.now() - startTime;

      return {
        outputImagePath,
        processingTime,
        generationType: "style-reference",
      };
    } catch (error) {
      console.error("[GeminiAI] Error during style transfer:", error);
      throw new Error(`Style transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private buildPromptForImageGeneration(request: AIGenerationRequest): string {
    const basePrompt = `Generate a high-quality, realistic image showing the hairstyle: "${request.prompt}".

Based on the provided client photo, create a photorealistic image of how they would look with this exact hairstyle applied to them.

Requirements:
- Maintain the client's facial features, skin tone, and face shape from the input image
- Apply the "${request.prompt}" hairstyle accurately
- Ensure professional barbershop quality
- Make it look natural and realistic
- Keep the same lighting and photo quality as the input

Generate ONLY the image, no text description.`;

    return basePrompt;
  }

  private buildPromptForGeneration(request: AIGenerationRequest): string {
    const basePrompt = `You are a professional hairstylist AI assistant. Analyze the provided client photo and describe in detail how they would look with the following hairstyle: "${request.prompt}".

Provide a detailed, personalized analysis including:

1. **Current Hair Analysis**: Describe the client's current hair (length, texture, face shape visible in the photo)
2. **Proposed Transformation**: Explain the "${request.prompt}" style in detail
3. **How It Will Look on THIS Client**: Based on their features in the photo, describe specifically how this style will look on them
4. **Cutting Technique**: Detail the cutting methods needed (fade levels, layering, texturizing)
5. **Styling Details**: Describe texture, volume, movement, and finishing
6. **Face Shape Compatibility**: Explain why this style works (or adaptations needed) for their specific face shape
7. **Color & Finish**: Describe color tones, highlights, and overall finish
8. **Maintenance & Styling Tips**: Provide practical daily styling advice
9. **Professional Recommendations**: Suggest specific products and techniques

Be specific, detailed, and enthusiastic. Analyze the actual client in the photo and create a vivid description of their transformation.`;

    return basePrompt;
  }

  private buildPromptForStyleTransferImage(): string {
    return `Generate a photorealistic image showing the client with the hairstyle from the reference image.

Analyze both images:
1. The client's current photo (their face, features, skin tone)
2. The reference hairstyle image

Create a new image that:
- Shows the client's face and features exactly as they appear
- Applies the hairstyle from the reference image to the client
- Maintains photorealistic quality
- Looks like a professional barbershop result
- Keeps natural lighting and proportions

Generate ONLY the transformed image, no text.`;
  }

  private buildPromptForStyleTransfer(): string {
    return `You are a professional hairstylist AI assistant. A client wants to achieve a hairstyle transformation based on a reference style from the salon's library.

Provide a detailed, professional description of how to achieve this transformation including:

1. **Reference Style Analysis**: Describe the key characteristics of the desired hairstyle
2. **Adaptation Approach**: Explain how to adapt the style to different face shapes and hair types
3. **Cutting & Styling Techniques**: Detail the specific techniques needed to achieve this look
4. **Color & Texture Matching**: Describe color considerations and texture requirements
5. **Step-by-Step Transformation**: Outline the transformation process
6. **Maintenance Guide**: Provide care and styling instructions
7. **Professional Tips**: Share expert recommendations for best results

Be specific, detailed, and create a vivid description that helps visualize the transformation.`;
  }

  private async extractGeneratedImage(response: any): Promise<string> {
    try {
      // Check if response contains generated images
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates in response");
      }

      const candidate = candidates[0];
      const content = candidate.content;
      
      if (!content || !content.parts) {
        throw new Error("No content parts in response");
      }

      // Look for inline image data in the response
      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/jpeg";
          const imageData = part.inlineData.data;
          console.log(`[GeminiAI] Extracted generated image (${imageData.length} chars)`);
          return `data:${mimeType};base64,${imageData}`;
        }
      }

      // If no image found, check if there's text (fallback)
      const text = response.text ? response.text() : "";
      if (text) {
        console.log(`[GeminiAI] No image generated, creating fallback visual from text`);
        return this.createResultImage(text, "AI Generated Result");
      }

      throw new Error("No image data found in response");
    } catch (error) {
      console.error("[GeminiAI] Error extracting generated image:", error);
      throw new Error(`Failed to extract generated image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async fetchImageAsBase64(imagePathOrUrl: string): Promise<string> {
    if (imagePathOrUrl.startsWith("data:")) {
      const base64Index = imagePathOrUrl.indexOf("base64,");
      if (base64Index !== -1) {
        return imagePathOrUrl.substring(base64Index + 7);
      }
      return imagePathOrUrl;
    }

    if (imagePathOrUrl.startsWith("http://") || imagePathOrUrl.startsWith("https://")) {
      console.log(`[GeminiAI] Fetching image from URL: ${imagePathOrUrl}`);
      const response = await fetch(imagePathOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      console.log(`[GeminiAI] Image fetched and converted to base64 (${base64.length} chars)`);
      return base64;
    }

    return imagePathOrUrl;
  }

  private extractBase64FromDataUrl(dataUrl: string): string {
    if (dataUrl.startsWith("data:")) {
      const base64Index = dataUrl.indexOf("base64,");
      if (base64Index !== -1) {
        return dataUrl.substring(base64Index + 7);
      }
    }
    return dataUrl;
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
          Powered by Google Gemini AI
        </text>
        
        <line x1="100" y1="160" x2="700" y2="160" stroke="#e0e0e0" stroke-width="2"/>
        
        <text x="80" y="200" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
          Requested Style:
        </text>
        <text x="80" y="230" font-family="Arial, sans-serif" font-size="14" fill="#666" font-style="italic">
          ${this.escapeXml(prompt.substring(0, 80))}${prompt.length > 80 ? '...' : ''}
        </text>
        
        <text x="80" y="280" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
          AI Analysis &amp; Visualization:
        </text>
        
        ${this.wrapText(description, 80, 320, 640, 14)}
        
        <rect x="60" y="880" width="680" height="60" fill="#f0f0f0" rx="10"/>
        <text x="400" y="915" font-family="Arial, sans-serif" font-size="12" fill="#666" text-anchor="middle">
          This is an AI-generated description. For actual visual results, integrate with image generation models.
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
