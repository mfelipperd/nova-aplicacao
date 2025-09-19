import React, { useState, useEffect } from 'react';
import type { Image } from '../types';
import { imageService } from '../services/imageService';

const RealtimeDisplay: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Carregar imagens do Firebase
  useEffect(() => {
    const loadImages = async () => {
      try {
        const firebaseImages = await imageService.getAllImages();
        setImages(firebaseImages);
      } catch (error) {
        console.error('Erro ao carregar imagens para exibição:', error);
      }
    };

    loadImages();

    // Recarregar imagens a cada 30 segundos para atualizações em tempo real
    const interval = setInterval(loadImages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play das imagens
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Galeria da Festa</h1>
          <p className="text-xl opacity-75">Aguardando fotos serem compartilhadas...</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Controles */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black bg-opacity-50 rounded-lg p-3 flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-gray-300 transition-colors"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <span className="text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Informações da festa */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white">
          <h1 className="text-2xl font-bold mb-1">Galeria da Festa</h1>
          <p className="text-sm opacity-75">
            {images.length} foto{images.length !== 1 ? 's' : ''} compartilhada{images.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Imagem principal */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="relative max-w-6xl max-h-full">
          <img
            src={currentImage.url}
            alt={currentImage.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          
          {/* Overlay com informações da foto */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentImage.userAvatar || 'https://via.placeholder.com/48'}
                  alt={currentImage.userName}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <p className="text-white font-semibold text-lg">
                    {currentImage.userName}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {formatDate(currentImage.uploadedAt)}
                  </p>
                </div>
              </div>
              
              {currentImage.comments && currentImage.comments.length > 0 && (
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {currentImage.comments.length} comentário{currentImage.comments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de progresso */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navegação manual */}
      <div className="absolute inset-y-0 left-0 flex items-center z-10">
        <button
          onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
          className="ml-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
          title="Foto anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-10">
        <button
          onClick={() => setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
          className="mr-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
          title="Próxima foto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Contador de tempo */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white text-sm">
          {isPlaying ? 'Auto-play ativo' : 'Pausado'}
        </div>
      </div>
    </div>
  );
};

export default RealtimeDisplay;
