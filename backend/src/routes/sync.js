const express = require('express');
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const SyncConfig = require('../models/SyncConfig');
const isAuthenticated = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const syncConfigs = await SyncConfig.find({ user: req.user._id });
    res.status(200).json(syncConfigs);
  } catch (error) {
    console.error('Error fetching sync configs:', error);
    res.status(500).json({ message: 'Failed to fetch sync configurations', error: error.message });
  }
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, sheetId, sheetName, tabName, localPath, syncInterval } = req.body;
    
    if (!name || !sheetId || !tabName || !localPath || !syncInterval) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const syncConfig = new SyncConfig({
      user: req.user._id,
      name,
      sheetId,
      sheetName,
      tabName,
      localPath,
      syncInterval
    });
    
    await syncConfig.save();
    
    await performSync(syncConfig, req.user);
    
    res.status(201).json(syncConfig);
  } catch (error) {
    console.error('Error creating sync config:', error);
    res.status(500).json({ message: 'Failed to create sync configuration', error: error.message });
  }
});

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const syncConfig = await SyncConfig.findOne({ 
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!syncConfig) {
      return res.status(404).json({ message: 'Sync configuration not found' });
    }
    
    res.status(200).json(syncConfig);
  } catch (error) {
    console.error('Error fetching sync config:', error);
    res.status(500).json({ message: 'Failed to fetch sync configuration', error: error.message });
  }
});

router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, sheetId, sheetName, tabName, localPath, syncInterval, isActive } = req.body;
    
    const syncConfig = await SyncConfig.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, sheetId, sheetName, tabName, localPath, syncInterval, isActive },
      { new: true }
    );
    
    if (!syncConfig) {
      return res.status(404).json({ message: 'Sync configuration not found' });
    }
    
    res.status(200).json(syncConfig);
  } catch (error) {
    console.error('Error updating sync config:', error);
    res.status(500).json({ message: 'Failed to update sync configuration', error: error.message });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const syncConfig = await SyncConfig.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!syncConfig) {
      return res.status(404).json({ message: 'Sync configuration not found' });
    }
    
    res.status(200).json({ message: 'Sync configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting sync config:', error);
    res.status(500).json({ message: 'Failed to delete sync configuration', error: error.message });
  }
});

router.post('/:id/sync', isAuthenticated, async (req, res) => {
  try {
    const syncConfig = await SyncConfig.findOne({ 
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!syncConfig) {
      return res.status(404).json({ message: 'Sync configuration not found' });
    }
    
    syncConfig.lastSyncStatus = 'pending';
    await syncConfig.save();
    
    const result = await performSync(syncConfig, req.user);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({ message: 'Failed to trigger sync', error: error.message });
  }
});

async function performSync(syncConfig, user) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: syncConfig.sheetId,
      range: syncConfig.tabName
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the sheet');
    }
    
    const headers = rows[0].map((header, index) => ({
      id: `col${index}`,
      title: header
    }));
    
    const data = rows.slice(1).map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header.id] = row[index] || '';
      });
      return rowData;
    });
    
    await fs.ensureDir(path.dirname(syncConfig.localPath));
    
    const csvWriter = createCsvWriter({
      path: syncConfig.localPath,
      header: headers
    });
    
    await csvWriter.writeRecords(data);
    
    syncConfig.lastSyncTime = new Date();
    syncConfig.lastSyncStatus = 'success';
    syncConfig.lastSyncError = null;
    await syncConfig.save();
    
    return {
      success: true,
      message: 'Sync completed successfully',
      syncConfig
    };
  } catch (error) {
    syncConfig.lastSyncTime = new Date();
    syncConfig.lastSyncStatus = 'failed';
    syncConfig.lastSyncError = error.message;
    await syncConfig.save();
    
    return {
      success: false,
      message: 'Sync failed',
      error: error.message,
      syncConfig
    };
  }
}

module.exports = router;
