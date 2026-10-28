import React, { useState, useEffect } from 'react';
import { LabRoute } from './types';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { HardwareLab } from './pages/HardwareLab';
import { MotherboardLab } from './pages/MotherboardLab';
import { PacketFlowLab } from './pages/PacketFlowLab';
import { InstallationLab } from './pages/InstallationLab';
import { ConfigurationLab } from './pages/ConfigurationLab';
import { NetworkBuilderLab } from './pages/NetworkBuilderLab';
import { TroubleshootingLab } from './pages/TroubleshootingLab';
import { LearningHubLab } from './pages/LearningHubLab';

export default function App() {
  // Sync route with window.location.pathname or fallback to '/'
  const [currentRoute, setCurrentRoute] = useState<LabRoute>(() => {
    const path = window.location.pathname as LabRoute;
    const validRoutes: LabRoute[] = [
      '/',
      '/lab',
      '/lab/motherboard',
      '/lab/packet-flow',
      '/lab/installation',
      '/lab/configuration',
      '/network-builder',
      '/troubleshooting',
      '/learn',
    ];
    return validRoutes.includes(path) ? path : '/';
  });

  const handleRouteChange = (route: LabRoute) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as LabRoute;
      const validRoutes: LabRoute[] = [
        '/',
        '/lab',
        '/lab/motherboard',
        '/lab/packet-flow',
        '/lab/installation',
        '/lab/configuration',
        '/network-builder',
        '/troubleshooting',
        '/learn',
      ];
      if (validRoutes.includes(path)) {
        setCurrentRoute(path);
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Visual Engineering Laboratory Header Navigation */}
      <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />

      {/* Main Viewport Container */}
      <main className="flex-1">
        {currentRoute === '/' && <Home onRouteChange={handleRouteChange} />}
        {currentRoute === '/lab' && <HardwareLab />}
        {currentRoute === '/lab/motherboard' && <MotherboardLab />}
        {currentRoute === '/lab/packet-flow' && <PacketFlowLab />}
        {currentRoute === '/lab/installation' && <InstallationLab />}
        {currentRoute === '/lab/configuration' && <ConfigurationLab />}
        {currentRoute === '/network-builder' && <NetworkBuilderLab />}
        {currentRoute === '/troubleshooting' && <TroubleshootingLab />}
        {currentRoute === '/learn' && <LearningHubLab />}
      </main>
    </div>
  );
}
