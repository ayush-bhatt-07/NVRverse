import React, { useState } from 'react';
import { INSTALLATION_STEPS } from '../data/installationData';
import { InstallationStep } from '../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Wrench, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Check,
  HardDrive,
  Cable,
  Monitor,
  Power
} from 'lucide-react';

export const InstallationLab: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSimulatingAction, setIsSimulatingAction] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const step = INSTALLATION_STEPS[currentStepIdx];
  const isCompleted = completedSteps.includes(step.id);
  const isAllComplete = completedSteps.length === INSTALLATION_STEPS.length;

  const triggerStepAction = () => {
    setIsSimulatingAction(true);
    setActionSuccessMessage(null);

    setTimeout(() => {
      setIsSimulatingAction(false);
      if (!completedSteps.includes(step.id)) {
        const nextCompleted = [...completedSteps, step.id];
        setCompletedSteps(nextCompleted);

        if (nextCompleted.length === INSTALLATION_STEPS.length) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
      setActionSuccessMessage('Action validated! Component physically installed and secured.');
    }, 600);
  };

  const handleNext = () => {
    if (currentStepIdx < INSTALLATION_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setActionSuccessMessage(null);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setActionSuccessMessage(null);
    }
  };

  const handleReset = () => {
    setCompletedSteps([]);
    setCurrentStepIdx(0);
    setActionSuccessMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              PHYSICAL LAB 01
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">STEP {currentStepIdx + 1} OF 15</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            NVR Hardware Installation Simulator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Hands-on sequential procedure from bare-metal chassis opening, 3.5" surveillance hard drive mounting, SATA bus cabling, to PoE camera patching and initial boot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono-tech">
            PROGRESS: <strong className="text-blue-700">{Math.round((completedSteps.length / 15) * 100)}%</strong> ({completedSteps.length}/15)
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-mono-tech font-semibold transition-colors"
          >
            <RotateCcw size={13} />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Steps List on Left, Interactive Simulation Workbench on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Step Navigator */}
        <div className="lg:col-span-4 space-y-2 max-h-[640px] overflow-y-auto pr-2">
          {INSTALLATION_STEPS.map((s, idx) => {
            const isDone = completedSteps.includes(s.id);
            const isCurrent = idx === currentStepIdx;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setActionSuccessMessage(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : isDone
                    ? 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono-tech text-[10px] font-bold ${
                      isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {s.id}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-400">
                      {s.category}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold truncate mt-0.5 ${
                    isCurrent ? 'text-blue-900' : 'text-slate-800'
                  }`}>
                    {s.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Step Action Deck & Visual Workbench */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Step Enclosure Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono-tech font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 uppercase">
                  STEP {step.id} • {step.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{step.title}</h2>
              </div>
              <span className="text-xs font-mono-tech text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                TOOL: {step.requiredTool}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {step.instructions}
            </p>

            {step.safetyWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Engineering Safety Rule:</strong> {step.safetyWarning}
                </div>
              </div>
            )}

            {/* Interactive Workbench Visual Rig */}
            <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden border border-slate-800 text-slate-100">
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono-tech text-[10px] text-cyan-300 font-bold uppercase">
                  VIRTUAL LAB WORKBENCH // SIMULATED RIG
                </span>
              </div>

              <div className="py-10 flex flex-col items-center justify-center text-center">
                {/* Visual Icon representation depending on step */}
                <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
                  {step.category === 'Storage' && <HardDrive size={36} />}
                  {step.category === 'Cabling' && <Cable size={36} />}
                  {step.category === 'Peripherals' && <Monitor size={36} />}
                  {step.category === 'Boot & Config' && <Power size={36} />}
                  {step.category === 'Chassis' && <Wrench size={36} />}
                </div>

                <h3 className="text-base font-bold text-white max-w-md">
                  {step.actionPrompt}
                </h3>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  Required Action: Click the actuator below to execute physical assembly
                </p>

                {/* Primary Interactive Action Button */}
                <button
                  disabled={isSimulatingAction}
                  onClick={triggerStepAction}
                  className={`mt-6 px-6 py-3 rounded-xl font-mono-tech text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {isSimulatingAction ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>PERFORMING INSTALLATION...</span>
                    </>
                  ) : isCompleted ? (
                    <>
                      <Check size={16} />
                      <span>STEP VERIFIED (CLICK TO RE-DO)</span>
                    </>
                  ) : (
                    <>
                      <Wrench size={16} />
                      <span>INSTALL & SECURE COMPONENT</span>
                    </>
                  )}
                </button>

                {actionSuccessMessage && (
                  <div className="mt-4 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono-tech flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={15} />
                    <span>{actionSuccessMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentStepIdx === 0}
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-mono-tech font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
                <span>PREVIOUS</span>
              </button>

              <button
                disabled={currentStepIdx === INSTALLATION_STEPS.length - 1}
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono-tech font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <span>NEXT STEP</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* All steps completed banner */}
          {isAllComplete && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Hardware Installation Certified Complete!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All 15 physical installation checkpoints have passed inspection. The NVR is fully assembled, powered, and ready for OS configuration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
