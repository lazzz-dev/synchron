const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.googleAccessToken,
      refresh_token: req.user.googleRefreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
      orderBy: 'modifiedTime desc'
    });

    res.status(200).json(response.data.files);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ message: 'Failed to fetch sheets', error: error.message });
  }
});

router.get('/:sheetId/tabs', isAuthenticated, async (req, res) => {
  try {
    const { sheetId } = req.params;
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.googleAccessToken,
      refresh_token: req.user.googleRefreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties'
    });

    const tabs = response.data.sheets.map(sheet => ({
      id: sheet.properties.sheetId,
      name: sheet.properties.title
    }));

    res.status(200).json(tabs);
  } catch (error) {
    console.error('Error fetching tabs:', error);
    res.status(500).json({ message: 'Failed to fetch tabs', error: error.message });
  }
});

router.get('/:sheetId/tabs/:tabName/data', isAuthenticated, async (req, res) => {
  try {
    const { sheetId, tabName } = req.params;
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.googleAccessToken,
      refresh_token: req.user.googleRefreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: tabName
    });

    res.status(200).json(response.data.values);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ message: 'Failed to fetch sheet data', error: error.message });
  }
});

module.exports = router;
