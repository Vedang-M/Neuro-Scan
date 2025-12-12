import React, { useState } from 'react';
import { AppView } from '../types';
import { Users, MessageSquare, Download, FileText, ArrowRight, TrendingUp, FileDown } from 'lucide-react';

interface Props {
    view: AppView.FAMILY | AppView.CLINICIAN;
}

const FamilyClinician: React.FC<Props> = ({ view }) => {
    return view === AppView.FAMILY ? <FamilyView /> : <ClinicianView />;
};

const FamilyView: React.FC = () => (
    <div className="p-8 h-full overflow-y-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Family Circle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Members */}
            <div className="md:col-span-1 space-y-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                         <Users size={18} /> Connected Members
                     </h3>
                     <div className="space-y-4">
                         {[
                             { name: 'Sarah (Daughter)', role: 'Admin', status: 'Online', img: 'https://picsum.photos/50/50?random=1' },
                             { name: 'Michael (Son)', role: 'Contributor', status: '2h ago', img: 'https://picsum.photos/50/50?random=2' },
                             { name: 'Dr. Chen', role: 'Clinician', status: 'View only', img: 'https://picsum.photos/50/50?random=3' },
                         ].map((m, i) => (
                             <div key={i} className="flex items-center gap-3">
                                 <img src={m.img} className="w-10 h-10 rounded-full" alt={m.name} />
                                 <div>
                                     <p className="text-sm font-medium text-slate-800">{m.name}</p>
                                     <p className="text-xs text-slate-500">{m.role} • {m.status}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <button className="w-full mt-6 py-2 border border-dashed border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50">
                         + Invite Member
                     </button>
                 </div>
                 
                 <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                     <h3 className="font-bold mb-2">Caregiver Alert</h3>
                     <p className="text-indigo-100 text-sm mb-4">
                         Robert's agitation risk is elevated for this afternoon. Please ensure a calm environment.
                     </p>
                     <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold w-full">
                         Acknowledge
                     </button>
                 </div>
            </div>

            {/* Right: Activity Feed */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
                <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2">
                    <MessageSquare size={18} /> Activity & Memory Stream
                </h3>
                <div className="flex-1 space-y-6">
                    {[
                        { user: 'Sarah', action: 'uploaded 5 photos to "Summer 1985"', time: '2 hours ago', content: 'Dad looked so happy in these garden photos!' },
                        { user: 'System', action: 'completed Daily Assessment', time: '4 hours ago', content: 'Score: 78/100 (Stable)' },
                        { user: 'Michael', action: 'commented', time: 'Yesterday', content: 'Going to visit on Saturday with the kids.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-500">
                                 {item.user[0]}
                             </div>
                             <div>
                                 <p className="text-sm">
                                     <span className="font-bold text-slate-800">{item.user}</span> <span className="text-slate-500">{item.action}</span>
                                 </p>
                                 <p className="text-xs text-slate-400 mb-1">{item.time}</p>
                                 {item.content && (
                                     <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 border border-slate-100">
                                         {item.content}
                                     </div>
                                 )}
                             </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <input type="text" placeholder="Share an update or memory..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500" />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Post</button>
                </div>
            </div>
        </div>
    </div>
);

const ClinicianView: React.FC = () => {
    const handleExportPDF = async () => {
        try {
            // Using localhost for prototype; in prod this would be relative or config-based
            const response = await fetch('http://localhost:3001/clinician/export/pdf/patient-123', {
                method: 'GET',
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'NeuroScan_Clinical_Report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to download PDF. Please ensure the backend server is running.');
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                     <h2 className="text-3xl font-bold text-slate-800">Clinician Analytics</h2>
                     <p className="text-slate-500 mt-1">Patient ID: #8492-RP • Robert Patil</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <FileDown size={16} /> Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                        <FileText size={16} /> Generate Clinical Report
                    </button>
                </div>
            </div>

            {/* Clinical Summary Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Metric Category</th>
                            <th className="px-6 py-4">Current Status</th>
                            <th className="px-6 py-4">Baseline (Jan 23)</th>
                            <th className="px-6 py-4">Trend (6mo)</th>
                            <th className="px-6 py-4">Clinical Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-800">MMSE Equivalent</td>
                            <td className="px-6 py-4">22/30</td>
                            <td className="px-6 py-4">24/30</td>
                            <td className="px-6 py-4 text-red-500 flex items-center gap-1"><TrendingUp className="rotate-180" size={14} /> -8%</td>
                            <td className="px-6 py-4 text-slate-500">Moderate decline, within expected range.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-800">Agitation Frequency</td>
                            <td className="px-6 py-4">3.2 / week</td>
                            <td className="px-6 py-4">1.5 / week</td>
                            <td className="px-6 py-4 text-orange-500 flex items-center gap-1"><TrendingUp size={14} /> +113%</td>
                            <td className="px-6 py-4 text-slate-500">Correlates with sleep disruption.</td>
                        </tr>
                         <tr>
                            <td className="px-6 py-4 font-medium text-slate-800">Sleep Efficiency</td>
                            <td className="px-6 py-4">68%</td>
                            <td className="px-6 py-4">75%</td>
                            <td className="px-6 py-4 text-slate-500 flex items-center gap-1"><ArrowRight size={14} /> Stable</td>
                            <td className="px-6 py-4 text-slate-500">Melatonin dosage adjusted.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-700 mb-4">Intervention Effectiveness</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Music Therapy', score: 85, impact: 'High' },
                            { name: 'Routine Structuring', score: 60, impact: 'Moderate' },
                            { name: 'Cognitive Exercises', score: 45, impact: 'Low' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <span className="text-slate-500">{item.impact} Impact</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-teal-500 h-2 rounded-full" style={{width: `${item.score}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-700 mb-4">Medication Correlation</h3>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800 mb-4">
                        <strong>Insight:</strong> Increased agitation observed 2 hours post-Donepezil administration on Tuesdays and Thursdays.
                    </div>
                     <div className="flex gap-2">
                         <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Donepezil 10mg</span>
                         <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Memantine 20mg</span>
                         <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Sertraline 50mg</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyClinician;