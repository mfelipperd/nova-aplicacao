import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
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
  recipientId: string; // ID do dono da foto
}

export const notificationService = {
  // Criar notificação quando alguém comenta em uma foto
  async createCommentNotification(
    imageId: string,
    imageUrl: string,
    commentContent: string,
    commenterId: string,
    commenterName: string,
    commenterAvatar: string | undefined,
    photoOwnerId: string
  ): Promise<void> {
    try {
      // Não criar notificação se o comentário é do próprio dono da foto
      if (commenterId === photoOwnerId) return;

      const notificationData = {
        type: 'comment' as const,
        userId: commenterId,
        userName: commenterName,
        userAvatar: commenterAvatar,
        imageId,
        imageUrl,
        content: commentContent,
        timestamp: serverTimestamp(),
        read: false,
        recipientId: photoOwnerId
      };

      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw new Error('Erro ao criar notificação');
    }
  },

  // Buscar notificações de um usuário
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          imageId: data.imageId,
          imageUrl: data.imageUrl,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          recipientId: data.recipientId
        };
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw new Error('Erro ao buscar notificações');
    }
  },

  // Marcar notificação como lida
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw new Error('Erro ao marcar notificação como lida');
    }
  },

  // Marcar todas as notificações como lidas
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw new Error('Erro ao marcar todas as notificações como lidas');
    }
  },

  // Contar notificações não lidas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  },

  // Escutar notificações em tempo real
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          imageId: data.imageId,
          imageUrl: data.imageUrl,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          recipientId: data.recipientId
        };
      });
      
      callback(notifications);
    }, (error) => {
      console.error('Erro ao escutar notificações:', error);
    });
  },

  // Deletar notificação
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { deleted: true });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw new Error('Erro ao deletar notificação');
    }
  },

  // Limpar todas as notificações
  async clearAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { deleted: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Erro ao limpar todas as notificações:', error);
      throw new Error('Erro ao limpar todas as notificações');
    }
  }
};
