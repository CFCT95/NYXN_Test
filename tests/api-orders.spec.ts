import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import http from 'http';

const ajv = new Ajv();

const orderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    client_id: { type: 'string' },
    status: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          quantity: { type: 'number' }
        },
        required: ['sku', 'quantity']
      }
    }
  },
  required: ['id', 'client_id', 'items']
};

test('Validar creación de órdenes corporativas y esquema JSON (POST)', async ({ playwright }) => {
  // token para headers (mock local no valida)
  const token = process.env.API_TOKEN || 'test-token';

  // mock local
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/v1/orders') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const responseBody = {
          id: "ORD-2026-XYZ",
          client_id: "NYXN-2026",
          status: "Created",
          items: [{ sku: "MCP-SERVER-CORE", quantity: 2 }]
        };
        const payload = JSON.stringify(responseBody);
        res.writeHead(201, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        });
        res.end(payload);
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const addr = server.address();
  if (!addr || typeof addr === 'string') {
    await new Promise<void>(r => server.close(() => r()));
    throw new Error('No se pudo iniciar el mock');
  }
  const port = addr.port;
  const baseURL = `http://127.0.0.1:${port}`;

  const apiContext = await playwright.request.newContext({ baseURL });

  const response = await apiContext.post('/api/v1/orders', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      client_id: 'NYXN-2026',
      items: [{ sku: 'MCP-SERVER-CORE', quantity: 2 }]
    }
  });

  expect(response.status()).toBe(201);

  const responseBody = await response.json();
  const validate = ajv.compile(orderResponseSchema);
  const valid = validate(responseBody);
  if (!valid) console.error(validate.errors);
  expect(valid).toBe(true);

  await apiContext.dispose();
  await new Promise<void>(resolve => server.close(() => resolve()));
});

/*
Consultas:

-- SQL (Postgres / MySQL)
SELECT id, client_id, status, items, created_at
FROM orders
WHERE client_id = 'NYXN-2026'
ORDER BY created_at DESC
LIMIT 1;

-- MongoDB (mongo shell)
db.orders.find({ client_id: 'NYXN-2026' }).sort({ created_at: -1 }).limit(1).pretty();
*/