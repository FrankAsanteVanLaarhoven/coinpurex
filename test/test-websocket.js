/**
 * Test RFC 6455 Real Native WebSocket Handshake & Binary Framing
 * Runs 100% in-process without requiring unsandboxed network sockets.
 */
const crypto = require('crypto');
const assert = require('assert');
const { PassThrough } = require('stream');

function testWebSocketLogic() {
  console.log('\n--- Running Real RFC 6455 WebSocket Handshake & Frame Tests ---');

  // 1. Handshake computation test
  const secKey = 'dGhlIHNhbXBsZSBub25jZQ=='; // Standard RFC 6455 test key
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const expectedAccept = 's3pPLMBiTxaQ9kYGzzhZRbK+xOo='; // Standard RFC 6455 test response

  const computedAccept = crypto.createHash('sha1').update(secKey + GUID).digest('base64');
  assert.strictEqual(computedAccept, expectedAccept, 'RFC 6455 SHA1 handshake accept key must match spec');
  console.log('  ✓ RFC 6455 SHA1 handshake accept key calculation verified');

  // 2. Framing test (server to client unmasked text frame)
  function encodeWsFrame(data, opcode = 0x1) {
    const payload = Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
    const length = payload.length;
    let header;

    if (length <= 125) {
      header = Buffer.from([0x80 | (opcode & 0x0f), length]);
    } else if (length <= 65535) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }

    return Buffer.concat([header, payload]);
  }

  function decodeWsFrame(buffer) {
    if (buffer.length < 2) return null;
    const opcode = buffer[0] & 0x0f;
    const isMasked = (buffer[1] & 0x80) !== 0;
    let payloadLength = buffer[1] & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (buffer.length < 4) return null;
      payloadLength = buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLength === 127) {
      if (buffer.length < 10) return null;
      payloadLength = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }

    let maskingKey = null;
    if (isMasked) {
      if (buffer.length < offset + 4) return null;
      maskingKey = buffer.slice(offset, offset + 4);
      offset += 4;
    }

    if (buffer.length < offset + payloadLength) return null;
    const payload = Buffer.from(buffer.slice(offset, offset + payloadLength));

    if (isMasked && maskingKey) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= maskingKey[i % 4];
      }
    }

    return { opcode, payload, totalLength: offset + payloadLength };
  }

  // Test short text payload
  const testMsg = JSON.stringify({ type: 'PRICE_UPDATE', symbol: 'CRS/DAI', price: 0.50 });
  const frame = encodeWsFrame(testMsg);
  assert.strictEqual(frame[0], 0x81, 'Expected FIN + Text opcode 0x81');
  assert.strictEqual(frame[1], Buffer.from(testMsg).length, 'Expected unmasked length');

  const decoded = decodeWsFrame(frame);
  assert.strictEqual(decoded.opcode, 0x1, 'Expected opcode 0x1');
  assert.strictEqual(decoded.payload.toString('utf-8'), testMsg, 'Decoded message must match original');
  console.log('  ✓ RFC 6455 Unmasked Server-to-Client Text Frame Encoding & Decoding verified');

  // Test client-to-server masked frame
  const clientPayload = Buffer.from(JSON.stringify({ action: 'ping' }));
  const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
  const maskedPayload = Buffer.alloc(clientPayload.length);
  for (let i = 0; i < clientPayload.length; i++) {
    maskedPayload[i] = clientPayload[i] ^ mask[i % 4];
  }
  const clientFrame = Buffer.concat([
    Buffer.from([0x81, 0x80 | clientPayload.length]),
    mask,
    maskedPayload
  ]);

  const decodedClient = decodeWsFrame(clientFrame);
  assert.strictEqual(decodedClient.opcode, 0x1);
  assert.strictEqual(decodedClient.payload.toString('utf-8'), clientPayload.toString('utf-8'));
  console.log('  ✓ RFC 6455 Masked Client-to-Server Text Frame Decoding verified');

  // Test Ping frame (0x89)
  const pingFrame = encodeWsFrame('heartbeat', 0x9);
  assert.strictEqual(pingFrame[0], 0x89, 'Expected FIN + Ping opcode 0x89');
  const decodedPing = decodeWsFrame(pingFrame);
  assert.strictEqual(decodedPing.opcode, 0x9);
  console.log('  ✓ RFC 6455 Ping Control Frame verified');

  console.log('Summary: 4 passed, 0 failed.\n');
  return { passed: 4, failed: 0 };
}

if (require.main === module) {
  testWebSocketLogic();
}

module.exports = { testWebSocketLogic };
