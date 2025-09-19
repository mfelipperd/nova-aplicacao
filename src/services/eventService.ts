import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { eventParticipationService } from './eventParticipationService';
import type { Party } from '../types';

class EventService {
  private readonly collectionName = 'parties';

  // Gerar código de convite único
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Criar novo evento
  async createEvent(name: string, description: string = '', createdBy: string): Promise<Party> {
    try {
      // Verificar se os parâmetros são válidos
      if (!name || !createdBy) {
        throw new Error('Nome do evento e ID do usuário são obrigatórios');
      }
      
      // Verificar se o Firebase está disponível
      if (!db) {
        throw new Error('Firebase não está inicializado');
      }
      
      const inviteCode = this.generateInviteCode();
      
      const eventData = {
        name,
        description,
        inviteCode,
        createdBy,
        createdAt: serverTimestamp(),
        isActive: true,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/event/${inviteCode}`
      };

      console.log('💾 Salvando evento no Firebase:', eventData);
      
      const docRef = await addDoc(collection(db, this.collectionName), eventData);
      
      console.log('✅ Evento salvo com ID:', docRef.id);
      
      const newEvent: Party = {
        id: docRef.id,
        name,
        description,
        inviteCode,
        createdBy,
        createdAt: new Date(),
        isActive: true,
        qrCode: eventData.qrCode
      };
      
      console.log('📅 Evento criado:', newEvent);

      // Adicionar participação do criador
      try {
        await eventParticipationService.addParticipation(
          createdBy,
          newEvent.id,
          newEvent.name,
          newEvent.inviteCode,
          'creator'
        );
      } catch (participationError) {
        console.error('Erro ao adicionar participação do criador:', participationError);
        // Não falhar a criação do evento se a participação falhar
      }
      
      return newEvent;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  // Buscar evento por código de convite
  async getEventByInviteCode(inviteCode: string): Promise<Party | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('inviteCode', '==', inviteCode),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        inviteCode: data.inviteCode,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
        qrCode: data.qrCode
      };
    } catch (error) {
      console.error('Erro ao buscar evento por código:', error);
      throw error;
    }
  }

  // Buscar evento por ID
  async getEventById(eventId: string): Promise<Party | null> {
    try {
      const docRef = doc(db, this.collectionName, eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        inviteCode: data.inviteCode,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
        qrCode: data.qrCode
      };
    } catch (error) {
      console.error('Erro ao buscar evento por ID:', error);
      throw error;
    }
  }

  // Listar eventos criados pelo usuário
  async getUserEvents(userId: string): Promise<Party[]> {
    try {
      console.log('🔍 Buscando eventos para usuário:', userId);
      
      const q = query(
        collection(db, this.collectionName),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
        console.log(`📋 Encontrados ${querySnapshot.docs.length} eventos para o usuário ${userId}`);
      } catch (queryError) {
        console.error('❌ ERRO na query principal:', queryError);
        throw queryError;
      }
      
      // Debug: Verificar se há eventos na coleção de forma geral
      try {
        const allEventsQuery = query(collection(db, this.collectionName));
        const allEventsSnapshot = await getDocs(allEventsQuery);
        console.log(`🔍 DEBUG: Total de eventos na coleção: ${allEventsSnapshot.docs.length}`);
        
        if (allEventsSnapshot.docs.length > 0) {
          console.log('🔍 DEBUG: Primeiros eventos encontrados:');
          allEventsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`  ${index + 1}. ID: ${doc.id}, createdBy: ${data.createdBy}, name: ${data.name}`);
          });
        }
      } catch (debugError) {
        console.error('❌ DEBUG: Erro ao buscar todos os eventos:', debugError);
      }
      
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const event = {
          id: doc.id,
          name: data.name,
          description: data.description,
          inviteCode: data.inviteCode,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive,
          qrCode: data.qrCode
        };
        console.log('📅 Evento encontrado:', event.name, '- ID:', event.id);
        return event;
      });
      
      return events;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos do usuário:', error);
      throw error;
    }
  }

  // Listar todos os eventos ativos
  async getAllActiveEvents(): Promise<Party[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          inviteCode: data.inviteCode,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive,
          qrCode: data.qrCode
        };
      });
    } catch (error) {
      console.error('Erro ao buscar todos os eventos:', error);
      throw error;
    }
  }

  // Atualizar evento
  async updateEvent(eventId: string, updates: Partial<Party>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, eventId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  // Desativar evento
  async deactivateEvent(eventId: string): Promise<void> {
    try {
      await this.updateEvent(eventId, { isActive: false });
    } catch (error) {
      console.error('Erro ao desativar evento:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
