// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link, 
  Grid, 
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Schéma de validation
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .required('Le mot de passe est requis')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Vérifier si l'utilisateur a été redirigé après une déconnexion due à l'expiration de session
  const sessionExpired = location.search.includes('session=expired');
  
  // Obtenir l'URL de redirection après connexion
  const from = location.state?.from?.pathname || '/dashboard';

  // Initialiser Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        await login({
          email: values.email,
          password: values.password
        });
        
        // Rediriger vers la page de destination
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setError(error.response?.data?.message || 'Erreur lors de la connexion');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo ou titre */}
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Admin Assistant
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Connexion
          </Typography>
          
          {/* Afficher le message d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Afficher un message si la session a expiré */}
          {sessionExpired && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Votre session a expiré. Veuillez vous reconnecter.
            </Alert>
          )}
          
          {/* Formulaire de connexion */}
          <form onSubmit={formik.handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  name="rememberMe" 
                  color="primary" 
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
              }
              label="Se souvenir de moi"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Connexion'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Mot de passe oublié ?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Pas de compte ? S'inscrire"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Pied de page */}
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Admin Assistant App
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
