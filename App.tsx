import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Memoryscape from './components/Memoryscape';
import Assessments from './components/Assessments';
import AgitationPrediction from './components/AgitationPrediction';
import NarrativeGenerator from './components/NarrativeGenerator';
import FamilyClinician from './components/FamilyClinician';
import VitalsMonitor from './components/VitalsMonitor';
import RoutineCoach from './components/RoutineCoach';
import SplashScreen from './components/SplashScreen';
import { AppView } from './types';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [memoryContext, setMemoryContext] = useState<any>(null);
  
  // State to share between Assessments and RoutineCoach
  const [assessmentScore, setAssessmentScore] = useState(78);
  const [recentIssues, setRecentIssues] = useState<string[]>([]);

  const handleAssessmentComplete = (score: number, issues: string[]) => {
      setAssessmentScore(score);
      setRecentIssues(issues);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.MEMORYSCAPE:
        return <Memoryscape onChangeView={setCurrentView} setGeneratedStoryContext={setMemoryContext} />;
      case AppView.ASSESSMENTS:
        return <Assessments onAssessmentComplete={handleAssessmentComplete} />;
      case AppView.AGITATION:
        return <AgitationPrediction />;
      case AppView.VITALS:
        return <VitalsMonitor />;
      case AppView.NARRATIVE:
        return <NarrativeGenerator onBack={() => setCurrentView(AppView.MEMORYSCAPE)} context={memoryContext} />;
      case AppView.FAMILY:
        return <FamilyClinician view={AppView.FAMILY} />;
      case AppView.CLINICIAN:
        return <FamilyClinician view={AppView.CLINICIAN} />;
      case AppView.ROUTINE:
        return <RoutineCoach assessmentScore={assessmentScore} recentIssues={recentIssues} />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden animate-fadeIn">
      {/* Sidebar - hidden on narrative view for immersion */}
      {currentView !== AppView.NARRATIVE && (
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      )}
      
      {/* Main Content Area */}
      <main className={`flex-1 relative ${currentView === AppView.NARRATIVE ? 'w-full' : ''}`}>
        {renderView()}
      </main>
    </div>
  );
};

export default App;