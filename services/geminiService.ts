
import { GoogleGenAI } from "@google/genai";
import { Language, AGE_GROUPS } from "../types";

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

export const generateStoryContent = async (
  prompt: string,
  language: Language,
  ageGroup: string
): Promise<{ title: string; content: string; imageUrl?: string } | null> => {
  if (!ai) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  const langText = language === 'tr' ? 'Turkish' : 'English';
  
  const systemInstruction = `You are a world-class children's storyteller. 
  Create a story suitable for children aged ${ageGroup}. 
  The language MUST be ${langText}.
  The tone should be magical, engaging, and safe.
  
  Return the response STRICTLY as a JSON object with the following schema:
  {
    "title": "The title of the story",
    "content": "The full text of the story, formatted with paragraphs."
  }
  Do not add markdown code blocks (like \`\`\`json) around the output. Just the raw JSON string.`;

  try {
    // 1. Generate Text
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a story about: ${prompt}`,
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
    // We use the generated title or a summarized prompt for the image
    // To save time, we use the user's prompt + title
    const imageResult = await generateStoryImage(`${prompt} - ${storyData.title}`, ageGroup);

    return {
      title: storyData.title,
      content: storyData.content,
      imageUrl: imageResult || undefined
    };

  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};