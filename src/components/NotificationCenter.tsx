import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: string;
  type: 'comment';
  userId: string;
  userName: string;
  userAvatar?: string;
  imageId: string;
  imageUrl: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  onNotificationClick: (imageId: string) => void;
  isInline?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationClick, isInline = false }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Função para gerar avatar baseado nas iniciais
  const generateInitialsAvatar = (name: string, size: number = 32): string => {
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
  const processAvatarUrl = (avatarUrl: string | undefined, name: string, size: number = 32): string => {
    if (!avatarUrl) return generateInitialsAvatar(name, size);
    
    if (avatarUrl.includes('googleusercontent.com')) {
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

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marcar como lida no Firebase
      await notificationService.markNotificationAsRead(notification.id);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notification.id ? { ...notif, read: true } : notif
        )
      );
      
      // Fechar painel
      setIsOpen(false);
      
      // Navegar para a foto
      onNotificationClick(notification.imageId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (user) {
        await notificationService.markAllNotificationsAsRead(user.id);
      }
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const clearAll = async () => {
    try {
      if (user) {
        await notificationService.clearAllNotifications(user.id);
      }
      setNotifications([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  // Carregar notificações do Firebase
  useEffect(() => {
    if (!user) return;

    // Escutar notificações em tempo real
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (firebaseNotifications) => {
        setNotifications(firebaseNotifications);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calcular notificações não lidas
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  if (!user) return null;

  // Se estiver no modo inline, renderizar apenas a lista
  if (isInline) {
    return (
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="w-8 h-8 text-encibra-gray-300 dark:text-encibra-gray-600 mx-auto mb-2" />
            <p className="text-sm text-encibra-gray-500 dark:text-encibra-gray-400">
              Nenhuma notificação
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-3 rounded-lg cursor-pointer hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors ${
                !notification.read ? 'bg-encibra-blue-50/50 dark:bg-encibra-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-2">
                <img
                  src={processAvatarUrl(notification.userAvatar, notification.userName, 32)}
                  alt={notification.userName}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = generateInitialsAvatar(notification.userName, 32);
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-sm font-medium text-encibra-gray-900 dark:text-white truncate">
                      {notification.userName}
                    </span>
                    <span className="text-xs text-encibra-gray-500 dark:text-encibra-gray-400">
                      {getTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-encibra-gray-700 dark:text-encibra-gray-300 line-clamp-2">
                    {notification.content}
                  </p>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-encibra-primary-500 rounded-full mt-1"></div>
                  )}
                </div>
                
                <img
                  src={notification.imageUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botão de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-encibra-gray-500 dark:text-encibra-gray-400 hover:text-encibra-primary-600 dark:hover:text-encibra-gray-200 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge de notificações não lidas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-encibra-gray-800 rounded-xl shadow-2xl border border-encibra-gray-200 dark:border-encibra-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-encibra-gray-600 dark:text-encibra-gray-300" />
              <h3 className="font-semibold text-encibra-gray-900 dark:text-white">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs rounded-full">
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-encibra-primary-600 dark:text-encibra-primary-400 hover:text-encibra-primary-700 dark:hover:text-encibra-primary-300"
                >
                  Marcar como lidas
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-1 text-encibra-gray-400 hover:text-encibra-gray-600 dark:hover:text-encibra-gray-300"
                title="Limpar todas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-encibra-gray-300 dark:text-encibra-gray-600 mx-auto mb-3" />
                <p className="text-encibra-gray-500 dark:text-encibra-gray-400">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700 cursor-pointer hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors ${
                    !notification.read ? 'bg-encibra-blue-50/50 dark:bg-encibra-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <img
                      src={processAvatarUrl(notification.userAvatar, notification.userName, 40)}
                      alt={notification.userName}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = generateInitialsAvatar(notification.userName, 40);
                      }}
                    />
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-encibra-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-encibra-gray-900 dark:text-white">
                          {notification.userName}
                        </span>
                        <span className="text-xs text-encibra-gray-500 dark:text-encibra-gray-400">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-encibra-gray-700 dark:text-encibra-gray-300 mb-2">
                        comentou na sua foto:
                      </p>
                      
                      <div className="bg-encibra-gray-100 dark:bg-encibra-gray-700 rounded-lg p-2">
                        <p className="text-sm text-encibra-gray-900 dark:text-white italic">
                          "{notification.content}"
                        </p>
                      </div>
                      
                      {/* Indicador de não lida */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-encibra-primary-500 rounded-full mt-2"></div>
                      )}
                    </div>
                    
                    {/* Mini preview da imagem */}
                    <img
                      src={notification.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-encibra-gray-100 dark:border-encibra-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-encibra-gray-500 dark:text-encibra-gray-400 hover:text-encibra-gray-700 dark:hover:text-encibra-gray-200"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
