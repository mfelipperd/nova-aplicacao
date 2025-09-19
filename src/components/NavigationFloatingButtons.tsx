import React from 'react';
import { Heart, Home, Camera } from 'lucide-react';

interface NavigationFloatingButtonsProps {
  currentView: 'feed' | 'liked';
  likedImagesCount: number;
  onFeedClick: () => void;
  onLikedClick: () => void;
  onUploadClick: () => void;
}

const NavigationFloatingButtons: React.FC<NavigationFloatingButtonsProps> = ({
  currentView,
  likedImagesCount,
  onFeedClick,
  onLikedClick,
  onUploadClick
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      {/* Dock Container */}
      <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/80 dark:bg-encibra-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-encibra-gray-700/20">
        
        {/* Botão Feed */}
        <button
          onClick={onFeedClick}
          className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            currentView === 'feed'
              ? 'bg-encibra-primary-500 text-white shadow-lg scale-110'
              : 'bg-white/60 dark:bg-encibra-gray-700/60 text-encibra-gray-600 dark:text-encibra-gray-300 hover:bg-white dark:hover:bg-encibra-gray-700 hover:text-encibra-primary-500 hover:scale-105'
          }`}
          title="Feed Principal"
        >
          <Home className={`transition-transform duration-300 ${currentView === 'feed' ? 'scale-110' : ''}`} size={20} />
          
          {/* Efeito de brilho para o botão ativo */}
          {currentView === 'feed' && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-encibra-primary-600 to-encibra-primary-400 opacity-80"></div>
          )}
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-encibra-gray-900 dark:bg-encibra-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            Feed Principal
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-encibra-gray-900 dark:border-t-encibra-gray-700"></div>
          </div>
        </button>

        {/* Botão Curtidas */}
        <button
          onClick={onLikedClick}
          className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            currentView === 'liked'
              ? 'bg-encibra-orange-500 text-white shadow-lg scale-110'
              : 'bg-white/60 dark:bg-encibra-gray-700/60 text-encibra-gray-600 dark:text-encibra-gray-300 hover:bg-white dark:hover:bg-encibra-gray-700 hover:text-encibra-orange-500 hover:scale-105'
          }`}
          title="Fotos Curtidas"
        >
          <Heart className={`transition-transform duration-300 ${currentView === 'liked' ? 'scale-110 fill-current' : ''}`} size={20} />
          
          {/* Efeito de brilho para o botão ativo */}
          {currentView === 'liked' && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-encibra-orange-600 to-encibra-orange-400 opacity-80"></div>
          )}
          
          {/* Badge de contagem */}
          {likedImagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
              {likedImagesCount > 99 ? '99+' : likedImagesCount}
            </span>
          )}
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-encibra-gray-900 dark:bg-encibra-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            Fotos Curtidas
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-encibra-gray-900 dark:border-t-encibra-gray-700"></div>
          </div>
        </button>

        {/* Botão Upload/Camera */}
        <button
          onClick={onUploadClick}
          className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 bg-gradient-to-br from-encibra-green-500 to-encibra-green-600 text-white hover:from-encibra-green-600 hover:to-encibra-green-700 hover:scale-105 shadow-lg"
          title="Adicionar Foto"
        >
          <Camera className="transition-transform duration-300" size={20} />
          
          {/* Efeito de brilho */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-encibra-green-600 to-encibra-green-400 opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-encibra-gray-900 dark:bg-encibra-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            Adicionar Foto
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-encibra-gray-900 dark:border-t-encibra-gray-700"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NavigationFloatingButtons;
