// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Contextes
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
// Autres imports à décommenter lorsque les pages seront créées
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import DocumentCreate from './pages/DocumentCreate';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Payments from './pages/Payments';
import PaymentDetail from './pages/PaymentDetail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Composants de mise en page
import MainLayout from './components/layout/MainLayout';

// Route privée qui nécessite une authentification
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Rendre le composant enfant si l'utilisateur est authentifié
  return children;
};

// Thème de l'application
const theme = createTheme({
  palette: {
    mode: 'light', // ou 'dark'
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes privées - à décommenter lorsque les composants seront créés */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Navigate to="/dashboard" replace />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/clients" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Clients />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/clients/:id" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <ClientDetail />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/documents" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Documents />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/documents/new" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <DocumentCreate />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/documents/:id" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <DocumentDetail />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tasks />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/tasks/:id" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <TaskDetail />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/payments" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Payments />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/payments/:id" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <PaymentDetail />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </PrivateRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
