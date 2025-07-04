# 🧁 APP DONANA - Firebase Edition

> Sistema completo de orçamentos e pedidos para vendas de doces com Firebase

![Version](https://img.shields.io/badge/version-2.0.0-pink)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Funcionalidades

### 🏠 Sistema Completo
- ✅ **Orçamentos** - Criação e gestão de orçamentos
- ✅ **Pedidos** - Confirmação e acompanhamento
- ✅ **Dashboard** - Relatórios financeiros
- ✅ **Produtos** - Catálogo completo
- ✅ **Cliente editável** - Nome e tema editáveis em tempo real

### 🔥 Firebase Integration
- ✅ **Autenticação** - Login anônimo seguro
- ✅ **Firestore** - Banco de dados em tempo real
- ✅ **Sincronização** - Automática e manual
- ✅ **Offline** - Funciona sem internet
- ✅ **Backup** - Dados seguros na nuvem

### 📱 PWA Features
- ✅ **Instalável** - Como app nativo
- ✅ **Offline** - Service Worker avançado
- ✅ **Responsivo** - Mobile-first design
- ✅ **Performance** - Otimizado e rápido

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone https://github.com/SEU_USUARIO/app-donana-firebase.git
cd app-donana-firebase
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Firebase

#### 3.1 Crie um Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Nomeie como "APP DONANA" ou similar
4. Habilite Google Analytics (opcional)

#### 3.2 Configure a Autenticação
1. No Firebase Console → Authentication
2. Aba "Sign-in method"
3. Habilite "Anonymous" 
4. Salve as configurações

#### 3.3 Configure o Firestore
1. No Firebase Console → Firestore Database
2. Clique "Criar banco de dados"
3. Selecione "Começar no modo de teste"
4. Escolha a localização (southamerica-east1 para Brasil)

#### 3.4 Configure as Regras do Firestore
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso apenas aos dados do próprio usuário
    match /{collection}/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Permite criação de novos documentos
    match /{collection}/{document} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 3.5 Obtenha a Configuração
1. No Firebase Console → Project Settings (⚙️)
2. Aba "General" → seção "Your apps"
3. Clique no ícone da web `</>`
4. Registre o app como "APP DONANA"
5. Copie a configuração

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=sua_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123def456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
REACT_APP_NAME=APP DONANA
REACT_APP_VERSION=2.0.0
```

### 5. Atualize a Configuração do Firebase

Edite o arquivo `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

### 6. Execute o Projeto
```bash
npm start
```

O app estará disponível em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
app-donana-firebase/
├── 📁 public/
│   ├── index.html          # Template HTML com PWA
│   ├── manifest.json       # Manifest PWA
│   ├── sw.js              # Service Worker
│   └── favicon.ico        # Ícones
├── 📁 src/
│   ├── 📁 firebase/
│   │   └── config.js      # Configuração Firebase
│   ├── 📁 hooks/
│   │   └── useFirebase.js # Hook personalizado
│   ├── App.js             # Componente principal
│   ├── index.js           # Entry point
│   └── index.css          # Estilos Tailwind
├── 📋 package.json        # Dependências
├── 🎨 tailwind.config.js  # Configuração Tailwind
└── 📖 README.md           # Esta documentação
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor de desenvolvimento

# Build
npm run build         # Cria build de produção
npm run build:analyze # Analisa o bundle

# Deploy
npm run deploy        # Deploy para GitHub Pages

# Testes
npm test              # Executa testes
npm run test:coverage # Cobertura de testes

# Utilitários
npm run eject         # Ejeta configurações (cuidado!)
```

## 🔥 Configuração Avançada do Firebase

### Índices do Firestore

Crie estes índices para melhor performance:

```javascript
// Índices compostos necessários
collection: "orcamentos"
fields: [userId: ASC, createdAt: DESC]

collection: "pedidos" 
fields: [userId: ASC, dataEntrega: ASC]

collection: "finalizados"
fields: [userId: ASC, dataFinalizacao: DESC]
```

### Regras de Segurança Avançadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para validar dados
    function isValidData(data) {
      return data.keys().hasAll(['userId', 'createdAt']) &&
             data.userId is string &&
             data.createdAt is timestamp;
    }
    
    // Orçamentos
    match /orcamentos/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        isValidData(request.resource.data);
    }
    
    // Pedidos
    match /pedidos/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        isValidData(request.resource.data);
    }
    
    // Finalizados (apenas leitura depois de criado)
    match /finalizados/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        isValidData(request.resource.data);
    }
  }
}
```

## 📱 Deploy

### GitHub Pages
1. Configure o `homepage` no `package.json`:
```json
{
  "homepage": "https://SEU_USUARIO.github.io/app-donana-firebase"
}
```

2. Execute o deploy:
```bash
npm run deploy
```

### Netlify
1. Conecte seu repositório GitHub ao Netlify
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`
3. Adicione as variáveis de ambiente no Netlify

### Vercel
1. Conecte ao GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🛠️ Personalização

### Adicionar Novos Produtos
Edite o array `produtosIniciais` em `src/App.js`:

```javascript
const produtosIniciais = [
  { 
    id: 32, 
    categoria: 'NOVA_CATEGORIA', 
    nome: 'Novo Produto', 
    preco: 5.00 
  },
  // ... outros produtos
];
```

### Customizar Cores
Modifique `tailwind.config.js`:

```javascript
colors: {
  donana: {
    500: '#sua_cor_principal',
    600: '#sua_cor_hover',
    // ... outras variações
  }
}
```

### Adicionar Funcionalidades
1. Crie novos hooks em `src/hooks/`
2. Adicione componentes em `src/components/`
3. Estenda o Firebase service em `src/firebase/`

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm test -- --watch

# Testes específicos
npm test -- --testNamePattern="Firebase"
```

## 📊 Performance

### Otimizações Implementadas
- ✅ Code splitting automático
- ✅ Service Worker com cache estratégico
- ✅ Lazy loading de componentes
- ✅ Imagens otimizadas
- ✅ Bundle analysis

### Métricas Alvo
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 4s

## 🔧 Troubleshooting

### Problemas Comuns

#### Erro de Autenticação Firebase
```
Error: Firebase Auth is not configured
```
**Solução**: Verifique se a autenticação anônima está habilitada no Firebase Console.

#### Erro de Permissão Firestore
```
Error: Missing or insufficient permissions
```
**Solução**: Verifique as regras do Firestore e se o usuário está autenticado.

#### Build Error
```
Error: Environment variables not found
```
**Solução**: Crie o arquivo `.env` com todas as variáveis necessárias.

#### PWA não Instala
**Solução**: Verifique se o `manifest.json` está correto e o app está sendo servido via HTTPS.

### Debug Firebase
```javascript
// Adicione ao inicio do App.js para debug
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Donana**
- GitHub: [@seu_usuario](https://github.com/seu_usuario)
- Email: seu_email@exemplo.com

## 🙏 Agradecimentos

- React Team
- Firebase Team
- Tailwind CSS
- Lucide Icons
- Toda a comunidade open source

---

## 📞 Suporte

Se você tiver problemas ou dúvidas:

1. Verifique este README
2. Consulte a [documentação do Firebase](https://firebase.google.com/docs)
3. Abra uma [issue](https://github.com/seu_usuario/app-donana-firebase/issues)

---

**🧁 APP DONANA - Transformando doces em negócios doces!**