import { createServer } from 'http';
import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import { RealtimeServer } from './services/websocket.server';

const app = express();

// Serve static files
app.use(express.static('public'));

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
const wsServer = new RealtimeServer(
  httpServer,
  process.env.DATABASE_URL || 'postgresql://localhost:5432/data_studio'
);

// Set up Remix handler
app.all(
  '*',
  createRequestHandler({
    build: require('../build'),
    mode: process.env.NODE_ENV,
  })
);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
