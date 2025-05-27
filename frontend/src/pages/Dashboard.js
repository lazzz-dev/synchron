import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { getSyncConfigs, deleteSyncConfig, triggerSync } from '../services/syncService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [syncConfigs, setSyncConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingIds, setSyncingIds] = useState([]);

  const fetchSyncConfigs = async () => {
    try {
      setLoading(true);
      const data = await getSyncConfigs();
      setSyncConfigs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load sync configurations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncConfigs();
  }, []);

  const handleAddSync = () => {
    navigate('/sync/new');
  };

  const handleEditSync = (id) => {
    navigate(`/sync/edit/${id}`);
  };

  const handleDeleteSync = async (id) => {
    if (window.confirm('Are you sure you want to delete this sync configuration?')) {
      try {
        await deleteSyncConfig(id);
        setSyncConfigs(syncConfigs.filter(config => config._id !== id));
      } catch (err) {
        setError('Failed to delete sync configuration. Please try again.');
        console.error(err);
      }
    }
  };

  const handleTriggerSync = async (id) => {
    try {
      setSyncingIds(prev => [...prev, id]);
      await triggerSync(id);
      await fetchSyncConfigs(); // Refresh the list to get updated status
    } catch (err) {
      setError('Failed to trigger sync. Please try again.');
      console.error(err);
    } finally {
      setSyncingIds(prev => prev.filter(syncId => syncId !== id));
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'success':
        return <Chip icon={<SuccessIcon />} label="Success" color="success" size="small" />;
      case 'failed':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      default:
        return <Chip label="Not synced yet" size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Sync Configurations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSync}
        >
          Add New Sync
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : syncConfigs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No sync configurations found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Get started by adding a new sync configuration.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSync}
          >
            Add New Sync
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Sheet</TableCell>
                <TableCell>Tab</TableCell>
                <TableCell>Interval (min)</TableCell>
                <TableCell>Last Sync</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncConfigs.map((config) => (
                <TableRow key={config._id}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{config.sheetName}</TableCell>
                  <TableCell>{config.tabName}</TableCell>
                  <TableCell>{config.syncInterval}</TableCell>
                  <TableCell>
                    {config.lastSyncTime
                      ? new Date(config.lastSyncTime).toLocaleString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>{getStatusChip(config.lastSyncStatus)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleTriggerSync(config._id)}
                      disabled={syncingIds.includes(config._id)}
                    >
                      {syncingIds.includes(config._id) ? (
                        <CircularProgress size={24} />
                      ) : (
                        <RefreshIcon />
                      )}
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditSync(config._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSync(config._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Dashboard;
