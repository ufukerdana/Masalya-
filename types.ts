
export type Language = 'tr' | 'en';
export type Theme = 'light' | 'dark';
export type AppView = 'home' | 'create' | 'profile';

export interface StoryOption {
  text: string;
}

export interface WordOfTheDay {
  word: string;
  definition: string;
  example: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  ageGroup: string;
  imageUrl: string;
  isAiGenerated: boolean;
  author?: string;
  language: Language;
  createdAt: number;
  isInteractive?: boolean;
  choices?: StoryOption[];
  audioUrl?: string;
  coloringPageUrl?: string;
  wordOfTheDay?: WordOfTheDay;
}

export interface UserProfile {
  name: string;
  storiesRead: number;
  favorites: string[]; // Story IDs
  createdStories: Story[];
}

export interface Translation {
  welcome: string;
  welcomeDesc: string;
  home: string;
  create: string;
  profile: string;
  categories: string;
  classics: string;
  generated: string;
  readNow: string;
  createTitle: string;
  createDesc: string;
  promptPlaceholder: string;
  generateBtn: string;
  generating: string;
  darkMode: string;
  lightMode: string;
  ageGroup: string;
  allAges: string;
  favorites: string;
  storiesRead: string;
  myStories: string;
  noStoriesYet: string;
  tryCreating: string;
  back: string;
  save: string;
  delete: string;
  saved: string;
  // New additions
  yearsOld: string;
  endOfStory: string;
  cat_adventure: string;
  cat_fantasy: string;
  cat_animals: string;
  cat_bedtime: string;
  cat_folk: string;
  // Image Gen
  painting: string;
  createMagicImage: string;
  magicImageCreated: string;
  // Hero Mode
  heroMode: string;
  heroModeDesc: string;
  heroNameLabel: string;
  heroNamePlaceholder: string;
  heroToyLabel: string;
  heroToyPlaceholder: string;
  heroPlaceLabel: string;
  heroPlacePlaceholder: string;
  // Interactive Mode
  interactiveMode: string;
  interactiveModeDesc: string;
  makeAChoice: string;
  continuingStory: string;
  // Voice Recording
  recordVoice: string;
  recording: string;
  stopRecording: string;
  playRecording: string;
  deleteRecording: string;
  listenToStory: string;
  voiceFeatureDesc: string;
  // Painting
  paintMode: string;
  createColoringPage: string;
  preparingCanvas: string;
  brushSize: string;
  pickColor: string;
  clearCanvas: string;
  saveArtwork: string;
  // Word of the Day
  wordOfTheDay: string;
  discoverWord: string;
  findingWord: string;
}

export const CATEGORIES = {
  ADVENTURE: 'adventure',
  FANTASY: 'fantasy',
  ANIMALS: 'animals',
  BEDTIME: 'bedtime',
  FOLK: 'folk',
} as const;

export const AGE_GROUPS = {
  TODDLER: '3-5',
  KID: '6-9',
  PRETEEN: '10+',
} as const;
