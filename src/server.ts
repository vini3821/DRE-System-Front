// src/server.ts
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';

// The dist folder
const distFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../browser'
);
const indexHtml = join(distFolder, 'index.html');

// Express server
const app = express();

// Configure CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
  return; // Adicionar retorno para resolver TS7030
});

// Serve static files from /browser
app.get('*.*', express.static(distFolder, {
  maxAge: '1y'
}));

// All regular routes serve the index.html
app.get('*', (req, res) => {
  // Simplesmente servir o index.html para todas as rotas
  res.sendFile(indexHtml);
});

// Start Express server
const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Angular server running at http://localhost:${port}`);
  console.log(`API endpoint: ${process.env['API_URL'] || 'using default from environment.ts'}`);
});