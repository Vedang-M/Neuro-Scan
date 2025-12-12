import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Music, Sliders, Type, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppView } from '../types';
import { generateMemoryNarrative } from '../services/geminiService';

interface NarrativeGeneratorProps {
  onBack: () => void;
  context: { images: string[]; themes: string[]; tags: string[] } | null;
}

const NarrativeGenerator: React.FC<NarrativeGeneratorProps> = ({ onBack, context }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState({
    tone: 'Calming' as 'Calming' | 'Engaging',
    duration: 3,
    music: 'Nostalgic'
  });

  // Load context or use placeholders
  const images = context?.images.length ? context.images : [
    'https://picsum.photos/1000/800?random=1',
    'https://picsum.photos/1000/800?random=2',
    'https://picsum.photos/1000/800?random=3'
  ];
  
  const tags = context?.tags || ['Peaceful', 'Garden', 'Family'];

  useEffect(() => {
    // Auto-generate story on mount
    const fetchStory = async () => {
      setIsLoading(true);
      const story = await generateMemoryNarrative(tags, config.tone);
      setGeneratedStory(story);
      setIsLoading(false);
    };
    fetchStory();
  }, [config.tone]);

  // Player logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col animate-fadeIn">
      {/* Header / Controls */}
      <div className="h-16 bg-black/40 backdrop-blur-md flex justify-between items-center px-6 text-white absolute top-0 w-full z-20">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
        </button>
        <h2 className="font-serif text-xl tracking-wide">Memory Session</h2>
        <div className="flex gap-4">
             <div className="hidden md:flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                 <Music size={14} className="text-indigo-300"/>
                 <span className="text-xs font-medium">{config.music} Piano</span>
             </div>
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
         {/* Ken Burns Image Layer */}
         {images.map((img, idx) => (
             <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
             >
                 <img 
                    src={img} 
                    alt="Memory" 
                    className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${idx === currentSlide && isPlaying ? 'scale-110 translate-x-4' : 'scale-100'}`} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
             </div>
         ))}

         {/* Text Overlay */}
         <div className="absolute bottom-32 left-0 right-0 px-8 md:px-32 text-center z-10">
             {isLoading ? (
                 <div className="flex justify-center">
                     <div className="w-2 h-2 bg-white rounded-full animate-bounce mx-1"></div>
                     <div className="w-2 h-2 bg-white rounded-full animate-bounce mx-1 delay-75"></div>
                     <div className="w-2 h-2 bg-white rounded-full animate-bounce mx-1 delay-150"></div>
                 </div>
             ) : (
                 <p className="text-white/90 text-2xl md:text-3xl font-serif leading-relaxed drop-shadow-lg max-w-4xl mx-auto animate-fadeIn">
                     "{generatedStory}"
                 </p>
             )}
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-24 bg-gradient-to-t from-black to-transparent absolute bottom-0 w-full z-20 flex flex-col justify-end pb-8">
          {/* Progress */}
          <div className="w-full h-1 bg-white/20 mb-6">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((currentSlide + 1) / images.length) * 100}%` }}
              ></div>
          </div>

          <div className="flex justify-center items-center gap-8">
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
                className="text-white/70 hover:text-white"
              >
                  <ChevronLeft size={32} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105"
              >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              
              <button 
                 onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
                 className="text-white/70 hover:text-white"
              >
                  <ChevronRight size={32} />
              </button>
          </div>
      </div>
      
      {/* Config Panel (Overlay) */}
      {!isPlaying && !isLoading && (
          <div className="absolute top-20 right-6 w-64 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white z-30 animate-slideIn">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 mb-4 flex items-center gap-2">
                  <Sliders size={14} /> Configuration
              </h3>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs text-slate-300 block mb-2">Narrative Tone</label>
                      <div className="flex bg-white/10 rounded-lg p-1">
                          <button 
                             onClick={() => setConfig({...config, tone: 'Calming'})}
                             className={`flex-1 text-xs py-1.5 rounded-md ${config.tone === 'Calming' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}
                          >
                              Calming
                          </button>
                          <button 
                             onClick={() => setConfig({...config, tone: 'Engaging'})}
                             className={`flex-1 text-xs py-1.5 rounded-md ${config.tone === 'Engaging' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}
                          >
                              Engaging
                          </button>
                      </div>
                  </div>
                  
                   <div>
                      <label className="text-xs text-slate-300 block mb-2 flex items-center justify-between">
                          <span>Music Theme</span>
                          <Music size={12} />
                      </label>
                      <select 
                        className="w-full bg-white/10 border border-white/10 rounded-lg text-sm px-2 py-2 text-white outline-none focus:border-indigo-500"
                        value={config.music}
                        onChange={(e) => setConfig({...config, music: e.target.value})}
                      >
                          <option value="Nostalgic">Nostalgic Piano</option>
                          <option value="Nature">Nature Sounds</option>
                          <option value="Classical">Classical</option>
                      </select>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default NarrativeGenerator;
