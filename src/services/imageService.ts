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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import type {
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import type {
  UploadResult
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Image, Comment } from '../types';

export const imageService = {
  // Upload de imagem
  async uploadImage(
    file: File,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<Image> {
    try {
      // Criar referência no storage
      const imageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
      
      // Upload do arquivo
      const uploadResult: UploadResult = await uploadBytes(imageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Criar documento no Firestore
      
      const imageData = {
        url: downloadURL,
        filename: file.name,
        uploadedAt: serverTimestamp(),
        userId,
        userName,
        userAvatar: userAvatar || null,
        comments: [],
        likes: 0
      };
      
      const docRef = await addDoc(collection(db, 'images'), imageData);
      
      return {
        id: docRef.id,
        url: downloadURL,
        filename: file.name,
        uploadedAt: new Date(),
        userId,
        userName,
        userAvatar,
        comments: []
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

  // Buscar todas as imagens
  async getAllImages(): Promise<Image[]> {
    try {
      const q = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      
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
          likedBy: data.likedBy || []
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
  }
};
