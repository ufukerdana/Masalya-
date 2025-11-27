
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Story, UserProfile, Language, Theme, AppView, CATEGORIES, AGE_GROUPS, Translation, StoryOption } from './types';
import { TRANSLATIONS, STATIC_STORIES } from './constants';
import { generateStoryContent, generateStoryImage, continueStory, generateColoringPage, generateWordCard } from './services/geminiService';

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

// --- Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'hero' | 'interactive' | 'danger' | 'magic' | 'orange';
}

const Button = ({ children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-magic-600 hover:bg-magic-700 text-white shadow-lg shadow-magic-500/30",
    secondary: "bg-white dark:bg-night-800 text-magic-700 dark:text-magic-300 border-2 border-magic-200 dark:border-magic-800 hover:border-magic-400",
    ghost: "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-magic-50 dark:hover:bg-white/5",
    hero: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30 hover:scale-105",
    interactive: "bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40",
    magic: "bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105",
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
}

const StoryCard = ({ story, onClick, t }: StoryCardProps) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-night-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group border border-transparent hover:border-magic-300 dark:hover:border-magic-700 relative"
  >
    <div className="relative h-48 overflow-hidden">
      <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {story.isAiGenerated && (
        <div className="absolute top-2 right-2 bg-magic-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm">
          <SparklesIcon /> AI
        </div>
      )}
      {story.isInteractive && (
         <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm">
           <SplitPathIcon />
         </div>
      )}
      {story.audioUrl && (
        <div className="absolute bottom-2 right-2 bg-pink-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm">
          <MicIcon />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md uppercase tracking-wider">
          {t['cat_' + story.category] || story.category}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">{story.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{story.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{story.ageGroup} {t.yearsOld}</span>
        <span>{story.author || 'Masalya'}</span>
      </div>
    </div>
  </div>
);

interface PaintingModalProps {
  imageUrl: string;
  onClose: () => void;
  t: any;
}

const PaintingModal = ({ imageUrl, onClose, t }: PaintingModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const colors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', // Rainbow
    '#000000', '#FFFFFF', '#8B4513', '#FF69B4', '#00CED1'
  ];

  useEffect(() => {
    // Prevent scrolling when touching canvas
    const preventScroll = (e: TouchEvent) => {
      if (e.target === canvasRef.current) e.preventDefault();
    };
    document.body.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.body.removeEventListener('touchmove', preventScroll);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale coordinates to handle potential canvas scaling via CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas to merge image and drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the background image
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Draw the user's artwork on top
      ctx.drawImage(canvas, 0, 0);
      
      const link = document.createElement('a');
      link.download = `masalya-art-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL();
      link.click();
    };
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-night-800 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-magic-100 dark:bg-night-900 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
           <h3 className="font-bold text-lg text-magic-700 dark:text-magic-300 flex items-center gap-2">
             <PaletteIcon /> {t.paintMode}
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full dark:text-white">
             <XIcon />
           </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
            {/* Background Image Layer */}
            <div className="relative w-full h-full max-w-[800px] max-h-[600px] aspect-[4/3] bg-white shadow-lg m-4">
               <img 
                 src={imageUrl} 
                 className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
                 alt="coloring page"
               />
               <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
               />
            </div>
        </div>

        {/* Tools Footer */}
        <div className="p-4 bg-white dark:bg-night-900 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
           {/* Colors */}
           <div className="flex gap-2 overflow-x-auto w-full sm:w-auto p-1 no-scrollbar">
             {colors.map(c => (
               <button
                 key={c}
                 onClick={() => setColor(c)}
                 className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0 ${color === c ? 'border-gray-400 scale-110 shadow-md' : 'border-transparent'}`}
                 style={{ backgroundColor: c }}
               />
             ))}
           </div>

           <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
              {/* Brush Size */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                 <BrushIcon />
                 <input 
                   type="range" 
                   min="1" 
                   max="20" 
                   value={brushSize} 
                   onChange={(e) => setBrushSize(parseInt(e.target.value))}
                   className="w-24 accent-magic-500"
                 />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={clearCanvas} title={t.clearCanvas}>
                  <TrashIcon />
                </Button>
                <Button variant="magic" onClick={saveArtwork} title={t.saveArtwork}>
                  <DownloadIcon />
                </Button>
              </div>
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
  onDiscoverWord: (story: Story) => Promise<void>;
  isGeneratingImage: boolean;
  isGeneratingColoringPage: boolean;
  isFindingWord: boolean;
  t: any 
}

const ReaderModal = ({ story, onClose, isFavorite, onToggleFavorite, onRegenerateImage, onGenerateColoringPage, onContinueStory, onSaveRecording, onDiscoverWord, isGeneratingImage, isGeneratingColoringPage, isFindingWord, t }: ReaderModalProps) => {
  const [isContinuing, setIsContinuing] = useState(false);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const [showPaintingModal, setShowPaintingModal] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(story?.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset state when story changes
    setAudioUrl(story?.audioUrl || null);
    setIsRecording(false);
    setIsPlaying(false);
    setShowPaintingModal(false);
  }, [story]);

  useEffect(() => {
    if (story?.coloringPageUrl && isGeneratingColoringPage === false) {
       // Automatically open if just generated
    }
  }, [story?.coloringPageUrl, isGeneratingColoringPage]);

  useEffect(() => {
    // Scroll to bottom when content updates
    if (contentEndRef.current) {
        contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [story?.content, story?.choices]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (story) onSaveRecording(story, url);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not available.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteRecording = () => {
    setAudioUrl(null);
    if (story) onSaveRecording(story, null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!story) return null;

  const handleChoice = async (choiceText: string) => {
    setIsContinuing(true);
    await onContinueStory(story, choiceText);
    setIsContinuing(false);
  };

  const handlePaintClick = async () => {
    if (story.coloringPageUrl) {
      setShowPaintingModal(true);
    } else {
      await onGenerateColoringPage(story);
      setShowPaintingModal(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-night-800 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 shrink-0 group">
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
            >
              <XIcon />
            </button>
            
            {/* Action Buttons Overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <Button 
                  variant="primary" 
                  onClick={(e) => { e.stopPropagation(); onRegenerateImage(story); }}
                  disabled={isGeneratingImage}
                  className="!text-xs !py-1 !px-3 !rounded-full !bg-white/90 !text-magic-700 hover:!bg-white shadow-sm"
               >
                  {isGeneratingImage ? t.painting : (
                    <> <SparklesIcon /> {t.createMagicImage} </>
                  )}
               </Button>
               
               <Button 
                  variant="primary" 
                  onClick={(e) => { e.stopPropagation(); handlePaintClick(); }}
                  disabled={isGeneratingColoringPage}
                  className="!text-xs !py-1 !px-3 !rounded-full !bg-white/90 !text-pink-600 hover:!bg-white shadow-sm"
               >
                  {isGeneratingColoringPage ? t.preparingCanvas : (
                    <> <PaletteIcon /> {t.createColoringPage} </>
                  )}
               </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-night-800 to-transparent pt-20">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{story.title}</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1 pb-24">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-magic-100 dark:bg-magic-900/30 text-magic-700 dark:text-magic-300 rounded-full text-xs font-bold uppercase tracking-wide">
                  {t['cat_' + story.category] || story.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">
                  {story.ageGroup} {t.yearsOld}
                </span>
                {story.isInteractive && (
                   <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                     <SplitPathIcon /> {t.interactiveMode}
                   </span>
                )}
              </div>
              <button onClick={onToggleFavorite} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <HeartIcon filled={isFavorite} />
              </button>
            </div>
            
            <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-loose font-sans">
               {story.content.split('\n').map((paragraph, idx) => (
                 paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
               ))}
            </div>

            {/* Word of the Day Card */}
            <div className="mt-8 animate-in slide-in-from-bottom-4">
              {story.wordOfTheDay ? (
                 <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full blur-xl opacity-50"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400 font-bold text-sm uppercase tracking-wider">
                         <LightbulbIcon /> {t.wordOfTheDay}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{story.wordOfTheDay.word}</h4>
                      <p className="text-gray-700 dark:text-gray-300 italic mb-3">"{story.wordOfTheDay.definition}"</p>
                      <div className="bg-white dark:bg-night-900/50 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                        {story.wordOfTheDay.example}
                      </div>
                    </div>
                 </div>
              ) : (
                <div className="flex justify-center">
                   <Button 
                     variant="orange" 
                     onClick={() => onDiscoverWord(story)} 
                     disabled={isFindingWord}
                   >
                     {isFindingWord ? (
                       <><span className="animate-spin">✨</span> {t.findingWord}</>
                     ) : (
                       <><LightbulbIcon /> {t.discoverWord}</>
                     )}
                   </Button>
                </div>
              )}
            </div>

            {/* Interactive Choices */}
            {story.isInteractive && story.choices && story.choices.length > 0 && (
               <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-bottom-4">
                  <h4 className="text-center text-emerald-800 dark:text-emerald-300 font-bold mb-4">{t.makeAChoice}</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {isContinuing ? (
                        <div className="text-center text-emerald-600 dark:text-emerald-400 py-4 flex items-center justify-center gap-2">
                           <span className="animate-spin">✨</span> {t.continuingStory}
                        </div>
                     ) : (
                        story.choices.map((choice, idx) => (
                          <button 
                             key={idx}
                             onClick={() => handleChoice(choice.text)}
                             className="p-4 bg-white dark:bg-night-900 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all text-left text-gray-800 dark:text-white font-medium"
                          >
                             {choice.text}
                          </button>
                        ))
                     )}
                  </div>
               </div>
            )}

            <div ref={contentEndRef} />

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-400">
              {story.isInteractive && story.choices && story.choices.length > 0 ? '' : t.endOfStory} • Masalya
            </div>
          </div>

          {/* Voice Recorder Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-night-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4 w-full">
              {audioUrl ? (
                <div className="flex items-center gap-3 w-full animate-in slide-in-from-bottom-2">
                   <button 
                     onClick={togglePlayback}
                     className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                   >
                     {isPlaying ? <PauseIcon /> : <PlayIcon />}
                   </button>
                   <div className="flex-1">
                     <p className="text-xs text-gray-400 mb-1 font-bold uppercase">{t.listenToStory}</p>
                     <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full overflow-hidden">
                       <div className={`h-full bg-pink-500 rounded-full transition-all duration-300 ${isPlaying ? 'w-full animate-[pulse_2s_infinite]' : 'w-0'}`}></div>
                     </div>
                   </div>
                   <button 
                     onClick={handleDeleteRecording}
                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                     title={t.deleteRecording}
                   >
                     <TrashIcon />
                   </button>
                   <audio 
                      ref={audioPlayerRef} 
                      src={audioUrl} 
                      onEnded={() => setIsPlaying(false)} 
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                    />
                </div>
              ) : (
                 <div className="flex items-center justify-between w-full">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-pink-100 dark:bg-pink-900/20 text-pink-500 rounded-full">
                       <HeadphonesIcon />
                     </div>
                     <div className="text-sm text-gray-600 dark:text-gray-300">
                       {isRecording ? (
                         <span className="text-pink-500 font-bold animate-pulse">{t.recording}</span>
                       ) : (
                         <span>{t.voiceFeatureDesc}</span>
                       )}
                     </div>
                   </div>
                   
                   {isRecording ? (
                      <button 
                        onClick={handleStopRecording}
                        className="px-6 py-2 rounded-full bg-red-500 text-white font-bold text-sm shadow-md hover:bg-red-600 transition-colors flex items-center gap-2 animate-pulse"
                      >
                        <StopIcon /> {t.stopRecording}
                      </button>
                   ) : (
                      <button 
                        onClick={handleStartRecording}
                        className="px-6 py-2 rounded-full bg-pink-500 text-white font-bold text-sm shadow-md hover:bg-pink-600 transition-colors flex items-center gap-2"
                      >
                        <MicIcon /> {t.recordVoice}
                      </button>
                   )}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showPaintingModal && story.coloringPageUrl && (
        <PaintingModal 
          imageUrl={story.coloringPageUrl} 
          onClose={() => setShowPaintingModal(false)}
          t={t}
        />
      )}
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
}

const HomeView = ({ stories, lang, onStoryClick, activeFilter, setActiveFilter, t }: HomeViewProps) => {
  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchLang = s.language === lang;
      const matchFilter = activeFilter === 'all' || s.category === activeFilter || s.ageGroup === activeFilter;
      return matchLang && matchFilter;
    });
  }, [stories, lang, activeFilter]);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-magic-500 to-purple-600 rounded-3xl text-white shadow-lg shadow-magic-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl"></div>
        
        <h2 className="text-2xl font-bold mb-2 relative z-10">{t.welcome}</h2>
        <p className="text-magic-100 relative z-10">{t.welcomeDesc}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeFilter === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-night-800 text-gray-600 dark:text-gray-400'}`}
          >
            {t.allAges}
          </button>
          {Object.values(CATEGORIES).map(cat => (
             <button 
             key={cat}
             onClick={() => setActiveFilter(cat)}
             className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold capitalize transition-colors ${activeFilter === cat ? 'bg-magic-600 text-white' : 'bg-white dark:bg-night-800 text-gray-600 dark:text-gray-400'}`}
           >
             {t['cat_' + cat] || cat}
           </button>
          ))}
           {Object.values(AGE_GROUPS).map(age => (
             <button 
             key={age}
             onClick={() => setActiveFilter(age)}
             className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeFilter === age ? 'bg-teal-500 text-white' : 'bg-white dark:bg-night-800 text-gray-600 dark:text-gray-400'}`}
           >
             {age}
           </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map(story => (
          <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story)} t={t} />
        ))}
      </div>
      
      {filteredStories.length === 0 && (
         <div className="text-center py-20 text-gray-400">
           <BookOpenIcon />
           <p className="mt-4">{t.noStoriesYet}</p>
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
}

const CreateView = ({ onGenerate, isGenerating, t, createdStory, onStoryClick }: CreateViewProps) => {
  const [prompt, setPrompt] = useState('');
  const [age, setAge] = useState<string>(AGE_GROUPS.KID);
  const [isInteractive, setIsInteractive] = useState(false);
  
  // Hero Mode State
  const [isHeroMode, setIsHeroMode] = useState(false);
  const [heroName, setHeroName] = useState('');
  const [heroToy, setHeroToy] = useState('');
  const [heroPlace, setHeroPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isHeroMode) {
      if (heroName.trim()) {
        const heroPrompt = `A story where the main character is a child named ${heroName}. They have a favorite item/toy: ${heroToy || 'a magical toy'}. The story takes place at: ${heroPlace || 'a magical land'}.`;
        onGenerate(heroPrompt, age, isInteractive);
      }
    } else {
      if (prompt.trim()) {
        onGenerate(prompt, age, isInteractive);
      }
    }
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-magic-100 dark:bg-magic-900/30 rounded-2xl mb-4 text-magic-600 dark:text-magic-400">
          <SparklesIcon />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.createTitle}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.createDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-night-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        {/* Toggle Hero Mode */}
        <div className="mb-4">
           <button
             type="button"
             onClick={() => setIsHeroMode(!isHeroMode)}
             className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${isHeroMode ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-magic-200'}`}
           >
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${isHeroMode ? 'bg-yellow-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                 <StarIcon filled={true} />
               </div>
               <div className="text-left">
                 <h3 className={`font-bold ${isHeroMode ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                   {t.heroMode}
                 </h3>
                 <p className="text-xs text-gray-400">{t.heroModeDesc}</p>
               </div>
             </div>
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isHeroMode ? 'border-yellow-400' : 'border-gray-300'}`}>
               {isHeroMode && <div className="w-3 h-3 rounded-full bg-yellow-400" />}
             </div>
           </button>
        </div>

        {/* Toggle Interactive Mode */}
        <div className="mb-6">
           <button
             type="button"
             onClick={() => setIsInteractive(!isInteractive)}
             className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${isInteractive ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-magic-200'}`}
           >
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${isInteractive ? 'bg-emerald-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                 <SplitPathIcon />
               </div>
               <div className="text-left">
                 <h3 className={`font-bold ${isInteractive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                   {t.interactiveMode}
                 </h3>
                 <p className="text-xs text-gray-400">{t.interactiveModeDesc}</p>
               </div>
             </div>
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isInteractive ? 'border-emerald-400' : 'border-gray-300'}`}>
               {isInteractive && <div className="w-3 h-3 rounded-full bg-emerald-400" />}
             </div>
           </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.ageGroup}</label>
          <div className="flex gap-2">
            {Object.values(AGE_GROUPS).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAge(a)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${age === a ? 'bg-magic-600 text-white shadow-lg shadow-magic-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {isHeroMode ? (
          <div className="space-y-4 mb-6 animate-in fade-in duration-300">
             <div>
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.heroNameLabel}</label>
               <input
                 type="text"
                 value={heroName}
                 onChange={(e) => setHeroName(e.target.value)}
                 placeholder={t.heroNamePlaceholder}
                 className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-yellow-400 focus:bg-white dark:focus:bg-black/40 outline-none transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.heroToyLabel}</label>
               <input
                 type="text"
                 value={heroToy}
                 onChange={(e) => setHeroToy(e.target.value)}
                 placeholder={t.heroToyPlaceholder}
                 className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-yellow-400 focus:bg-white dark:focus:bg-black/40 outline-none transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.heroPlaceLabel}</label>
               <input
                 type="text"
                 value={heroPlace}
                 onChange={(e) => setHeroPlace(e.target.value)}
                 placeholder={t.heroPlacePlaceholder}
                 className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-yellow-400 focus:bg-white dark:focus:bg-black/40 outline-none transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
               />
             </div>
          </div>
        ) : (
          <div className="mb-6 animate-in fade-in duration-300">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-magic-500 focus:bg-white dark:focus:bg-black/40 outline-none transition-all resize-none h-32 text-gray-800 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        )}

        <Button 
          type="submit" 
          variant={isHeroMode ? 'hero' : (isInteractive ? 'interactive' : 'primary')}
          disabled={isGenerating || (isHeroMode ? !heroName.trim() : !prompt.trim())} 
          className="w-full py-4 text-lg"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">✨</span> {t.generating}
            </>
          ) : (
            <>
              {isInteractive ? <SplitPathIcon /> : <SparklesIcon />} {t.generateBtn}
            </>
          )}
        </Button>
      </form>

      {createdStory && !isGenerating && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t.generated}</h3>
          <StoryCard story={createdStory} onClick={() => onStoryClick(createdStory)} t={t} />
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
  t: any;
}

const ProfileView = ({ user, allStories, onStoryClick, onDeleteStory, t }: ProfileViewProps) => {
  const favorites = allStories.filter(s => user.favorites.includes(s.id));
  const created = user.createdStories;

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-magic-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.storiesRead} {t.storiesRead}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Created Stories */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon /> {t.myStories}
          </h3>
          {created.length > 0 ? (
            <div className="space-y-4">
              {created.map(story => (
                <div key={story.id} className="flex gap-4 p-3 bg-white dark:bg-night-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <img src={story.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 dark:text-white truncate">{story.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{story.content}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => onStoryClick(story)} className="text-xs font-bold text-magic-600 hover:underline">{t.readNow}</button>
                      <button onClick={() => onDeleteStory(story.id)} className="text-xs font-bold text-red-500 hover:underline">{t.delete}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-500 mb-2">{t.noStoriesYet}</p>
               <p className="text-magic-500 text-sm font-bold">{t.tryCreating}</p>
             </div>
          )}
        </section>

        {/* Favorites */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <HeartIcon filled={true} /> {t.favorites}
          </h3>
          {favorites.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {favorites.map(story => (
               <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story)} t={t} />
             ))}
           </div>
          ) : (
            <p className="text-gray-500 italic">{t.noStoriesYet}</p>
          )}
        </section>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [lang, setLang] = useState<Language>('tr');
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<AppView>('home');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  
  // Data State
  const [generatedStories, setGeneratedStories] = useState<Story[]>([]);
  const [updatedStaticStories, setUpdatedStaticStories] = useState<Record<string, Story>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Küçük Okur',
    storiesRead: 12,
    favorites: [],
    createdStories: []
  });

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingColoringPage, setIsGeneratingColoringPage] = useState(false);
  const [isFindingWord, setIsFindingWord] = useState(false);
  const [lastCreatedStory, setLastCreatedStory] = useState<Story | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const t = TRANSLATIONS[lang];
  
  // Merge static stories (with potential updates) and generated stories
  const allStories = useMemo(() => {
    const staticList = STATIC_STORIES.map(s => updatedStaticStories[s.id] || s);
    return [...staticList, ...generatedStories];
  }, [updatedStaticStories, generatedStories]);

  // Initialize Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handlers
  const handleGenerateStory = async (prompt: string, age: string, isInteractive: boolean) => {
    setIsGenerating(true);
    setLastCreatedStory(null);
    try {
      const result = await generateStoryContent(prompt, lang, age, isInteractive);
      if (result) {
        const newStory: Story = {
          id: `gen_${Date.now()}`,
          title: result.title,
          content: result.content,
          category: CATEGORIES.FANTASY, // Default for generated
          ageGroup: age,
          imageUrl: result.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
          isAiGenerated: true,
          author: 'AI Storyteller',
          language: lang,
          createdAt: Date.now(),
          isInteractive: isInteractive,
          choices: result.choices,
          wordOfTheDay: result.wordOfTheDay
        };
        
        setGeneratedStories(prev => [newStory, ...prev]);
        setUserProfile(prev => ({
          ...prev,
          createdStories: [newStory, ...prev.createdStories]
        }));
        setLastCreatedStory(newStory);
      }
    } catch (error) {
      alert("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueStory = async (story: Story, choice: string) => {
    try {
      const result = await continueStory(story.content, choice, lang, story.ageGroup);
      if (result) {
        const updatedStory = {
          ...story,
          content: story.content + "\n\n" + result.content,
          choices: result.choices // Replace choices with new ones or empty
        };
        
        // Update in generated stories list
        setGeneratedStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
        
        // Update currently active view
        setActiveStory(updatedStory);
      }
    } catch (error) {
      console.error("Failed to continue story", error);
    }
  };

  const handleRegenerateImage = async (story: Story) => {
    setIsGeneratingImage(true);
    try {
      // Use story title and a bit of content for context
      const prompt = `${story.title}. ${story.content.substring(0, 50)}`;
      const newImageUrl = await generateStoryImage(prompt, story.ageGroup);
      
      if (newImageUrl) {
        const updatedStory = { ...story, imageUrl: newImageUrl };
        
        if (story.id.startsWith('gen_')) {
          // Update generated stories
          setGeneratedStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
          setLastCreatedStory(current => current?.id === story.id ? updatedStory : current);
        } else {
          // Update static stories override map
          setUpdatedStaticStories(prev => ({ ...prev, [story.id]: updatedStory }));
        }
        
        // Update active story view immediately
        setActiveStory(updatedStory);
      }
    } catch (error) {
      console.error("Failed to regen image", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateColoringPage = async (story: Story) => {
    setIsGeneratingColoringPage(true);
    try {
      const prompt = `${story.title}. Main character and scene.`;
      const coloringUrl = await generateColoringPage(prompt);
      
      if (coloringUrl) {
         const updatedStory = { ...story, coloringPageUrl: coloringUrl };
         
         if (story.id.startsWith('gen_')) {
           setGeneratedStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
         } else {
           setUpdatedStaticStories(prev => ({ ...prev, [story.id]: updatedStory }));
         }
         setActiveStory(updatedStory);
      }
    } catch (error) {
       console.error("Failed to generate coloring page", error);
    } finally {
      setIsGeneratingColoringPage(false);
    }
  };

  const handleDiscoverWord = async (story: Story) => {
    setIsFindingWord(true);
    try {
      const wordCard = await generateWordCard(story.content, lang, story.ageGroup);
      if (wordCard) {
        const updatedStory = { ...story, wordOfTheDay: wordCard };
        
        if (story.id.startsWith('gen_')) {
          setGeneratedStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
        } else {
          setUpdatedStaticStories(prev => ({ ...prev, [story.id]: updatedStory }));
        }
        setActiveStory(updatedStory);
      }
    } catch (error) {
      console.error("Failed to generate word card", error);
    } finally {
      setIsFindingWord(false);
    }
  };

  const handleSaveRecording = (story: Story, audioUrl: string | null) => {
      const updatedStory = { ...story, audioUrl: audioUrl || undefined };
      
      if (story.id.startsWith('gen_')) {
          setGeneratedStories(prev => prev.map(s => s.id === story.id ? updatedStory : s));
          // Also update created stories in profile
          setUserProfile(prev => ({
              ...prev,
              createdStories: prev.createdStories.map(s => s.id === story.id ? updatedStory : s)
          }));
      } else {
          setUpdatedStaticStories(prev => ({ ...prev, [story.id]: updatedStory }));
      }
      setActiveStory(updatedStory);
  };

  const handleToggleFavorite = () => {
    if (!activeStory) return;
    setUserProfile(prev => {
      const isFav = prev.favorites.includes(activeStory.id);
      return {
        ...prev,
        favorites: isFav 
          ? prev.favorites.filter(id => id !== activeStory.id)
          : [...prev.favorites, activeStory.id]
      };
    });
  };

  const handleDeleteStory = (id: string) => {
    setGeneratedStories(prev => prev.filter(s => s.id !== id));
    setUserProfile(prev => ({
      ...prev,
      createdStories: prev.createdStories.filter(s => s.id !== id),
      favorites: prev.favorites.filter(favId => favId !== id) // Remove from favs too if deleted
    }));
  };

  const readStory = (story: Story) => {
    setActiveStory(story);
    setUserProfile(prev => ({ ...prev, storiesRead: prev.storiesRead + 1 }));
  };

  return (
    <div className="min-h-screen font-sans bg-magic-50 dark:bg-night-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-night-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-magic-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
            <h1 className="text-xl font-bold text-magic-800 dark:text-white tracking-tight">Masalya</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')}
              className="px-2 py-1 rounded-md text-sm font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200"
            >
              {lang.toUpperCase()}
            </button>
            <button 
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
        {view === 'home' && (
          <HomeView 
            stories={allStories} 
            lang={lang} 
            onStoryClick={readStory}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            t={t}
          />
        )}
        {view === 'create' && (
          <CreateView 
            onGenerate={handleGenerateStory} 
            isGenerating={isGenerating} 
            t={t}
            createdStory={lastCreatedStory}
            onStoryClick={readStory}
          />
        )}
        {view === 'profile' && (
          <ProfileView 
            user={userProfile} 
            allStories={allStories} 
            onStoryClick={readStory}
            onDeleteStory={handleDeleteStory}
            t={t}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-night-900 border-t border-gray-100 dark:border-gray-800 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button 
            onClick={() => setView('home')} 
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-2xl transition-colors ${view === 'home' ? 'text-magic-600 dark:text-magic-400 bg-magic-50 dark:bg-white/5' : 'text-gray-400'}`}
          >
            <HomeIcon />
            <span className="text-[10px] font-bold">{t.home}</span>
          </button>
          
          <button 
            onClick={() => setView('create')} 
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-2xl transition-colors ${view === 'create' ? 'text-magic-600 dark:text-magic-400 bg-magic-50 dark:bg-white/5' : 'text-gray-400'}`}
          >
            <SparklesIcon />
            <span className="text-[10px] font-bold">{t.create}</span>
          </button>
          
          <button 
            onClick={() => setView('profile')} 
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-2xl transition-colors ${view === 'profile' ? 'text-magic-600 dark:text-magic-400 bg-magic-50 dark:bg-white/5' : 'text-gray-400'}`}
          >
            <UserIcon />
            <span className="text-[10px] font-bold">{t.profile}</span>
          </button>
        </div>
      </nav>

      {/* Reading Modal */}
      <ReaderModal 
        story={activeStory} 
        onClose={() => setActiveStory(null)} 
        isFavorite={activeStory ? userProfile.favorites.includes(activeStory.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onRegenerateImage={handleRegenerateImage}
        onGenerateColoringPage={handleGenerateColoringPage}
        onContinueStory={handleContinueStory}
        onSaveRecording={handleSaveRecording}
        onDiscoverWord={handleDiscoverWord}
        isGeneratingImage={isGeneratingImage}
        isGeneratingColoringPage={isGeneratingColoringPage}
        isFindingWord={isFindingWord}
        t={t}
      />

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
