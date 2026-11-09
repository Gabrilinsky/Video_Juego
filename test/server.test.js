'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const WebSocket = require('ws');
const { createGameServer, sanitizeQueuePayload } = require('../server');

const validPayload = {
  type: 'queue',
  arena: 'colosseum',
  fighter: {
    outfit: 'samurai',
    element: 'fire',
    weapon1: 'katana',
    weapon2: 'kunai',
    style: 'balanced',
    colorSkin: '#e2e8f0',
    colorSuit: '#2563eb',
    colorAura: '#00ffff'
  }
};

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

function nextMessage(socket, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off('message', onMessage);
      reject(new Error(`Timed out waiting for ${type}`));
    }, 2000);
    const onMessage = data => {
      const message = JSON.parse(data.toString());
      if (message.type !== type) return;
      clearTimeout(timeout);
      socket.off('message', onMessage);
      resolve(message);
    };
    socket.on('message', onMessage);
  });
}

test('validates and whitelists online fighter configuration', () => {
  const cleanPayload = sanitizeQueuePayload(validPayload);
  assert.equal(cleanPayload.arena, 'colosseum');
  assert.equal(cleanPayload.fighter.weapon1, 'katana');
  assert.equal('weaponUpgrades' in cleanPayload.fighter, false);
  assert.equal(sanitizeQueuePayload({ ...validPayload, arena: '../server.js' }), null);
  assert.equal(sanitizeQueuePayload({
    ...validPayload,
    fighter: { ...validPayload.fighter, colorAura: 'javascript:alert(1)' }
  }), null);
});

test('pairs two players, relays controls, and broadcasts the result', async t => {
  const { httpServer, webSocketServer } = createGameServer();
  await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve));
  const url = `ws://127.0.0.1:${httpServer.address().port}/multiplayer`;
  const sockets = [];
  t.after(async () => {
    sockets.forEach(socket => socket.terminate());
    await new Promise(resolve => webSocketServer.close(resolve));
    await new Promise(resolve => httpServer.close(resolve));
  });

  const playerOne = await connect(url);
  sockets.push(playerOne);
  const firstWaiting = nextMessage(playerOne, 'waiting');
  playerOne.send(JSON.stringify(validPayload));
  await firstWaiting;
  const firstMatch = nextMessage(playerOne, 'match');

  const playerTwo = await connect(url);
  sockets.push(playerTwo);
  const secondMatch = nextMessage(playerTwo, 'match');
  playerTwo.send(JSON.stringify({ ...validPayload, fighter: { ...validPayload.fighter, outfit: 'ninja' } }));

  const [matchOne, matchTwo] = await Promise.all([firstMatch, secondMatch]);
  assert.equal(matchOne.playerNumber, 1);
  assert.equal(matchTwo.playerNumber, 2);
  assert.equal(matchOne.fighters[1].outfit, 'ninja');

  const relayedInput = nextMessage(playerOne, 'input');
  playerTwo.send(JSON.stringify({ type: 'input', keys: { KeyA: true, IgnoreMe: true } }));
  assert.deepEqual((await relayedInput).keys, { KeyA: true });

  const resultOne = nextMessage(playerOne, 'finished');
  const resultTwo = nextMessage(playerTwo, 'finished');
  playerOne.send(JSON.stringify({ type: 'finished', winner: 1 }));
  assert.equal((await resultOne).winner, 1);
  assert.equal((await resultTwo).winner, 1);
});
