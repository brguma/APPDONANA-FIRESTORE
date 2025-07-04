import { useState, useEffect, useCallback } from 'react';
import { 
  authService, 
  firestoreService, 
  connectivityService 
} from '../firebase/config';

export const useFirebase = () => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(connectivityService.isOnline());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🔐 Observador de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsInitializing(false);
      console.log('👤 Estado de autenticação:', user ? 'Logado' : 'Deslogado');
    });

    return unsubscribe;
  }, []);

  // 🌐 Observador de conectividade
  useEffect(() => {
    const unsubscribe = connectivityService.onConnectivityChange((online) => {
      setIsOnline(online);
      console.log('🌐 Conectividade:', online ? 'Online' : 'Offline');
    });

    return unsubscribe;
  }, []);

  // 🔐 Login anônimo
  const signInAnonymously = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInAnonymously();
      console.log('✅ Login anônimo realizado:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('❌ Erro no login anônimo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚪 Logout
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 💾 Salvar no Firestore
  const saveToFirestore = useCallback(async (collection, data) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    try {
      const result = await firestoreService.saveDocument(collection, data);
      console.log(`💾 Dados salvos em ${collection}:`, result.id);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao salvar em ${collection}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 📥 Carregar do Firestore
  const loadFromFirestore = useCallback(async (collection) => {
    if (!user) {
      console.warn('⚠️ Usuário não autenticado para carregar dados');
      return [];
    }

    setIsLoading(true);
    try {
      const result = await firestoreService.loadUserDocuments(collection);
      console.log(`📥 Dados carregados de ${collection}:`, result.length, 'itens');
      return result;
    } catch (error) {
      console.error(`❌ Erro ao carregar ${collection}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 🔄 Atualizar no Firestore
  const updateInFirestore = useCallback(async (collection, id, data) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    try {
      const result = await firestoreService.updateDocument(collection, id, data);
      console.log(`🔄 Documento ${id} atualizado em ${collection}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${collection}/${id}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 🗑️ Deletar do Firestore
  const deleteFromFirestore = useCallback(async (collection, id) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    try {
      const result = await firestoreService.deleteDocument(collection, id);
      console.log(`🗑️ Documento ${id} deletado de ${collection}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao deletar ${collection}/${id}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 🎧 Listener em tempo real
  const subscribeToCollection = useCallback((collection, callback) => {
    if (!user) {
      console.warn('⚠️ Usuário não autenticado para subscription');
      return () => {};
    }

    console.log(`🎧 Iniciando listener em tempo real para ${collection}`);
    return firestoreService.subscribeToUserDocuments(collection, callback);
  }, [user]);

  // 🔄 Sincronizar dados
  const syncData = useCallback(async (collections) => {
    if (!user || !isOnline) {
      console.warn('⚠️ Não é possível sincronizar: usuário não autenticado ou offline');
      return false;
    }

    setIsLoading(true);
    try {
      const promises = Object.entries(collections).map(([collectionName, data]) => 
        firestoreService.saveDocument(collectionName, { items: data })
      );

      await Promise.all(promises);
      console.log('🔄 Sincronização completa');
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline]);

  // 📊 Estatísticas
  const getStats = useCallback(async () => {
    if (!user) return null;

    try {
      const [orcamentos, pedidos, finalizados] = await Promise.all([
        loadFromFirestore('orcamentos'),
        loadFromFirestore('pedidos'), 
        loadFromFirestore('finalizados')
      ]);

      return {
        orcamentos: orcamentos.length,
        pedidos: pedidos.length,
        finalizados: finalizados.length,
        totalVendas: finalizados.reduce((sum, item) => sum + (item.total || 0), 0)
      };
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      return null;
    }
  }, [user, loadFromFirestore]);

  return {
    // Estado
    user,
    isOnline,
    isLoading,
    isInitializing,

    // Autenticação
    signInAnonymously,
    signOut,

    // Firestore
    saveToFirestore,
    loadFromFirestore,
    updateInFirestore,
    deleteFromFirestore,
    subscribeToCollection,

    // Utilitários
    syncData,
    getStats,

    // Info útil
    isAuthenticated: !!user,
    canSync: !!user && isOnline,
    userId: user?.uid || null
  };
};