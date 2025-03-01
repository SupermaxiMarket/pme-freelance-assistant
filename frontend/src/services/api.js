// frontend/src/services/api.js
import axios from 'axios';

// Créer une instance axios avec l'URL de base de l'API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Intercepteur pour ajouter le token d'authentification à toutes les requêtes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et rafraîchir le token si nécessaire
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (non autorisé) et que ce n'est pas déjà une tentative de rafraîchissement
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Récupérer le refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Rediriger vers la page de connexion si pas de refresh token
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Essayer de rafraîchir le token
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
          refreshToken
        });
        
        // Si le rafraîchissement a réussi
        if (response.data && response.data.accessToken) {
          // Mettre à jour le token dans le stockage local
          localStorage.setItem('accessToken', response.data.accessToken);
          
          // Mettre à jour l'en-tête de la requête originale et la renvoyer
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, rediriger vers la page de connexion
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// Service de gestion des clients
export const clientService = {
  getAllClients: () => api.get('/clients'),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (clientData) => api.post('/clients', clientData),
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  getClientDocuments: (id) => api.get(`/clients/${id}/documents`),
  getClientTasks: (id) => api.get(`/clients/${id}/tasks`),
  getClientPayments: (id) => api.get(`/clients/${id}/payments`)
};

// Service de gestion des documents
export const documentService = {
  getAllDocuments: () => api.get('/documents'),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  createDocument: (documentData) => api.post('/documents', documentData),
  updateDocument: (id, documentData) => api.put(`/documents/${id}`, documentData),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  sendDocument: (id) => api.post(`/documents/${id}/send`),
  signDocument: (id, signatureData) => api.post(`/documents/${id}/sign`, signatureData),
  getSignatureUrl: (id) => api.get(`/documents/${id}/signature-url`),
  generatePdf: (id) => api.post(`/documents/${id}/generate-pdf`),
  duplicateDocument: (id) => api.post(`/documents/${id}/duplicate`),
  getDocumentTemplates: () => api.get('/documents/templates')
};

// Service de gestion des tâches
export const taskService = {
  getAllTasks: () => api.get('/tasks'),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  completeTask: (id) => api.post(`/tasks/${id}/complete`),
  createRecurringTask: (taskData) => api.post('/tasks/recurring', taskData),
  getTasksByDate: (date) => api.get(`/tasks/by-date?date=${date}`),
  getTodayReminders: () => api.get('/tasks/reminders')
};

// Service de gestion des paiements
export const paymentService = {
  getAllPayments: () => api.get('/payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  markAsPaid: (id) => api.post(`/payments/${id}/mark-as-paid`),
  payInvoice: (invoiceId, paymentData) => api.post(`/payments/invoice/${invoiceId}/pay`, paymentData),
  getPaymentStats: () => api.get('/payments/stats'),
  getOverduePayments: () => api.get('/payments/overdue')
};

// Service de tableau de bord
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenueStats: () => api.get('/dashboard/revenue'),
  getTasksSummary: () => api.get('/dashboard/tasks-summary'),
  getClientActivity: () => api.get('/dashboard/client-activity'),
  getDocumentsStatus: () => api.get('/dashboard/documents-status'),
  getRecentActivity: () => api.get('/dashboard/recent-activity')
};

// Service d'IA
export const aiService = {
  generateEmail: (data) => api.post('/ai/generate-email', data),
  generateProposal: (data) => api.post('/ai/generate-proposal', data),
  summarizeClient: (clientId) => api.post('/ai/summarize-client', { clientId }),
  analyzeDocuments: (documentIds) => api.post('/ai/analyze-documents', { documentIds }),
  generateContent: (prompt) => api.post('/ai/generate-content', { prompt })
};

export { api };
export default api;
