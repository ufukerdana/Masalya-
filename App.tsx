import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Story, UserProfile, Language, Theme, AppView, CATEGORIES, AGE_GROUPS, Translation, StoryOption, ThemeId } from './types';
import { TRANSLATIONS, STATIC_STORIES, WHITE_PLACEHOLDER } from './constants';
import { generateStoryContent, generateStoryImage, continueStory, generateColoringPage, generateWordCard, generateStorySpeech } from './services/geminiService';
import { initDB, saveStoryToDB, getAllStoriesFromDB, deleteStoryFromDB } from './services/storageService';

// --- Theme Configuration ---
const THEME_STYLES: Record<ThemeId, {
  appBg: string;
  headerBg: string;
  navBg: string;
  cardBg: string;
  textMain: string;
  textSub: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  border: string;
  gradient: string;
}> = {
  magic: {
    appBg: "bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900",
    headerBg: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-purple-100 dark:border-purple-900",
    navBg: "bg-white dark:bg-gray-900 border-purple-100 dark:border-purple-900",
    cardBg: "bg-white dark:bg-gray-800",
    textMain: "text-purple-900 dark:text-purple-100",
    textSub: "text-purple-700 dark:text-purple-300",
    primary: "bg-purple-600 text-white shadow-purple-500/30",
    primaryHover: "hover:bg-purple-700",
    secondary: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    accent: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-pink-500"
  },
  jungle: {
    appBg: "bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-gray-900",
    headerBg: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-green-100 dark:border-green-900",
    navBg: "bg-white dark:bg-gray-900 border-green-100 dark:border-green-900",
    cardBg: "bg-white dark:bg-gray-800",
    textMain: "text-green-900 dark:text-green-100",
    textSub: "text-green-700 dark:text-green-300",
    primary: "bg-green-600 text-white shadow-green-500/30",
    primaryHover: "hover:bg-green-700",
    secondary: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    accent: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-emerald-600"
  },
  ocean: {
    appBg: "bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900",
    headerBg: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-cyan-100 dark:border-cyan-900",
    navBg: "bg-white dark:bg-gray-900 border-cyan-100 dark:border-cyan-900",
    cardBg: "bg-white dark:bg-gray-800",
    textMain: "text-blue-900 dark:text-blue-100",
    textSub: "text-blue-700 dark:text-blue-300",
    primary: "bg-blue-500 text-white shadow-blue-500/30",
    primaryHover: "hover:bg-blue-600",
    secondary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    accent: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    gradient: "from-cyan-400 to-blue-600"
  },
  candy: {
    appBg: "bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-rose-950 dark:via-pink-950 dark:to-gray-900",
    headerBg: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-pink-100 dark:border-pink-900",
    navBg: "bg-white dark:bg-gray-900 border-pink-100 dark:border-pink-900",
    cardBg: "bg-white dark:bg-gray-800",
    textMain: "text-pink-900 dark:text-pink-100",
    textSub: "text-pink-700 dark:text-pink-300",
    primary: "bg-pink-500 text-white shadow-pink-500/30",
    primaryHover: "hover:bg-pink-600",
    secondary: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    accent: "text-pink-500 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    gradient: "from-pink-400 to-rose-500"
  },
  space: {
    appBg: "bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-gray-950 dark:via-indigo-950 dark:to-black",
    headerBg: "bg-white/80 dark:bg-black/80 backdrop-blur-md border-indigo-100 dark:border-indigo-900",
    navBg: "bg-white dark:bg-black border-indigo-100 dark:border-indigo-900",
    cardBg: "bg-white dark:bg-gray-900",
    textMain: "text-indigo-900 dark:text-indigo-100",
    textSub: "text-indigo-700 dark:text-indigo-300",
    primary: "bg-indigo-600 text-white shadow-indigo-500/30",
    primaryHover: "hover:bg-indigo-700",
    secondary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    accent: "text-indigo-500 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
    gradient: "from-indigo-500 to-violet-600"
  }
};

// --- Icons (SVG) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M5 3h4"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-red-500" : ""}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const StarIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-yellow-400" : ""}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const SplitPathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12v7H5v-7"/><path d="m14 5 5 5-5 5"/><path d="m5 12 7-7"/></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const HeadphonesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
const BrushIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2.5 2.24 0 .46.62.8 1 .8a2.49 2.49 0 0 0 2.5-2.5c0-.56.45-1 1-1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-1z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const Volume2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// --- Helper Functions ---
const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'hero' | 'interactive' | 'danger' | 'orange';
  themeConfig?: typeof THEME_STYLES['magic'];
}

const Button = ({ children, className = '', variant = 'primary', themeConfig, ...props }: ButtonProps) => {
  const currentTheme = themeConfig || THEME_STYLES['magic'];
  const baseStyle = "px-4 py-2 rounded-2xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-sm hover:shadow-md";
  
  const variants = {
    primary: `${currentTheme.primary} ${currentTheme.primaryHover}`,
    secondary: `${currentTheme.secondary} border-2 ${currentTheme.border} hover:brightness-95`,
    ghost: `bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5`,
    hero: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30 hover:scale-105",
    interactive: "bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40",
    orange: "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  t: any;
  themeConfig: typeof THEME_STYLES['magic'];
}

const StoryCard = ({ story, onClick, t, themeConfig }: StoryCardProps) => (
  <div 
    onClick={onClick}
    className={`${themeConfig.cardBg} rounded-3xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group border-2 border-transparent hover:${themeConfig.border.split(' ')[0]} relative`}
  >
    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
      <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {story.isAiGenerated && (
        <div className={`absolute top-2 right-2 ${themeConfig.primary} bg-opacity-90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm font-bold`}>
          <SparklesIcon /> AI
        </div>
      )}
      {story.isInteractive && (
         <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm font-bold">
           <SplitPathIcon />
         </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
          {t['cat_' + story.category] || story.category}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className={`text-xl font-bold ${themeConfig.textMain} mb-2 line-clamp-1`}>{story.title}</h3>
      <p className={`text-sm ${themeConfig.textSub} opacity-80 line-clamp-2 mb-4 font-medium`}>{story.content}</p>
      <div className={`flex items-center justify-between text-xs font-bold ${themeConfig.textSub} opacity-60`}>
        <span>{story.ageGroup} {t.yearsOld}</span>
        <span className="flex items-center gap-1">
          {story.author || 'Masalya'}
        </span>
      </div>
    </div>
  </div>
);

interface AudioPlayerProps {
  src: string;
  onDelete?: () => void;
  title?: string;
  autoPlay?: boolean;
  themeConfig: typeof THEME_STYLES['magic'];
}

const AudioPlayer = ({ src, onDelete, title, autoPlay = false, themeConfig }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    
    if (audioRef.current) {
        audioRef.current.load();
        if (autoPlay) {
          setTimeout(() => {
            audioRef.current?.play().catch(e => console.log("Autoplay blocked", e));
          }, 100);
        }
    }
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleSpeed = () => {
    const rates = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  };

  return (
    <div className={`w-full p-4 rounded-3xl ${themeConfig.secondary} border-2 ${themeConfig.border} flex flex-col gap-3 transition-all duration-300`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center justify-between">
         {title && <span className={`text-xs font-black uppercase tracking-widest ${themeConfig.textSub} opacity-70`}>{title}</span>}
         <button 
           onClick={toggleSpeed}
           className={`text-xs font-bold px-3 py-1 rounded-full bg-white/40 ${themeConfig.textMain} hover:bg-white/60 transition-colors min-w-[3rem]`}
         >
           {playbackRate}x
         </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 flex-shrink-0 ${themeConfig.primary} ${themeConfig.primaryHover}`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="flex-1 flex flex-col justify-center gap-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={`w-full h-2 bg-black/10 rounded-full appearance-none cursor-pointer accent-current ${themeConfig.textMain}`}
          />
          <div className="flex justify-between text-[10px] font-bold opacity-60 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {onDelete && (
           <button 
             onClick={onDelete}
             className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
           >
             <TrashIcon />
           </button>
        )}
      </div>
    </div>
  );
};

// ... PaintingModal remains mostly the same, just keeping it standard as it's a full screen canvas tool ...
// Skipping PaintingModal full implementation in this diff as it was already provided and works well independently of themes. 
// Assuming it exists as previously defined.

// Re-defining PaintingModal for completeness in this file
interface PaintingModalProps {
  imageUrl: string;
  onClose: () => void;
  t: any;
}
const PaintingModal = ({ imageUrl, onClose, t }: PaintingModalProps) => {
    // ... Same implementation as previous step ...
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#FF0000');
    const [brushSize, setBrushSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#000000', '#FFFFFF', '#8B4513', '#FF69B4', '#00CED1'];
  
    // ... drawing logic ...
    const startDrawing = (e: any) => {
         const canvas = canvasRef.current;
         if(!canvas) return;
         const ctx = canvas.getContext('2d');
         if(!ctx) return;
         setIsDrawing(true);
         const rect = canvas.getBoundingClientRect();
         let clientX, clientY;
         if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } else { clientX = e.clientX; clientY = e.clientY; }
         const scaleX = canvas.width / rect.width;
         const scaleY = canvas.height / rect.height;
         ctx.beginPath();
         ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
         ctx.strokeStyle = color;
         ctx.lineWidth = brushSize;
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';
    };
    const draw = (e: any) => {
        if(!isDrawing) return;
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } else { clientX = e.clientX; clientY = e.clientY; }
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
        ctx.stroke();
    };
    const stopDrawing = () => setIsDrawing(false);
    const clearCanvas = () => { const c = canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height); };
    const saveArtwork = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvas, 0, 0);
            const link = document.createElement('a');
            link.download = `masalya-art-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL();
            link.click();
        };
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg flex items-center gap-2"><PaletteIcon /> {t.paintMode}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full"><XIcon /></button>
                </div>
                <div className="flex-1 relative bg-gray-50 dark:bg-black overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full max-w-[800px] max-h-[600px] aspect-[4/3] bg-white shadow-lg m-4">
                        <img src={imageUrl} className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" alt="" />
                        <canvas ref={canvasRef} width={800} height={600} className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto w-full sm:w-auto p-1 no-scrollbar">
                        {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0 ${color === c ? 'border-gray-400 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
                    </div>
                    <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"><BrushIcon /><input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24" /></div>
                        <div className="flex gap-2"><Button variant="ghost" onClick={clearCanvas}><TrashIcon /></Button><Button variant="primary" onClick={saveArtwork}><DownloadIcon /></Button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ReaderModalProps { 
  story: Story | null; 
  onClose: () => void; 
  isFavorite: boolean; 
  onToggleFavorite: () => void;
  onRegenerateImage: (story: Story) => Promise<void>;
  onGenerateColoringPage: (story: Story) => Promise<void>;
  onContinueStory: (story: Story, choice: string) => Promise<void>;
  onSaveRecording: (story: Story, audioBlobUrl: string | null) => void;
  onSaveAiAudio: (story: Story, audioBlobUrl: string | null) => void;
  onDiscoverWord: (story: Story) => Promise<void>;
  isGeneratingImage: boolean;
  isGeneratingColoringPage: boolean;
  isFindingWord: boolean;
  t: any;
  themeConfig: typeof THEME_STYLES['magic'];
}

const ReaderModal = ({ story, onClose, isFavorite, onToggleFavorite, onRegenerateImage, onGenerateColoringPage, onContinueStory, onSaveRecording, onSaveAiAudio, onDiscoverWord, isGeneratingImage, isGeneratingColoringPage, isFindingWord, t, themeConfig }: ReaderModalProps) => {
  const [isContinuing, setIsContinuing] = useState(false);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const [showPaintingModal, setShowPaintingModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(story?.audioUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(story?.aiAudioUrl || null);
  const [isGeneratingAiAudio, setIsGeneratingAiAudio] = useState(false);

  useEffect(() => {
    setAudioUrl(story?.audioUrl || null);
    setAiAudioUrl(story?.aiAudioUrl || null);
    setIsRecording(false);
    setShowPaintingModal(false);
  }, [story]);

  useEffect(() => {
    if (story && story.aiAudioUrl && story.aiAudioUrl !== aiAudioUrl) setAiAudioUrl(story.aiAudioUrl);
  }, [story?.aiAudioUrl]);

  useEffect(() => {
    if (contentEndRef.current) contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [story?.content, story?.choices]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob); 
        reader.onloadend = () => {
            const base64data = reader.result as string;
            setAudioUrl(base64data);
            if (story) onSaveRecording(story, base64data);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) { alert("Microphone access denied."); }
  };
  const handleStopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };
  const handleDeleteRecording = () => { setAudioUrl(null); if (story) onSaveRecording(story, null); };

  const handleGenerateAiAudio = async () => {
     if (!story) return;
     setIsGeneratingAiAudio(true);
     try {
        const url = await generateStorySpeech(story.content, story.language);
        if (url) { setAiAudioUrl(url); onSaveAiAudio(story, url); }
     } catch (e) { console.error(e); } finally { setIsGeneratingAiAudio(false); }
  };

  if (!story) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className={`bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 border-4 ${themeConfig.border}`}>
          <div className="relative h-56 sm:h-72 shrink-0 group bg-gray-100 dark:bg-gray-800">
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-colors z-[60] focus:outline-none"><XIcon /></button>
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onRegenerateImage(story); }} disabled={isGeneratingImage} className="!text-xs !py-1 !px-3 !rounded-full !bg-white/90 shadow-sm">{isGeneratingImage ? t.painting : <><SparklesIcon /> {t.createMagicImage}</>}</Button>
               <Button variant="secondary" onClick={(e) => { e.stopPropagation(); if (story.coloringPageUrl) setShowPaintingModal(true); else { onGenerateColoringPage(story).then(() => setShowPaintingModal(true)); } }} disabled={isGeneratingColoringPage} className="!text-xs !py-1 !px-3 !rounded-full !bg-white/90 shadow-sm">{isGeneratingColoringPage ? t.preparingCanvas : <><PaletteIcon /> {t.createColoringPage}</>}</Button>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t ${story.isAiGenerated ? 'from-black/80' : 'from-black/60'} to-transparent pt-32`}>
               <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">{story.title}</h2>
            </div>
          </div>
          
          <div className={`p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1 pb-32 ${themeConfig.cardBg}`}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-1.5 ${themeConfig.secondary} rounded-full text-xs font-bold uppercase tracking-wide border-2 border-transparent`}>{t['cat_' + story.category] || story.category}</span>
                <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border-2 border-gray-200 dark:border-gray-700">{story.ageGroup} {t.yearsOld}</span>
                {story.isInteractive && <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wide border-2 border-emerald-200"><SplitPathIcon /> {t.interactiveMode}</span>}
              </div>
              <button onClick={onToggleFavorite} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><HeartIcon filled={isFavorite} /></button>
            </div>
            
            <div className="mb-8">
               {!aiAudioUrl ? (
                   <div className={`p-5 rounded-3xl flex items-center justify-between border-2 ${themeConfig.border} ${themeConfig.secondary} bg-opacity-30`}>
                     <div className={`flex items-center gap-4 ${themeConfig.textMain}`}>
                         <div className={`p-3 bg-white rounded-full shadow-sm`}>
                             <Volume2Icon />
                         </div>
                         <div className="text-sm font-bold">{t.aiNarration}</div>
                     </div>
                     <button onClick={handleGenerateAiAudio} disabled={isGeneratingAiAudio} className={`px-5 py-2 bg-white ${themeConfig.textSub} border-2 ${themeConfig.border} rounded-2xl text-sm font-bold hover:brightness-95 disabled:opacity-50 flex items-center gap-2 shadow-sm`}>{isGeneratingAiAudio ? <span className="animate-spin">✨</span> : <SparklesIcon />}{isGeneratingAiAudio ? t.generatingAudio : t.listenToAi}</button>
                   </div>
               ) : (
                  <AudioPlayer src={aiAudioUrl} title={t.aiNarration} themeConfig={themeConfig} />
               )}
            </div>

            <div className={`prose dark:prose-invert prose-lg max-w-none ${themeConfig.textMain} leading-loose font-medium`}>
               {story.content.split('\n').map((paragraph, idx) => (paragraph.trim() && <p key={idx} className="mb-6">{paragraph}</p>))}
            </div>

            <div className="mt-10 animate-in slide-in-from-bottom-4">
              {story.wordOfTheDay ? (
                 <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-[2rem] p-8 relative overflow-hidden shadow-sm">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest"><LightbulbIcon /> {t.wordOfTheDay}</div>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{story.wordOfTheDay.word}</h4>
                      <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4 font-serif">"{story.wordOfTheDay.definition}"</p>
                      <div className="bg-white/60 dark:bg-black/30 p-4 rounded-2xl text-base text-gray-600 dark:text-gray-400 font-medium">{story.wordOfTheDay.example}</div>
                    </div>
                 </div>
              ) : (
                <div className="flex justify-center"><Button variant="orange" onClick={() => onDiscoverWord(story)} disabled={isFindingWord}>{isFindingWord ? <><span className="animate-spin">✨</span> {t.findingWord}</> : <><LightbulbIcon /> {t.discoverWord}</>}</Button></div>
              )}
            </div>

            {story.isInteractive && story.choices && story.choices.length > 0 && (
               <div className="mt-10 p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border-2 border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-bottom-4 shadow-sm">
                  <h4 className="text-center text-emerald-800 dark:text-emerald-300 font-black text-lg mb-6 uppercase tracking-wide">{t.makeAChoice}</h4>
                  <div className="grid grid-cols-1 gap-4">
                     {isContinuing ? <div className="text-center text-emerald-600 py-4 flex items-center justify-center gap-2 font-bold"><span className="animate-spin">✨</span> {t.continuingStory}</div> : story.choices.map((choice, idx) => (
                          <button key={idx} onClick={() => { setIsContinuing(true); onContinueStory(story, choice.text).then(() => setIsContinuing(false)); }} className="p-5 bg-white dark:bg-gray-800 border-2 border-emerald-100 dark:border-emerald-900 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all text-left text-gray-800 dark:text-white font-bold text-lg">{choice.text}</button>
                        ))}
                  </div>
               </div>
            )}
            <div ref={contentEndRef} />
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm font-bold opacity-40 uppercase tracking-widest">{story.isInteractive && story.choices && story.choices.length > 0 ? '' : t.endOfStory} • Masalya</div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex items-center justify-between z-20">
            <div className="w-full">
              {audioUrl ? (
                <div className="animate-in slide-in-from-bottom-2"><AudioPlayer src={audioUrl} onDelete={handleDeleteRecording} themeConfig={themeConfig} title={t.listenToStory} /></div>
              ) : (
                 <div className="flex items-center justify-between w-full px-2">
                   <div className="flex items-center gap-3"><div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full"><HeadphonesIcon /></div><div className="text-sm font-bold text-gray-500 dark:text-gray-400">{isRecording ? <span className="text-pink-500 animate-pulse">{t.recording}</span> : <span>{t.voiceFeatureDesc}</span>}</div></div>
                   {isRecording ? <button onClick={handleStopRecording} className="px-6 py-3 rounded-full bg-red-500 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-colors flex items-center gap-2 animate-pulse"><StopIcon /> {t.stopRecording}</button> : <button onClick={handleStartRecording} className="px-6 py-3 rounded-full bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors flex items-center gap-2 active:scale-95"><MicIcon /> {t.recordVoice}</button>}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPaintingModal && story.coloringPageUrl && <PaintingModal imageUrl={story.coloringPageUrl} onClose={() => setShowPaintingModal(false)} t={t} />}
    </>
  );
};

// --- Views ---

interface HomeViewProps { 
  stories: Story[]; 
  lang: Language; 
  onStoryClick: (s: Story) => void;
  activeFilter: string;
  setActiveFilter: (c: string) => void;
  t: any;
  themeConfig: typeof THEME_STYLES['magic'];
}

const HomeView = ({ stories, lang, onStoryClick, activeFilter, setActiveFilter, t, themeConfig }: HomeViewProps) => {
  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchLang = s.language === lang;
      const matchFilter = activeFilter === 'all' || s.category === activeFilter || s.ageGroup === activeFilter;
      return matchLang && matchFilter;
    });
  }, [stories, lang, activeFilter]);

  return (
    <div className="pb-28">
      <div className={`mb-8 p-8 bg-gradient-to-r ${themeConfig.gradient} rounded-[2rem] text-white shadow-xl shadow-${themeConfig.primary.split('-')[1]}-500/20 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl"></div>
        <h2 className="text-3xl font-black mb-2 relative z-10 tracking-tight">{t.welcome}</h2>
        <p className="text-white/90 relative z-10 font-medium text-lg">{t.welcomeDesc}</p>
      </div>

      <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-3">
          <button onClick={() => setActiveFilter('all')} className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeFilter === 'all' ? themeConfig.primary : `bg-white dark:bg-gray-800 ${themeConfig.textSub} hover:bg-gray-50 border-2 border-transparent`}`}>{t.allAges}</button>
          {Object.values(CATEGORIES).map(cat => ( <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold capitalize transition-all ${activeFilter === cat ? themeConfig.primary : `bg-white dark:bg-gray-800 ${themeConfig.textSub} hover:bg-gray-50 border-2 border-transparent`}`}>{t['cat_' + cat] || cat}</button> ))}
           <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 mx-2 self-center"></div>
           {Object.values(AGE_GROUPS).map(age => ( <button key={age} onClick={() => setActiveFilter(age)} className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeFilter === age ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : `bg-white dark:bg-gray-800 ${themeConfig.textSub} hover:bg-gray-50 border-2 border-transparent`}`}>{age}</button> ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStories.map(story => ( <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story)} t={t} themeConfig={themeConfig} /> ))}
      </div>
      
      {filteredStories.length === 0 && (
         <div className="text-center py-20 text-gray-400">
           <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpenIcon /></div>
           <p className="font-bold text-lg">{t.noStoriesYet}</p>
         </div>
      )}
    </div>
  );
};

interface CreateViewProps { 
  onGenerate: (prompt: string, age: string, isInteractive: boolean) => Promise<void>; 
  isGenerating: boolean; 
  t: any;
  createdStory: Story | null;
  onStoryClick: (s: Story) => void;
  themeConfig: typeof THEME_STYLES['magic'];
}

const CreateView = ({ onGenerate, isGenerating, t, createdStory, onStoryClick, themeConfig }: CreateViewProps) => {
  const [prompt, setPrompt] = useState('');
  const [age, setAge] = useState<string>(AGE_GROUPS.KID);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isHeroMode, setIsHeroMode] = useState(false);
  const [heroName, setHeroName] = useState('');
  const [heroToy, setHeroToy] = useState('');
  const [heroPlace, setHeroPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = isHeroMode 
      ? `A story where the main character is a child named ${heroName}. Favorite item: ${heroToy || 'magical toy'}. Location: ${heroPlace || 'magical land'}.`
      : prompt;
    if (finalPrompt.trim()) onGenerate(finalPrompt, age, isInteractive);
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto">
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4">
        <div className={`inline-block p-4 ${themeConfig.secondary} rounded-3xl mb-4 shadow-sm`}><SparklesIcon /></div>
        <h2 className={`text-3xl font-black ${themeConfig.textMain} mb-2`}>{t.createTitle}</h2>
        <p className={`${themeConfig.textSub} text-lg`}>{t.createDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className={`${themeConfig.cardBg} p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-2 ${themeConfig.border}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
           <button type="button" onClick={() => setIsHeroMode(!isHeroMode)} className={`p-4 rounded-3xl flex items-center gap-3 border-2 transition-all text-left ${isHeroMode ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}>
             <div className={`p-3 rounded-2xl ${isHeroMode ? 'bg-yellow-400 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}><StarIcon filled={true} /></div>
             <div><h3 className={`font-bold text-sm ${isHeroMode ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t.heroMode}</h3></div>
             {isHeroMode && <div className="ml-auto text-yellow-500"><CheckIcon /></div>}
           </button>

           <button type="button" onClick={() => setIsInteractive(!isInteractive)} className={`p-4 rounded-3xl flex items-center gap-3 border-2 transition-all text-left ${isInteractive ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}>
             <div className={`p-3 rounded-2xl ${isInteractive ? 'bg-emerald-400 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}><SplitPathIcon /></div>
             <div><h3 className={`font-bold text-sm ${isInteractive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t.interactiveMode}</h3></div>
             {isInteractive && <div className="ml-auto text-emerald-500"><CheckIcon /></div>}
           </button>
        </div>

        <div className="mb-8">
          <label className={`block text-sm font-bold ${themeConfig.textSub} mb-3 uppercase tracking-wide`}>{t.ageGroup}</label>
          <div className="flex gap-2 flex-wrap">
            {Object.values(AGE_GROUPS).map((a) => ( <button key={a} type="button" onClick={() => setAge(a)} className={`flex-1 min-w-[60px] py-3 rounded-2xl text-sm font-bold transition-all border-2 ${age === a ? `${themeConfig.primary} border-transparent` : `bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:border-gray-200`}`}>{a}</button> ))}
          </div>
        </div>

        {isHeroMode ? (
          <div className="space-y-5 mb-8 animate-in fade-in">
             {['Name', 'Toy', 'Place'].map(field => (
                 <div key={field}>
                   <label className={`block text-xs font-bold ${themeConfig.textSub} mb-2 uppercase ml-2`}>{t[`hero${field}Label`]}</label>
                   <input type="text" value={field === 'Name' ? heroName : field === 'Toy' ? heroToy : heroPlace} onChange={(e) => field === 'Name' ? setHeroName(e.target.value) : field === 'Toy' ? setHeroToy(e.target.value) : setHeroPlace(e.target.value)} placeholder={t[`hero${field}Placeholder`]} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black/30 border-2 border-transparent focus:border-yellow-400 outline-none font-bold text-gray-800 dark:text-white transition-all" />
                 </div>
             ))}
          </div>
        ) : (
          <div className="mb-8 animate-in fade-in">
            <label className={`block text-xs font-bold ${themeConfig.textSub} mb-2 uppercase ml-2`}>Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.promptPlaceholder} className={`w-full p-5 rounded-3xl bg-gray-50 dark:bg-black/30 border-2 border-transparent focus:${themeConfig.border.split(' ')[0]} outline-none transition-all resize-none h-40 font-medium text-gray-800 dark:text-white`} />
          </div>
        )}

        <Button type="submit" variant={isHeroMode ? 'hero' : (isInteractive ? 'interactive' : 'primary')} themeConfig={themeConfig} disabled={isGenerating || (isHeroMode ? !heroName.trim() : !prompt.trim())} className="w-full py-5 text-lg rounded-2xl shadow-xl">{isGenerating ? <><span className="animate-spin mr-2">✨</span> {t.generating}</> : <>{isInteractive ? <SplitPathIcon /> : <SparklesIcon />} {t.generateBtn}</>}</Button>
      </form>

      {createdStory && !isGenerating && (
        <div className="mt-12 animate-in slide-in-from-bottom-8">
          <h3 className={`text-2xl font-black ${themeConfig.textMain} mb-6 text-center`}>{t.generated}</h3>
          <StoryCard story={createdStory} onClick={() => onStoryClick(createdStory)} t={t} themeConfig={themeConfig} />
        </div>
      )}
    </div>
  );
};

interface ProfileViewProps { 
  user: UserProfile; 
  allStories: Story[]; 
  onStoryClick: (s: Story) => void; 
  onDeleteStory: (id: string) => void;
  onUpdateTheme: (t: ThemeId) => void;
  t: any;
  themeConfig: typeof THEME_STYLES['magic'];
}

const ProfileView = ({ user, allStories, onStoryClick, onDeleteStory, onUpdateTheme, t, themeConfig }: ProfileViewProps) => {
  const favorites = allStories.filter(s => user.favorites.includes(s.id));
  const created = user.createdStories;

  return (
    <div className="pb-28">
      <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] ${themeConfig.secondary} mb-10`}>
        <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${themeConfig.gradient} flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4`}>{user.name.charAt(0)}</div>
        <h2 className={`text-3xl font-black ${themeConfig.textMain}`}>{user.name}</h2>
        <p className={`font-bold opacity-60 ${themeConfig.textSub}`}>{user.storiesRead} {t.storiesRead}</p>
      </div>

      <section className="mb-10">
         <h3 className={`text-xl font-black ${themeConfig.textMain} mb-5 flex items-center gap-2 px-2`}><PaletteIcon /> {t.selectTheme}</h3>
         <div className="grid grid-cols-5 gap-2 sm:gap-4 p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            {(Object.keys(THEME_STYLES) as ThemeId[]).map(themeId => (
               <button key={themeId} onClick={() => onUpdateTheme(themeId)} className={`flex flex-col items-center gap-2 transition-transform active:scale-95 group`}>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md transition-all ${user.theme === themeId ? 'ring-4 ring-offset-2 ring-gray-200 dark:ring-gray-600 scale-110' : 'opacity-70 hover:opacity-100'}`} style={{ background: themeId === 'magic' ? '#9333ea' : themeId === 'jungle' ? '#16a34a' : themeId === 'ocean' ? '#06b6d4' : themeId === 'candy' ? '#ec4899' : '#4f46e5' }}>
                    {user.theme === themeId && <CheckIcon />}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-center text-gray-500 line-clamp-1">{t[`theme_${themeId}`]}</span>
               </button>
            ))}
         </div>
      </section>

      <section className="mb-10">
        <h3 className={`text-xl font-black ${themeConfig.textMain} mb-5 flex items-center gap-2 px-2`}><SparklesIcon /> {t.myStories}</h3>
        {created.length > 0 ? (
          <div className="space-y-4">
            {created.map(story => (
              <div key={story.id} className={`${themeConfig.cardBg} flex gap-4 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.01]`}>
                <img src={story.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg">{story.title}</h4>
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => onStoryClick(story)} className={`text-xs font-black uppercase tracking-wider ${themeConfig.textSub}`}>{t.readNow}</button>
                    <button onClick={() => onDeleteStory(story.id)} className="text-xs font-black uppercase tracking-wider text-red-400 hover:text-red-600">{t.delete}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center p-10 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
             <p className="text-gray-400 font-bold mb-2">{t.noStoriesYet}</p>
             <p className={`${themeConfig.textSub} text-sm font-bold opacity-70`}>{t.tryCreating}</p>
           </div>
        )}
      </section>

      <section>
        <h3 className={`text-xl font-black ${themeConfig.textMain} mb-5 flex items-center gap-2 px-2`}><HeartIcon filled={true} /> {t.favorites}</h3>
        {favorites.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{favorites.map(story => <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story)} t={t} themeConfig={themeConfig} />)}</div> : <p className="text-gray-400 italic text-center p-8">{t.noStoriesYet}</p>}
      </section>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [lang, setLang] = useState<Language>('tr');
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<AppView>('home');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  
  const [stories, setStories] = useState<Story[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Küçük Okur',
    theme: 'magic', // Default theme
    storiesRead: 0,
    favorites: [],
    createdStories: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingColoringPage, setIsGeneratingColoringPage] = useState(false);
  const [isFindingWord, setIsFindingWord] = useState(false);
  const [lastCreatedStory, setLastCreatedStory] = useState<Story | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const t = TRANSLATIONS[lang];
  const hasInitialized = useRef(false);
  const themeConfig = THEME_STYLES[userProfile.theme] || THEME_STYLES['magic'];

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Load Data
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const initialize = async () => {
       try {
          await initDB();
          const dbStories = await getAllStoriesFromDB();
          const dbStoryMap = new Map(dbStories.map(s => [s.id, s]));
          const mergedStories: Story[] = [];
          
          for (const staticStory of STATIC_STORIES) {
              if (dbStoryMap.has(staticStory.id)) {
                  mergedStories.push(dbStoryMap.get(staticStory.id)!);
                  dbStoryMap.delete(staticStory.id);
              } else { mergedStories.push(staticStory); }
          }
          dbStoryMap.forEach(story => mergedStories.push(story));
          setStories(mergedStories);
          
          const myGenerated = mergedStories.filter(s => s.id.startsWith('gen_'));
          
          // Load User Profile Preference from localStorage if available (simple persistence for theme)
          const savedTheme = localStorage.getItem('masalya_theme') as ThemeId;
          
          setUserProfile(prev => ({ 
              ...prev, 
              createdStories: myGenerated,
              theme: savedTheme && THEME_STYLES[savedTheme] ? savedTheme : 'magic'
          }));

          // Background Asset Generation Queue...
          for (const s of mergedStories) {
             if (STATIC_STORIES.find(ss => ss.id === s.id)) {
                 const needsImage = s.imageUrl === WHITE_PLACEHOLDER;
                 const needsAudio = !s.aiAudioUrl;
                 if (needsImage || needsAudio) {
                     let updated = { ...s };
                     let changed = false;
                     if (needsImage) {
                         try {
                            const newImg = await generateStoryImage(`${s.title}. ${s.content.substring(0, 50)}`, s.ageGroup);
                            if (newImg) { updated.imageUrl = newImg; changed = true; }
                         } catch(e) {}
                     }
                     if (needsAudio) {
                         try {
                             const newAudio = await generateStorySpeech(s.content, s.language);
                             if (newAudio) { updated.aiAudioUrl = newAudio; changed = true; }
                         } catch(e) {}
                     }
                     if (changed) {
                         setStories(prev => prev.map(ps => ps.id === updated.id ? updated : ps));
                         await saveStoryToDB(updated);
                     }
                 }
             }
          }
       } catch (e) { console.error(e); setStories(STATIC_STORIES); }
    };
    initialize();
  }, []);

  // Sync active story updates
  useEffect(() => {
     if (activeStory) {
         const found = stories.find(s => s.id === activeStory.id);
         if (found && (found.imageUrl !== activeStory.imageUrl || found.aiAudioUrl !== activeStory.aiAudioUrl || found.coloringPageUrl !== activeStory.coloringPageUrl || found.audioUrl !== activeStory.audioUrl || found.wordOfTheDay !== activeStory.wordOfTheDay)) {
             setActiveStory(found);
         }
     }
  }, [stories, activeStory]);

  const handleUpdateTheme = (newTheme: ThemeId) => {
      setUserProfile(prev => ({...prev, theme: newTheme}));
      localStorage.setItem('masalya_theme', newTheme);
  };

  const handleGenerateStory = async (prompt: string, age: string, isInteractive: boolean) => {
    setIsGenerating(true); setLastCreatedStory(null);
    try {
      const result = await generateStoryContent(prompt, lang, age, isInteractive);
      if (result) {
        const newStory: Story = {
          id: `gen_${Date.now()}`,
          title: result.title, content: result.content, category: CATEGORIES.FANTASY, ageGroup: age, imageUrl: result.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
          isAiGenerated: true, author: 'AI Storyteller', language: lang, createdAt: Date.now(), isInteractive: isInteractive, choices: result.choices, wordOfTheDay: result.wordOfTheDay, aiAudioUrl: result.aiAudioUrl
        };
        await saveStoryToDB(newStory);
        setStories(prev => [newStory, ...prev]);
        setUserProfile(prev => ({ ...prev, createdStories: [newStory, ...prev.createdStories] }));
        setLastCreatedStory(newStory);
      }
    } catch (error) { alert("Error generating story."); } finally { setIsGenerating(false); }
  };
  const handleContinueStory = async (story: Story, choice: string) => {
    try {
      const result = await continueStory(story.content, choice, lang, story.ageGroup);
      if (result) {
        const updatedStory = { ...story, content: story.content + "\n\n" + result.content, choices: result.choices };
        await saveStoryToDB(updatedStory);
        setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
        setActiveStory(updatedStory);
      }
    } catch (error) {}
  };
  const handleRegenerateImage = async (story: Story) => {
    setIsGeneratingImage(true);
    try {
      const newImageUrl = await generateStoryImage(`${story.title}. ${story.content.substring(0, 50)}`, story.ageGroup);
      if (newImageUrl) {
        const updatedStory = { ...story, imageUrl: newImageUrl };
        await saveStoryToDB(updatedStory);
        setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
        setActiveStory(updatedStory);
      }
    } catch (error) {} finally { setIsGeneratingImage(false); }
  };
  const handleGenerateColoringPage = async (story: Story) => {
    setIsGeneratingColoringPage(true);
    try {
      const coloringUrl = await generateColoringPage(`${story.title}`);
      if (coloringUrl) {
         const updatedStory = { ...story, coloringPageUrl: coloringUrl };
         await saveStoryToDB(updatedStory);
         setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
         setActiveStory(updatedStory);
      }
    } catch (error) {} finally { setIsGeneratingColoringPage(false); }
  };
  const handleDiscoverWord = async (story: Story) => {
    setIsFindingWord(true);
    try {
      const wordCard = await generateWordCard(story.content, lang, story.ageGroup);
      if (wordCard) {
        const updatedStory = { ...story, wordOfTheDay: wordCard };
        await saveStoryToDB(updatedStory);
        setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
        setActiveStory(updatedStory);
      }
    } catch (error) {} finally { setIsFindingWord(false); }
  };
  const handleSaveRecording = async (story: Story, audioUrl: string | null) => {
      const updatedStory = { ...story, audioUrl: audioUrl || undefined };
      await saveStoryToDB(updatedStory);
      setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
      setUserProfile(prev => ({ ...prev, createdStories: prev.createdStories.map(s => s.id === story.id ? updatedStory : s) }));
      setActiveStory(updatedStory);
  };
  const handleSaveAiAudio = async (story: Story, audioUrl: string | null) => {
    const updatedStory = { ...story, aiAudioUrl: audioUrl || undefined };
    await saveStoryToDB(updatedStory);
    setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
    setActiveStory(updatedStory);
  };
  const handleToggleFavorite = () => {
    if (!activeStory) return;
    setUserProfile(prev => {
      const isFav = prev.favorites.includes(activeStory.id);
      return { ...prev, favorites: isFav ? prev.favorites.filter(id => id !== activeStory.id) : [...prev.favorites, activeStory.id] };
    });
  };
  const handleDeleteStory = async (id: string) => {
    await deleteStoryFromDB(id);
    setStories(prev => prev.filter(s => s.id !== id));
    setUserProfile(prev => ({ ...prev, createdStories: prev.createdStories.filter(s => s.id !== id), favorites: prev.favorites.filter(favId => favId !== id) }));
  };
  const readStory = (story: Story) => {
    setActiveStory(story);
    setUserProfile(prev => ({ ...prev, storiesRead: prev.storiesRead + 1 }));
  };

  return (
    <div className={`min-h-screen font-sans ${themeConfig.appBg} transition-colors duration-500`}>
      <header className={`fixed top-0 left-0 right-0 z-40 ${themeConfig.headerBg} border-b`}>
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${themeConfig.primary} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md`}>M</div>
            <h1 className={`text-2xl font-black ${themeConfig.textMain} tracking-tight`}>Masalya</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')} className={`px-3 py-1.5 rounded-xl text-xs font-black ${themeConfig.secondary}`}>{lang.toUpperCase()}</button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className={`p-2.5 rounded-full ${themeConfig.secondary} hover:scale-105 transition-transform`}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
        {view === 'home' && <HomeView stories={stories} lang={lang} onStoryClick={readStory} activeFilter={activeFilter} setActiveFilter={setActiveFilter} t={t} themeConfig={themeConfig} />}
        {view === 'create' && <CreateView onGenerate={handleGenerateStory} isGenerating={isGenerating} t={t} createdStory={lastCreatedStory} onStoryClick={readStory} themeConfig={themeConfig} />}
        {view === 'profile' && <ProfileView user={userProfile} allStories={stories} onStoryClick={readStory} onDeleteStory={handleDeleteStory} onUpdateTheme={handleUpdateTheme} t={t} themeConfig={themeConfig} />}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-40 ${themeConfig.navBg} border-t pb-safe`}>
        <div className="max-w-md mx-auto flex justify-around p-3">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 p-3 w-20 rounded-3xl transition-all duration-300 ${view === 'home' ? `${themeConfig.secondary} ${themeConfig.textMain} scale-110` : 'text-gray-400 hover:text-gray-600'}`}><HomeIcon /><span className="text-[10px] font-black tracking-wide">{t.home}</span></button>
          <button onClick={() => setView('create')} className={`flex flex-col items-center gap-1 p-3 w-20 rounded-3xl transition-all duration-300 ${view === 'create' ? `${themeConfig.secondary} ${themeConfig.textMain} scale-110` : 'text-gray-400 hover:text-gray-600'}`}><SparklesIcon /><span className="text-[10px] font-black tracking-wide">{t.create}</span></button>
          <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 p-3 w-20 rounded-3xl transition-all duration-300 ${view === 'profile' ? `${themeConfig.secondary} ${themeConfig.textMain} scale-110` : 'text-gray-400 hover:text-gray-600'}`}><UserIcon /><span className="text-[10px] font-black tracking-wide">{t.profile}</span></button>
        </div>
      </nav>

      <ReaderModal story={activeStory} onClose={() => setActiveStory(null)} isFavorite={activeStory ? userProfile.favorites.includes(activeStory.id) : false} onToggleFavorite={handleToggleFavorite} onRegenerateImage={handleRegenerateImage} onGenerateColoringPage={handleGenerateColoringPage} onContinueStory={handleContinueStory} onSaveRecording={handleSaveRecording} onSaveAiAudio={handleSaveAiAudio} onDiscoverWord={handleDiscoverWord} isGeneratingImage={isGeneratingImage} isGeneratingColoringPage={isGeneratingColoringPage} isFindingWord={isFindingWord} t={t} themeConfig={themeConfig} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);