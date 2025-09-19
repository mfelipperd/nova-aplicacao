import React, { useState, useEffect } from 'react';
import { LogOut, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Feed from '../components/Feed';
import FloatingUploadButton from '../components/FloatingUploadButton';
import UploadModal from '../components/UploadModal';
import ThemeToggle from '../components/ThemeToggle';
import { imageService } from '../services/imageService';
import type { Image } from '../types';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Carregar imagens do Firebase
  useEffect(() => {
    const loadImages = async () => {
      try {
        const firebaseImages = await imageService.getAllImages();
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
  }, []);

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

  const handleLike = (_imageId: string) => {
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

  const handleDeleteImage = (_imageId: string) => {
    // Recarregar imagens após deletar
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

  const handleLogout = async () => {
    await logout();
  };

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
                  <h1 className="text-xl font-bold text-encibra-gray-900 dark:text-white">Encibra Events</h1>
                  <p className="text-sm text-encibra-gray-600 dark:text-encibra-gray-300">Galeria de fotos</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/32'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-encibra-gray-200 dark:border-encibra-gray-600"
                />
                <span className="text-sm font-medium text-encibra-gray-700 dark:text-encibra-gray-200">
                  {user?.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-3">
                <ThemeToggle />
                <a
                  href="/display"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-encibra-gray-500 dark:text-encibra-gray-400 hover:text-encibra-primary-600 dark:hover:text-encibra-gray-200 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Ver tela de projeção"
                >
                  <Eye className="w-5 h-5" />
                </a>
                <button
                  onClick={handleLogout}
                  className="p-2 text-encibra-gray-500 dark:text-encibra-gray-400 hover:text-encibra-orange-600 dark:hover:text-encibra-gray-200 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Feed */}
      <main className="py-4 sm:py-6 pb-safe">
        <Feed
          images={images}
          onDownload={handleDownload}
          onLike={handleLike}
          onAddComment={handleAddComment}
          onDeleteImage={handleDeleteImage}
        />
      </main>

      {/* Floating Upload Button */}
      <FloatingUploadButton onClick={() => setIsUploadModalOpen(true)} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleImageUpload}
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
