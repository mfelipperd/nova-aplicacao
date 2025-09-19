import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { eventService } from '../services/eventService';
import { eventParticipationService, type EventParticipation } from '../services/eventParticipationService';
import { useAuth } from './AuthContext';
import type { Party } from '../types';

interface EventContextType {
  currentEvent: Party | null;
  setCurrentEvent: (event: Party | null) => void;
  userEvents: Party[];
  setUserEvents: (events: Party[]) => void;
  userParticipations: EventParticipation[];
  setUserParticipations: (participations: EventParticipation[]) => void;
  loadUserEvents: (userId: string) => Promise<void>;
  loadUserParticipations: (userId: string) => Promise<void>;
  loadEventByInviteCode: (inviteCode: string) => Promise<void>;
  addEventParticipation: (event: Party, role: 'creator' | 'participant') => Promise<void>;
  reloadUserEvents: (userId: string) => Promise<void>;
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent deve ser usado dentro de um EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<Party | null>(null);
  const [userEvents, setUserEvents] = useState<Party[]>([]);
  const [userParticipations, setUserParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Carregar eventos do usuário
  const loadUserEvents = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const events = await eventService.getUserEvents(userId);
      setUserEvents(events);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar participações do usuário
  const loadUserParticipations = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const participations = await eventParticipationService.getUserParticipations(userId);
      setUserParticipations(participations);
    } catch (error) {
      console.error('Erro ao carregar participações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar participação em evento
  const addEventParticipation = useCallback(async (event: Party, role: 'creator' | 'participant') => {
    try {
      // Esta função será chamada quando necessário, mas precisamos do userId
      // Vamos implementar isso no componente que chama
      console.log('Adicionando participação:', event.name, role);
    } catch (error) {
      console.error('Erro ao adicionar participação:', error);
    }
  }, []);

  // Recarregar todos os eventos do usuário
  const reloadUserEvents = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      await loadUserEvents(userId);
      await loadUserParticipations(userId);
    } catch (error) {
      console.error('Erro ao recarregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUserEvents, loadUserParticipations]);

  // Carregar evento por código de convite
  const loadEventByInviteCode = useCallback(async (inviteCode: string, userId?: string) => {
    try {
      setLoading(true);
      const event = await eventService.getEventByInviteCode(inviteCode);
      if (event) {
        setCurrentEvent(event);
        
        // Adicionar participação quando usuário entra via link
        if (userId) {
          try {
            await eventParticipationService.addParticipation(
              userId,
              event.id,
              event.name,
              event.inviteCode,
              'participant'
            );
          } catch (participationError) {
            console.error('Erro ao adicionar participação:', participationError);
            // Não falhar o carregamento se a participação falhar
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar evento por código:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar se há evento na URL ao inicializar (apenas uma vez)
  useEffect(() => {
    if (initialized || !user) return;
    
    const path = window.location.pathname;
    const eventMatch = path.match(/\/event\/([A-Z0-9]+)/);
    
    if (eventMatch && !currentEvent) {
      const inviteCode = eventMatch[1];
      // Agora temos acesso ao userId através do contexto de autenticação
      loadEventByInviteCode(inviteCode, user.id);
    }
    
    setInitialized(true);
  }, [initialized, currentEvent, loadEventByInviteCode, user]);

  const value: EventContextType = useMemo(() => ({
    currentEvent,
    setCurrentEvent,
    userEvents,
    setUserEvents,
    userParticipations,
    setUserParticipations,
    loadUserEvents,
    loadUserParticipations,
    loadEventByInviteCode,
    addEventParticipation,
    reloadUserEvents,
    loading
  }), [currentEvent, userEvents, userParticipations, loadUserEvents, loadUserParticipations, loadEventByInviteCode, addEventParticipation, reloadUserEvents, loading]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
