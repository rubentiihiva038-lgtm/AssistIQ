import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'assistiq-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: true, 
      sameSite: 'none',
      httpOnly: true 
    }
  }));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Redirect URI will be determined dynamically or from env
    process.env.GOOGLE_REDIRECT_URI
  );

  // API Routes
  app.get('/api/auth/url', (req, res) => {
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${origin}/auth/callback`;
    
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ];

    const url = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    ).generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
      const origin = `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${origin}/auth/callback`;
      
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await client.getToken(code as string);
      
      // Store tokens in session
      (req.session as any).tokens = tokens;

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful! Syncing data... You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/status', (req, res) => {
    const tokens = (req.session as any).tokens;
    res.json({ isAuthenticated: !!tokens });
  });

  app.post('/api/sync-sheets', async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });

    const { tasks, sheetName } = req.body;
    if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'Invalid data' });

    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials(tokens);

      const sheets = google.sheets({ version: 'v4', auth });
      
      // 1. Create a new spreadsheet or find existing
      let spreadsheetId = (req.session as any).spreadsheetId;

      if (!spreadsheetId) {
        const resource = {
          properties: {
            title: `Assist IQ Export - ${new Date().toLocaleDateString()}`,
          },
        };
        const spreadsheet = await sheets.spreadsheets.create({
          requestBody: resource,
          fields: 'spreadsheetId',
        });
        spreadsheetId = spreadsheet.data.spreadsheetId;
        (req.session as any).spreadsheetId = spreadsheetId;
      }

      // 2. Prepare headers
      const headers = ['Date', 'Company', 'Status', 'City', 'Agent', 'Price (DH)', 'Description'];
      const rows = tasks.map(t => [
        t.date,
        t.company,
        t.status,
        t.city,
        t.agent,
        t.price,
        t.description
      ]);

      // 3. Clear and update
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers, ...rows],
        },
      });

      res.json({ 
        success: true, 
        spreadsheetId, 
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` 
      });
    } catch (error: any) {
      console.error('Sync Error:', error);
      res.status(500).json({ error: error.message || 'Sync failed' });
    }
  });

  // Vite/Prod logic
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
