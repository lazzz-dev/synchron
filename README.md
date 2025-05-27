# Synchron

Enterprise-level file synchronization platform that automates data transfer between Google Sheets and local CSV files.

## Features

- Google OAuth authentication
- Select Google Sheets and specific tabs
- Configure automated synchronization to local CSV files
- Set custom sync intervals
- Multiple sync configurations per user
- Background processing with robust error handling

## Tech Stack

- **Frontend**: React with Material UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Task Scheduling**: node-cron

## Setup Instructions

### Prerequisites

1. Node.js and npm installed
2. MongoDB installed and running
3. Google Cloud Platform account with OAuth credentials

### Google Cloud Setup

1. Create a new project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Sheets API and Google Drive API
3. Create OAuth 2.0 credentials
   - Set authorized JavaScript origins to `http://localhost:3000` (for development) and your production URL
   - Set authorized redirect URIs to `http://localhost:5000/api/auth/google/callback` (for development) and your production callback URL

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/synchron
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   CLIENT_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account and set up a new cluster
2. Create a database user with read/write permissions
3. Whitelist your IP address or use `0.0.0.0/0` for all IPs
4. Get your MongoDB connection string

### Heroku Deployment

#### Backend Deployment

1. Create a new Heroku app for the backend
2. Connect your GitHub repository or use Heroku CLI to deploy
3. Set the following environment variables in Heroku:
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `GOOGLE_CALLBACK_URL`: `https://your-backend-app.herokuapp.com/api/auth/google/callback`
   - `CLIENT_URL`: `https://your-frontend-app.herokuapp.com`
4. Deploy the backend to Heroku

#### Frontend Deployment

1. Create a new Heroku app for the frontend
2. Connect your GitHub repository or use Heroku CLI to deploy
3. Set the following environment variables in Heroku:
   - `REACT_APP_API_URL`: `https://your-backend-app.herokuapp.com/api`
   - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
4. Deploy the frontend to Heroku

## Usage

1. Log in with your Google account
2. Click "Add New Sync" to create a new sync configuration
3. Select a Google Sheet and tab
4. Configure the local path and sync interval
5. Save the configuration
6. The system will automatically sync the data based on your configuration

## License

MIT
