// Import das funções do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// 🔥 CONFIGURAÇÃO DO FIREBASE
// Substitua pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com", 
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "123456789",
  appId: "SEU_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// 🔐 FUNÇÕES DE AUTENTICAÇÃO
export const authService = {
  // Login anônimo
  signInAnonymously: () => signInAnonymously(auth),
  
  // Logout
  signOut: () => signOut(auth),
  
  // Observador de estado de autenticação
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  
  // Usuário atual
  getCurrentUser: () => auth.currentUser
};

// 📊 FUNÇÕES DO FIRESTORE
export const firestoreService = {
  // Salvar documento
  async saveDocument(collectionName, data) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      
      const docData = {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, collectionName), docData);
      console.log(`✅ Documento salvo em ${collectionName}:`, docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`❌ Erro ao salvar em ${collectionName}:`, error);
      throw error;
    }
  },

  // Carregar documentos do usuário
  async loadUserDocuments(collectionName) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      
      const q = query(
        collection(db, collectionName),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`📥 Carregados ${documents.length} documentos de ${collectionName}`);
      return documents;
    } catch (error) {
      console.error(`❌ Erro ao carregar ${collectionName}:`, error);
      return [];
    }
  },

  // Atualizar documento
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      console.log(`🔄 Documento ${docId} atualizado em ${collectionName}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  // Deletar documento
  async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      console.log(`🗑️ Documento ${docId} deletado de ${collectionName}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Erro ao deletar ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  // Listener em tempo real
  subscribeToUserDocuments(collectionName, callback) {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const q = query(
      collection(db, collectionName),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`🔄 Atualização em tempo real - ${collectionName}:`, documents.length);
      callback(documents);
    });
  }
};

// 🌐 FUNÇÕES DE CONECTIVIDADE
export const connectivityService = {
  // Verificar se está online
  isOnline: () => navigator.onLine,
  
  // Observador de conectividade
  onConnectivityChange: (callback) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

// 📱 CONFIGURAÇÃO PWA
export const enablePWA = () => {
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🔧 SW registrado com sucesso:', registration.scope);
        })
        .catch((registrationError) => {
          console.log('❌ Falha no registro do SW:', registrationError);
        });
    });
  }
};

export default app;