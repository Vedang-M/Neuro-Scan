import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { AlertTriangle, TrendingUp, Brain, Calendar } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const data = [
  { name: 'Mon', score: 82 },
  { name: 'Tue', score: 85 },
  { name: 'Wed', score: 81 },
  { name: 'Thu', score: 78 },
  { name: 'Fri', score: 84 },
  { name: 'Sat', score: 86 },
  { name: 'Sun', score: 85 },
];

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Good Morning, Robert</h2>
          <p className="text-slate-500 mt-1">Daily overview and cognitive health status</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">December 12, 2025</p>
          <p className="text-xl font-bold text-indigo-600">10:18 AM</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Agitation Prediction Card */}
        <div 
          onClick={() => onChangeView(AppView.AGITATION)}
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <AlertTriangle className="text-yellow-400" size={24} />
            </div>
            <span className="bg-red-500/20 text-red-200 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">
              HIGH RISK
            </span>
          </div>
          <div className="mb-4">
            <span className="text-5xl font-bold">70%</span>
            <span className="text-sm text-indigo-200 ml-2">Agitation Probability</span>
          </div>
          <div className="text-sm text-indigo-200/80 mb-4">
            Key factors: Recent sleep disruption, elevated heart rate variability.
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 w-[70%]"></div>
          </div>
        </div>

        {/* Cognitive Stability Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 p-2 rounded-lg">
                <Brain className="text-teal-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Cognitive Stability</h3>
            </div>
            <TrendingUp className="text-teal-500" size={20} />
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center">Stable trend over last 7 days</p>
        </div>

        {/* Quick Actions / Routine */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-slate-700">Up Next</h3>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-center w-12">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Now</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-800">Memory Session</h4>
                        <p className="text-xs text-slate-500">Scheduled: 10:30 AM</p>
                    </div>
                    <button 
                        onClick={() => onChangeView(AppView.MEMORYSCAPE)}
                        className="ml-auto bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700"
                    >
                        Start
                    </button>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                    <div className="text-center w-12">
                        <span className="block text-xs text-slate-400 font-bold uppercase">12:00</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-800">Lunch & Meds</h4>
                        <p className="text-xs text-slate-500">Nutrition + Donepezil</p>
                    </div>
                </div>
            </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => onChangeView(AppView.ASSESSMENTS)}
                  className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    View Routine Coach &rarr;
                </button>
            </div>
        </div>
      </div>
      
      {/* Additional Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
             { label: 'Sleep Quality', val: '6.5h', sub: '-10% vs avg', color: 'text-orange-500' },
             { label: 'Social Interactions', val: 'High', sub: '3 family calls', color: 'text-green-500' },
             { label: 'Physical Activity', val: '1,240', sub: 'Steps taken', color: 'text-blue-500' },
             { label: 'Mood Index', val: 'Neutral', sub: 'Last check-in', color: 'text-slate-500' },
         ].map((stat, idx) => (
             <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                 <p className="text-xs text-slate-400 font-medium uppercase">{stat.label}</p>
                 <p className="text-2xl font-bold text-slate-800 mt-1">{stat.val}</p>
                 <p className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</p>
             </div>
         ))}
      </div>
    </div>
  );
};

export default Dashboard;