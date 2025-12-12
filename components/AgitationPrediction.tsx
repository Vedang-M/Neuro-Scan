import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Moon, Sun, HeartPulse, Pill } from 'lucide-react';

const heartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  hrv: 40 + Math.random() * 20 + (i > 14 && i < 18 ? 30 : 0), // Spike in afternoon
}));

// Mock heatmap data (7 days x 4 time blocks)
const heatmapData = [
    { day: 'Mon', morning: 20, afternoon: 65, evening: 40, night: 10 },
    { day: 'Tue', morning: 25, afternoon: 70, evening: 45, night: 15 },
    { day: 'Wed', morning: 15, afternoon: 60, evening: 35, night: 10 },
    { day: 'Thu', morning: 30, afternoon: 85, evening: 50, night: 20 },
    { day: 'Fri', morning: 20, afternoon: 65, evening: 40, night: 15 },
    { day: 'Sat', morning: 10, afternoon: 30, evening: 20, night: 10 },
    { day: 'Sun', morning: 10, afternoon: 25, evening: 15, night: 5 },
];

const AgitationPrediction: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Agitation Predictive Model</h2>
          <p className="text-slate-500 mt-1">Real-time risk assessment and forecasting</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
             <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Forecast Range</span>
             <span className="text-sm font-medium text-slate-700">Next 24 Hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Risk Indicator */}
          <div className="lg:col-span-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
              <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="3"
                          />
                          <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth="3"
                              strokeDasharray="70, 100"
                              className="animate-[spin_1s_ease-out_reverse]"
                          />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold">70%</span>
                          <span className="text-[10px] uppercase tracking-wider text-yellow-400">Risk</span>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold mb-2">High Agitation Risk</h3>
                      <p className="text-indigo-200 mb-1 max-w-lg">
                          Model predicts elevated agitation levels between <span className="text-white font-bold">2:00 PM - 5:00 PM</span> today.
                      </p>
                      <div className="flex gap-2 mt-3">
                          <span className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">Trigger: Poor Sleep</span>
                          <span className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">Trigger: High HRV</span>
                      </div>
                  </div>
              </div>
              
              <div className="mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full md:w-64">
                   <h4 className="text-sm font-bold text-indigo-100 mb-3 flex items-center gap-2">
                       <Sun size={16} /> Recommended Actions
                   </h4>
                   <ul className="space-y-2 text-sm text-indigo-200">
                       <li className="flex gap-2">
                           <span className="text-green-400">✓</span> Schedule quiet time at 1:30 PM
                       </li>
                       <li className="flex gap-2">
                           <span className="text-green-400">✓</span> Play "Calming" memory session
                       </li>
                       <li className="flex gap-2">
                           <span className="text-green-400">✓</span> Check hydration levels
                       </li>
                   </ul>
              </div>
          </div>

          {/* HRV Graph */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <HeartPulse className="text-rose-500" size={20} /> Heart Rate Variability
                  </h3>
              </div>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={heartData}>
                          <defs>
                              <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} interval={3} />
                          <Tooltip contentStyle={{borderRadius: '8px'}} />
                          <Area type="monotone" dataKey="hrv" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHrv)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Vitals Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <Moon className="text-indigo-500" size={20} />
                          <h4 className="font-medium text-slate-700">Sleep Score</h4>
                      </div>
                      <span className="text-4xl font-bold text-slate-800">58<span className="text-sm text-slate-400 font-normal ml-1">/100</span></span>
                  </div>
                  <div className="mt-4">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full w-[58%]"></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Restless night detected (4 wake ups)</p>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <Activity className="text-teal-500" size={20} />
                          <h4 className="font-medium text-slate-700">Activity Level</h4>
                      </div>
                      <span className="text-4xl font-bold text-slate-800">Low</span>
                  </div>
                  <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2">Steps: 1,240</p>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full w-[30%]"></div>
                      </div>
                  </div>
              </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                          <Pill className="text-blue-500" size={20} />
                          <h4 className="font-medium text-slate-700">Medication Adherence</h4>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">On Track</span>
                  </div>
                  <div className="flex justify-between text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                              <span className="text-xs text-slate-400">{d}</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${i === 3 ? 'bg-slate-200 text-slate-400' : 'bg-blue-500'}`}>
                                  {i === 3 ? '' : '✓'}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
          {/* Heatmap Section */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="font-semibold text-slate-700 mb-6">Weekly Agitation Heatmap</h3>
               <div className="w-full overflow-x-auto">
                   <div className="min-w-[600px] h-48">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={heatmapData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="morning" stackId="a" fill="#93c5fd" />
                            <Bar dataKey="afternoon" stackId="a" fill="#fca5a5" />
                            <Bar dataKey="evening" stackId="a" fill="#fdba74" />
                            <Bar dataKey="night" stackId="a" fill="#cbd5e1" />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-center gap-6 mt-4">
                       <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 bg-blue-300"></div> Morning</div>
                       <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 bg-red-300"></div> Afternoon (High Risk)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 bg-orange-300"></div> Evening</div>
                       <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 bg-slate-300"></div> Night</div>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default AgitationPrediction;