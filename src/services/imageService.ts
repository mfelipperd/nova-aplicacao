import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import type {
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import type {
  UploadResult
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Image, Comment } from '../types';
import { notificationService } from './notificationService';

export const imageService = {
  // Upload de imagem
  async uploadImage(
    file: File,
    userId: string,
    userName: string,
    userAvatar?: string,
    eventId?: string
  ): Promise<Image> {
    try {
      // Criar referência no storage
      const imageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
      
      // Upload do arquivo
      const uploadResult: UploadResult = await uploadBytes(imageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Criar documento no Firestore
      console.log('📤 IMAGEM: Salvando imagem com eventId:', eventId);
      
      const imageData = {
        url: downloadURL,
        filename: file.name,
        uploadedAt: serverTimestamp(),
        userId,
        userName,
        userAvatar: userAvatar || null,
        comments: [],
        likes: 0,
        eventId: eventId || null
      };
      
      console.log('📤 IMAGEM: Dados da imagem:', imageData);
      const docRef = await addDoc(collection(db, 'images'), imageData);
      console.log('✅ IMAGEM: Imagem salva com ID:', docRef.id);
      
      return {
        id: docRef.id,
        url: downloadURL,
        filename: file.name,
        uploadedAt: new Date(),
        userId,
        userName,
        userAvatar,
        comments: [],
        eventId
      };
    } catch (error) {
      console.error('❌ Erro ao fazer upload da imagem:', error);
      
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error('❌ Mensagem de erro:', error.message);
        console.error('❌ Stack trace:', error.stack);
      }
      
      // Verificar se é erro de permissão
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('❌ Código do erro:', (error as any).code);
        if ((error as any).code === 'storage/unauthorized') {
          throw new Error('Sem permissão para fazer upload. Verifique as regras do Storage.');
        }
        if ((error as any).code === 'storage/bucket-not-found') {
          throw new Error('Bucket do Storage não encontrado. Verifique a configuração.');
        }
      }
      
      throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
    }
  },

  // Buscar todas as imagens (opcionalmente filtradas por evento)
  async getAllImages(eventId?: string): Promise<Image[]> {
    try {
      console.log('🔍 IMAGEM: Buscando imagens para eventId:', eventId);
      
      let q;
      if (eventId) {
        q = query(
          collection(db, 'images'), 
          where('eventId', '==', eventId),
          orderBy('uploadedAt', 'desc')
        );
        console.log('🔍 IMAGEM: Query com filtro por eventId:', eventId);
      } else {
        q = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
        console.log('🔍 IMAGEM: Query sem filtro (todas as imagens)');
      }
      
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      console.log(`📷 IMAGEM: Encontradas ${querySnapshot.docs.length} imagens`);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const imageData = {
          id: doc.id,
          url: data.url,
          filename: data.filename,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          comments: data.comments?.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt?.toDate() || new Date(),
            userId: comment.userId,
            userName: comment.userName,
            userAvatar: comment.userAvatar
          })) || [],
          likes: data.likedBy?.length || 0,
          likedBy: data.likedBy || [],
          eventId: data.eventId
        };
        
        
        return imageData;
      });
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      throw new Error('Erro ao carregar imagens. Tente novamente.');
    }
  },

  // Adicionar comentário
  async addComment(
    imageId: string,
    content: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<Comment> {
      try {
        const imageRef = doc(db, 'images', imageId);
        
        const newComment = {
          id: Date.now().toString(),
          content,
          createdAt: new Date(),
          userId,
          userName,
          userAvatar: userAvatar || null
        };
        
        // Verificar se o documento existe primeiro
        const docSnap = await getDoc(imageRef);
        if (!docSnap.exists()) {
          throw new Error('Documento não encontrado');
        }
        
        // Implementar retry com backoff exponencial
        let lastError;
        const maxRetries = 3;
        const baseDelay = 1000; // 1 segundo
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const updatePromise = updateDoc(imageRef, {
              comments: arrayUnion(newComment)
            });
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout: Operação demorou muito')), 8000);
            });
            
            await Promise.race([updatePromise, timeoutPromise]);
            break; // Sucesso, sair do loop
            
          } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
              throw lastError; // Última tentativa, lançar erro
            }
            
            // Calcular delay exponencial
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        const result = {
          id: newComment.id,
          content,
          createdAt: new Date(),
          userId,
          userName,
          userAvatar
        };

        // Criar notificação para o dono da foto (se não for o próprio comentador)
        try {
          const imageData = docSnap.data();
          if (imageData.userId !== userId) {
            await notificationService.createCommentNotification(
              imageId,
              imageData.url,
              content,
              userId,
              userName,
              userAvatar,
              imageData.userId
            );
          }
        } catch (notificationError) {
          console.error('Erro ao criar notificação:', notificationError);
          // Não falhar a operação de comentário se a notificação falhar
        }
        
        return result;
    } catch (error) {
      console.error('❌ ERRO no imageService.addComment:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Erro completo:', error);
      
      if (error instanceof Error) {
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Stack:', error.stack);
      }
      
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('❌ Código do erro Firebase:', (error as any).code);
      }
      
      throw new Error('Erro ao adicionar comentário. Tente novamente.');
    }
  },

  // Dar like em uma imagem
  async likeImage(imageId: string, userId: string): Promise<void> {
    try {
      const imageRef = doc(db, 'images', imageId);
      
      // Implementar retry com backoff
      let lastError;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await updateDoc(imageRef, {
            likedBy: arrayUnion(userId)
          });
          return;
        } catch (error) {
          lastError = error;
          
          if (attempt === maxRetries) {
            throw lastError;
          }
          
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
      throw new Error('Erro ao dar like. Tente novamente.');
    }
  },

  // Remover like de uma imagem
  async unlikeImage(imageId: string, userId: string): Promise<void> {
    try {
      const imageRef = doc(db, 'images', imageId);
      
      // Implementar retry com backoff
      let lastError;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await updateDoc(imageRef, {
            likedBy: arrayRemove(userId)
          });
          return;
        } catch (error) {
          lastError = error;
          
          if (attempt === maxRetries) {
            throw lastError;
          }
          
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Erro ao remover like:', error);
      throw new Error('Erro ao remover like. Tente novamente.');
    }
  },

  async deleteImage(imageId: string, userId: string): Promise<void> {
    try {
      // Primeiro, verificar se o usuário é o dono da imagem
      const imageRef = doc(db, 'images', imageId);
      const imageDoc = await getDoc(imageRef);
      
      if (!imageDoc.exists()) {
        throw new Error('Imagem não encontrada');
      }
      
      const imageData = imageDoc.data();
      
      if (imageData.userId !== userId) {
        throw new Error('Você não tem permissão para deletar esta imagem');
      }
      
      // Deletar o documento do Firestore
      await deleteDoc(imageRef);
      
      // Deletar o arquivo do Storage se existir
      if (imageData.url) {
        try {
          const imageStorageRef = ref(storage, imageData.url);
          await deleteObject(imageStorageRef);
        } catch (storageError) {
          console.warn('Aviso: Não foi possível deletar o arquivo do Storage:', storageError);
          // Não falha a operação se o arquivo do Storage não existir
        }
      }
      
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      if (error instanceof Error) {
        throw error; // Re-throw erros de permissão
      }
      throw new Error('Erro ao deletar imagem. Tente novamente.');
    }
  }
};
