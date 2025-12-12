import React, { useState, useRef, useEffect } from 'react';
import { Mic, PenTool, Image as ImageIcon, RotateCcw, CheckCircle2, Play, Square, Loader2, AlertCircle, Timer, BrainCircuit, Eye, MousePointerClick, RefreshCw } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { analyzeClockDrawing, evaluateMemoryRecall, analyzeSpeechPattern } from '../services/geminiService';

const data = [
  { subject: 'Memory', A: 80, fullMark: 100 },
  { subject: 'Language', A: 90, fullMark: 100 },
  { subject: 'Attention', A: 65, fullMark: 100 },
  { subject: 'Visuospatial', A: 70, fullMark: 100 },
  { subject: 'Orientation', A: 85, fullMark: 100 },
];

const RECALL_ITEMS_POOL = [
    { name: 'Apple', icon: '🍎' },
    { name: 'Bicycle', icon: '🚲' },
    { name: 'Cat', icon: '🐱' },
    { name: 'Key', icon: '🔑' },
    { name: 'Umbrella', icon: '☂️' },
    { name: 'Book', icon: '📖' },
    { name: 'Chair', icon: '🪑' },
    { name: 'Sun', icon: '☀️' },
    { name: 'Flower', icon: '🌸' },
    { name: 'Car', icon: '🚗' },
    { name: 'Watch', icon: '⌚' },
    { name: 'Shoe', icon: '👟' },
    { name: 'Hat', icon: '🎩' },
    { name: 'Ball', icon: '⚽' },
    { name: 'Cup', icon: '☕' }
];

interface Props {
    onAssessmentComplete?: (score: number, issues: string[]) => void;
}

const Assessments: React.FC<Props> = ({ onAssessmentComplete }) => {
  const [activeTab, setActiveTab] = useState<'speech' | 'drawing' | 'recall'>('speech');
  
  // Speech State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [speechResult, setSpeechResult] = useState<any>(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);

  // Drawing State
  const [drawingStarted, setDrawingStarted] = useState(false);
  const [isAnalyzingDrawing, setIsAnalyzingDrawing] = useState(false);
  const [drawingResult, setDrawingResult] = useState<any>(null);
  
  // Recall State
  const [recallStage, setRecallStage] = useState<'start' | 'memorize' | 'delay' | 'input' | 'analyzing' | 'result'>('start');
  const [targetItems, setTargetItems] = useState<{name: string, icon: string}[]>([]);
  const [selectionPool, setSelectionPool] = useState<{name: string, icon: string}[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [recallTimer, setRecallTimer] = useState(0);
  const [recallAnalysis, setRecallAnalysis] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // -- Speech Logic --
  const toggleRecording = async () => {
    if (isRecording) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                handleAnalyzeSpeech(blob);
                // cleanup
                stream.getTracks().forEach(t => t.stop());
            };
            
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setSpeechResult(null);
        } catch (e) {
            console.error("Microphone access denied or error:", e);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    }
  };

  const handleAnalyzeSpeech = (blob: Blob) => {
      setIsAnalyzingSpeech(true);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
          const base64data = reader.result as string;
          const result = await analyzeSpeechPattern(base64data);
          
          setSpeechResult(result);
          setIsAnalyzingSpeech(false);

          if (onAssessmentComplete && result) {
               const issues = [];
               if (result.fluencyScore < 60) issues.push("Verbal Fluency Decline");
               if (result.clarity < 70) issues.push("Articulation Difficulty");
               onAssessmentComplete(result.fluencyScore, issues);
          }
      };
  };

  // -- Recall Logic --
  // Timer Logic for Recall Test
  useEffect(() => {
    let interval: any;
    if (recallTimer > 0) {
        interval = setInterval(() => setRecallTimer(t => t - 1), 1000);
    } else {
        if (recallStage === 'memorize') {
            setRecallStage('delay');
            setRecallTimer(10); // 10s delay
        } else if (recallStage === 'delay') {
            prepareSelectionPhase();
        }
    }
    return () => clearInterval(interval);
  }, [recallTimer, recallStage]);

  const startRecallTest = () => {
      // Pick 5 random items as targets
      const shuffled = [...RECALL_ITEMS_POOL].sort(() => 0.5 - Math.random());
      setTargetItems(shuffled.slice(0, 5));
      setRecallStage('memorize');
      setRecallTimer(5); // 5 seconds to memorize
      setSelectedItems([]);
      setRecallAnalysis(null);
  };

  const prepareSelectionPhase = () => {
      // Create a pool containing targets + 7 distractors
      const targets = targetItems;
      const distractors = RECALL_ITEMS_POOL
        .filter(i => !targets.some(t => t.name === i.name))
        .sort(() => 0.5 - Math.random())
        .slice(0, 7);
      
      const pool = [...targets, ...distractors].sort(() => 0.5 - Math.random());
      setSelectionPool(pool);
      setRecallStage('input');
  };

  const toggleSelection = (itemName: string) => {
      if (selectedItems.includes(itemName)) {
          setSelectedItems(prev => prev.filter(i => i !== itemName));
      } else {
          setSelectedItems(prev => [...prev, itemName]);
      }
  };

  const submitRecall = async () => {
      setRecallStage('analyzing');
      const targetNames = targetItems.map(i => i.name);
      
      const result = await evaluateMemoryRecall(targetNames, selectedItems);
      setRecallAnalysis(result);
      setRecallStage('result');

      // Update parent component (App) to trigger Routine Coach update
      if (onAssessmentComplete && result && typeof result.accuracy === 'number') {
          const issues = [];
          if (result.accuracy < 60) issues.push("Memory Deficits");
          if (result.intrusions?.length > 0) issues.push("False Positive Recall");
          
          onAssessmentComplete(result.accuracy, issues);
      }
  };

  const resetRecall = () => {
      setRecallStage('start');
      setSelectedItems([]);
      setRecallAnalysis(null);
  };

  // -- Drawing Logic --
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background initially to ensure clean export
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    let drawing = false;

    const startDraw = (e: MouseEvent) => {
      drawing = true;
      setDrawingStarted(true);
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };
    const draw = (e: MouseEvent) => {
      if (!drawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    const stopDraw = () => {
      drawing = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    return () => {
        canvas.removeEventListener('mousedown', startDraw);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDraw);
        canvas.removeEventListener('mouseout', stopDraw);
    };
  }, [activeTab]);

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if(canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx!.fillStyle = "#ffffff";
          ctx!.fillRect(0,0, canvas.width, canvas.height);
          setDrawingStarted(false);
          setDrawingResult(null);
      }
  }

  const handleAnalyzeDrawing = async () => {
    if (!canvasRef.current) return;
    setIsAnalyzingDrawing(true);
    setDrawingResult(null);
    try {
        const base64 = canvasRef.current.toDataURL('image/png');
        const result = await analyzeClockDrawing(base64);
        setDrawingResult(result);
        
        // Update Routine Coach based on drawing too
        if (onAssessmentComplete && result) {
             const issues = [];
             if (result.score < 5) issues.push("Visuospatial Decline");
             // Normalize 0-10 score to 0-100 for simplicity in this demo context
             onAssessmentComplete(result.score * 10, issues);
        }
    } catch (error) {
        console.error("Analysis failed", error);
    } finally {
        setIsAnalyzingDrawing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Clinical Assessments</h2>
        <p className="text-slate-500 mt-1">Standardized cognitive screening tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex border-b border-slate-100">
            {[
              { id: 'speech', label: 'Speech Fluency', icon: Mic },
              { id: 'drawing', label: 'Clock Drawing', icon: PenTool },
              { id: 'recall', label: 'Memory Recall', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 flex-1 flex flex-col">
            {activeTab === 'speech' && (
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">Verbal Fluency Test</h3>
                    <p className="text-slate-500 max-w-md">"Tell me as many animals as you can think of in one minute."</p>
                </div>
                
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-50 ring-4 ring-red-100' : 'bg-slate-50'}`}>
                    <button 
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isRecording ? 'bg-red-500' : 'bg-indigo-600'}`}
                    >
                        {isRecording ? <Square fill="white" className="text-white" /> : <Mic className="text-white" size={32} />}
                    </button>
                </div>

                {isRecording && (
                     <div className="flex gap-1 h-8 items-end">
                         {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                             <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce" style={{height: h * 6 + 'px', animationDelay: i * 0.1 + 's'}}></div>
                         ))}
                     </div>
                )}

                {isAnalyzingSpeech && (
                     <div className="flex flex-col items-center gap-2 text-indigo-600 animate-fadeIn">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm font-medium">Analyzing speech patterns...</span>
                     </div>
                )}
                
                {!isRecording && !isAnalyzingSpeech && speechResult && (
                    <div className="grid grid-cols-2 gap-8 w-full max-w-md animate-fadeIn">
                         <div className="bg-slate-50 p-4 rounded-xl text-center">
                             <p className="text-xs text-slate-500 uppercase font-bold">Pace</p>
                             <p className="text-2xl font-semibold text-slate-800">{speechResult.pace} wpm</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-xl text-center">
                             <p className="text-xs text-slate-500 uppercase font-bold">Clarity</p>
                             <p className="text-2xl font-semibold text-green-600">{speechResult.clarity}%</p>
                         </div>
                         <div className="col-span-2 bg-indigo-50 p-4 rounded-xl text-center border border-indigo-100">
                             <p className="text-xs text-indigo-400 uppercase font-bold mb-1">Fluency Score</p>
                             <p className="text-3xl font-bold text-indigo-700">{speechResult.fluencyScore}/100</p>
                             {speechResult.transcript && (
                                <p className="text-xs text-slate-500 mt-2 italic">"{speechResult.transcript}"</p>
                             )}
                         </div>
                    </div>
                )}

                {!isRecording && !isAnalyzingSpeech && !speechResult && (
                    <p className="text-sm text-slate-400">Press the microphone to start recording.</p>
                )}
              </div>
            )}

            {activeTab === 'drawing' && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-600 font-medium">Draw a clock showing the time 11:10</p>
                    <button onClick={clearCanvas} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1">
                        <RotateCcw size={14} /> Clear
                    </button>
                </div>
                <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative overflow-hidden">
                    <canvas 
                        ref={canvasRef} 
                        width={600} 
                        height={400} 
                        className="w-full h-full cursor-crosshair"
                    />
                    {!drawingStarted && !drawingResult && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300">
                            Start Drawing Here
                        </div>
                    )}
                    {isAnalyzingDrawing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-indigo-600">
                                <Loader2 className="animate-spin" size={32} />
                                <span className="text-sm font-medium">Analyzing spatial patterns...</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {drawingResult ? (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                             <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                                 <CheckCircle2 size={18} className="text-indigo-600"/> Analysis Result
                             </h4>
                             <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                                 Score: {drawingResult.score}/10
                             </span>
                        </div>
                        <p className="text-sm text-indigo-800 mb-3">{drawingResult.feedback}</p>
                        <div className="flex flex-wrap gap-2">
                            {drawingResult.findings?.map((finding: string, i: number) => (
                                <span key={i} className="text-xs bg-white text-slate-600 px-2 py-1 rounded border border-indigo-100">
                                    {finding}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-4 opacity-50">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2 py-1 rounded border">
                                <CheckCircle2 size={14} className="text-slate-400"/> Contour
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2 py-1 rounded border">
                                <CheckCircle2 size={14} className="text-slate-400"/> Numbers
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2 py-1 rounded border">
                                <AlertCircle size={14} className="text-slate-400"/> Hands
                            </span>
                        </div>
                        <button 
                            onClick={handleAnalyzeDrawing}
                            disabled={!drawingStarted || isAnalyzingDrawing}
                            className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !drawingStarted || isAnalyzingDrawing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                            }`}
                        >
                            Analyze Drawing
                        </button>
                    </div>
                )}
              </div>
            )}

            {activeTab === 'recall' && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    {/* Start Stage */}
                    {recallStage === 'start' && (
                        <>
                             <div className="grid grid-cols-3 gap-4 mb-8">
                                 {[1,2,3].map(i => (
                                     <div key={i} className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                                        <Eye className="text-slate-300" size={32} />
                                     </div>
                                 ))}
                             </div>
                             <button 
                                onClick={startRecallTest}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                             >
                                 <Play size={18} /> Start Recall Test
                             </button>
                             <p className="text-xs text-slate-400 mt-4 max-w-xs text-center">
                                 5 items will be shown for 5 seconds. Identify them from a list after a delay.
                             </p>
                        </>
                    )}

                    {/* Memorize Stage */}
                    {recallStage === 'memorize' && (
                        <div className="w-full h-full flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-6 text-indigo-600">
                                <Eye size={20} />
                                <span className="font-bold">Memorize these items</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6 mb-8">
                                {targetItems.map((item, i) => (
                                    <div key={i} className="w-28 h-28 bg-white border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center shadow-sm animate-fadeIn">
                                        <span className="text-4xl mb-2">{item.icon}</span>
                                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-linear" 
                                    style={{ width: `${(recallTimer / 5) * 100}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 font-medium">{recallTimer}s remaining</p>
                        </div>
                    )}

                    {/* Delay Stage */}
                    {recallStage === 'delay' && (
                        <div className="flex flex-col items-center justify-center animate-fadeIn">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 relative">
                                <BrainCircuit className="text-slate-300" size={40} />
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Please Wait</h3>
                            <p className="text-slate-500">Processing...</p>
                            <p className="mt-4 text-2xl font-mono font-bold text-indigo-600">{recallTimer}s</p>
                        </div>
                    )}

                    {/* Input (Selection) Stage */}
                    {recallStage === 'input' && (
                        <div className="w-full h-full animate-fadeIn flex flex-col">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-700 flex items-center justify-center gap-2">
                                    <MousePointerClick size={20} className="text-indigo-500" /> Select the items you saw
                                </h3>
                                <p className="text-sm text-slate-500">Select {targetItems.length} items.</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-2">
                                    {selectionPool.map((item, i) => {
                                        const isSelected = selectedItems.includes(item.name);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => toggleSelection(item.name)}
                                                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                                                    isSelected 
                                                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md transform scale-105' 
                                                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="text-3xl mb-1">{item.icon}</span>
                                                <span className={`text-xs font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                    {item.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <button 
                                    onClick={submitRecall}
                                    disabled={selectedItems.length === 0}
                                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                                        selectedItems.length > 0
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    <CheckCircle2 size={18} /> Submit ({selectedItems.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Analyzing Stage */}
                    {recallStage === 'analyzing' && (
                        <div className="flex flex-col items-center text-indigo-600">
                             <Loader2 size={40} className="animate-spin mb-4" />
                             <p className="font-medium">Evaluating performance...</p>
                        </div>
                    )}

                    {/* Result Stage */}
                    {recallStage === 'result' && recallAnalysis && (
                        <div className="w-full max-w-lg animate-fadeIn">
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800">Recall Score</h3>
                                    <span className={`text-2xl font-bold ${recallAnalysis.accuracy >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                                        {recallAnalysis.accuracy}%
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Correctly Identified</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recallAnalysis.correctItems?.length > 0 ? (
                                                recallAnalysis.correctItems.map((item: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm border border-green-100 flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> {item}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">None</span>
                                            )}
                                        </div>
                                    </div>

                                    {recallAnalysis.missedItems?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Missed Targets</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recallAnalysis.missedItems.map((item: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm border border-red-100">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {recallAnalysis.intrusions?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Incorrect Selections</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recallAnalysis.intrusions.map((item: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm border border-orange-100">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-600 italic">"{recallAnalysis.analysis}"</p>
                                </div>
                            </div>

                            <button 
                                onClick={resetRecall}
                                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} /> Start New Test
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2">Cognitive Domain Profile</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Robert"
                                dataKey="A"
                                stroke="#4f46e5"
                                strokeWidth={2}
                                fill="#6366f1"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                    <p className="text-2xl font-bold text-slate-800">78/100</p>
                    <p className="text-xs text-slate-500">Overall Score (Moderate)</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <h3 className="font-semibold text-slate-700 mb-4">Historical Trend</h3>
                 <div className="space-y-4">
                     {[
                         { date: 'Dec 12', score: 78, change: 0 },
                         { date: 'Dec 05', score: 79, change: -1 },
                         { date: 'Nov 28', score: 76, change: +2 },
                     ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm">
                             <span className="text-slate-500">{item.date}</span>
                             <div className="flex items-center gap-2">
                                 <span className="font-bold text-slate-700">{item.score}</span>
                                 <span className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                     {item.change > 0 ? '+' : ''}{item.change}
                                 </span>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;