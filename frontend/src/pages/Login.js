import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { getGoogleLoginUrl } from '../services/authService';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to Synchron
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enterprise-level file synchronization platform that automates data transfer between Google Sheets and local CSV files.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGoogleLogin}
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
