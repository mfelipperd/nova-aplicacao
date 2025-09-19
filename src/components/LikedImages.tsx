import React, { useState } from 'react';
import { Download, Heart, DownloadCloud, ArrowLeft } from 'lucide-react';
import type { Image as ImageType } from '../types';
import { useAuth } from '../contexts/AuthContext';
// import ImageCardSkeleton from './ImageCardSkeleton';

interface LikedImagesProps {
  images: ImageType[];
  onDownload: (image: ImageType) => void;
  onBack: () => void;
}

const LikedImages: React.FC<LikedImagesProps> = ({ images, onDownload, onBack }) => {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  // Filtrar apenas imagens curtidas pelo usuário atual
  const likedImages = images.filter(image => 
    user && image.likedBy?.includes(user.id)
  );

  const handleToggleSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === likedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(likedImages.map(img => img.id)));
    }
  };

  const handleDownloadSelected = () => {
    selectedImages.forEach(imageId => {
      const image = likedImages.find(img => img.id === imageId);
      if (image) {
        onDownload(image);
      }
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Função para gerar avatar baseado nas iniciais
  const generateInitialsAvatar = (name: string, size: number = 40): string => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
              fill="white" text-anchor="middle" dy="0.35em">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Função para processar URLs de avatar
  const processAvatarUrl = (avatarUrl: string | undefined, name: string, size: number = 40): string => {
    if (!avatarUrl) return generateInitialsAvatar(name, size);
    
    // Se for URL do Google, ajustar para melhor compatibilidade
    if (avatarUrl.includes('googleusercontent.com')) {
      const baseUrl = avatarUrl.split('?')[0];
      return `${baseUrl}?sz=${size}`;
    }
    
    return avatarUrl;
  };

  if (likedImages.length === 0) {
    return (
      <div className="w-full px-2 sm:max-w-2xl sm:mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-encibra-gray-600 dark:text-encibra-gray-300 hover:text-encibra-primary-600 dark:hover:text-encibra-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mx-auto bg-encibra-100 dark:bg-encibra-800 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-encibra-400 dark:text-encibra-500" />
          </div>
          <h3 className="text-xl font-semibold text-encibra-900 dark:text-white mb-2">
            Nenhuma foto curtida ainda
          </h3>
          <p className="text-encibra-600 dark:text-encibra-300 max-w-md">
            Comece curtindo algumas fotos da festa para vê-las aqui!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:max-w-2xl sm:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-encibra-gray-600 dark:text-encibra-gray-300 hover:text-encibra-primary-600 dark:hover:text-encibra-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-encibra-gray-600 dark:text-encibra-gray-300">
            {likedImages.length} foto{likedImages.length !== 1 ? 's' : ''} curtida{likedImages.length !== 1 ? 's' : ''}
          </span>
          
          <button
            onClick={() => setIsSelecting(!isSelecting)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelecting
                ? 'bg-encibra-primary-600 text-white'
                : 'bg-encibra-gray-200 dark:bg-encibra-gray-700 text-encibra-gray-700 dark:text-encibra-gray-200'
            }`}
          >
            {isSelecting ? 'Cancelar' : 'Selecionar'}
          </button>
        </div>
      </div>

      {/* Controles de seleção */}
      {isSelecting && (
        <div className="bg-encibra-50 dark:bg-encibra-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-encibra-primary-600 dark:text-encibra-primary-400 hover:text-encibra-primary-700 dark:hover:text-encibra-primary-300"
              >
                {selectedImages.size === likedImages.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
              
              <span className="text-sm text-encibra-gray-600 dark:text-encibra-gray-300">
                {selectedImages.size} selecionada{selectedImages.size !== 1 ? 's' : ''}
              </span>
            </div>
            
            {selectedImages.size > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="flex items-center space-x-2 px-4 py-2 bg-encibra-green-600 text-white rounded-lg hover:bg-encibra-green-700 transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Baixar selecionadas</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid de imagens curtidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {likedImages.map((image) => (
          <div
            key={image.id}
            className={`relative group cursor-pointer rounded-lg overflow-hidden ${
              isSelecting ? 'ring-2 ring-encibra-primary-500' : ''
            }`}
            onClick={() => isSelecting ? handleToggleSelection(image.id) : onDownload(image)}
          >
            {/* Imagem */}
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Download className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Checkbox de seleção */}
              {isSelecting && (
                <div className="absolute top-2 left-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedImages.has(image.id)
                      ? 'bg-encibra-primary-600 border-encibra-primary-600'
                      : 'bg-white border-encibra-gray-300'
                  }`}>
                    {selectedImages.has(image.id) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Ícone de curtido */}
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-encibra-orange-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
            </div>
            
            {/* Informações da foto */}
            <div className="p-3 bg-white dark:bg-encibra-gray-800">
              <div className="flex items-center space-x-2 mb-1">
                <img
                  src={processAvatarUrl(image.userAvatar, image.userName, 20)}
                  alt={image.userName}
                  className="w-5 h-5 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = generateInitialsAvatar(image.userName, 20);
                  }}
                />
                <span className="text-xs font-medium text-encibra-gray-700 dark:text-encibra-gray-200 truncate">
                  {image.userName}
                </span>
              </div>
              <p className="text-xs text-encibra-gray-500 dark:text-encibra-gray-400">
                {getTimeAgo(image.uploadedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedImages;
