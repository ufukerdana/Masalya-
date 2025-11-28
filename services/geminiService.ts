import { GoogleGenAI, Modality } from "@google/genai";
import { Language, AGE_GROUPS, StoryOption, WordOfTheDay } from "../types";

const apiKey = process.env.API_KEY;

// Safely initialize the client. If no key is present, we handle it in the function call.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Helper Functions for Rate Limiting ---

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to call API with retry logic for 429/Quota errors
// Default: 4 retries, starting at 4 seconds delay (4s, 8s, 16s, 32s) -> covers ~60 seconds of waiting
async function callWithRetry<T>(fn: () => Promise<T>, retries = 4, baseDelay = 4000): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error?.status === 429 || 
                           error?.message?.includes('429') || 
                           error?.message?.includes('Quota') || 
                           error?.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && attempt < retries) {
        attempt++;
        const waitTime = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Rate limit hit (429). Retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Helpers for Audio Decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to encode Uint8Array to Base64
function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const getStyleForAge = (ageGroup: string): string => {
  if (ageGroup === AGE_GROUPS.BABY) {
    return "very simple shapes, high contrast, baby book style, soft edges, minimal details, cute, white background, pastel accents";
  } else if (ageGroup === AGE_GROUPS.TODDLER) {
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
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
    }));

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
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
    }));

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

export const generateStorySpeech = async (
  text: string,
  language: Language
): Promise<string | null> => {
  if (!ai) return null;

  // Truncate if too long (API limits)
  const promptText = text.substring(0, 3000); 

  const voiceName = language === 'tr' ? 'Kore' : 'Puck'; 
  
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    }));

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioBytes = decode(base64Audio);
    // Create WAV Header
    const wavHeader = getWavHeader(audioBytes.length, 24000, 1);
    
    // Concatenate Header and PCM data
    const wavBytes = new Uint8Array(wavHeader.byteLength + audioBytes.byteLength);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(audioBytes, wavHeader.byteLength);

    // Convert complete WAV to Base64 String for persistence
    const wavBase64 = encodeBase64(wavBytes);
    return `data:audio/wav;base64,${wavBase64}`;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const generateStoryContent = async (
  prompt: string,
  language: Language,
  ageGroup: string,
  isInteractive: boolean = false,
  length: 'short' | 'long' = 'short'
): Promise<{ title: string; content: string; imageUrl?: string; choices?: StoryOption[]; wordOfTheDay?: WordOfTheDay; aiAudioUrl?: string; coloringPageUrl?: string } | null> => {
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
    // Handling story length instruction
    const lengthInstruction = length === 'short' 
      ? 'The story should be SHORT, strictly UNDER 500 words (aim for 300-400 words).'
      : 'The story should be LONG, detailed, and immersive, strictly OVER 500 words (aim for 600-800 words).';

    systemInstruction += `
    ${lengthInstruction}
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
    // 1. Generate Text (with retry)
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a story based on the following: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    }));

    const text = response.text;
    if (!text) return null;

    let storyData;
    try {
      storyData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from model output", e);
      return null;
    }

    // 2. Generate Image, Audio AND Coloring Page in Parallel
    // Individual functions are now wrapped with callWithRetry, so they will handle rate limits independently.
    const [imageResult, audioResult, coloringPageResult] = await Promise.all([
      generateStoryImage(`${prompt} - ${storyData.title}`, ageGroup),
      !isInteractive ? generateStorySpeech(storyData.content, language) : Promise.resolve(null),
      generateColoringPage(storyData.title)
    ]);

    return {
      title: storyData.title,
      content: storyData.content,
      choices: storyData.choices, // Undefined for non-interactive
      imageUrl: imageResult || undefined,
      wordOfTheDay: storyData.wordOfTheDay,
      aiAudioUrl: audioResult || undefined,
      coloringPageUrl: coloringPageResult || undefined
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
  ageGroup: string,
  turnCount: number
): Promise<{ content: string; choices?: StoryOption[] } | null> => {
  if (!ai) return null;

  const MAX_TURNS = 5;
  const isFinalTurn = turnCount >= MAX_TURNS;
  const langText = language === 'tr' ? 'Turkish' : 'English';

  let systemInstruction = `You are a world-class children's storyteller continuing an interactive story.
  Target audience age: ${ageGroup}. Language: ${langText}.
  The user has made a choice. Write the next segment of the story (approx 150-200 words).
  
  Current Turn: ${turnCount} / ${MAX_TURNS}.`;

  if (isFinalTurn) {
    systemInstruction += `
    THIS IS THE FINAL TURN. 
    Bring the story to a satisfying, magical, and happy conclusion based on the user's choice.
    Do NOT provide any new choices.
    The "choices" array MUST be empty.
    `;
  } else {
    systemInstruction += `
    The story continues. Provide exactly 2 new choices for what happens next.
    `;
  }
  
  systemInstruction += `
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
    
    Write the ${isFinalTurn ? 'FINAL conclusion' : 'next segment'}.
    `;

    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    }));

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
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Read this story and pick ONE educational, interesting word suitable for a child aged ${ageGroup}. 
      Provide a simple definition and an example sentence. Language: ${langText}.
      Story: ${storyContent.substring(0, 1000)}...`, 
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
        } as any 
      },
    }));
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating word card:", error);
    return null;
  }
}

// Helper to add WAV header to raw PCM data so <audio> elements can play it
function getWavHeader(dataLength: number, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}