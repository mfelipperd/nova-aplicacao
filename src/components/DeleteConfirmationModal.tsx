import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageOwner: string;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  imageOwner,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative bg-white dark:bg-encibra-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-3 right-3 p-2 rounded-full text-encibra-gray-500 dark:text-encibra-gray-400 hover:bg-encibra-gray-100 dark:hover:bg-encibra-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-encibra-orange-100 dark:bg-encibra-orange-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-encibra-orange-600 dark:text-encibra-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-encibra-gray-900 dark:text-white">
              Deletar Foto
            </h3>
            <p className="text-sm text-encibra-gray-500 dark:text-encibra-gray-400">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-encibra-gray-700 dark:text-encibra-gray-300">
            Tem certeza que deseja deletar esta foto? Esta ação irá remover permanentemente:
          </p>
          <ul className="mt-2 text-sm text-encibra-gray-600 dark:text-encibra-gray-400 space-y-1">
            <li>• A imagem do servidor</li>
            <li>• Todos os comentários</li>
            <li>• Todos os likes</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-encibra-gray-800 dark:text-encibra-gray-200">
            Foto de: <span className="text-encibra-primary-600 dark:text-encibra-primary-400">{imageOwner}</span>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 text-sm font-medium text-encibra-gray-700 dark:text-encibra-gray-300 bg-encibra-gray-100 dark:bg-encibra-gray-700 rounded-lg hover:bg-encibra-gray-200 dark:hover:bg-encibra-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-encibra-orange-600 hover:bg-encibra-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deletando...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Deletar Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
