import React, { useState, useEffect } from 'react';
import { Eye, LogOut, Settings, Camera, Sun, Moon, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useEvent } from '../contexts/EventContext';
import { notificationService } from '../services/notificationService';
import EventSelector from './EventSelector';

interface SimpleUserPopoverProps {
  onNotificationClick: (imageId: string) => void;
  onLogout: () => void;
  onUploadClick: () => void;
}

const SimpleUserPopover: React.FC<SimpleUserPopoverProps> = ({
  onLogout,
  onUploadClick
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentEvent, loadUserEvents, loadUserParticipations } = useEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEventSelector, setShowEventSelector] = useState(false);

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
    
    if (avatarUrl.includes('googleusercontent.com')) {
      const baseUrl = avatarUrl.split('?')[0];
      return `${baseUrl}?sz=${size}`;
    }
    
    return avatarUrl;
  };

  // Buscar contagem de notificações não lidas
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Erro ao buscar contagem de notificações:', error);
      }
    };

    fetchUnreadCount();

    // Escutar mudanças em tempo real
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length;
        setUnreadCount(unreadCount);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Carregar eventos e participações do usuário (apenas uma vez)
  useEffect(() => {
    if (!user) return;
    loadUserEvents(user.id);
    loadUserParticipations(user.id);
  }, [user?.id, loadUserEvents, loadUserParticipations]);

  // Escutar evento customizado para abrir o EventSelector
  useEffect(() => {
    const handleOpenEventSelector = () => {
      setShowEventSelector(true);
      setIsOpen(false); // Fechar o popover
    };

    window.addEventListener('openEventSelector', handleOpenEventSelector);
    
    return () => {
      window.removeEventListener('openEventSelector', handleOpenEventSelector);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botão do avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700 transition-colors"
      >
        <span className="text-sm font-medium text-encibra-gray-700 dark:text-white">
          {user.name}
        </span>
        <div className="relative">
          <img
            src={processAvatarUrl(user.avatar, user.name, 40)}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-encibra-gray-200 dark:border-encibra-gray-600"
            onError={(e) => {
              e.currentTarget.src = generateInitialsAvatar(user.name, 40);
            }}
          />
          {/* Badge de notificações */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Conteúdo do popover */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-encibra-gray-800 rounded-xl shadow-2xl border border-encibra-gray-200 dark:border-encibra-gray-700 z-40">
            {/* Header do popover */}
            <div className="p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={processAvatarUrl(user.avatar, user.name, 48)}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-encibra-gray-200 dark:border-encibra-gray-600"
                  onError={(e) => {
                    e.currentTarget.src = generateInitialsAvatar(user.name, 48);
                  }}
                />
                <div>
                  <h3 className="font-semibold text-encibra-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-encibra-gray-500 dark:text-encibra-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Opções do menu */}
            <div className="py-2">
              {/* Gerenciar Eventos */}
              <button
                onClick={() => {
                  setShowEventSelector(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-encibra-purple-100 dark:bg-encibra-purple-900 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-encibra-purple-600 dark:text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-encibra-gray-700 dark:text-white">
                    Eventos e Festas
                  </span>
                  {currentEvent && (
                    <p className="text-xs text-encibra-gray-500 dark:text-encibra-gray-300">
                      {currentEvent.name}
                    </p>
                  )}
                </div>
              </button>

              {/* Adicionar Foto */}
              <button
                onClick={() => {
                  onUploadClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-encibra-green-100 dark:bg-encibra-green-900 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-encibra-green-600 dark:text-white" />
                </div>
                <span className="text-encibra-gray-700 dark:text-white">
                  Adicionar Foto
                </span>
              </button>

              {/* Ver Projeção */}
              <a
                href="/display"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-encibra-purple-100 dark:bg-encibra-purple-900 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-encibra-purple-600 dark:text-white" />
                </div>
                <span className="text-encibra-gray-700 dark:text-white">
                  Ver Tela de Projeção
                </span>
              </a>

              {/* Toggle de Tema */}
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-encibra-gray-100 dark:bg-encibra-gray-700 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-encibra-gray-600 dark:text-white" />
                  ) : (
                    <Moon className="w-4 h-4 text-encibra-gray-600 dark:text-white" />
                  )}
                </div>
                <span className="text-encibra-gray-700 dark:text-white">
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              </button>

              {/* Configurações */}
              <button
                onClick={() => {
                  // TODO: Implementar configurações
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-encibra-gray-100 dark:bg-encibra-gray-700 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-encibra-gray-600 dark:text-white" />
                </div>
                <span className="text-encibra-gray-700 dark:text-white">
                  Configurações
                </span>
              </button>

              {/* Sair */}
              {/* Botão de teste para verificar imagens */}
              <button
                onClick={async () => {
                  try {
                    console.log('🧪 TESTE: Verificando imagens no Firebase...');
                    
                    // Importar Firebase
                    const { collection, query, getDocs, where } = await import('firebase/firestore');
                    const { db } = await import('../config/firebase');
                    
                    // Verificar todas as imagens
                    const allImagesQuery = query(collection(db, 'images'));
                    const allImagesSnapshot = await getDocs(allImagesQuery);
                    console.log(`📷 TOTAL: ${allImagesSnapshot.docs.length} imagens no Firebase`);
                    
                    // Verificar imagens do usuário atual
                    const userImagesQuery = query(collection(db, 'images'), where('userId', '==', user.id));
                    const userImagesSnapshot = await getDocs(userImagesQuery);
                    console.log(`👤 MINHAS: ${userImagesSnapshot.docs.length} imagens do usuário ${user.id}`);
                    
                    // Mostrar detalhes
                    allImagesSnapshot.docs.forEach((doc, index) => {
                      const data = doc.data();
                      console.log(`  ${index + 1}. ID: ${doc.id}, userId: ${data.userId}, eventId: ${data.eventId}, filename: ${data.filename}`);
                    });
                    
                    alert(`📊 Verificação completa!\n\nTotal de imagens: ${allImagesSnapshot.docs.length}\nSuas imagens: ${userImagesSnapshot.docs.length}\n\nVerifique o console para detalhes.`);
                    
                  } catch (error) {
                    console.error('❌ TESTE: Erro na verificação:', error);
                    alert('❌ Erro na verificação: ' + error.message);
                  }
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-blue-600 dark:text-blue-400"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-lg">🔍</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400">Verificar Imagens (TESTE)</span>
              </button>

              {/* Botão para recarregar imagens */}
              <button
                onClick={async () => {
                  try {
                    console.log('🔄 RECARREGAMENTO: Forçando recarregamento das imagens...');
                    
                    // Importar Firebase
                    const { collection, query, getDocs, where, orderBy } = await import('firebase/firestore');
                    const { db } = await import('../config/firebase');
                    
                    // Buscar imagens do evento atual
                    const { currentEvent } = await import('../contexts/EventContext');
                    const eventId = currentEvent?.id;
                    
                    console.log('🔄 RECARREGAMENTO: Buscando imagens para evento:', eventId);
                    
                    let imagesQuery;
                    if (eventId) {
                      imagesQuery = query(
                        collection(db, 'images'), 
                        where('eventId', '==', eventId),
                        orderBy('uploadedAt', 'desc')
                      );
                    } else {
                      imagesQuery = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
                    }
                    
                    const snapshot = await getDocs(imagesQuery);
                    console.log(`🔄 RECARREGAMENTO: Encontradas ${snapshot.docs.length} imagens`);
                    
                    // Mapear para o formato esperado
                    const images = snapshot.docs.map(doc => {
                      const data = doc.data();
                      return {
                        id: doc.id,
                        url: data.url,
                        filename: data.filename,
                        uploadedAt: data.uploadedAt?.toDate() || new Date(),
                        userId: data.userId,
                        userName: data.userName,
                        userAvatar: data.userAvatar,
                        comments: data.comments || [],
                        likes: data.likes || 0,
                        likedBy: data.likedBy || [],
                        eventId: data.eventId
                      };
                    });
                    
                    // Disparar evento customizado para atualizar o HomePage
                    window.dispatchEvent(new CustomEvent('forceReloadImages', { detail: images }));
                    
                    alert(`🔄 Recarregamento forçado!\n\nEncontradas ${images.length} imagens.\nVerifique se as imagens foram atualizadas na interface.`);
                    
                  } catch (error) {
                    console.error('❌ RECARREGAMENTO: Erro:', error);
                    alert('❌ Erro no recarregamento: ' + error.message);
                  }
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-600 dark:text-green-400"
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 text-lg">🔄</span>
                </div>
                <span className="text-green-600 dark:text-green-400">Recarregar Imagens (TESTE)</span>
              </button>

              {/* Botão de limpeza do Firebase (APENAS PARA TESTE) */}
              <button
                onClick={async () => {
                  const confirmClear = confirm(
                    '⚠️ ATENÇÃO: Isso vai deletar TODOS os SEUS dados!\n\n' +
                    '• Suas imagens\n' +
                    '• Seus eventos criados\n' +
                    '• Suas participações\n' +
                    '• Suas notificações\n\n' +
                    'Esta ação NÃO PODE ser desfeita!\n\n' +
                    'Tem certeza que deseja continuar?'
                  );
                  
                  if (!confirmClear) return;
                  
                  try {
                    console.log('🔥 LIMPEZA: Iniciando limpeza do Firebase...');
                    
                    // Importar Firebase
                    const { collection, query, getDocs, writeBatch, doc, deleteDoc, where } = await import('firebase/firestore');
                    const { db } = await import('../config/firebase');
                    
                    // Limpar apenas documentos que o usuário tem permissão
                    console.log(`🗑️  Limpando dados do usuário: ${user.id}`);
                    
                    // 1. Limpar imagens do usuário
                    console.log('📷 Limpando imagens do usuário...');
                    const imagesQuery = query(collection(db, 'images'), where('userId', '==', user.id));
                    const imagesSnapshot = await getDocs(imagesQuery);
                    console.log(`   📊 Encontradas ${imagesSnapshot.docs.length} imagens do usuário`);
                    
                    for (const docSnapshot of imagesSnapshot.docs) {
                      try {
                        await deleteDoc(doc(db, 'images', docSnapshot.id));
                        console.log(`   ✅ Imagem deletada: ${docSnapshot.id}`);
                      } catch (error) {
                        console.error(`   ❌ Erro ao deletar imagem ${docSnapshot.id}:`, error);
                      }
                    }
                    
                    // 2. Limpar eventos criados pelo usuário
                    console.log('🎉 Limpando eventos criados pelo usuário...');
                    const partiesQuery = query(collection(db, 'parties'), where('createdBy', '==', user.id));
                    const partiesSnapshot = await getDocs(partiesQuery);
                    console.log(`   📊 Encontrados ${partiesSnapshot.docs.length} eventos criados pelo usuário`);
                    
                    for (const docSnapshot of partiesSnapshot.docs) {
                      try {
                        await deleteDoc(doc(db, 'parties', docSnapshot.id));
                        console.log(`   ✅ Evento deletado: ${docSnapshot.id}`);
                      } catch (error) {
                        console.error(`   ❌ Erro ao deletar evento ${docSnapshot.id}:`, error);
                      }
                    }
                    
                    // 3. Limpar participações do usuário
                    console.log('👥 Limpando participações do usuário...');
                    const participationsQuery = query(collection(db, 'eventParticipations'), where('userId', '==', user.id));
                    const participationsSnapshot = await getDocs(participationsQuery);
                    console.log(`   📊 Encontradas ${participationsSnapshot.docs.length} participações do usuário`);
                    
                    for (const docSnapshot of participationsSnapshot.docs) {
                      try {
                        await deleteDoc(doc(db, 'eventParticipations', docSnapshot.id));
                        console.log(`   ✅ Participação deletada: ${docSnapshot.id}`);
                      } catch (error) {
                        console.error(`   ❌ Erro ao deletar participação ${docSnapshot.id}:`, error);
                      }
                    }
                    
                    // 4. Limpar notificações do usuário
                    console.log('🔔 Limpando notificações do usuário...');
                    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.id));
                    const notificationsSnapshot = await getDocs(notificationsQuery);
                    console.log(`   📊 Encontradas ${notificationsSnapshot.docs.length} notificações do usuário`);
                    
                    for (const docSnapshot of notificationsSnapshot.docs) {
                      try {
                        await deleteDoc(doc(db, 'notifications', docSnapshot.id));
                        console.log(`   ✅ Notificação deletada: ${docSnapshot.id}`);
                      } catch (error) {
                        console.error(`   ❌ Erro ao deletar notificação ${docSnapshot.id}:`, error);
                      }
                    }
                    
                    console.log('🎉 Limpeza dos dados do usuário concluída!');
                    
                    // Forçar recarregamento da página para limpar cache
                    alert('✅ Seus dados foram limpos com sucesso!\n\nA página será recarregada para atualizar a interface.');
                    window.location.reload();
                    
                  } catch (error) {
                    console.error('❌ LIMPEZA: Erro durante a limpeza:', error);
                    alert('❌ Erro durante a limpeza: ' + error.message);
                  }
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-300 text-lg">🔥</span>
                </div>
                <span className="text-red-600 dark:text-red-400">Limpar Meus Dados (TESTE)</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-300" />
                </div>
                <span className="text-red-600 dark:text-red-400">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Event Selector Modal */}
      <EventSelector
        isOpen={showEventSelector}
        onClose={() => setShowEventSelector(false)}
      />
    </div>
  );
};

export default SimpleUserPopover;
