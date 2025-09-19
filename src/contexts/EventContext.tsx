import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { eventService } from '../services/eventService';
import { eventParticipationService, type EventParticipation } from '../services/eventParticipationService';
import { useAuth } from './AuthContext';
import { CookieService, COOKIE_NAMES } from '../utils/cookieService';
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
  saveLastEventToCookie: (event: Party) => void;
  loadLastEventFromCookie: () => Party | null;
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

  // Salvar último evento nos cookies
  const saveLastEventToCookie = useCallback((event: Party) => {
    try {
      // Salvar por 30 dias
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      CookieService.setCookie(COOKIE_NAMES.LAST_EVENT_ID, event.id, {
        expires: expirationDate,
        path: '/'
      });
      
      CookieService.setCookie(COOKIE_NAMES.LAST_EVENT_NAME, event.name, {
        expires: expirationDate,
        path: '/'
      });
      
      CookieService.setCookie(COOKIE_NAMES.LAST_EVENT_INVITE_CODE, event.inviteCode, {
        expires: expirationDate,
        path: '/'
      });
    } catch (error) {
      console.error('Erro ao salvar evento nos cookies:', error);
    }
  }, []);

  // Recarregar todos os eventos do usuário
  const reloadUserEvents = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const [events, participations] = await Promise.all([
        eventService.getUserEvents(userId),
        eventParticipationService.getUserParticipations(userId)
      ]);
      
      setUserEvents(events);
      setUserParticipations(participations);
      
      // Auto-selecionar primeiro evento disponível se não há evento ativo
      if (!currentEvent) {
        // Combinar eventos criados e participados
        const allEvents = [...events, ...participations.map(p => ({
          id: p.eventId,
          name: p.eventName,
          inviteCode: p.eventInviteCode,
          description: '',
          qrCode: '',
          createdAt: new Date(),
          createdBy: '',
          isActive: true
        }))];
        
        // Remover duplicatas baseado no ID
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.id === event.id)
        );
        
        if (uniqueEvents.length > 0) {
          const firstEvent = uniqueEvents[0];
          setCurrentEvent(firstEvent);
          saveLastEventToCookie(firstEvent);
        }
      }
    } catch (error) {
      console.error('Erro ao recarregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentEvent, saveLastEventToCookie]);

  // Carregar último evento dos cookies
  const loadLastEventFromCookie = useCallback((): Party | null => {
    try {
      const eventId = CookieService.getCookie(COOKIE_NAMES.LAST_EVENT_ID);
      const eventName = CookieService.getCookie(COOKIE_NAMES.LAST_EVENT_NAME);
      const inviteCode = CookieService.getCookie(COOKIE_NAMES.LAST_EVENT_INVITE_CODE);
      
      if (eventId && eventName && inviteCode) {
        return {
          id: eventId,
          name: eventName,
          inviteCode: inviteCode,
          description: '',
          qrCode: '', // QR Code será gerado quando necessário
          createdAt: new Date(),
          createdBy: '',
          isActive: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar evento dos cookies:', error);
      return null;
    }
  }, []);

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
    
    const initializeEvent = async () => {
      const path = window.location.pathname;
      const eventMatch = path.match(/\/event\/([A-Z0-9]+)/);
      
      // Prioridade 1: Evento via URL (link direto)
      if (eventMatch) {
        const inviteCode = eventMatch[1];
        await loadEventByInviteCode(inviteCode, user.id);
        return; // Se carregou via URL, não carrega do cookie
      }
      
      // Prioridade 2: Evento salvo nos cookies
      const lastEventFromCookie = loadLastEventFromCookie();
      if (lastEventFromCookie) {
        // Verificar se o evento ainda existe e se o usuário tem acesso
        try {
          const fullEvent = await eventService.getEventByInviteCode(lastEventFromCookie.inviteCode);
          if (fullEvent) {
            setCurrentEvent(fullEvent);
            // Recarregar eventos do usuário para garantir que temos a lista atualizada
            await reloadUserEvents(user.id);
          }
        } catch (error) {
          console.error('Erro ao verificar evento dos cookies:', error);
          // Se o evento não existe mais, limpar os cookies
          CookieService.removeCookie(COOKIE_NAMES.LAST_EVENT_ID);
          CookieService.removeCookie(COOKIE_NAMES.LAST_EVENT_NAME);
          CookieService.removeCookie(COOKIE_NAMES.LAST_EVENT_INVITE_CODE);
        }
      } else {
        // Se não há evento nos cookies, carregar eventos do usuário
        await reloadUserEvents(user.id);
        
        // Auto-selecionar o primeiro evento disponível se não há evento ativo
        // Isso será feito após o carregamento dos eventos
      }
    };
    
    initializeEvent();
    setInitialized(true);
  }, [initialized, user, loadEventByInviteCode, loadLastEventFromCookie, reloadUserEvents]);

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
    saveLastEventToCookie,
    loadLastEventFromCookie,
    loading
  }), [currentEvent, userEvents, userParticipations, loadUserEvents, loadUserParticipations, loadEventByInviteCode, addEventParticipation, reloadUserEvents, saveLastEventToCookie, loadLastEventFromCookie, loading]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};
