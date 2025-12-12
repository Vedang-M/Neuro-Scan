import React from 'react';
import { 
  LayoutDashboard, 
  Image, 
  Activity, 
  BrainCircuit, 
  Users, 
  Stethoscope, 
  CalendarClock,
  HeartPulse
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Command Center', icon: LayoutDashboard },
    { id: AppView.MEMORYSCAPE, label: 'Memoryscape', icon: Image },
    { id: AppView.VITALS, label: 'Vitals Monitor', icon: HeartPulse },
    { id: AppView.ROUTINE, label: 'Routine Coach', icon: CalendarClock },
    { id: AppView.ASSESSMENTS, label: 'Assessments', icon: Activity },
    { id: AppView.AGITATION, label: 'Agitation Prediction', icon: BrainCircuit },
    { id: AppView.FAMILY, label: 'Family Circle', icon: Users },
    { id: AppView.CLINICIAN, label: 'Clinician View', icon: Stethoscope },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
          NeuroScan
        </h1>
        <p className="text-xs text-slate-400 mt-1">Adaptive Care Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
            RP
          </div>
          <div>
            <p className="text-sm font-medium">Robert Patil</p>
            <p className="text-xs text-slate-500">Patient Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;