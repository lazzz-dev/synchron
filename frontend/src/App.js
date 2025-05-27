import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewSync from './pages/NewSync';
import EditSync from './pages/EditSync';

import Layout from './components/Layout';

import { checkAuthStatus } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
        setIsAuthenticated(isAuthenticated);
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        }
      />
      <Route
        path="/"
        element={
          <Layout isAuthenticated={isAuthenticated} user={user} />
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="sync/new"
          element={
            isAuthenticated ? <NewSync /> : <Navigate to="/login" />
          }
        />
        <Route
          path="sync/edit/:id"
          element={
            isAuthenticated ? <EditSync /> : <Navigate to="/login" />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
