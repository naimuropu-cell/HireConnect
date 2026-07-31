import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { initSocket } from './lib/socket';

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  console.log(`HireConnect API listening on http://localhost:${config.port}`);
  console.log(`CORS origin: ${config.clientUrl}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandled rejection', reason);
});
