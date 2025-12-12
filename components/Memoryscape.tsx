import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Smile, MapPin, Play, Loader2, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppView } from '../types';
import { generateAnalysisSummary, analyzeMemoryCollection } from '../services/geminiService';

interface MemoryscapeProps {
  onChangeView: (view: AppView) => void;
  setGeneratedStoryContext: (data: any) => void;
}

const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24'];

const Memoryscape: React.FC<MemoryscapeProps> = ({ onChangeView, setGeneratedStoryContext }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsAnalyzing(true);
      setAiSummary("");
      setAnalysisResults(null);
      
      const files = Array.from(e.target.files) as File[];
      
      try {
        const base64Promises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const base64Images = await Promise.all(base64Promises);
        
        // Append to existing images for display
        setImages(prev => [...prev, ...base64Images]);
        
        // Analyze the NEW images using Gemini
        const results = await analyzeMemoryCollection(base64Images);
        
        if (results) {
             setAnalysisResults(results);
             const summary = await generateAnalysisSummary(results.themes, results.emotions);
             setAiSummary(summary);
        }

      } catch (err) {
          console.error("Error processing files", err);
      } finally {
          setIsAnalyzing(false);
      }
    }
  };

  const startSession = () => {
    setGeneratedStoryContext({
        images: images.length > 0 ? images : [
            'https://picsum.photos/800/600?random=101',
            'https://picsum.photos/800/600?random=102',
            'https://picsum.photos/800/600?random=103'
        ],
        themes: analysisResults?.themes || ['Family', 'Love'],
        tags: ['Sunny', 'Laughter', 'Together']
    });
    onChangeView(AppView.NARRATIVE);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Memoryscape</h2>
          <p className="text-slate-500 mt-1">AI-powered photo analysis & timeline reconstruction</p>
        </div>
        <button 
           onClick={startSession}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2 transition-all"
        >
            <Play size={20} fill="currentColor" />
            Generate Memory Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Upload & Grid */}
        <div className="lg:col-span-2 space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center text-slate-400">
                    <Upload size={48} className="mb-4 text-slate-300" />
                    <p className="font-medium text-slate-600">Drag photos here or click to upload</p>
                    <p className="text-sm mt-2">Support for JPG, PNG (Max 10 files)</p>
                </div>
            </div>

            {isAnalyzing && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center gap-3 text-indigo-600">
                    <Loader2 className="animate-spin" />
                    <span className="font-medium">Analyzing visual patterns and extracting memories...</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length === 0 ? (
                    // Empty State Placeholders
                    [1,2,3].map(i => (
                        <div key={i} className="aspect-[4/3] bg-slate-100 rounded-xl flex items-center justify-center">
                            <ImageIcon className="text-slate-300" size={32} />
                        </div>
                    ))
                ) : (
                    images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm aspect-[4/3]">
                            <img src={img} alt="Memory" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <span className="text-white text-xs font-medium px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                                    Detected
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Right Col: Analysis */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2">
                    <Smile size={20} className="text-teal-500" />
                    Emotional Resonance
                </h3>
                <div className="h-48 w-full relative">
                    {analysisResults ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={analysisResults.emotions}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analysisResults.emotions.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                            Upload photos to see analysis
                        </div>
                    )}
                    {analysisResults && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-700">100%</span>
                        </div>
                    )}
                </div>
                {analysisResults && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {analysisResults.emotions.map((e: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                                {e.name} ({e.value}%)
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-indigo-500" />
                    Contextual Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysisResults ? (
                        analysisResults.themes.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400 text-sm">No context available yet.</span>
                    )}
                </div>
            </div>
            
             <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                 <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <Sparkles size={16} className="text-indigo-500" />
                     Generative Summary
                 </h3>
                 <div className="text-sm text-slate-700 leading-relaxed italic">
                     {aiSummary ? (
                         `"${aiSummary}"`
                     ) : (
                         <span className="text-slate-400 not-italic">Upload images to generate a narrative summary.</span>
                     )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Memoryscape;