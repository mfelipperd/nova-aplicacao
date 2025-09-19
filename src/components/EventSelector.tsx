import React, { useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';

interface EventSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ isOpen, onClose }) => {
  const { currentEvent, setCurrentEvent, userEvents, userParticipations, loadUserEvents } = useEvent();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen || !user) return null;



  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;

    try {
      setCreating(true);
      const newEvent = await eventService.createEvent(
        newEventName.trim(),
        newEventDescription.trim(),
        user.id
      );
      
      // Atualizar lista de eventos
      await loadUserEvents(user.id);
      
      // Definir como evento atual
      setCurrentEvent(newEvent);
      
      // Limpar formulário
      setNewEventName('');
      setNewEventDescription('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    setCurrentEvent(event);
    onClose();
  };

  const handleCopyInviteCode = async (inviteCode: string) => {
    try {
      const inviteUrl = `${window.location.origin}/event/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(inviteCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const handleLeaveEvent = () => {
    setCurrentEvent(null);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-encibra-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-encibra-gray-200 dark:border-encibra-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-encibra-gray-900 dark:text-white">
                Eventos e Festas
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-encibra-gray-100 dark:hover:bg-encibra-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Evento atual */}
            {currentEvent && (
              <div className="mb-6 p-4 bg-encibra-blue-50 dark:bg-encibra-blue-900/20 rounded-lg border border-encibra-blue-200 dark:border-encibra-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-encibra-blue-900 dark:text-encibra-blue-100">
                      Evento Atual
                    </h3>
                    <p className="text-sm text-encibra-blue-700 dark:text-encibra-blue-300">
                      {currentEvent.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyInviteCode(currentEvent.inviteCode)}
                    className="flex items-center space-x-2 px-3 py-1 bg-encibra-blue-100 dark:bg-encibra-blue-800 text-encibra-blue-700 dark:text-encibra-blue-200 rounded-lg text-sm hover:bg-encibra-blue-200 dark:hover:bg-encibra-blue-700 transition-colors"
                  >
                    {copiedCode === currentEvent.inviteCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleLeaveEvent}
                  className="mt-3 text-sm text-encibra-blue-600 dark:text-encibra-blue-400 hover:text-encibra-blue-800 dark:hover:text-encibra-blue-200 transition-colors"
                >
                  Sair do Evento
                </button>
              </div>
            )}

            {/* Botão para criar novo evento */}
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-encibra-gray-300 dark:border-encibra-gray-600 rounded-lg hover:border-encibra-green-500 dark:hover:border-encibra-green-400 hover:bg-encibra-green-50 dark:hover:bg-encibra-green-900/20 transition-colors mb-6"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5 text-encibra-gray-500 dark:text-encibra-gray-400" />
                <span className="text-encibra-gray-700 dark:text-white">
                  Criar Nova Festa/Evento
                </span>
                </div>
              </button>
            )}

            {/* Formulário de criação */}
            {showCreateForm && (
              <form onSubmit={handleCreateEvent} className="mb-6 p-4 bg-encibra-gray-50 dark:bg-encibra-gray-700/50 rounded-lg">
                <h3 className="font-medium text-encibra-gray-900 dark:text-white mb-4">
                  Criar Novo Evento
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-encibra-gray-700 dark:text-white mb-2">
                      Nome do Evento
                    </label>
                    <input
                      type="text"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      placeholder="Ex: Aniversário da Maria, Formatura 2024..."
                      className="w-full px-3 py-2 border border-encibra-gray-300 dark:border-encibra-gray-600 rounded-lg focus:ring-2 focus:ring-encibra-primary-500 focus:border-transparent dark:bg-encibra-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-encibra-gray-700 dark:text-white mb-2">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      placeholder="Descreva o evento..."
                      rows={3}
                      className="w-full px-3 py-2 border border-encibra-gray-300 dark:border-encibra-gray-600 rounded-lg focus:ring-2 focus:ring-encibra-primary-500 focus:border-transparent dark:bg-encibra-gray-800 dark:text-white resize-none"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={creating || !newEventName.trim()}
                        className="flex-1 px-4 py-2 bg-encibra-primary-600 text-white rounded-lg hover:bg-encibra-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {creating ? 'Criando...' : 'Criar Evento'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewEventName('');
                          setNewEventDescription('');
                        }}
                        className="px-4 py-2 border border-encibra-gray-300 dark:border-encibra-gray-600 text-encibra-gray-700 dark:text-white rounded-lg hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                    
                    
                    {/* Botão para limpar dados (APENAS PARA TESTE) */}
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmClear = confirm(
                          '⚠️ ATENÇÃO: Isso vai deletar TODOS os dados do Firebase!\n\n' +
                          '• Todas as imagens\n' +
                          '• Todos os eventos\n' +
                          '• Todas as participações\n' +
                          '• Todas as notificações\n\n' +
                          'Esta ação NÃO PODE ser desfeita!\n\n' +
                          'Tem certeza que deseja continuar?'
                        );
                        
                        if (!confirmClear) return;
                        
                        try {
                          console.log('🔥 LIMPEZA: Iniciando limpeza do Firebase...');
                          
                          // Importar Firebase
                          const { collection, query, getDocs, writeBatch, doc } = await import('firebase/firestore');
                          const { getStorage, ref, listAll, deleteObject } = await import('firebase/storage');
                          const { db } = await import('../config/firebase');
                          const storage = getStorage();
                          
                          // Coleções para limpar
                          const collections = ['images', 'parties', 'eventParticipations', 'notifications'];
                          
                          for (const collectionName of collections) {
                            console.log(`🗑️  Limpando coleção: ${collectionName}`);
                            
                            const collectionRef = collection(db, collectionName);
                            const snapshot = await getDocs(collectionRef);
                            
                            if (snapshot.empty) {
                              console.log(`   ✅ Coleção ${collectionName} já está vazia`);
                              continue;
                            }
                            
                            console.log(`   📊 Encontrados ${snapshot.docs.length} documentos`);
                            
                            // Deletar em lotes de 500
                            const batch = writeBatch(db);
                            let batchCount = 0;
                            
                            for (const docSnapshot of snapshot.docs) {
                              batch.delete(doc(db, collectionName, docSnapshot.id));
                              batchCount++;
                              
                              if (batchCount === 500) {
                                await batch.commit();
                                console.log(`   ✅ Deletados ${batchCount} documentos`);
                                batchCount = 0;
                              }
                            }
                            
                            if (batchCount > 0) {
                              await batch.commit();
                              console.log(`   ✅ Deletados ${batchCount} documentos finais`);
                            }
                            
                            console.log(`   ✅ Coleção ${collectionName} limpa!`);
                          }
                          
                          console.log('🎉 Limpeza do Firebase concluída!');
                          alert('✅ Firebase limpo com sucesso!\n\nTodas as coleções foram esvaziadas.');
                          
                        } catch (error) {
                          console.error('❌ LIMPEZA: Erro durante a limpeza:', error);
                          alert('❌ Erro durante a limpeza: ' + error.message);
                        }
                      }}
                  </div>
                </div>
              </form>
            )}

            {/* Lista de eventos participados */}
            {userParticipations.length > 0 && (
              <div>
                <h3 className="font-medium text-encibra-gray-900 dark:text-white mb-4">
                  Eventos Participados
                </h3>
                <div className="space-y-3">
                  {userParticipations.map((participation) => (
                    <div
                      key={participation.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        currentEvent?.id === participation.eventId
                          ? 'border-encibra-primary-500 bg-encibra-primary-50 dark:bg-encibra-primary-900/20'
                          : 'border-encibra-gray-200 dark:border-encibra-gray-700 hover:border-encibra-gray-300 dark:hover:border-encibra-gray-600 hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50'
                      }`}
                      onClick={() => {
                        // Criar um objeto Party básico para compatibilidade
                        const event: any = {
                          id: participation.eventId,
                          name: participation.eventName,
                          inviteCode: participation.eventInviteCode,
                          createdAt: participation.joinedAt
                        };
                        handleSelectEvent(event);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-encibra-gray-900 dark:text-white">
                            {participation.eventName}
                          </h4>
                          <p className="text-xs text-encibra-gray-500 dark:text-encibra-gray-500 mt-2">
                            {participation.role === 'creator' ? 'Criado' : 'Participando'} desde {participation.joinedAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-encibra-gray-100 dark:bg-encibra-gray-700 text-encibra-gray-600 dark:text-encibra-gray-400 px-2 py-1 rounded">
                            {participation.eventInviteCode}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            participation.role === 'creator'
                              ? 'bg-encibra-green-100 dark:bg-encibra-green-900 text-encibra-green-600 dark:text-encibra-green-400'
                              : 'bg-encibra-blue-100 dark:bg-encibra-blue-900 text-encibra-blue-600 dark:text-encibra-blue-400'
                          }`}>
                            {participation.role === 'creator' ? 'Criador' : 'Participante'}
                          </span>
                          {currentEvent?.id === participation.eventId && (
                            <span className="text-xs bg-encibra-primary-100 dark:bg-encibra-primary-900 text-encibra-primary-600 dark:text-encibra-primary-400 px-2 py-1 rounded">
                              Ativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de eventos criados pelo usuário (mantido para compatibilidade) */}
            {userEvents.length > 0 && (
              <div className={userParticipations.length > 0 ? 'mt-6' : ''}>
                <h3 className="font-medium text-encibra-gray-900 dark:text-white mb-4">
                  Eventos Criados
                </h3>
                <div className="space-y-3">
                  {userEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        currentEvent?.id === event.id
                          ? 'border-encibra-primary-500 bg-encibra-primary-50 dark:bg-encibra-primary-900/20'
                          : 'border-encibra-gray-200 dark:border-encibra-gray-700 hover:border-encibra-gray-300 dark:hover:border-encibra-gray-600 hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50'
                      }`}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-encibra-gray-900 dark:text-white">
                            {event.name}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-encibra-gray-600 dark:text-encibra-gray-400 mt-1">
                              {event.description}
                            </p>
                          )}
                          <p className="text-xs text-encibra-gray-500 dark:text-encibra-gray-500 mt-2">
                            Criado em {event.createdAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-encibra-gray-100 dark:bg-encibra-gray-700 text-encibra-gray-600 dark:text-encibra-gray-400 px-2 py-1 rounded">
                            {event.inviteCode}
                          </span>
                          <span className="text-xs bg-encibra-green-100 dark:bg-encibra-green-900 text-encibra-green-600 dark:text-encibra-green-400 px-2 py-1 rounded">
                            Criador
                          </span>
                          {currentEvent?.id === event.id && (
                            <span className="text-xs bg-encibra-primary-100 dark:bg-encibra-primary-900 text-encibra-primary-600 dark:text-encibra-primary-400 px-2 py-1 rounded">
                              Ativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventSelector;
