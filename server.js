'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { WebSocket, WebSocketServer } = require('ws');

const ROOT = __dirname;
const INPUT_CODES = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'KeyU', 'KeyI', 'KeyO'];
const ALLOWED = {
  arena: ['colosseum', 'volcano', 'cyber', 'forest', 'ice', 'temple'],
  outfit: ['samurai', 'ninja', 'cyborg', 'assassin', 'knight', 'ronin', 'monk', 'frostguard', 'dragon'],
  element: ['ice', 'fire', 'lightning', 'shadow', 'solar', 'wind', 'earth', 'water', 'poison', 'arcane', 'metal'],
  weapon1: ['sai', 'katana', 'spear', 'nunchaku', 'daggers', 'nodachi', 'hammer', 'claws', 'staff', 'axe'],
  weapon2: ['kunai', 'shuriken', 'chakram', 'smoke', 'bolt', 'orb'],
  style: ['speedster', 'balanced', 'heavy', 'hidden']
};
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sanitizeQueuePayload(payload) {
  if (!payload || typeof payload !== 'object' || !ALLOWED.arena.includes(payload.arena)) return null;
  const fighter = payload.fighter;
  if (!fighter || typeof fighter !== 'object') return null;
  for (const key of ['outfit', 'element', 'weapon1', 'weapon2', 'style']) {
    if (!ALLOWED[key].includes(fighter[key])) return null;
  }
  for (const key of ['colorSkin', 'colorSuit', 'colorAura']) {
    if (typeof fighter[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(fighter[key])) return null;
  }
  return {
    arena: payload.arena,
    fighter: {
      outfit: fighter.outfit,
      element: fighter.element,
      weapon1: fighter.weapon1,
      weapon2: fighter.weapon2,
      style: fighter.style,
      colorSkin: fighter.colorSkin,
      colorSuit: fighter.colorSuit,
      colorAura: fighter.colorAura
    }
  };
}

function createGameServer() {
  const waitingPlayers = [];
  const httpServer = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (url.pathname === '/healthz') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end('{"status":"ok"}');
      return;
    }
    if (url.pathname !== '/' && !url.pathname.startsWith('/static/')) {
      response.writeHead(404).end('Not found');
      return;
    }
    let relativePath;
    try {
      relativePath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    } catch (error) {
      response.writeHead(400).end('Invalid path');
      return;
    }
    const filePath = path.resolve(ROOT, `.${relativePath}`);
    if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    });
  });
  const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 4096 });

  const send = (client, message) => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(message));
  };
  const removeFromQueue = client => {
    const index = waitingPlayers.indexOf(client);
    if (index !== -1) waitingPlayers.splice(index, 1);
  };
  const leaveRoom = (client, notifyOpponent) => {
    const room = client.room;
    if (!room) return;
    client.room = null;
    room.players.forEach(peer => {
      if (peer === client) return;
      peer.room = null;
      if (notifyOpponent && !room.finished) send(peer, { type: 'opponent-left' });
    });
  };
  const matchWaitingPlayers = () => {
    while (waitingPlayers.length >= 2) {
      const playerOne = waitingPlayers.shift();
      const playerTwo = waitingPlayers.shift();
      if (playerOne.readyState !== WebSocket.OPEN || playerTwo.readyState !== WebSocket.OPEN) continue;
      const room = {
        players: [playerOne, playerTwo],
        fighters: [playerOne.queuePayload.fighter, playerTwo.queuePayload.fighter],
        arena: playerOne.queuePayload.arena,
        finished: false
      };
      room.players.forEach((client, index) => {
        client.room = room;
        send(client, {
          type: 'match',
          playerNumber: index + 1,
          fighters: room.fighters,
          arena: room.arena
        });
      });
    }
  };

  httpServer.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url, 'http://localhost');
    const origin = request.headers.origin;
    let originHost = null;
    try {
      if (origin) originHost = new URL(origin).host;
    } catch (error) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }
    if (requestUrl.pathname !== '/multiplayer'
      || (originHost && originHost !== request.headers.host)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }
    webSocketServer.handleUpgrade(request, socket, head, client => {
      webSocketServer.emit('connection', client, request);
    });
  });

  webSocketServer.on('connection', client => {
    client.room = null;
    client.queuePayload = null;
    client.messageWindowStart = Date.now();
    client.messageCount = 0;
    client.on('message', rawMessage => {
      const now = Date.now();
      if (now - client.messageWindowStart >= 1000) {
        client.messageWindowStart = now;
        client.messageCount = 0;
      }
      if (++client.messageCount > 100) {
        client.close(1008, 'Message rate exceeded');
        return;
      }
      let message;
      try {
        message = JSON.parse(rawMessage.toString());
      } catch (error) {
        send(client, { type: 'error', message: 'Mensaje no válido.' });
        return;
      }
      if (!message || typeof message !== 'object') return;

      if (message.type === 'queue') {
        if (client.room || client.queuePayload) return;
        const payload = sanitizeQueuePayload(message);
        if (!payload) {
          send(client, { type: 'error', message: 'La configuración del luchador no es válida.' });
          client.close(1008, 'Invalid fighter configuration');
          return;
        }
        client.queuePayload = payload;
        waitingPlayers.push(client);
        send(client, { type: 'waiting' });
        matchWaitingPlayers();
      } else if (message.type === 'input') {
        if (!client.room || client.room.finished || !message.keys || typeof message.keys !== 'object' || Array.isArray(message.keys)) return;
        const keys = {};
        INPUT_CODES.forEach(code => {
          if (typeof message.keys[code] === 'boolean') keys[code] = message.keys[code];
        });
        const opponent = client.room.players.find(peer => peer !== client);
        send(opponent, { type: 'input', keys });
      } else if (message.type === 'finished') {
        if (!client.room || client.room.players[0] !== client || client.room.finished
          || ![null, 1, 2].includes(message.winner)) return;
        client.room.finished = true;
        client.room.players.forEach(peer => send(peer, { type: 'finished', winner: message.winner }));
      } else if (message.type === 'leave') {
        removeFromQueue(client);
        client.queuePayload = null;
        leaveRoom(client, true);
      }
    });
    client.on('close', () => {
      removeFromQueue(client);
      leaveRoom(client, true);
    });
  });

  return { httpServer, webSocketServer };
}

if (require.main === module) {
  const { httpServer } = createGameServer();
  const port = Number(process.env.PORT) || 3000;
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Shadow Kombat disponible en http://localhost:${port}`);
  });
}

module.exports = { createGameServer, sanitizeQueuePayload };
