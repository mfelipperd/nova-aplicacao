import React, { useState } from 'react';
import { Download, MessageCircle, Heart, MoreVertical } from 'lucide-react';
import type { Image as ImageType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { imageService } from '../services/imageService';

interface FeedProps {
  images: ImageType[];
  onDownload: (image: ImageType) => void;
  onLike: (imageId: string) => void;
  onAddComment: (imageId: string, content: string) => void;
}

const Feed: React.FC<FeedProps> = ({ images, onDownload, onLike, onAddComment }) => {
  const { user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState<{ [key: string]: string }>({});

  // Função para processar URLs de avatar do Google
  const processAvatarUrl = (avatarUrl: string | undefined, size: number = 40): string => {
    if (!avatarUrl) return `https://via.placeholder.com/${size}`;
    
    // Se for URL do Google, ajustar para melhor compatibilidade
    if (avatarUrl.includes('googleusercontent.com')) {
      // Remover parâmetros que podem causar problemas e adicionar size
      const baseUrl = avatarUrl.split('?')[0];
      return `${baseUrl}?sz=${size}`;
    }
    
    return avatarUrl;
  };




  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleAddComment = async (imageId: string) => {
    const content = newCommentContent[imageId];
    
    if (content && content.trim() && user) {
      try {
        await imageService.addComment(imageId, content.trim(), user.id, user.name, user.avatar);
        setNewCommentContent(prev => ({ ...prev, [imageId]: '' }));
        onAddComment(imageId, content.trim()); // Notify parent to reload images
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert('Erro ao adicionar comentário. Tente novamente.');
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mx-auto bg-encibra-100 dark:bg-encibra-800 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-12 h-12 text-encibra-400 dark:text-encibra-500" />
        </div>
        <h3 className="text-xl font-semibold text-encibra-900 dark:text-white mb-2">
          Nenhuma foto ainda
        </h3>
        <p className="text-encibra-600 dark:text-encibra-300 max-w-md">
          Seja o primeiro a compartilhar uma foto da festa! Use o botão flutuante para enviar suas fotos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {images.map((image) => (
        <div key={image.id} className="bg-white dark:bg-encibra-800 rounded-xl shadow-lg border border-encibra-200 dark:border-encibra-700 overflow-hidden">
          {/* Header do post */}
          <div className="flex items-center justify-between p-4 border-b border-encibra-100 dark:border-encibra-700">
            <div className="flex items-center space-x-3">
                  <img
                    src={processAvatarUrl(image.userAvatar, 40)}
                    alt={image.userName}
                    className="w-10 h-10 rounded-full border-2 border-encibra-200 dark:border-encibra-600"
                    onError={(e) => {
                      console.log('❌ Avatar failed to load:', {
                        url: image.userAvatar,
                        userName: image.userName,
                        error: e.currentTarget.src
                      });
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(image.userName)}&background=random&color=fff&size=40`;
                    }}
                    onLoad={() => {
                      console.log('✅ Avatar loaded successfully:', {
                        url: image.userAvatar,
                        userName: image.userName
                      });
                    }}
                  />
              <div>
                <p className="font-semibold text-encibra-900 dark:text-white">
                  {image.userName}
                </p>
                <p className="text-sm text-encibra-500 dark:text-encibra-400">
                  {getTimeAgo(image.uploadedAt)}
                </p>
              </div>
            </div>
            
            <button className="p-2 text-encibra-400 hover:text-encibra-600 dark:hover:text-encibra-300 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Imagem */}
          <div className="relative">
            <img
              src={image.url}
              alt={image.filename}
              className="w-full object-cover cursor-pointer"
              onClick={() => onDownload(image)}
            />
          </div>

          {/* Ações */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onLike(image.id)}
                  className={`flex items-center space-x-1 transition-colors ${
                    user && image.likedBy?.includes(user.id) 
                      ? 'text-red-500' 
                      : 'text-encibra-500 dark:text-encibra-400 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`w-6 h-6 ${
                      user && image.likedBy?.includes(user.id) ? 'fill-current' : ''
                    }`} 
                  />
                  <span className="text-sm font-medium">
                    {image.likes || 0}
                  </span>
                </button>
                
                <button className="flex items-center space-x-1 text-encibra-500 dark:text-encibra-400 hover:text-encibra-600 dark:hover:text-encibra-300 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">
                    {image.comments?.length || 0}
                  </span>
                </button>
                
                <button 
                  onClick={() => onDownload(image)}
                  className="text-encibra-500 dark:text-encibra-400 hover:text-encibra-600 dark:hover:text-encibra-300 transition-colors"
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Comentários */}
            {image.comments && image.comments.length > 0 && (
              <div className="space-y-2 mb-3">
                {image.comments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                          <img
                            src={processAvatarUrl(comment.userAvatar, 24)}
                            alt={comment.userName}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random&color=fff&size=24`;
                            }}
                          />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-encibra-900 dark:text-white">
                          {comment.userName}
                        </span>
                        <span className="text-encibra-900 dark:text-white ml-2">
                          {comment.content}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
                {image.comments.length > 3 && (
                  <button className="text-sm text-encibra-500 dark:text-encibra-400 hover:text-encibra-600 dark:hover:text-encibra-300">
                    Ver todos os {image.comments.length} comentários
                  </button>
                )}
              </div>
            )}

            {/* Campo de comentário */}
            <div className="flex items-center space-x-2 pt-2 border-t border-encibra-100 dark:border-encibra-700">
                    <img
                      src={user?.avatar || 'https://via.placeholder.com/24'}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/24';
                      }}
                    />
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Adicionar comentário..."
                  value={newCommentContent[image.id] || ''}
                  onChange={(e) => {
                    setNewCommentContent(prev => ({ ...prev, [image.id]: e.target.value }));
                  }}
                  className="flex-1 bg-transparent text-sm text-encibra-900 dark:text-white placeholder-encibra-400 dark:placeholder-encibra-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCommentContent[image.id]?.trim()) {
                      handleAddComment(image.id);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    handleAddComment(image.id);
                  }}
                  disabled={!newCommentContent[image.id]?.trim()}
                  className="text-sm font-semibold text-encibra-purple-500 hover:text-encibra-purple-600 dark:text-encibra-purple-400 dark:hover:text-encibra-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
