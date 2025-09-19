import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import Feed from '../components/Feed';
import LikedImages from '../components/LikedImages';
import NavigationFloatingButtons from '../components/NavigationFloatingButtons';
import SimpleUserPopover from '../components/SimpleUserPopover';
import UploadModal from '../components/UploadModal';
import EventSelectorDropdown from '../components/EventSelectorDropdown';
import EventSelector from '../components/EventSelector';
import { imageService } from '../services/imageService';
import type { Image } from '../types';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentEvent } = useEvent();
  const [images, setImages] = useState<Image[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'feed' | 'liked'>('feed');

  // Carregar imagens do Firebase
  useEffect(() => {
    const loadImages = async () => {
      try {
        const firebaseImages = await imageService.getAllImages(currentEvent?.id);
        setImages(firebaseImages);
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
        // Em caso de erro, usar dados mockados como fallback
        const mockImages: Image[] = [
          {
            id: '1',
            url: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Foto+da+Festa+1',
            filename: 'festa-1.jpg',
            uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            userId: '1',
            userName: 'João Silva',
            userAvatar: 'https://via.placeholder.com/40',
            comments: [
              {
                id: '1',
                content: 'Que festa incrível! 🎉',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                userId: '2',
                userName: 'Maria Santos',
                userAvatar: 'https://via.placeholder.com/20'
              }
            ]
          }
        ];
        setImages(mockImages);
      }
    };

    loadImages();
  }, [currentEvent]);

  const handleImageUpload = async (image: Image) => {
    setImages(prev => [image, ...prev]);
  };

  const handleDownload = (image: Image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddComment = (_imageId: string, _content: string) => {
    // Recarregar imagens do Firebase para ter os dados mais atualizados
    const reloadImages = async () => {
      try {
        const firebaseImages = await imageService.getAllImages();
        setImages(firebaseImages);
      } catch (error) {
        console.error('Erro ao recarregar imagens:', error);
      }
    };
    
    reloadImages();
  };

  const handleLike = async (imageId: string) => {
    if (!user) return;
    
    try {
      // Encontrar a imagem atual
      const currentImage = images.find(img => img.id === imageId);
      if (!currentImage) return;
      
      // Verificar se o usuário já curtiu
      const isLiked = currentImage.likedBy?.includes(user.id);
      
      if (isLiked) {
        // Remover like
        await imageService.unlikeImage(imageId, user.id);
      } else {
        // Adicionar like
        await imageService.likeImage(imageId, user.id);
      }
      
      // Recarregar imagens do Firebase para ter os dados mais atualizados
      const firebaseImages = await imageService.getAllImages();
      setImages(firebaseImages);
    } catch (error) {
      console.error('Erro ao dar like:', error);
      alert('Erro ao dar like. Tente novamente.');
    }
  };

  const handleDeleteImage = (_imageId: string) => {
    // Recarregar imagens após deletar
    const reloadImages = async () => {
      try {
        const firebaseImages = await imageService.getAllImages(currentEvent?.id);
        setImages(firebaseImages);
      } catch (error) {
        console.error('Erro ao recarregar imagens:', error);
      }
    };
    
    reloadImages();
  };

  const handleLogout = async () => {
    await logout();
  };

  // Calcular número de imagens curtidas
  const likedImagesCount = user ? images.filter(img => img.likedBy?.includes(user.id)).length : 0;



  return (
    <div className="min-h-screen bg-encibra-light dark:bg-encibra-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-encibra-gray-800 shadow-sm border-b border-encibra-gray-200 dark:border-encibra-gray-700 transition-colors duration-200 pt-safe">
        <div className="container-mobile">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-encibra rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-encibra-gray-900 dark:text-white">
                    Encibra Events
                  </h1>
                  {/* Seletor de eventos no lugar do subtítulo */}
                  <EventSelectorDropdown onOpenEventSelector={() => setIsEventSelectorOpen(true)} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              
              {/* Popover do usuário */}
              <SimpleUserPopover
                onNotificationClick={(imageId) => {
                  setCurrentView('feed');
                }}
                onLogout={handleLogout}
                onUploadClick={() => setIsUploadModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-4 sm:py-6 pb-safe">
        {currentView === 'feed' ? (
          <Feed
            images={images}
            onDownload={handleDownload}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onDeleteImage={handleDeleteImage}
          />
        ) : (
          <LikedImages
            images={images}
            onDownload={handleDownload}
            onBack={() => setCurrentView('feed')}
          />
        )}
      </main>

      {/* Navigation Dock */}
      <NavigationFloatingButtons
        currentView={currentView}
        likedImagesCount={likedImagesCount}
        onFeedClick={() => setCurrentView('feed')}
        onLikedClick={() => setCurrentView('liked')}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleImageUpload}
        eventId={currentEvent?.id}
      />

      {/* Event Selector Modal */}
      <EventSelector
        isOpen={isEventSelectorOpen}
        onClose={() => setIsEventSelectorOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-encibra-800 border-t border-encibra-200 dark:border-encibra-700 mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-encibra-500 dark:text-encibra-400 text-sm">
            <p>Escaneie o QR Code para acessar esta galeria</p>
            <p className="mt-1">Compartilhe suas fotos da festa com todos!</p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-xs">Powered by</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gradient-encibra rounded"></div>
                <span className="font-semibold text-encibra-600 dark:text-encibra-300">Encibra</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

