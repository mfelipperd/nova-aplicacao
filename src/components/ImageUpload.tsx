import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { imageService } from '../services/imageService';
import type { Image } from '../types';

interface ImageUploadProps {
  onUpload: (image: Image) => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedImage?: Image;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (!user) {
      alert('Você precisa estar logado para fazer upload.');
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const invalidFiles: string[] = [];

    // Processar cada arquivo
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - não é uma imagem`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        invalidFiles.push(`${file.name} - muito grande (máx 10MB)`);
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileWithPreview: FileWithPreview = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        };
        validFiles.push(fileWithPreview);
        
        // Adicionar ao estado quando todos os arquivos forem processados
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadAllFiles = async () => {
    if (!user || selectedFiles.length === 0) {
      return;
    }

    const pendingFiles = selectedFiles.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) {
      return;
    }
    setUploadingCount(pendingFiles.length);

    // Atualizar status para uploading
    setSelectedFiles(prev => prev.map(file => 
      file.status === 'pending' ? { ...file, status: 'uploading' as const } : file
    ));

    // Upload de cada arquivo
    const uploadPromises = pendingFiles.map(async (fileWithPreview, index) => {
      try {
        
        const uploadedImage = await imageService.uploadImage(
          fileWithPreview.file,
          user.id,
          user.name,
          user.avatar
        );
        
        
        // Atualizar status para completed
        setSelectedFiles(prev => prev.map(file => 
          file.id === fileWithPreview.id 
            ? { ...file, status: 'completed' as const, uploadedImage }
            : file
        ));
        
        onUpload(uploadedImage);
        return uploadedImage;
      } catch (error) {
        console.error(`❌ Erro no upload ${index + 1}:`, error);
        
        // Atualizar status para error
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-full mb-3">
            <Camera className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Compartilhe uma foto
          </h3>
          <p className="text-sm text-gray-500">
            Olá, {user?.name}! Escolha uma foto para compartilhar
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />

          {selectedFiles.length > 0 ? (
            <div className="space-y-4">
              {/* Lista de imagens selecionadas */}
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileWithPreview) => (
                  <div key={fileWithPreview.id} className="relative">
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    
                    {/* Status overlay */}
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
                    
                    {/* Botão remover */}
                    <button
                      onClick={() => removeFile(fileWithPreview.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Botões de ação */}
                  <div className="space-y-2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={onButtonClick}
                        disabled={uploadingCount > 0}
                        className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 rounded-md hover:bg-primary-200 disabled:opacity-50"
                      >
                        Adicionar mais
                      </button>
                      <button
                        onClick={uploadAllFiles}
                        disabled={uploadingCount > 0 || selectedFiles.filter(f => f.status === 'pending').length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                      >
                        {uploadingCount > 0 ? `Enviando ${uploadingCount}...` : 'Enviar todas'}
                      </button>
                      <button
                        onClick={clearAll}
                        disabled={uploadingCount > 0}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                      >
                        Limpar
                      </button>
                    </div>
                    
                  </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <button
                  onClick={onButtonClick}
                  disabled={uploadingCount > 0}
                  className="text-primary-600 hover:text-primary-500 font-medium text-sm"
                >
                  Clique para selecionar fotos
                </button>
                <p className="text-gray-500 text-sm">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF até 10MB cada
              </p>
            </div>
          )}
        </div>

        {uploadingCount > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
              Enviando {uploadingCount} foto{uploadingCount > 1 ? 's' : ''}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
