
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Story, UserProfile, Language, Theme, AppView, CATEGORIES, AGE_GROUPS, Translation } from './types';
import { TRANSLATIONS, STATIC_STORIES } from './constants';
import { generateStoryContent, generateStoryImage } from './services/geminiService';

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
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-magic-600 hover:bg-magic-700 text-white shadow-lg shadow-magic-500/30",
    secondary: "bg-white dark:bg-night-800 text-magic-700 dark:text-magic-300 border-2 border-magic-200 dark:border-magic-800 hover:border-magic-400",
    ghost: "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-magic-50 dark:hover:bg-white/5",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const StoryCard: React.FC<{ story: Story; onClick: () => void; t: any }> = ({ story, onClick, t }) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-night-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group border border-transparent hover:border-magic-300 dark:hover:border-magic-700"
  >
    <div className="relative h-48 overflow-hidden">
      <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {story.isAiGenerated && (
        <div className="absolute top-2 right-2 bg-magic-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <SparklesIcon /> AI
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md uppercase tracking-wider">
          {t[`cat_${story.category}`] || story.category}
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

const ReaderModal: React.FC<{ 
  story: Story | null; 
  onClose: () => void; 
  isFavorite: boolean; 
  onToggleFavorite: () => void;
  onRegenerateImage: (story: Story) => Promise<void>;
  isGeneratingImage: boolean;
  t: any 
}> = ({ story, onClose, isFavorite, onToggleFavorite, onRegenerateImage, isGeneratingImage, t }) => {
  if (!story) return null;

  return (
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
          
          {/* Magic Image Button */}
          <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button 
                variant="primary" 
                onClick={(e) => { e.stopPropagation(); onRegenerateImage(story); }}
                disabled={isGeneratingImage}
                className="!text-xs !py-1 !px-3 !rounded-full !bg-white/90 !text-magic-700 hover:!bg-white"
             >
                {isGeneratingImage ? t.painting : t.createMagicImage}
             </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-night-800 to-transparent pt-20">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{story.title}</h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-magic-100 dark:bg-magic-900/30 text-magic-700 dark:text-magic-300 rounded-full text-xs font-bold uppercase tracking-wide">
                {t[`cat_${story.category}`] || story.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">
                {story.ageGroup} {t.yearsOld}
              </span>
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

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-400">
            {t.endOfStory} • Masalya
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Views ---

const HomeView: React.FC<{ 
  stories: Story[]; 
  lang: Language; 
  onStoryClick: (s: Story) => void;
  activeFilter: string;
  setActiveFilter: (c: string) => void;
  t: any; 
}> = ({ stories, lang, onStoryClick, activeFilter, setActiveFilter, t }) => {
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
             {t[`cat_${cat}`] || cat}
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

const CreateView: React.FC<{ 
  onGenerate: (prompt: string, age: string) => Promise<void>; 
  isGenerating: boolean; 
  t: any;
  createdStory: Story | null;
  onStoryClick: (s: Story) => void;
}> = ({ onGenerate, isGenerating, t, createdStory, onStoryClick }) => {
  const [prompt, setPrompt] = useState('');
  const [age, setAge] = useState<string>(AGE_GROUPS.KID);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, age);
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

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-magic-500 focus:bg-white dark:focus:bg-black/40 outline-none transition-all resize-none h-32 text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isGenerating || !prompt.trim()} 
          className="w-full py-4 text-lg"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">✨</span> {t.generating}
            </>
          ) : (
            <>
              <SparklesIcon /> {t.generateBtn}
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

const ProfileView: React.FC<{ 
  user: UserProfile; 
  allStories: Story[]; 
  onStoryClick: (s: Story) => void; 
  onDeleteStory: (id: string) => void;
  t: any;
}> = ({ user, allStories, onStoryClick, onDeleteStory, t }) => {
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

const App: React.FC = () => {
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
  const handleGenerateStory = async (prompt: string, age: string) => {
    setIsGenerating(true);
    setLastCreatedStory(null);
    try {
      const result = await generateStoryContent(prompt, lang, age);
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
          createdAt: Date.now()
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
        isGeneratingImage={isGeneratingImage}
        t={t}
      />

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);