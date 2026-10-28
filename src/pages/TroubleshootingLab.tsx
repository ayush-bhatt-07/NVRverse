import React, { useState } from 'react';
import { TROUBLESHOOTING_SCENARIOS } from '../data/troubleshootingData';
import { TroubleshootingScenario } from '../types';
import confetti from 'canvas-confetti';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Search, 
  Terminal, 
  Zap, 
  HardDrive, 
  Wifi, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const TroubleshootingLab: React.FC = () => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [activeTestOutputs, setActiveTestOutputs] = useState<Record<string, boolean>>({});
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null);
  const [isFixApplied, setIsFixApplied] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [resolvedScenarios, setResolvedScenarios] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  const scenario = TROUBLESHOOTING_SCENARIOS[selectedScenarioIdx];

  const handleRunDiagnostic = (testName: string) => {
    setActiveTestOutputs(prev => ({
      ...prev,
      [testName]: true,
    }));
  };

  const handleApplyFix = (fixId: string) => {
    setSelectedFixId(fixId);
    setAttempts(a => a + 1);
    setIsFixApplied(true);

    const fix = scenario.fixOptions.find(f => f.id === fixId);
    if (fix && fix.isCorrect) {
      setIsResolved(true);
      if (!resolvedScenarios.includes(scenario.id)) {
        setResolvedScenarios(prev => [...prev, scenario.id]);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      setIsResolved(false);
    }
  };

  const handleResetScenario = () => {
    setActiveTestOutputs({});
    setSelectedFixId(null);
    setIsFixApplied(false);
    setIsResolved(false);
    setShowHint(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              FAULT DIAGNOSTIC LAB
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">
              SCENARIO {selectedScenarioIdx + 1} OF {TROUBLESHOOTING_SCENARIOS.length}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            NVR Engineering Fault Diagnosis Simulator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Tackle real-world field failures: PoE overdraw, damaged cables, ONVIF credential locks, IP conflicts, and uninitialized surveillance partitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono-tech">
            RESOLVED: <strong className="text-emerald-700">{resolvedScenarios.length}</strong> / {TROUBLESHOOTING_SCENARIOS.length}
          </div>
          <button
            onClick={handleResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-mono-tech font-semibold transition-colors"
          >
            <RotateCcw size={13} />
            <span>RESET INCIDENT</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scenario Drawer + Diagnostic Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Scenario Selector */}
        <div className="lg:col-span-4 space-y-2 max-h-[640px] overflow-y-auto pr-2">
          {TROUBLESHOOTING_SCENARIOS.map((sc, idx) => {
            const isDone = resolvedScenarios.includes(sc.id);
            const isCurrent = idx === selectedScenarioIdx;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioIdx(idx);
                  handleResetScenario();
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : isDone
                    ? 'bg-white border-emerald-200 hover:bg-emerald-50/30'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-400">
                    {sc.category} • {sc.difficulty}
                  </span>
                  {isDone && <CheckCircle2 size={14} className="text-emerald-600" />}
                </div>
                <h4 className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-900'}`}>
                  {sc.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Right Diagnostic Rig */}
        <div className="lg:col-span-8 space-y-5">
          {/* Incident Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono-tech font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 uppercase">
                  INCIDENT TICKET // ACTIVE FAULT
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{scenario.title}</h2>
              </div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono-tech text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <HelpCircle size={14} />
                <span>{showHint ? 'HIDE HINT' : 'SHOW HINT'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-slate-800">Observed Field Symptom:</span>
              <p className="text-xs text-slate-600 leading-relaxed">{scenario.symptom}</p>
            </div>

            {/* Error Log Console */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono-tech text-xs">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] pb-1.5 border-b border-slate-800">
                <Terminal size={12} className="text-cyan-400" />
                <span>NVR SYSTEM KERNEL EVENT LOG</span>
              </div>
              <p className="text-red-400 text-[11px] mt-2 whitespace-pre-wrap">
                {scenario.initialState.errorLog}
              </p>
            </div>

            {showHint && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 animate-in fade-in">
                <strong>Diagnostic Tip:</strong> Execute the diagnostic test tools below to uncover the root cause before selecting a repair action.
              </div>
            )}
          </div>

          {/* Diagnostic Instruments Deck */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-mono-tech flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              <span>STEP 1: PERFORM HARDWARE DIAGNOSTICS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenario.diagnosticTests.map((t, idx) => {
                const isRun = activeTestOutputs[t.name];
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{t.name}</span>
                      <button
                        onClick={() => handleRunDiagnostic(t.name)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-mono-tech font-bold transition-colors"
                      >
                        RUN TEST
                      </button>
                    </div>

                    {isRun ? (
                      <pre className="p-2 bg-slate-900 text-cyan-300 font-mono-tech text-[10px] rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap animate-in fade-in">
                        {t.resultOutput}
                      </pre>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-mono-tech italic">
                        Instrument idle. Click 'Run Test' to probe circuit.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Fix Implementation Options */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-mono-tech flex items-center gap-2">
              <Zap size={16} className="text-blue-600" />
              <span>STEP 2: APPLY ENGINEERING SOLUTION</span>
            </h3>

            <div className="space-y-2">
              {scenario.fixOptions.map(opt => {
                const isChosen = selectedFixId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleApplyFix(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      isChosen && opt.isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30'
                        : isChosen && !opt.isCorrect
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isChosen && (
                        opt.isCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-600 shrink-0" />
                        )
                      )}
                    </div>

                    {isChosen && (
                      <p className="mt-2 text-[11px] font-mono-tech pt-2 border-t border-slate-200/60 leading-relaxed">
                        {opt.explanation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Success Feedback Banner */}
            {isResolved && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950 animate-in fade-in">
                <Sparkles size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Fault Successfully Diagnosed & Fixed!</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Link beat restored and telemetry returned to nominal thresholds in {attempts} attempt{attempts > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
