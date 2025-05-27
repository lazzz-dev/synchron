const cron = require('node-cron');
const SyncConfig = require('../models/SyncConfig');
const User = require('../models/User');
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const activeJobs = new Map();

async function initScheduler() {
  try {
    console.log('Initializing sync scheduler...');
    
    const syncConfigs = await SyncConfig.find({ isActive: true });
    
    for (const config of syncConfigs) {
      scheduleSync(config);
    }
    
    console.log(`Scheduler initialized with ${syncConfigs.length} active sync jobs`);
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
}

function scheduleSync(syncConfig) {
  cancelSync(syncConfig._id);
  
  if (!syncConfig.isActive) {
    return;
  }
  
  const minutes = syncConfig.syncInterval;
  let cronExpression;
  
  if (minutes < 60) {
    cronExpression = `*/${minutes} * * * *`; // Every X minutes
  } else {
    const hours = Math.floor(minutes / 60);
    cronExpression = `0 */${hours} * * *`; // Every X hours
  }
  
  const job = cron.schedule(cronExpression, async () => {
    try {
      console.log(`Running scheduled sync for: ${syncConfig.name} (${syncConfig._id})`);
      
      const user = await User.findById(syncConfig.user);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      await performSync(syncConfig, user);
    } catch (error) {
      console.error(`Scheduled sync failed for ${syncConfig._id}:`, error);
      
      try {
        syncConfig.lastSyncTime = new Date();
        syncConfig.lastSyncStatus = 'failed';
        syncConfig.lastSyncError = error.message;
        await syncConfig.save();
      } catch (saveError) {
        console.error('Error updating sync status:', saveError);
      }
    }
  });
  
  activeJobs.set(syncConfig._id.toString(), job);
  
  console.log(`Scheduled sync for ${syncConfig.name} (${syncConfig._id}) with interval: ${minutes} minutes`);
}

function cancelSync(syncConfigId) {
  const jobId = syncConfigId.toString();
  
  if (activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    job.stop();
    activeJobs.delete(jobId);
    console.log(`Cancelled sync job for ${jobId}`);
  }
}

async function performSync(syncConfig, user) {
  try {
    syncConfig.lastSyncStatus = 'pending';
    await syncConfig.save();
    
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
    
    console.log(`Sync completed successfully for ${syncConfig.name} (${syncConfig._id})`);
    
    return {
      success: true,
      message: 'Sync completed successfully',
      syncConfig
    };
  } catch (error) {
    console.error(`Sync failed for ${syncConfig._id}:`, error);
    
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

module.exports = {
  initScheduler,
  scheduleSync,
  cancelSync,
  performSync
};
