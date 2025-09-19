#!/usr/bin/env node

/**
 * Script para configurar o Firebase
 * Execute: node setup-firebase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Configuração do Firebase para Festa Photos\n');

const questions = [
  {
    name: 'apiKey',
    question: 'API Key (VITE_FIREBASE_API_KEY): ',
    example: 'AIzaSyC...'
  },
  {
    name: 'authDomain',
    question: 'Auth Domain (VITE_FIREBASE_AUTH_DOMAIN): ',
    example: 'seu-projeto.firebaseapp.com'
  },
  {
    name: 'projectId',
    question: 'Project ID (VITE_FIREBASE_PROJECT_ID): ',
    example: 'seu-projeto-id'
  },
  {
    name: 'storageBucket',
    question: 'Storage Bucket (VITE_FIREBASE_STORAGE_BUCKET): ',
    example: 'seu-projeto.appspot.com'
  },
  {
    name: 'messagingSenderId',
    question: 'Messaging Sender ID (VITE_FIREBASE_MESSAGING_SENDER_ID): ',
    example: '123456789'
  },
  {
    name: 'appId',
    question: 'App ID (VITE_FIREBASE_APP_ID): ',
    example: '1:123456789:web:abcdef123456'
  }
];

const config = {};

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[index];
  rl.question(`${q.question}`, (answer) => {
    if (answer.trim()) {
      config[q.name] = answer.trim();
    }
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  const envContent = `# Configurações do Firebase
# Gerado automaticamente em ${new Date().toISOString()}

${Object.entries(config).map(([key, value]) => `VITE_FIREBASE_${key.toUpperCase()}=${value}`).join('\n')}
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Arquivo .env criado com sucesso!');
    console.log(`📁 Localização: ${envPath}`);
    console.log('\n🚀 Agora você pode executar: npm run dev');
  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env:', error.message);
  }

  rl.close();
}

// Verificar se já existe .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  rl.question('\n⚠️  Arquivo .env já existe. Deseja sobrescrever? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askQuestion(0);
    } else {
      console.log('❌ Configuração cancelada.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
