# 🎉 Nova Aplicação - Galeria de Fotos de Eventos

Uma aplicação moderna para compartilhamento de fotos em eventos, onde os participantes podem fazer upload de imagens, comentar e dar likes em tempo real.

## ✨ Funcionalidades

- 📸 **Upload de múltiplas fotos** com drag & drop
- 💬 **Sistema de comentários** em tempo real
- ❤️ **Sistema de likes** interativo
- 🌙 **Modo escuro/claro** com toggle
- 👤 **Autenticação** com Google, Facebook ou email/senha
- 📱 **Design responsivo** estilo Instagram
- 🖥️ **Tela de projeção** para eventos
- 🔒 **Segurança** com Firebase Security Rules

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Storage
  - Hosting
- **Icons**: Lucide React

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/nova-aplicacao.git
cd nova-aplicacao
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Firebase
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🔧 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Google, Facebook, Email/Password)
3. Crie um banco Firestore
4. Configure Storage
5. Copie as credenciais para o arquivo `.env`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Feed.tsx        # Feed principal estilo Instagram
│   ├── ImageUpload.tsx # Upload de múltiplas imagens
│   ├── UploadModal.tsx # Modal de upload
│   └── ...
├── contexts/           # Context API
│   ├── AuthContext.tsx # Autenticação
│   └── ThemeContext.tsx # Tema escuro/claro
├── pages/             # Páginas da aplicação
│   ├── HomePage.tsx   # Página principal
│   └── RealtimeDisplay.tsx # Tela de projeção
├── services/          # Serviços
│   ├── authService.ts # Serviços de autenticação
│   └── imageService.ts # Serviços de imagem
├── types/             # Definições TypeScript
└── config/            # Configurações
    └── firebase.ts    # Configuração do Firebase
```

## 🎨 Design

- **Cores**: Baseado na identidade visual da Encibra
- **Layout**: Feed estilo Instagram com FAB
- **Responsivo**: Funciona em desktop e mobile
- **Acessibilidade**: Suporte a modo escuro/claro

## 🔒 Segurança

- **Firestore Rules**: Configuradas para proteger dados
- **Storage Rules**: Apenas usuários autenticados podem fazer upload
- **Validação**: Tamanho máximo de 10MB por imagem

## 🚀 Deploy

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Outras plataformas

```bash
npm run build
# Deploy da pasta dist/ para sua plataforma preferida
```

## 📱 Como Usar

1. **Acesse a aplicação** via QR Code ou link
2. **Faça login** com Google, Facebook ou crie uma conta
3. **Faça upload** de suas fotos do evento
4. **Comente e curta** as fotos dos outros participantes
5. **Visualize** na tela de projeção em tempo real

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**M. Felippe**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- Firebase pela infraestrutura
- Tailwind CSS pelo styling
- Lucide pelos ícones
- Comunidade React pela inspiração

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**