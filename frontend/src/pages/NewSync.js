import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { getSheets, getSheetTabs, getSheetTabData } from '../services/sheetsService';
import { createSyncConfig } from '../services/syncService';

const steps = ['Select Sheet', 'Select Tab', 'Configure Sync'];

const NewSync = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [syncInterval, setSyncInterval] = useState(60);
  
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        const data = await getSheets();
        setSheets(data);
      } catch (err) {
        setError('Failed to load Google Sheets. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  useEffect(() => {
    if (!selectedSheet) return;

    const fetchTabs = async () => {
      try {
        setLoading(true);
        const data = await getSheetTabs(selectedSheet);
        setTabs(data);
      } catch (err) {
        setError('Failed to load sheet tabs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTabs();
  }, [selectedSheet]);

  useEffect(() => {
    if (!selectedSheet || !selectedTab) return;

    const fetchPreviewData = async () => {
      try {
        setLoading(true);
        const data = await getSheetTabData(selectedSheet, selectedTab);
        setPreviewData(data);
      } catch (err) {
        setError('Failed to load preview data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [selectedSheet, selectedTab]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSheetChange = (event) => {
    const sheetId = event.target.value;
    setSelectedSheet(sheetId);
    
    const sheet = sheets.find(s => s.id === sheetId);
    setSelectedSheetName(sheet ? sheet.name : '');
    
    setSelectedTab('');
    setPreviewData(null);
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
        syncInterval: parseInt(syncInterval)
      };
      
      await createSyncConfig(syncConfig);
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create sync configuration. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="sheet-select-label">Google Sheet</InputLabel>
            <Select
              labelId="sheet-select-label"
              id="sheet-select"
              value={selectedSheet}
              label="Google Sheet"
              onChange={handleSheetChange}
              disabled={loading}
            >
              {sheets.map((sheet) => (
                <MenuItem key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 1:
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="tab-select-label">Sheet Tab</InputLabel>
            <Select
              labelId="tab-select-label"
              id="tab-select"
              value={selectedTab}
              label="Sheet Tab"
              onChange={handleTabChange}
              disabled={loading}
            >
              {tabs.map((tab) => (
                <MenuItem key={tab.id} value={tab.name}>
                  {tab.name}
                </MenuItem>
              ))}
            </Select>
            
            {previewData && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Data Preview
                </Typography>
                <Paper sx={{ overflow: 'auto', maxHeight: 300 }}>
                  <Box sx={{ p: 2 }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr>
                          {previewData[0]?.map((header, index) => (
                            <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1, 6).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 6 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Showing first 5 rows of {previewData.length - 1} total rows
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}
          </FormControl>
        );
      case 2:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
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
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Sync Configuration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && activeStep !== 2 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Box>
                <Button
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading || !name || !localPath || !syncInterval}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={
                      (activeStep === 0 && !selectedSheet) ||
                      (activeStep === 1 && !selectedTab)
                    }
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NewSync;
