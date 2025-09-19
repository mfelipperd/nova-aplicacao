import React, { useState } from 'react';
import { Download, MessageCircle, Heart, X } from 'lucide-react';
import type { Image as ImageType } from '../types';
import { imageService } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';

interface ImageGalleryProps {
  images: ImageType[];
  onDownload: (image: ImageType) => void;
  onAddComment: (imageId: string, content: string) => void;
  onLike: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDownload, onAddComment, onLike }) => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAddComment = async (imageId: string) => {
    if (newComment.trim() && user) {
      try {
        await imageService.addComment(
          imageId,
          newComment.trim(),
          user.id,
          user.name,
          user.avatar
        );
        // Notificar componente pai sobre a mudança
        onAddComment(imageId, newComment.trim());
        setNewComment('');
        setShowComments(null);
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert('Erro ao adicionar comentário. Tente novamente.');
      }
    }
  };

  const handleLike = async (imageId: string, image: ImageType) => {
    if (!user) return;

    try {
      const isLiked = image.likedBy?.includes(user.id);
      
      if (isLiked) {
        await imageService.unlikeImage(imageId, user.id);
      } else {
        await imageService.likeImage(imageId, user.id);
      }
      
      // Notificar componente pai sobre a mudança
      onLike(imageId);
    } catch (error) {
      console.error('Erro ao dar like:', error);
      alert('Erro ao dar like. Tente novamente.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Galeria da Festa
        </h2>
        <p className="text-gray-600">
          {images.length} foto{images.length !== 1 ? 's' : ''} compartilhada{images.length !== 1 ? 's' : ''}
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma foto ainda
          </h3>
          <p className="text-gray-500">
            Seja o primeiro a compartilhar uma foto da festa!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative group">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                />
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Ver em tela cheia"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => onDownload(image)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Baixar"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={image.userAvatar || 'https://via.placeholder.com/32'}
                      alt={image.userName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {image.userName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(image.uploadedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowComments(showComments === image.id ? null : image.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">
                        {image.comments?.length || 0}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleLike(image.id, image)}
                      className={`flex items-center space-x-1 transition-colors ${
                        user && image.likedBy?.includes(user.id) 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          user && image.likedBy?.includes(user.id) ? 'fill-current' : ''
                        }`} 
                      />
                      <span className="text-sm">{image.likes || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comentários */}
                {showComments === image.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                      {image.comments?.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <img
                              src={comment.userAvatar || 'https://via.placeholder.com/20'}
                              alt={comment.userName}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="font-medium text-gray-900">
                              {comment.userName}
                            </span>
                          </div>
                          <p className="text-gray-700 ml-6">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Adicionar comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(image.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(image.id)}
                        disabled={!newComment.trim()}
                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de imagem em tela cheia */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedImage.userAvatar || 'https://via.placeholder.com/40'}
                    alt={selectedImage.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedImage.userName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedImage.uploadedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDownload(selectedImage)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
