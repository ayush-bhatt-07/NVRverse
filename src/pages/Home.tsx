import React from 'react';
import { LabRoute } from '../types';
import { HeroNVRViewer } from '../components/three/HeroNVRViewer';
import { 
  Box, 
  Cpu, 
  Activity, 
  Wrench, 
  Sliders, 
  Share2, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';

interface HomeProps {
  onRouteChange: (route: LabRoute) => void;
}

export const Home: React.FC<HomeProps> = ({ onRouteChange }) => {
  const quickNav = [
    { 
      route: '/lab' as LabRoute, 
      label: '3D NVR Hardware', 
      desc: 'Disassembly & I/O Ports',
      icon: Box, 
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-500' 
    },
    { 
      route: '/lab/motherboard' as LabRoute, 
      label: 'Motherboard PCB', 
      desc: 'Silicon Architecture',
      icon: Cpu, 
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200 hover:border-cyan-500' 
    },
    { 
      route: '/lab/packet-flow' as LabRoute, 
      label: 'Packet Simulator', 
      desc: 'Live IP Camera Stream',
      icon: Activity, 
      color: 'text-purple-600 bg-purple-50 border-purple-200 hover:border-purple-500' 
    },
    { 
      route: '/lab/installation' as LabRoute, 
      label: 'Installation Lab', 
      desc: '15-Step Assembly Rig',
      icon: Wrench, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:border-emerald-500' 
    },
    { 
      route: '/lab/configuration' as LabRoute, 
      label: 'Virtual NVR OS', 
      desc: 'Live View & Playback',
      icon: Sliders, 
      color: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-500' 
    },
    { 
      route: '/network-builder' as LabRoute, 
      label: 'Network Topology', 
      desc: 'PoE Budget & Ping Test',
      icon: Share2, 
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:border-indigo-500' 
    },
    { 
      route: '/troubleshooting' as LabRoute, 
      label: 'Diagnostics', 
      desc: 'Fault Finding Simulator',
      icon: AlertTriangle, 
      color: 'text-red-600 bg-red-50 border-red-200 hover:border-red-500' 
    },
    { 
      route: '/learn' as LabRoute, 
      label: 'Academy', 
      desc: 'Calculators & Lessons',
      icon: BookOpen, 
      color: 'text-slate-600 bg-slate-100 border-slate-300 hover:border-slate-500' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER: Clean, bold NVRverse Title without any 80/20% in the tagline */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono-tech text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>VIRTUAL ENGINEERING LABORATORY</span>
        </div>

        {/* Prominent Name: NVRverse */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900">
          NVR<span className="text-blue-600">verse</span>
        </h1>

        {/* Clean, enhanced tagline without 80/20% */}
        <p className="text-sm sm:text-base text-slate-600 font-mono-tech max-w-2xl mx-auto">
          Interactive 3D Engineering Simulator for Network Video Recorders
        </p>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onRouteChange('/lab')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono-tech text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Box size={15} className="text-cyan-400" />
            <span>LAUNCH 3D HARDWARE LAB</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={() => onRouteChange('/lab/packet-flow')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono-tech text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Activity size={15} />
            <span>SIMULATE PACKET FLOW</span>
          </button>

          <button
            onClick={() => onRouteChange('/lab/configuration')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-mono-tech text-xs font-semibold transition-colors shadow-xs"
          >
            <Sliders size={15} />
            <span>VIRTUAL NVR OS</span>
          </button>
        </div>
      </div>

      {/* 3D NVR DIGITAL TWIN VIEWPORT */}
      <div className="w-full">
        <HeroNVRViewer onEnterLab={() => onRouteChange('/lab')} />
      </div>

      {/* SIMULATOR MODULES DECK */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-xs font-bold text-slate-500 uppercase tracking-wider">
            SPECIALIZED ENGINEERING LABORATORIES
          </span>
          <span className="font-mono-tech text-xs text-blue-600 font-semibold hidden sm:inline">
            CLICK ANY MODULE TO EXPLORE
          </span>
        </div>

        {/* Visual Module Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickNav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => onRouteChange(item.route)}
                className="group flex flex-col items-center justify-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 border transition-transform group-hover:scale-110 ${item.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono-tech group-hover:text-blue-600 transition-colors leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono-tech mt-0.5 leading-tight">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Telemetry & Engineering Specs Strip */}
      <div className="flex flex-wrap items-center justify-around gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs font-mono-tech text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>8-CH 4K POE INGESTION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>120W PSE POWER BUDGET</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>H.265 / ALLFRAME 6G SATA</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>LIVE PACKET TRACE & DIAGNOSTICS</span>
        </div>
      </div>
    </div>
  );
};
