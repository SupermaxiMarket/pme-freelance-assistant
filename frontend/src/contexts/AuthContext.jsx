// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est authentifié au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          // Si l'erreur n'est pas 401, on la gère ici
          // Les erreurs 401 sont gérées par l'intercepteur axios
          if (error.response && error.response.status !== 401) {
            setError(error.response?.data?.message || 'Erreur de connexion');
          }
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonctions d'authentification
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Stocker les tokens
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      // Mettre à jour l'état utilisateur
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Stocker les tokens
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      // Mettre à jour l'état utilisateur
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API de déconnexion (optionnel)
      await authService.logout();
      
      // Supprimer les tokens du stockage local
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(userData);
      
      // Mettre à jour l'état utilisateur
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la demande de réinitialisation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(token, password);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
