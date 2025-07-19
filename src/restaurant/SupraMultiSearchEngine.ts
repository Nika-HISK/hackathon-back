import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';

// Load environment variables
config();

interface Restaurant {
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  dish_price: number;
  [key: string]: any;
}

interface SearchResult {
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  dish_price: number;
}

interface SearchResponse {
  results: SearchResult[];
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: SearchResponse;
  message?: string;
}

export class SupraSearchEngine {
  private client: GoogleGenAI;
  private model: string;
  private restaurantData: Restaurant[] = [];

  constructor(model: string = 'gemini-2.0-flash') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not found. Please set it in your .env file.');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  /**
   * Loads restaurant data from a JSON file
   */
  loadData(dataPath: string = 'data/rests.json'): boolean {
    try {
      const fullPath = path.resolve(dataPath);
      const data = fs.readFileSync(fullPath, 'utf-8');
      this.restaurantData = JSON.parse(data);
      console.log(`✅ Successfully loaded ${this.restaurantData.length} restaurants.`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load data from ${dataPath}:`, error);
      return false;
    }
  }

  /**
   * Helper to prepare an image file for the API
   */
  private processImage(imagePath: string): { inlineData: { data: string; mimeType: string } } {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Data = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      
      return {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error}`);
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Performs a multimodal search using either text, an image, or both
   */
  async search(
    query: string = '',
    imagePath: string = '',
    preferences: string = '',
    limit: number = 10
  ): Promise<ApiResponse> {
    try {
      const restaurantDataJson = JSON.stringify(this.restaurantData, null, 2);
      const contents: any[] = [];

      // Build the prompt
      let prompt = '';
      if (imagePath) {
        const imageData = this.processImage(imagePath);
        contents.push(imageData);
        prompt = `
        Analyze this food image and find similar dishes in the restaurant database.
        Additional user query: "${query || 'None'}"
        Return up to ${limit} matches.
        `;
      } else {
        prompt = `
        You are a Georgian cuisine expert. Find dishes matching the query: "${query}"
        Return up to ${limit} matches.
        `;
      }

      const preferencesPrompt = preferences ? `
        User Preferences and allergies: "${preferences}"
        ` : '';

      const fullPrompt = `
        ${prompt}
        
        RESTAURANT DATA:
        ${restaurantDataJson}

        INSTRUCTIONS:
        1. Understand the user's intent (taste, price, dietary needs, cuisine type, etc.)
        2. Find the most relevant dishes with detailed restaurant information
        3. Return maximum ${limit} results ranked by relevance
        4. Focus on Georgian cuisine authenticity when relevant
        5. Always focus on user preferences and allergies, they are top priority.
        ${preferencesPrompt}

        also you should act like the waiters in the restaurant,
        professionally and politely pick the best dishes that user might also like
        and return them with the addition to the main query.
        focus on preferences and allergies user specified in the query.

        you are not allowed to return the same dish more than once.
        and you are not allowed to make mistakes in the data when returning them. you have IDEAL memory and ideal capabilities to return information as it was.

        OUTPUT FORMAT (JSON ONLY):
        {
          "results": [
            {
              "restaurant_id": "...",
              "restaurant_name": "...",
              "dish_name": "...",
              "dish_price": 0.00
            }
          ]
        }
      `;

      contents.push(fullPrompt);

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const responseData = JSON.parse(response.text);
      return { status: 'success', data: responseData };

    } catch (error) {
      console.error('❌ Search failed:', error);
      return { status: 'error', message: String(error) };
    }
  }

  /**
   * Streaming version of search for real-time results
   */
  async searchStream(
    query: string = '',
    imagePath: string = '',
    preferences: string = '',
    limit: number = 10
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const restaurantDataJson = JSON.stringify(this.restaurantData, null, 2);
    const contents: any[] = [];

    // Build the prompt (same as above)
    let prompt = '';
    if (imagePath) {
      const imageData = this.processImage(imagePath);
      contents.push(imageData);
      prompt = `
      Analyze this food image and find similar dishes in the restaurant database.
      Additional user query: "${query || 'None'}"
      Return up to ${limit} matches.
      `;
    } else {
      prompt = `
      You are a Georgian cuisine expert. Find dishes matching the query: "${query}"
      Return up to ${limit} matches.
      `;
    }

    const preferencesPrompt = preferences ? `
      User Preferences and allergies: "${preferences}"
      ` : '';

    const fullPrompt = `
      ${prompt}
      
      RESTAURANT DATA:
      ${restaurantDataJson}

      INSTRUCTIONS:
      1. Understand the user's intent (taste, price, dietary needs, cuisine type, etc.)
      2. Find the most relevant dishes with detailed restaurant information
      3. Return maximum ${limit} results ranked by relevance
      4. Focus on Georgian cuisine authenticity when relevant
      5. Always focus on user preferences and allergies, they are top priority.
      ${preferencesPrompt}

      also you should act like the waiters in the restaurant,
      professionally and politely pick the best dishes that user might also like
      and return them with the addition to the main query.
      focus on preferences and allergies user specified in the query.

      you are not allowed to return the same dish more than once.
      and you are not allowed to make mistakes in the data when returning them. you have IDEAL memory and ideal capabilities to return information as it was.

      OUTPUT FORMAT (JSON ONLY):
      {
        "results": [
          {
            "restaurant_id": "...",
            "restaurant_name": "...",
            "dish_name": "...",
            "dish_price": 0.00
          }
        ]
      }
    `;

    contents.push(fullPrompt);

    const stream = await this.client.models.generateContentStream({
      model: this.model,
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    async function* streamGenerator() {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    }

    return streamGenerator();
  }
}

// Export for usage
export default SupraSearchEngine;

// Example usage
async function example() {
  const engine = new SupraSearchEngine();
  
  // Load data
  if (engine.loadData()) {
    // Search for khachapuri
    const result = await engine.search(
      'khachapuri',
      '',
      'vegetarian, no nuts',
      5
    );
    
    console.log('Search result:', result);
  }
}
