#!/usr/bin/env node

import { RealtimeInterviewWebSocketServer } from '../workcrew-ui/lib/realtime-websocket';

// Start the WebSocket server for real-time interviews
const server = new RealtimeInterviewWebSocketServer(3001);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  server.close();
  process.exit(0);
});

console.log('Real-time interview WebSocket server started on port 3001');