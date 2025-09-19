import React, { useState } from 'react';
import { X, Upload, Camera, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { imageService } from '../services/imageService';
import type { Image } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (image: Image) => void;
  eventId?: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedImage?: Image;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, eventId }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const { user } = useAuth();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!user) {
      alert('Você precisa estar logado para fazer upload.');
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - não é uma imagem`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        invalidFiles.push(`${file.name} - muito grande (máx 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileWithPreview: FileWithPreview = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        };
        validFiles.push(fileWithPreview);

        if (validFiles.length + invalidFiles.length === files.length) {
          setSelectedFiles(prev => [...prev, ...validFiles]);

          if (invalidFiles.length > 0) {
            alert(`Arquivos inválidos:\n${invalidFiles.join('\n')}`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadAllFiles = async () => {
    if (!user || selectedFiles.length === 0) return;

    // Validar que há um evento ativo
    if (!eventId) {
      alert('⚠️ Você precisa estar em um evento para fazer upload de imagens.\n\nCrie ou entre em um evento primeiro.');
      return;
    }

    const pendingFiles = selectedFiles.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploadingCount(pendingFiles.length);

    setSelectedFiles(prev => prev.map(file =>
      file.status === 'pending' ? { ...file, status: 'uploading' as const } : file
    ));

    const uploadPromises = pendingFiles.map(async (fileWithPreview) => {
      try {
        
        const uploadedImage = await imageService.uploadImage(
          fileWithPreview.file,
          user.id,
          user.name,
          user.avatar,
          eventId
        );

        setSelectedFiles(prev => prev.map(file =>
          file.id === fileWithPreview.id
            ? { ...file, status: 'completed' as const, uploadedImage }
            : file
        ));

        onUpload(uploadedImage);
        return uploadedImage;
      } catch (error) {
        console.error('Erro no upload:', error);

        setSelectedFiles(prev => prev.map(file =>
          file.id === fileWithPreview.id
            ? { ...file, status: 'error' as const }
            : file
        ));
        return null;
      }
    });

    await Promise.all(uploadPromises);
    setUploadingCount(0);
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setUploadingCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-encibra-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-encibra-200 dark:border-encibra-700">
          <h2 className="text-xl font-semibold text-encibra-900 dark:text-white">
            Compartilhar Fotos
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-encibra-400 hover:text-encibra-600 dark:hover:text-encibra-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-encibra-100 dark:bg-encibra-700 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-encibra-500 dark:text-encibra-400" />
              </div>
              <h3 className="text-lg font-medium text-encibra-900 dark:text-white mb-2">
                Escolha suas fotos
              </h3>
              <p className="text-encibra-600 dark:text-encibra-300 mb-6">
                Selecione as fotos que você quer compartilhar com todos
              </p>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-encibra text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Upload className="w-5 h-5 mr-2" />
                Selecionar Fotos
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview das fotos */}
              <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileWithPreview) => (
                  <div key={fileWithPreview.id} className="relative">
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      {fileWithPreview.status === 'pending' && (
                        <div className="text-white text-xs text-center">
                          <p>Pronto</p>
                        </div>
                      )}
                      {fileWithPreview.status === 'uploading' && (
                        <div className="text-white text-xs text-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto mb-1"></div>
                          <p>Enviando...</p>
                        </div>
                      )}
                      {fileWithPreview.status === 'completed' && (
                        <div className="text-green-400 text-xs text-center">
                          <Check className="w-4 h-4 mx-auto mb-1" />
                          <p>Enviado!</p>
                        </div>
                      )}
                      {fileWithPreview.status === 'error' && (
                        <div className="text-red-400 text-xs text-center">
                          <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                          <p>Erro</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFile(fileWithPreview.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botões de ação */}
              <div className="flex space-x-3 justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="hidden"
                  id="add-more-files"
                />
                <label
                  htmlFor="add-more-files"
                  className="px-4 py-2 text-sm font-medium text-encibra-600 dark:text-encibra-400 bg-encibra-100 dark:bg-encibra-700 rounded-lg hover:bg-encibra-200 dark:hover:bg-encibra-600 cursor-pointer transition-colors"
                >
                  Adicionar mais
                </label>
                
                <button
                  onClick={uploadAllFiles}
                  disabled={uploadingCount > 0 || selectedFiles.filter(f => f.status === 'pending').length === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-encibra rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {uploadingCount > 0 ? `Enviando ${uploadingCount}...` : 'Enviar todas'}
                </button>
                
                <button
                  onClick={clearAll}
                  disabled={uploadingCount > 0}
                  className="px-4 py-2 text-sm font-medium text-encibra-600 dark:text-encibra-400 bg-encibra-100 dark:bg-encibra-700 rounded-lg hover:bg-encibra-200 dark:hover:bg-encibra-600 disabled:opacity-50 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
