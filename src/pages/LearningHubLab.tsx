import React, { useState } from 'react';
import { LEARNING_LESSONS } from '../data/learningData';
import { LearningLesson } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Calculator, 
  HardDrive, 
  Zap, 
  Layers, 
  Sliders, 
  Clock, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const LearningHubLab: React.FC = () => {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<Record<string, boolean>>({});

  // Interactive Bitrate & Storage Calculator State
  const [calcCameras, setCalcCameras] = useState<number>(8);
  const [calcDays, setCalcDays] = useState<number>(30);
  const [calcResolution, setCalcResolution] = useState<number>(4096); // 4096 kbps (4K H.265)

  // Interactive PoE Budget Calculator State
  const [calcPoeCameras, setCalcPoeCameras] = useState<number>(8);
  const [calcAvgWatts, setCalcAvgWatts] = useState<number>(12.5);

  const lesson = LEARNING_LESSONS[selectedLessonIdx];

  // Storage calculation: (Bitrate kbps / 8) * 3600 * 24 * days * cameras / 1,000,000 = TB
  const totalBitrateMbps = (calcCameras * calcResolution) / 1000;
  const storageNeededGB = ((calcResolution * 1000) / 8 * 3600 * 24 * calcDays * calcCameras) / 1e9;
  const storageNeededTB = (storageNeededGB / 1000).toFixed(2);

  // PoE calculation
  const totalPoeWatts = (calcPoeCameras * calcAvgWatts).toFixed(1);
  const isPoeOver = parseFloat(totalPoeWatts) > 120;

  const handleSelectQuiz = (qIdx: number, optIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${lesson.id}-${qIdx}`]: optIdx,
    }));
    setShowQuizResults(prev => ({
      ...prev,
      [`${lesson.id}-${qIdx}`]: true,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ENGINEERING ACADEMY
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">
              MODULE {selectedLessonIdx + 1} OF {LEARNING_LESSONS.length}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Visual Surveillance Engineering Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Concise, visually grounded lessons on NVR architecture, PoE power budgets, surveillance hard drives, and protocol handshakes.
          </p>
        </div>
      </div>

      {/* Main Grid: Lessons Tabs + Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Lesson Index */}
        <div className="lg:col-span-4 space-y-2">
          {LEARNING_LESSONS.map((l, idx) => {
            const isCurrent = idx === selectedLessonIdx;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedLessonIdx(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-tech font-bold uppercase text-slate-400 mb-1">
                  <span>{l.category}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {l.readTime}
                  </span>
                </div>
                <h4 className={`text-xs font-bold leading-snug ${isCurrent ? 'text-blue-900' : 'text-slate-900'}`}>
                  {l.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Right Active Lesson Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Lesson Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-mono-tech font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                {lesson.category} DEEP DIVE
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{lesson.title}</h2>
              <p className="text-xs text-slate-500 font-mono-tech mt-0.5">{lesson.subtitle}</p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {lesson.summary}
            </p>

            {/* Key Takeaways Cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 font-mono-tech mb-2">
                CRITICAL ENGINEERING TAKEAWAYS:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.keyTakeaways.map((k, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-900 font-mono-tech mb-1.5">
                TECHNICAL ARCHITECTURE:
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lesson.deepDive}
              </p>
            </div>
          </div>

          {/* Interactive Calculator Section if available */}
          {lesson.calculatorType === 'storage' && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono-tech">
                  INTERACTIVE SURVEILLANCE STORAGE CALCULATOR
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-tech text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Camera Count: {calcCameras}</label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={calcCameras}
                    onChange={e => setCalcCameras(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Retention Days: {calcDays} Days</label>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    value={calcDays}
                    onChange={e => setCalcDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Bitrate per Camera:</label>
                  <select
                    value={calcResolution}
                    onChange={e => setCalcResolution(parseInt(e.target.value))}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs"
                  >
                    <option value="2048">1080p Full HD (2 Mbps H.265)</option>
                    <option value="3072">2K QHD (3 Mbps H.265)</option>
                    <option value="4096">4K Ultra HD (4 Mbps H.265)</option>
                    <option value="8192">4K High-Bitrate (8 Mbps H.264)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl text-white font-mono-tech flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Total Network Ingest:</span>
                  <span className="text-lg font-bold text-cyan-400">{totalBitrateMbps.toFixed(1)} Mbps</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Required HDD Capacity:</span>
                  <span className="text-lg font-bold text-emerald-400">{storageNeededTB} Terabytes (TB)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Recommended Drive Setup:</span>
                  <span className="text-xs font-bold text-white">
                    {parseFloat(storageNeededTB) > 4 ? '2x 4TB Surveillance HDDs' : '1x 4TB AllFrame HDD'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {lesson.calculatorType === 'poe' && (
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono-tech">
                  INTERACTIVE POE POWER BUDGET CALCULATOR
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Number of PoE Cameras: {calcPoeCameras}</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={calcPoeCameras}
                    onChange={e => setCalcPoeCameras(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Average Draw per Camera: {calcAvgWatts}W</label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    value={calcAvgWatts}
                    onChange={e => setCalcAvgWatts(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className={`p-4 rounded-xl font-mono-tech flex items-center justify-between border ${
                isPoeOver ? 'bg-red-950 text-red-200 border-red-500' : 'bg-slate-900 text-white border-slate-800'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Estimated Power Draw:</span>
                  <span className={`text-xl font-bold ${isPoeOver ? 'text-red-400' : 'text-amber-400'}`}>
                    {totalPoeWatts} Watts
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">NVR Power Supply Limit:</span>
                  <span className="text-sm font-bold text-white">120.0 Watts Max</span>
                </div>
              </div>
            </div>
          )}

          {/* Mini Knowledge Check */}
          {lesson.quiz.map((q, qIdx) => {
            const key = `${lesson.id}-${qIdx}`;
            const chosen = quizAnswers[key];
            const isRevealed = showQuizResults[key];
            return (
              <div key={qIdx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 font-mono-tech uppercase">
                    MINI ASSESSMENT // KNOWLEDGE CHECK
                  </h3>
                </div>

                <p className="text-sm font-bold text-slate-900">{q.question}</p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectQuiz(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                          isRevealed
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                              : isSelected
                              ? 'bg-red-50 border-red-300 text-red-900'
                              : 'bg-slate-50 border-slate-200 opacity-60 text-slate-600'
                            : isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {isRevealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                          {isRevealed && isSelected && !isCorrect && <XCircle size={16} className="text-red-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isRevealed && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 animate-in fade-in">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
