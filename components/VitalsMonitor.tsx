import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { HeartPulse, Thermometer, Activity, AlertOctagon, Settings } from 'lucide-react';

interface VitalData {
    time: string;
    value: number;
}

const VitalsMonitor: React.FC = () => {
    // State for live data
    const [heartRateData, setHeartRateData] = useState<VitalData[]>([]);
    const [spO2Data, setSpO2Data] = useState<VitalData[]>([]);
    const [tempData, setTempData] = useState<VitalData[]>([]);

    // Current Values
    const [currentHR, setCurrentHR] = useState(72);
    const [currentSpO2, setCurrentSpO2] = useState(98);
    const [currentTemp, setCurrentTemp] = useState(36.6);

    // Thresholds
    const [thresholds, setThresholds] = useState({
        hrMax: 100,
        hrMin: 50,
        spO2Min: 95,
        tempMax: 37.5
    });

    const [showSettings, setShowSettings] = useState(false);

    // Initialize mock data
    useEffect(() => {
        const initialData = (base: number, variance: number) => 
            Array.from({ length: 20 }, (_, i) => ({
                time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
                value: base + (Math.random() * variance - variance / 2)
            }));
        
        setHeartRateData(initialData(72, 5));
        setSpO2Data(initialData(98, 2));
        setTempData(initialData(36.6, 0.4));
    }, []);

    // Live update simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' });

            const updateMetric = (
                prevData: VitalData[], 
                base: number, 
                variance: number, 
                setter: (val: number) => void,
                dataSetter: (val: VitalData[]) => void
            ) => {
                const newVal = Number((base + (Math.random() * variance - variance / 2)).toFixed(1));
                setter(newVal);
                
                const newData = [...prevData.slice(1), { time: now, value: newVal }];
                dataSetter(newData);
            };

            // Simulate slight fluctuations
            updateMetric(heartRateData, 72, 10, setCurrentHR, setHeartRateData);
            updateMetric(spO2Data, 98, 3, setCurrentSpO2, setSpO2Data);
            updateMetric(tempData, 36.6, 0.6, setCurrentTemp, setTempData);

        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [heartRateData, spO2Data, tempData]);

    // Check alerts
    const getAlertStatus = (val: number, type: 'hr' | 'spo2' | 'temp') => {
        if (type === 'hr') return val > thresholds.hrMax || val < thresholds.hrMin;
        if (type === 'spo2') return val < thresholds.spO2Min;
        if (type === 'temp') return val > thresholds.tempMax;
        return false;
    };

    const VitalCard = ({ 
        title, 
        value, 
        unit, 
        data, 
        color, 
        icon: Icon, 
        isAlert,
        domain
    }: { 
        title: string, value: number, unit: string, data: VitalData[], color: string, icon: any, isAlert: boolean, domain: [number, number]
    }) => (
        <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 ${isAlert ? 'bg-red-50 border-red-200 ring-2 ring-red-400' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAlert ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700">{title}</h3>
                        <p className={`text-xs ${isAlert ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                            {isAlert ? 'CRITICAL ALERT' : 'Normal Range'}
                        </p>
                    </div>
                </div>
                {isAlert && <AlertOctagon className="text-red-500 animate-pulse" size={24} />}
            </div>
            
            <div className="flex items-end gap-2 mb-6">
                <span className={`text-5xl font-bold ${isAlert ? 'text-red-600' : 'text-slate-800'}`}>{value}</span>
                <span className="text-lg text-slate-400 mb-1 font-medium">{unit}</span>
            </div>

            <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isAlert ? '#fee2e2' : '#f1f5f9'} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={domain} hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={isAlert ? '#dc2626' : color} 
                            strokeWidth={3} 
                            dot={false}
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Vital Signs Monitor</h2>
                    <p className="text-slate-500 mt-1">Real-time physiological data streams</p>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showSettings ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Settings size={18} />
                    Thresholds
                </button>
            </div>

            {/* Threshold Settings Panel */}
            {showSettings && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-slideIn">
                    <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Alert Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Max Heart Rate (BPM)</label>
                            <input 
                                type="number" 
                                value={thresholds.hrMax} 
                                onChange={(e) => setThresholds({...thresholds, hrMax: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Min Heart Rate (BPM)</label>
                            <input 
                                type="number" 
                                value={thresholds.hrMin} 
                                onChange={(e) => setThresholds({...thresholds, hrMin: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Min SpO2 (%)</label>
                            <input 
                                type="number" 
                                value={thresholds.spO2Min} 
                                onChange={(e) => setThresholds({...thresholds, spO2Min: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Max Temperature (°C)</label>
                            <input 
                                type="number" 
                                value={thresholds.tempMax} 
                                onChange={(e) => setThresholds({...thresholds, tempMax: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <VitalCard 
                    title="Heart Rate" 
                    value={currentHR} 
                    unit="bpm" 
                    data={heartRateData} 
                    color="#ec4899" 
                    icon={HeartPulse}
                    isAlert={getAlertStatus(currentHR, 'hr')}
                    domain={[40, 160]}
                />
                <VitalCard 
                    title="Blood Oxygen" 
                    value={currentSpO2} 
                    unit="%" 
                    data={spO2Data} 
                    color="#0ea5e9" 
                    icon={Activity}
                    isAlert={getAlertStatus(currentSpO2, 'spo2')}
                    domain={[85, 100]}
                />
                <VitalCard 
                    title="Temperature" 
                    value={currentTemp} 
                    unit="°C" 
                    data={tempData} 
                    color="#f59e0b" 
                    icon={Thermometer}
                    isAlert={getAlertStatus(currentTemp, 'temp')}
                    domain={[35, 40]}
                />
            </div>

            <div className="mt-8 bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg mb-1">Active Monitoring Session</h3>
                    <p className="text-slate-400 text-sm">Device Connected: NeuroScan Wearable V2 (Battery: 84%)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-400">Live Stream Active</span>
                </div>
            </div>
        </div>
    );
};

export default VitalsMonitor;