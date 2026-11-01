import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Support large base64 image payloads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  const dataFilePath = path.resolve(__dirname, 'public', 'portfolio-data.json');

  // API to fetch permanently stored portfolio data
  app.get('/api/portfolio', (req, res) => {
    try {
      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        return res.json({ success: true, data: JSON.parse(raw) });
      }
      return res.json({ success: false, data: null });
    } catch (err: any) {
      console.error('Error reading portfolio-data.json:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API to permanently save portfolio data directly to disk (portfolio-data.json)
  app.post('/api/portfolio', (req, res) => {
    try {
      const portfolioData = req.body;
      if (!portfolioData || typeof portfolioData !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid portfolio data' });
      }
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify(portfolioData, null, 2), 'utf-8');
      console.log(`[Server] Portfolio data permanently saved to disk at ${dataFilePath}`);
      return res.json({ success: true, message: 'Saved to disk permanently' });
    } catch (err: any) {
      console.error('Error writing portfolio-data.json:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Portfolio server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
