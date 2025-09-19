// Script para configurar Firebase Storage via API REST
import fetch from 'node-fetch';

const PROJECT_ID = 'image-shower-45861';
const ACCESS_TOKEN = process.argv[2]; // Token será passado como argumento

if (!ACCESS_TOKEN) {
  console.log('❌ Token de acesso necessário');
  console.log('Execute: firebase login:ci');
  console.log('Depois: node setup-storage.js <seu-token>');
  process.exit(1);
}

async function setupStorage() {
  console.log('🔥 Configurando Firebase Storage...');
  
  try {
    // 1. Verificar se o Storage já existe
    console.log('📋 Verificando Storage existente...');
    
    // 2. Habilitar a API do Storage
    console.log('🔧 Habilitando Storage API...');
    const enableApiUrl = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/storage-api.googleapis.com:enable`;
    
    const enableResponse = await fetch(enableApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (enableResponse.ok) {
      console.log('✅ Storage API habilitada');
    } else {
      const error = await enableResponse.text();
      console.log('⚠️ Storage API pode já estar habilitada:', error);
    }
    
    // 3. Criar bucket do Storage
    console.log('🪣 Criando bucket do Storage...');
    const bucketName = `${PROJECT_ID}.appspot.com`;
    
    const createBucketUrl = `https://storage.googleapis.com/storage/v1/b?project=${PROJECT_ID}`;
    const bucketData = {
      name: bucketName,
      location: 'US-CENTRAL1',
      storageClass: 'STANDARD'
    };
    
    const createResponse = await fetch(createBucketUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bucketData)
    });
    
    if (createResponse.ok) {
      console.log('✅ Bucket criado com sucesso:', bucketName);
    } else {
      const error = await createResponse.text();
      if (error.includes('already exists')) {
        console.log('✅ Bucket já existe:', bucketName);
      } else {
        console.log('❌ Erro ao criar bucket:', error);
      }
    }
    
    console.log('🎉 Storage configurado com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('1. Acesse: https://console.firebase.google.com/project/image-shower-45861/storage');
    console.log('2. Configure as regras de segurança');
    console.log('3. Teste o upload na aplicação');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

setupStorage();
