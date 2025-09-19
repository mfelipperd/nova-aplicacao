import React from 'react';
import { Camera } from 'lucide-react';

interface FloatingUploadButtonProps {
  onClick: () => void;
}

const FloatingUploadButton: React.FC<FloatingUploadButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-encibra rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-white z-50 touch-manipulation pb-safe"
      title="Compartilhar foto"
    >
      <Camera className="w-6 h-6" />
    </button>
  );
};

export default FloatingUploadButton;
