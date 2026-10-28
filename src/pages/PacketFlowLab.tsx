import React from 'react';
import { PacketSimulationScene } from '../components/three/PacketSimulationScene';

export const PacketFlowLab: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#f8fafc]">
      <div className="flex-1 relative w-full h-full">
        <PacketSimulationScene />
      </div>
    </div>
  );
};
