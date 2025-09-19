import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Copy, Check, RefreshCw } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';

interface EventSelectorDropdownProps {
  onOpenEventSelector?: () => void;
}

const EventSelectorDropdown: React.FC<EventSelectorDropdownProps> = ({ onOpenEventSelector }) => {
  const { currentEvent, setCurrentEvent, userParticipations, userEvents, reloadUserEvents } = useEvent();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar eventos e participações quando o usuário mudar
  useEffect(() => {
    if (user) {
      reloadUserEvents(user.id);
    }
  }, [user, reloadUserEvents]);

  const handleEventSelect = (event: any) => {
    setCurrentEvent(event);
    setIsOpen(false);
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
    setIsOpen(false);
    
    // Recarregar eventos após sair para garantir que a lista esteja atualizada
    if (user) {
      reloadUserEvents(user.id);
    }
  };

  // Combinar eventos criados e participados, removendo duplicatas
  const allEvents = React.useMemo(() => {
    console.log('🔄 Combinando eventos...');
    console.log('📋 Eventos criados:', userEvents.length, userEvents.map(e => e.name));
    console.log('👥 Participações:', userParticipations.length, userParticipations.map(p => p.eventName));
    
    const eventMap = new Map();
    
    // Adicionar eventos criados
    userEvents.forEach(event => {
      eventMap.set(event.id, {
        id: event.id,
        name: event.name,
        inviteCode: event.inviteCode,
        role: 'creator' as const,
        joinedAt: event.createdAt
      });
      console.log('➕ Adicionado evento criado:', event.name);
    });
    
    // Adicionar participações (sobrescreve se já existir, mas mantém role correto)
    userParticipations.forEach(participation => {
      eventMap.set(participation.eventId, {
        id: participation.eventId,
        name: participation.eventName,
        inviteCode: participation.eventInviteCode,
        role: participation.role,
        joinedAt: participation.joinedAt
      });
      console.log('➕ Adicionada participação:', participation.eventName, '- Role:', participation.role);
    });
    
    const result = Array.from(eventMap.values()).sort((a, b) => {
      // Ordenar por data de entrada (mais recente primeiro)
      return b.joinedAt.getTime() - a.joinedAt.getTime();
    });
    
    console.log('📊 Total de eventos combinados:', result.length);
    console.log('📋 Lista final:', result.map(e => `${e.name} (${e.role})`));
    
    return result;
  }, [userEvents, userParticipations]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do evento atual - estilo compacto para header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700 transition-colors max-w-xs"
      >
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm text-encibra-gray-600 dark:text-encibra-gray-300 truncate">
            {currentEvent ? currentEvent.name : 'Selecionar Evento'}
          </div>
        </div>
        <ChevronDown className={`w-3 h-3 text-encibra-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-encibra-gray-800 rounded-xl shadow-2xl border border-encibra-gray-200 dark:border-encibra-gray-700 z-50">
          {/* Header do dropdown */}
          <div className="p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-encibra-gray-900 dark:text-white">
                  Eventos
                </h3>
                <p className="text-sm text-encibra-gray-500 dark:text-encibra-gray-400">
                  Selecione um evento para visualizar suas fotos
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => user && reloadUserEvents(user.id)}
                  className="p-2 hover:bg-encibra-gray-100 dark:hover:bg-encibra-gray-700 rounded-lg transition-colors"
                  title="Recarregar eventos"
                >
                  <RefreshCw className="w-4 h-4 text-encibra-gray-500 dark:text-encibra-gray-400" />
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 TESTE: Forçando recarregamento...');
                    console.log('👤 User:', user);
                    console.log('📋 UserEvents atual:', userEvents);
                    console.log('👥 UserParticipations atual:', userParticipations);
                    if (user) {
                      reloadUserEvents(user.id);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Teste de debug"
                >
                  🧪
                </button>
                <button
                  onClick={async () => {
                    if (!user || !currentEvent) {
                      alert('Usuário ou evento atual não encontrado');
                      return;
                    }
                    
                    try {
                      console.log('🧪 TESTE: Criando participação manual...');
                      const { eventParticipationService } = await import('../services/eventParticipationService');
                      
                      await eventParticipationService.addParticipation(
                        user.id,
                        currentEvent.id,
                        currentEvent.name,
                        currentEvent.inviteCode,
                        'participant'
                      );
                      
                      console.log('✅ TESTE: Participação criada com sucesso');
                      alert('Participação criada com sucesso!');
                      
                      // Recarregar eventos
                      if (user) {
                        reloadUserEvents(user.id);
                      }
                    } catch (error) {
                      console.error('❌ TESTE: Erro ao criar participação:', error);
                      alert('Erro ao criar participação: ' + error.message);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  title="Criar participação manual"
                >
                  ➕
                </button>
              </div>
            </div>
          </div>

          {/* Evento atual */}
          {currentEvent && (
            <div className="p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-encibra-blue-900 dark:text-encibra-blue-100">
                    Evento Atual
                  </h4>
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

          {/* Lista de eventos */}
          <div className="max-h-64 overflow-y-auto">
            {allEvents.length > 0 ? (
              <div className="p-2">
                {allEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      currentEvent?.id === event.id
                        ? 'bg-encibra-primary-50 dark:bg-encibra-primary-900/20 border border-encibra-primary-200 dark:border-encibra-primary-700'
                        : 'hover:bg-encibra-gray-50 dark:hover:bg-encibra-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-encibra-gray-900 dark:text-white truncate">
                            {event.name}
                          </h4>
                          {currentEvent?.id === event.id && (
                            <span className="text-xs bg-encibra-primary-100 dark:bg-encibra-primary-900 text-encibra-primary-600 dark:text-encibra-primary-400 px-2 py-1 rounded">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-encibra-gray-500 dark:text-encibra-gray-400 mt-1">
                          {event.role === 'creator' ? 'Criado' : 'Participando'} desde {event.joinedAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs bg-encibra-gray-100 dark:bg-encibra-gray-700 text-encibra-gray-600 dark:text-encibra-gray-400 px-2 py-1 rounded">
                          {event.inviteCode}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.role === 'creator'
                            ? 'bg-encibra-green-100 dark:bg-encibra-green-900 text-encibra-green-600 dark:text-encibra-green-400'
                            : 'bg-encibra-blue-100 dark:bg-encibra-blue-900 text-encibra-blue-600 dark:text-encibra-blue-400'
                        }`}>
                          {event.role === 'creator' ? 'Criador' : 'Participante'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <Calendar className="w-8 h-8 text-encibra-gray-400 mx-auto mb-2" />
                <p className="text-sm text-encibra-gray-500 dark:text-encibra-gray-400">
                  Nenhum evento encontrado
                </p>
                <p className="text-xs text-encibra-gray-400 dark:text-encibra-gray-500 mt-1">
                  Crie um evento ou entre via link
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-encibra-gray-100 dark:border-encibra-gray-700">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenEventSelector) {
                  onOpenEventSelector();
                }
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-encibra-primary-600 text-white rounded-lg hover:bg-encibra-primary-700 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Criar Novo Evento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSelectorDropdown;
