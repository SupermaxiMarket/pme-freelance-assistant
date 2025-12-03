import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
          email: values.email,
        });

        // NOTE: DEV-ONLY! In production, the token is sent by email.
        // Here we get it from the response to redirect immediately.
        const { resetToken } = response.data;
        
        setSuccessMessage('Un lien de réinitialisation a été généré. Vous allez être redirigé...');

        // Redirect to the reset password page with the token
        setTimeout(() => {
          navigate(`/reset-password/${resetToken}`);
        }, 2000);

      } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        setError(error.response?.data?.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    },
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
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Admin Assistant
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Mot de passe oublié
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
          
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Envoyer'}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Retour à la connexion
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
