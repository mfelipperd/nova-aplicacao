# 🔥 Configuração do Firebase - Login com Google

## Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "festa-photos")
4. Ative/desative o Google Analytics conforme preferir
5. Clique em "Criar projeto"

## Passo 2: Configurar Authentication

1. No painel lateral, clique em **Authentication**
2. Clique na aba **Sign-in method**
3. Clique em **Google**
4. Ative o provedor Google
5. Configure o email de suporte do projeto
6. Salve as configurações

## Passo 3: Configurar Firestore Database

1. No painel lateral, clique em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção** (mais seguro)
4. Escolha uma localização (ex: us-central1)
5. Clique em **Avançar**

## Passo 4: Configurar Storage

1. No painel lateral, clique em **Storage**
2. Clique em **Começar**
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore
5. Clique em **Próximo**

## Passo 5: Obter Configurações do App

1. No painel lateral, clique na **engrenagem** (⚙️) > **Configurações do projeto**
2. Role para baixo até **Seus aplicativos**
3. Clique no ícone **Web** (</>)
4. Digite um nome para o app (ex: "festa-photos-web")
5. **NÃO** marque "Também configurar o Firebase Hosting"
6. Clique em **Registrar app**

## Passo 6: Copiar Configurações

Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Passo 7: Configurar Domínios Autorizados

1. Ainda em **Authentication** > **Settings**
2. Role para baixo até **Domínios autorizados**
3. Adicione:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção (ex: `seu-site.com`)

## Passo 8: Configurar Regras do Firestore

1. Vá para **Firestore Database** > **Regras**
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita apenas para usuários autenticados
    match /images/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Passo 9: Configurar Regras do Storage

1. Vá para **Storage** > **Regras**
2. Substitua as regras por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload apenas para usuários autenticados
    match /images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Passo 10: Criar Arquivo .env

1. No seu projeto, copie o arquivo de exemplo:
```bash
cp env.example .env
```

2. Edite o `.env` com suas configurações:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## ✅ Pronto!

Após seguir esses passos, sua aplicação estará configurada para:
- ✅ Login com Google
- ✅ Registro de usuários
- ✅ Upload de imagens
- ✅ Armazenamento no Firestore
- ✅ Autenticação segura
