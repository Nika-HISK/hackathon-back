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

export interface ImageData {
  inlineData: {
    data: string;
    mimeType: string;
  };
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
      const mimeType = SupraSearchEngine.getMimeType(imagePath);
      
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
  static getMimeType(filePath: string): string {
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
      case '.bmp':
        return 'image/bmp';
      case '.tiff':
      case '.tif':
        return 'image/tiff';
      default:
        return 'image/jpeg'; // Default fallback
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

      const fullPrompt = `You are a professional Georgian cuisine expert and waiter with PERFECT MEMORY.
            
      USER REQUEST: "${query}"
      

      RESTAURANT DATA (available dishes):
      ${restaurantDataJson}

      INSTRUCTIONS - Handle ALL operations naturally:
      
      {"🖼️ IMAGE ANALYSIS MODE:" if image_path else ""}
      {"- First, analyze the food image to identify what dish/cuisine it shows" if image_path else ""}
      {"- Then, search the restaurant database for ACTUAL similar dishes" if image_path else ""}
      {"- Return matching dishes from the database, not just description" if image_path else ""}
      {"- Focus on finding real dishes that match what you see in the image" if image_path else ""}
      
      1. UNDERSTAND the user's intent:
         - Adding dishes? ("add", "also", "more", "suggest")
         - Removing/filtering? ("only", "just", "don't want", "remove", "except")
         - Replacing? ("instead", "different")
         - Asking for information? ("show", "what do I have")
         - Image search? (when image provided, find similar dishes in database)
      
      2. HANDLE USER SELECTION DECISIONS:
          - If user says "ავიღებ X" or "X ავიღებ" (I'll take X) = choose ONLY X, remove other similar options
         - If user wants to ADD: keep current dishes + add new ones = - ALWAYS keep dishes user has already chosen (unless they specifically ask to remove)
         - If user asks for new category: show ALL options in that category + keep existing selection
         - If user says "I don't want X": remove X from current selection - Only remove items when user explicitly says "remove X" or "I don't want X"
         - If user has allergies: remove/avoid allergens
         - If IMAGE PROVIDED: search database for dishes similar to what's shown
         - If user chooses 1 item from multiple options (like "საქონლის ხინკალს" from 4 khinkali)
          - Keep the chosen item + remove other similar items from same category
      
      3. SHOW ALL AVAILABLE OPTIONS for what user requests - and after filtering RETURN FINAL COMPLETE SELECTION
         - If user asks for khinkali, show ALL khinkali options available
         - If user asks for drinks, show ALL drink options available  
         - If user asks for meat dishes, show ALL meat dish options
         - Don't make filtering decisions for the user - show options
         - Only filter when user explicitly says "remove X" or "only keep Y"
         - Maximum {limit} dishes total
         - NEVER add duplicates - always check! if exact same dish already exists in selection
          - If user selects existing dish, just keep that one, don't add again
         - Respect allergies and preferences
         - For images: MUST include actual matching dishes from database
      
      4. BE SMART about context:
         - "only khinkali" = keep only khinkali dishes from current selection
         - "I have pork allergy" = remove all pork dishes
         - "add drinks" = add drinks to existing selection
         - "remove everything except beef khinkali" = keep only beef khinkali
         - IMAGE + "What food is this?" = identify AND find similar dishes in database
         - if requested dish is not in the database and you can't find similar dishes, leave blank space for that dish

      CRITICAL SELECTION RULES:
          - "ხინკალი მინდა" = show ALL khinkali options (exploration phase)
          - "საქონლის ხინკალს ავიღებ" = choose ONLY beef khinkali, REMOVE all other khinkali (selection phase)  
          - "დავამატებ X" = choose X from shown options, remove other similar items
          - "ავიღებ X" = same as above - selection, not addition

          NEVER keep multiple items of same type after user makes a choice.

      GEORGIAN LANGUAGE CONTEXT:
          - "ხინკალი მინდა" = "I want khinkali" → Show options
          - "ავიღებ ხინკალს" = "I'll take THE khinkali" → Use current selection
          - When user says "ავიღებ X და Y" after discussing specific items → finalize those specific items, don't show all options again
      
      5. CRITICAL FOR IMAGES:
         - Don't just describe the food - FIND MATCHING DISHES in the database
         - Look for dishes with similar ingredients, cooking methods, or cuisine type
         - Return actual available dishes, not descriptions
      
      <example>
      EXAMPLE CONVERSATION TO FOLLOW:
          User: "აჭარული ხაჭაპური მინდა" (I want Adjarian khachapuri)
          → Show ALL available აჭარული ხაჭაპური options from all restaurants

          User: "სახლი 11-ს აჭარული ავიღებ" (I'll take Adjarian from Sakhli #11)
          → Keep that specific khachapuri remove other khachapuri options

          User: "სასმელიც" (also drinks)  
          → Keep the khachapuri selection + show ALL available drink options from the same restaurant user chose

          User: "რამე ხორციანსაც" (something with meat too)
          → Keep khachapuri from same restaurant + keep drinks + show ALL meat dish options

          User: "აღარ მინდა სასმელი" (I don't want drinks)
          → Keep khachapuri + remove drinks + show ALL meat dish options

          User: "ვსო შევუკვეთავ" (I'll order these)
          → Keep khachapuri + keep meat dishes + show final selection

          This way user sees all options and makes their own filtering decisions.   
      </example>

      <example 2>
          User: "ხინკალი მინდა" (I want khinkali)
          → Show ALL 5 khinkali options

          User: "საქონლის ხინკალს ავიღებ" (I'll take beef khinkali)  
          → Keep ONLY "ხინკალი (საქონლის, 1 ცალი)" - remove other 4 khinkali options
          → Final selection: 1 dish (the chosen beef khinkali)

          User: "სასმელიც დავამატებ" (I'll also add drinks)
          → Keep beef khinkali + show ALL drink options
      </example 2>

      OUTPUT FORMAT (JSON ONLY):
      {{
          "results": [
              {{
                  "restaurant_id": "...",
                  "restaurant_name": "...",
                  "dish_name": "...",
                  "dish_price": 0.00,
              }}
          ],
          "operation_performed": "added" | "filtered" | "replaced" | "removed" | "no_change"
      }}
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
