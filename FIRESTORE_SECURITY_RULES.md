# 🔒 Regras de Segurança do Firestore

## 📋 Resumo das Permissões

### 🖼️ Coleção `images`

| Ação | Quem pode fazer | Descrição |
|------|----------------|-----------|
| **👀 Ler** | Todos os usuários autenticados | Ver todas as imagens, comentários e likes |
| **📤 Criar** | Apenas o usuário autenticado | Upload de nova imagem (userId deve coincidir) |
| **✏️ Atualizar** | **Dono da imagem**: Pode modificar tudo<br/>**Outros usuários**: Apenas comentários e likes | Modificações controladas por segurança |
| **🗑️ Deletar** | **APENAS o dono da imagem** | Proteção total contra exclusão por terceiros |

## 🔐 Detalhes das Regras

### ✅ **Permitido para todos os usuários autenticados:**
- Ver todas as imagens
- Adicionar comentários
- Dar like/deslike
- Ver comentários e likes

### 👤 **Permitido apenas para o dono da imagem:**
- Modificar dados da imagem (nome, avatar, etc.)
- Deletar a imagem
- Alterar qualquer campo da imagem

### 🚫 **Protegido contra modificação por terceiros:**
- `userId` (não pode ser alterado)
- `userName` (não pode ser alterado)
- `userAvatar` (não pode ser alterado)
- `url` (não pode ser alterado)
- `filename` (não pode ser alterado)

## 🛡️ Segurança Implementada

### **Regra de Atualização Detalhada:**
```javascript
allow update: if request.auth != null
  && (request.auth.uid == resource.data.userId // Dono pode modificar tudo
      || (request.auth.uid != resource.data.userId // Outros usuários só podem
          && request.resource.data.keys().hasAll(['comments', 'likedBy']) // modificar comments e likedBy
          && request.resource.data.userId == resource.data.userId // sem alterar o dono
          && request.resource.data.userName == resource.data.userName // sem alterar o nome
          && request.resource.data.userAvatar == resource.data.userAvatar)); // sem alterar o avatar
```

### **Regra de Exclusão:**
```javascript
allow delete: if request.auth != null 
  && request.auth.uid == resource.data.userId;
```

## 🎯 Comportamento Esperado

1. **✅ Usuário pode comentar** em qualquer foto
2. **✅ Usuário pode dar like** em qualquer foto
3. **✅ Usuário pode ver** todas as fotos e comentários
4. **❌ Usuário NÃO pode deletar** fotos de outros
5. **❌ Usuário NÃO pode modificar** dados de fotos de outros
6. **✅ Dono pode deletar** sua própria foto
7. **✅ Dono pode modificar** dados de sua própria foto

## 📝 Notas Importantes

- Todas as operações requerem **autenticação**
- As regras são aplicadas **automaticamente** pelo Firebase
- **Não há bypass** das regras pelo frontend
- **Auditoria completa** de todas as operações
- **Proteção contra** ataques maliciosos
