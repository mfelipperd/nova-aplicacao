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


      const q = query(
        collection(db, 'eventParticipations'),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (queryError) {
        console.error('❌ ERRO na query de participações:', queryError);
        throw queryError;
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
    } catch (error) {
      console.error('Erro ao atualizar dados da participação:', error);
      throw error;
    }
  }
};
