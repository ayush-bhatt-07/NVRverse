import React from 'react';
import { MotherboardScene } from '../components/three/MotherboardScene';

export const MotherboardLab: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#f8fafc]">
      <div className="flex-1 relative w-full h-full">
        <MotherboardScene />
      </div>
    </div>
  );
};
