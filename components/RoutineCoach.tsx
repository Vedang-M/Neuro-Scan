import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Sun, Moon, Coffee, BookOpen, Music, Users, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { generateAdaptiveRoutine } from '../services/geminiService';

interface Props {
  assessmentScore: number;
  recentIssues?: string[];
}

const RoutineCoach: React.FC<Props> = ({ assessmentScore, recentIssues = [] }) => {
  const [routine, setRoutine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRoutine();
  }, [assessmentScore]);

  const generateRoutine = async () => {
    setIsLoading(true);
    const result = await generateAdaptiveRoutine(assessmentScore, recentIssues);
    setRoutine(result);
    setIsLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'physical': return <Sun className="text-orange-500" />;
      case 'cognitive': return <BookOpen className="text-indigo-500" />;
      case 'calming': return <Music className="text-teal-500" />;
      case 'social': return <Users className="text-pink-500" />;
      default: return <Coffee className="text-slate-500" />;
    }
  };

  const getIntensityColor = () => {
      if (assessmentScore < 60) return "from-orange-50 to-orange-100 border-orange-200 text-orange-800";
      if (assessmentScore > 80) return "from-green-50 to-green-100 border-green-200 text-green-800";
      return "from-blue-50 to-blue-100 border-blue-200 text-blue-800";
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Adaptive Routine Coach</h2>
          <p className="text-slate-500 mt-1">Daily schedule optimized by cognitive metrics</p>
        </div>
        <div className="flex gap-3">
             <div className="text-right">
                 <p className="text-xs text-slate-400 font-bold uppercase">Based on Score</p>
                 <p className="text-lg font-bold text-indigo-600">{assessmentScore}/100</p>
             </div>
             <button onClick={generateRoutine} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                 <RefreshCcw size={20} />
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strategy Card */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
               <div className={`p-4 rounded-full bg-gradient-to-br ${getIntensityColor()} border`}>
                   <BrainIcon size={32} />
               </div>
               <div className="flex-1">
                   <h3 className="font-bold text-lg text-slate-800 mb-1">
                       Today's Focus: {isLoading ? "Analyzing..." : (routine?.focus || "Balanced Maintenance")}
                   </h3>
                   <p className="text-slate-500 text-sm">
                       {assessmentScore < 60 
                           ? "Detected recent difficulty. Schedule adjusted for reduced cognitive load and increased familiarity."
                           : "Cognitive performance is stable. Routine includes moderate challenges to maintain neuroplasticity."
                       }
                   </p>
               </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <p>Generating personalized schedule...</p>
                  </div>
              ) : (
                  routine?.schedule?.map((item: any, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
                          <div className="w-16 text-center">
                              <span className="block font-bold text-slate-800">{item.time}</span>
                              <span className="text-xs text-slate-400">{item.duration}m</span>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              {getIcon(item.type)}
                          </div>
                          <div className="flex-1">
                              <h4 className="font-semibold text-slate-700">{item.activity}</h4>
                              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{item.type}</p>
                          </div>
                          <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg">
                              <ArrowRight size={20} />
                          </button>
                      </div>
                  ))
              )}
          </div>

          {/* Stats / Legend */}
          <div className="space-y-6">
               <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                   <h4 className="font-bold mb-4 flex items-center gap-2">
                       <Clock size={18} /> Routine Balance
                   </h4>
                   <div className="space-y-4">
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-300">
                               <span>Cognitive</span>
                               <span>30%</span>
                           </div>
                           <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 w-[30%]"></div>
                           </div>
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-300">
                               <span>Physical</span>
                               <span>25%</span>
                           </div>
                           <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-orange-500 w-[25%]"></div>
                           </div>
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-300">
                               <span>Rest/Calm</span>
                               <span>45%</span>
                           </div>
                           <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-teal-500 w-[45%]"></div>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <h4 className="font-semibold text-slate-700 mb-2">Clinician Note</h4>
                   <p className="text-sm text-slate-500">
                       Routine adherence is currently <strong className="text-green-600">High (85%)</strong>. 
                       Consider increasing duration of afternoon music therapy if agitation persists.
                   </p>
               </div>
          </div>
      </div>
    </div>
  );
};

const BrainIcon = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
)

export default RoutineCoach;