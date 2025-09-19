import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface EventParticipation {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  eventInviteCode: string;
  joinedAt: Date;
  role: 'creator' | 'participant';
}

export const eventParticipationService = {
  // Adicionar participação em evento (quando usuário entra via link)
  async addParticipation(
    userId: string,
    eventId: string,
    eventName: string,
    eventInviteCode: string,
    role: 'creator' | 'participant' = 'participant'
  ): Promise<EventParticipation> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!userId) throw new Error('ID do usuário é obrigatório');
      if (!eventId) throw new Error('ID do evento é obrigatório');

      // Verificar se já existe participação
      const existingParticipation = await this.getParticipationByUserAndEvent(userId, eventId);
      if (existingParticipation) {
        console.log('Usuário já participa deste evento');
        return existingParticipation;
      }

      const participationData = {
        userId,
        eventId,
        eventName,
        eventInviteCode,
        role,
        joinedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      console.log('Adicionando participação:', participationData);

      const docRef = await addDoc(collection(db, 'eventParticipations'), participationData);

      const participation: EventParticipation = {
        id: docRef.id,
        userId,
        eventId,
        eventName,
        eventInviteCode,
        joinedAt: new Date(),
        role
      };

      console.log('Participação criada com sucesso:', participation);
      return participation;
    } catch (error) {
      console.error('Erro ao adicionar participação:', error);
      throw error;
    }
  },

  // Buscar participação específica por usuário e evento
  async getParticipationByUserAndEvent(userId: string, eventId: string): Promise<EventParticipation | null> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!userId || !eventId) return null;

      const q = query(
        collection(db, 'eventParticipations'),
        where('userId', '==', userId),
        where('eventId', '==', eventId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        userId: data.userId,
        eventId: data.eventId,
        eventName: data.eventName,
        eventInviteCode: data.eventInviteCode,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        role: data.role
      };
    } catch (error) {
      console.error('Erro ao buscar participação:', error);
      return null;
    }
  },

  // Buscar todos os eventos que o usuário participa
  async getUserParticipations(userId: string): Promise<EventParticipation[]> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!userId) throw new Error('ID do usuário é obrigatório');

      console.log('🔍 PARTICIPAÇÃO: Buscando participações para usuário:', userId);

      const q = query(
        collection(db, 'eventParticipations'),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
        console.log(`🔍 PARTICIPAÇÃO: Encontradas ${querySnapshot.docs.length} participações para o usuário ${userId}`);
      } catch (queryError) {
        console.error('❌ ERRO na query de participações:', queryError);
        throw queryError;
      }

      // Debug: Verificar se há participações na coleção de forma geral
      try {
        const allParticipationsQuery = query(collection(db, 'eventParticipations'));
        const allParticipationsSnapshot = await getDocs(allParticipationsQuery);
        console.log(`🔍 PARTICIPAÇÃO DEBUG: Total de participações na coleção: ${allParticipationsSnapshot.docs.length}`);
        
        if (allParticipationsSnapshot.docs.length > 0) {
          console.log('🔍 PARTICIPAÇÃO DEBUG: Primeiras participações encontradas:');
          allParticipationsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`  ${index + 1}. ID: ${doc.id}, userId: ${data.userId}, eventId: ${data.eventId}, eventName: ${data.eventName}`);
          });
        }
      } catch (debugError) {
        console.error('❌ PARTICIPAÇÃO DEBUG: Erro ao buscar todas as participações:', debugError);
      }

      const participations: EventParticipation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        participations.push({
          id: doc.id,
          userId: data.userId,
          eventId: data.eventId,
          eventName: data.eventName,
          eventInviteCode: data.eventInviteCode,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          role: data.role
        });
      });

      console.log(`Encontradas ${participations.length} participações para o usuário ${userId}`);
      return participations;
    } catch (error) {
      console.error('Erro ao buscar participações do usuário:', error);
      return [];
    }
  },

  // Escutar mudanças nas participações do usuário
  subscribeToUserParticipations(
    userId: string,
    callback: (participations: EventParticipation[]) => void
  ): () => void {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!userId) return () => {};

      const q = query(
        collection(db, 'eventParticipations'),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const participations: EventParticipation[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          participations.push({
            id: doc.id,
            userId: data.userId,
            eventId: data.eventId,
            eventName: data.eventName,
            eventInviteCode: data.eventInviteCode,
            joinedAt: data.joinedAt?.toDate() || new Date(),
            role: data.role
          });
        });

        callback(participations);
      });
    } catch (error) {
      console.error('Erro ao escutar participações:', error);
      return () => {};
    }
  },

  // Remover participação (sair do evento)
  async removeParticipation(participationId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!participationId) throw new Error('ID da participação é obrigatório');

      await deleteDoc(doc(db, 'eventParticipations', participationId));
      console.log('Participação removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover participação:', error);
      throw error;
    }
  },

  // Atualizar dados da participação (quando evento é atualizado)
  async updateParticipationEventData(
    eventId: string,
    eventName: string,
    eventInviteCode: string
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      if (!eventId) throw new Error('ID do evento é obrigatório');

      const q = query(
        collection(db, 'eventParticipations'),
        where('eventId', '==', eventId)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises: Promise<void>[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const updatePromise = updateDoc(docSnapshot.ref, {
          eventName,
          eventInviteCode,
          updatedAt: serverTimestamp()
        });
        updatePromises.push(updatePromise);
      });

      await Promise.all(updatePromises);
      console.log(`Atualizadas ${updatePromises.length} participações para o evento ${eventId}`);
    } catch (error) {
      console.error('Erro ao atualizar dados da participação:', error);
      throw error;
    }
  }
};
