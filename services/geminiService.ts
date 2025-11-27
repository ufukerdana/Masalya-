
import { GoogleGenAI } from "@google/genai";
import { Language, AGE_GROUPS, StoryOption, WordOfTheDay } from "../types";

const apiKey = process.env.API_KEY;

// Safely initialize the client. If no key is present, we handle it in the function call.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const getStyleForAge = (ageGroup: string): string => {
  if (ageGroup === AGE_GROUPS.TODDLER) {
    return "cute, soft pastel colors, simple shapes, cartoon style, storybook illustration, whimsical, very friendly";
  } else if (ageGroup === AGE_GROUPS.KID) {
    return "vibrant pastel colors, detailed children's book illustration, watercolor style, magical atmosphere";
  } else {
    // Preteen
    return "fantasy art style, soft lighting, detailed, atmospheric, slightly more mature storybook style";
  }
};

export const generateStoryImage = async (
  prompt: string,
  ageGroup: string
): Promise<string | null> => {
  if (!ai) return null;

  const style = getStyleForAge(ageGroup);
  const imagePrompt = `A high quality children's book illustration of ${prompt}. Style: ${style}. No text, no words in the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
    });

    // Extract image data
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateColoringPage = async (
  prompt: string
): Promise<string | null> => {
  if (!ai) return null;

  // Specific prompt for black and white coloring page
  const imagePrompt = `A simple black and white coloring book page outline of ${prompt}. Thick lines, white background, no shading, no gray, high contrast, vector style, simple details for children to color. No text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating coloring page:", error);
    return null;
  }
};

export const generateStoryContent = async (
  prompt: string,
  language: Language,
  ageGroup: string,
  isInteractive: boolean = false
): Promise<{ title: string; content: string; imageUrl?: string; choices?: StoryOption[]; wordOfTheDay?: WordOfTheDay } | null> => {
  if (!ai) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  const langText = language === 'tr' ? 'Turkish' : 'English';
  
  let systemInstruction = `You are a world-class children's storyteller. 
  Create a story suitable for children aged ${ageGroup}. 
  The language MUST be ${langText}.
  The tone should be magical, engaging, and safe.`;

  if (isInteractive) {
    systemInstruction += `
    You are creating an INTERACTIVE story (Choose Your Own Adventure).
    Write only the BEGINNING of the story (approx 150-200 words).
    Stop at a suspenseful or decision-making point.
    Provide exactly 2 simple choices for what happens next.
    
    Return the response STRICTLY as a JSON object with this schema:
    {
      "title": "Story Title",
      "content": "Story content...",
      "choices": [{"text": "Option 1"}, {"text": "Option 2"}],
      "wordOfTheDay": { "word": "Word", "definition": "Simple definition", "example": "Example sentence using the word." }
    }`;
  } else {
    systemInstruction += `
    The length should be approximately a 3-minute read (around 400-600 words).
    Also, identify one "Word of the Day" (an interesting or slightly challenging word from the story) and explain it.
    
    Return the response STRICTLY as a JSON object with this schema:
    {
      "title": "Story Title",
      "content": "Full story content...",
      "wordOfTheDay": { "word": "Word", "definition": "Simple definition", "example": "Example sentence using the word." }
    }`;
  }
  
  systemInstruction += ` Do not add markdown code blocks (like \`\`\`json) around the output. Just the raw JSON string.`;

  try {
    // 1. Generate Text
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a story based on the following: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    let storyData;
    try {
      storyData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from model output", e);
      return null;
    }

    // 2. Generate Image (Parallel or Sequential)
    const imageResult = await generateStoryImage(`${prompt} - ${storyData.title}`, ageGroup);

    return {
      title: storyData.title,
      content: storyData.content,
      choices: storyData.choices, // Undefined for non-interactive
      imageUrl: imageResult || undefined,
      wordOfTheDay: storyData.wordOfTheDay
    };

  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

export const continueStory = async (
  currentContent: string,
  choice: string,
  language: Language,
  ageGroup: string
): Promise<{ content: string; choices?: StoryOption[] } | null> => {
  if (!ai) return null;

  const langText = language === 'tr' ? 'Turkish' : 'English';

  const systemInstruction = `You are a world-class children's storyteller continuing an interactive story.
  Target audience age: ${ageGroup}. Language: ${langText}.
  
  The user has made a choice. Write the next segment of the story (approx 150-200 words).
  If the story should continue, provide 2 new choices.
  If the story should reach a conclusion, provide an empty choices array.
  
  Return STRICTLY JSON:
  {
    "content": "The next part of the story...",
    "choices": [{"text": "Next Option 1"}, {"text": "Next Option 2"}] 
    // OR "choices": [] if the story ends.
  }
  Do not include markdown.`;

  try {
    const prompt = `
    STORY SO FAR:
    ${currentContent}
    
    USER CHOSE:
    ${choice}
    
    Write the continuation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Error continuing story:", error);
    return null;
  }
};

export const generateWordCard = async (
  storyContent: string,
  language: Language,
  ageGroup: string
): Promise<WordOfTheDay | null> => {
  if (!ai) return null;
  const langText = language === 'tr' ? 'Turkish' : 'English';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Read this story and pick ONE educational, interesting word suitable for a child aged ${ageGroup}. 
      Provide a simple definition and an example sentence. Language: ${langText}.
      Story: ${storyContent.substring(0, 1000)}...`, // Truncate to avoid huge context usage if long
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
             word: { type: "STRING" },
             definition: { type: "STRING" },
             example: { type: "STRING" }
          },
          required: ["word", "definition", "example"]
        } as any // Cast to any to avoid type check issues with enum import
      },
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating word card:", error);
    return null;
  }
}
