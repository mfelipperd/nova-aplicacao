import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';
import dotenv from 'dotenv';

// Configuração do Firebase (usar as mesmas configurações do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyCQHr-944XH-DQd7LzDXlGCj5R5Hv8dX5M",
  authDomain: "image-shower-45861.firebaseapp.com",
  projectId: "image-shower-45861",
  storageBucket: "image-shower-45861.firebasestorage.app",
  messagingSenderId: "596753984019",
  appId: "1:596753984019:web:1e7c93618e7b817b432de6"
};

async function clearFirebase() {
  try {
    console.log('🔥 Iniciando limpeza do Firebase...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    // Coleções para limpar
    const collections = ['images', 'parties', 'eventParticipations', 'notifications'];
    
    console.log('📋 Limpando coleções do Firestore...');
    
    // Limpar cada coleção
    for (const collectionName of collections) {
      console.log(`🗑️  Limpando coleção: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`   ✅ Coleção ${collectionName} já está vazia`);
        continue;
      }
      
      console.log(`   📊 Encontrados ${snapshot.docs.length} documentos`);
      
      // Usar batch para deletar em lotes (máximo 500 por vez)
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        batch.delete(doc(db, collectionName, docSnapshot.id));
        batchCount++;
        
        // Executar batch a cada 500 documentos
        if (batchCount === 500) {
          await batch.commit();
          console.log(`   ✅ Deletados ${batchCount} documentos`);
          batchCount = 0;
        }
      }
      
      // Executar batch final se houver documentos restantes
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   ✅ Deletados ${batchCount} documentos finais`);
      }
      
      console.log(`   ✅ Coleção ${collectionName} limpa!`);
    }
    
    console.log('🗂️  Limpando Storage...');
    
    // Limpar storage de imagens
    const imagesRef = ref(storage, 'images');
    const imagesList = await listAll(imagesRef);
    
    if (imagesList.items.length === 0) {
      console.log('   ✅ Storage de imagens já está vazio');
    } else {
      console.log(`   📊 Encontrados ${imagesList.items.length} arquivos no storage`);
      
      // Deletar arquivos em lotes
      const deletePromises = imagesList.items.map(async (itemRef) => {
        try {
          await deleteObject(itemRef);
          return true;
        } catch (error) {
          console.error(`   ❌ Erro ao deletar ${itemRef.fullPath}:`, error.message);
          return false;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;
      
      console.log(`   ✅ Deletados ${successCount}/${imagesList.items.length} arquivos do storage`);
    }
    
    // Limpar subpastas (usuários)
    for (const folderRef of imagesList.prefixes) {
      console.log(`   🗂️  Limpando pasta: ${folderRef.name}`);
      const userImagesList = await listAll(folderRef);
      
      const userDeletePromises = userImagesList.items.map(async (itemRef) => {
        try {
          await deleteObject(itemRef);
          return true;
        } catch (error) {
          console.error(`   ❌ Erro ao deletar ${itemRef.fullPath}:`, error.message);
          return false;
        }
      });
      
      const userResults = await Promise.all(userDeletePromises);
      const userSuccessCount = userResults.filter(Boolean).length;
      
      console.log(`   ✅ Deletados ${userSuccessCount}/${userImagesList.items.length} arquivos da pasta ${folderRef.name}`);
    }
    
    console.log('🎉 Limpeza do Firebase concluída com sucesso!');
    console.log('');
    console.log('📝 Coleções limpas:');
    collections.forEach(col => console.log(`   - ${col}`));
    console.log('🗂️  Storage limpo:');
    console.log('   - images/');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

// Configuração já está hardcoded acima

// Executar limpeza
clearFirebase()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });

export { clearFirebase };
