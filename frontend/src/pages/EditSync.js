import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { getSheets, getSheetTabs } from '../services/sheetsService';
import { getSyncConfig, updateSyncConfig } from '../services/syncService';

const EditSync = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [syncInterval, setSyncInterval] = useState(60);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    const fetchSyncConfig = async () => {
      try {
        setLoading(true);
        const config = await getSyncConfig(id);
        
        setName(config.name);
        setSelectedSheet(config.sheetId);
        setSelectedSheetName(config.sheetName);
        setSelectedTab(config.tabName);
        setLocalPath(config.localPath);
        setSyncInterval(config.syncInterval);
        setIsActive(config.isActive);
        
        await fetchSheets();
        await fetchTabs(config.sheetId);
      } catch (err) {
        setError('Failed to load sync configuration. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSyncConfig();
  }, [id]);

  const fetchSheets = async () => {
    try {
      const data = await getSheets();
      setSheets(data);
    } catch (err) {
      setError('Failed to load Google Sheets. Please try again.');
      console.error(err);
    }
  };

  const fetchTabs = async (sheetId) => {
    try {
      const data = await getSheetTabs(sheetId);
      setTabs(data);
    } catch (err) {
      setError('Failed to load sheet tabs. Please try again.');
      console.error(err);
    }
  };

  const handleSheetChange = async (event) => {
    const sheetId = event.target.value;
    setSelectedSheet(sheetId);
    
    const sheet = sheets.find(s => s.id === sheetId);
    setSelectedSheetName(sheet ? sheet.name : '');
    
    setSelectedTab('');
    
    await fetchTabs(sheetId);
  };

  const handleTabChange = (event) => {
    setSelectedTab(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const syncConfig = {
        name,
        sheetId: selectedSheet,
        sheetName: selectedSheetName,
        tabName: selectedTab,
        localPath,
        syncInterval: parseInt(syncInterval),
        isActive
      };
      
      await updateSyncConfig(id, syncConfig);
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update sync configuration. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Sync Configuration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="sheet-select-label">Google Sheet</InputLabel>
                <Select
                  labelId="sheet-select-label"
                  id="sheet-select"
                  value={selectedSheet}
                  label="Google Sheet"
                  onChange={handleSheetChange}
                >
                  {sheets.map((sheet) => (
                    <MenuItem key={sheet.id} value={sheet.id}>
                      {sheet.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="tab-select-label">Sheet Tab</InputLabel>
                <Select
                  labelId="tab-select-label"
                  id="tab-select"
                  value={selectedTab}
                  label="Sheet Tab"
                  onChange={handleTabChange}
                >
                  {tabs.map((tab) => (
                    <MenuItem key={tab.id} value={tab.name}>
                      {tab.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Local CSV Path"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                required
                helperText="Full path where the CSV file will be saved"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sync Interval (minutes)"
                type="number"
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                required
                inputProps={{ min: 5 }}
                helperText="Minimum 5 minutes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !name || !selectedSheet || !selectedTab || !localPath || !syncInterval}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EditSync;
