import React from 'react';
import { LabRoute } from '../../types';
import { 
  Box, 
  Cpu, 
  Activity, 
  Wrench, 
  Sliders, 
  Share2, 
  AlertTriangle, 
  BookOpen, 
  Home,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentRoute: LabRoute;
  onRouteChange: (route: LabRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const navItems: { route: LabRoute; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
    { route: '/', label: 'HOME', icon: Home },
    { route: '/lab', label: '3D NVR', icon: Box },
    { route: '/lab/motherboard', label: 'MOTHERBOARD', icon: Cpu },
    { route: '/lab/packet-flow', label: 'PACKET FLOW', icon: Activity },
    { route: '/lab/installation', label: 'INSTALL SIM', icon: Wrench },
    { route: '/lab/configuration', label: 'VIRTUAL NVR OS', icon: Sliders },
    { route: '/network-builder', label: 'TOPOLOGY', icon: Share2 },
    { route: '/troubleshooting', label: 'DIAGNOSTICS', icon: AlertTriangle },
    { route: '/learn', label: 'ACADEMY', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Lab Indicator */}
          <div 
            onClick={() => onRouteChange('/')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-mono-tech font-bold text-sm shadow-xs group-hover:bg-blue-600 transition-colors">
              NV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-sm">
                  NVRVerse
                </span>
                <span className="font-mono-tech text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  ENGINEERING LAB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono-tech -mt-0.5 hidden sm:block">
                SYS.VIRTUAL // 8-CH POE DIGITAL TWIN
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onRouteChange(item.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry Status Bead */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono-tech text-[11px] font-bold text-slate-700">
                LAB ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Subnav */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onRouteChange(item.route)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono-tech whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
