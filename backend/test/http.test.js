const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('health endpoint reports API availability', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('production frontend can send authenticated API requests across origins', async () => {
  const response = await fetch(`${baseUrl}/api/admin/vendors`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://merkato-online-gebeya.onrender.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'content-type,authorization',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://merkato-online-gebeya.onrender.com');
  assert.deepEqual(
    response.headers.get('access-control-allow-methods').split(',').map((method) => method.trim()),
    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  );
  const allowedHeaders = response.headers.get('access-control-allow-headers').toLowerCase();
  assert.match(allowedHeaders, /content-type/);
  assert.match(allowedHeaders, /authorization/);
});

test('vendor, customer, and admin API routes require authentication', async () => {
  const protectedRoutes = [
    ['GET', '/api/vendors/me/dashboard'],
    ['GET', '/api/orders/mine'],
    ['GET', '/api/admin/dashboard'],
    ['GET', '/api/admin/users'],
    ['DELETE', '/api/admin/users/507f1f77bcf86cd799439011'],
    ['GET', '/api/admin/vendors'],
    ['GET', '/api/admin/stores'],
    ['PATCH', '/api/admin/stores/507f1f77bcf86cd799439011/verification'],
    ['GET', '/api/admin/products'],
    ['DELETE', '/api/admin/products/507f1f77bcf86cd799439011'],
    ['PATCH', '/api/admin/products/507f1f77bcf86cd799439011/visibility'],
    ['GET', '/api/admin/orders'],
  ];
  for (const [method, path] of protectedRoutes) {
    const response = await fetch(`${baseUrl}${path}`, { method });
    assert.equal(response.status, 401, path);
  }
});

test('public registration cannot assign the admin role', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'long-secure-password',
      phone: '+251911123456',
      role: 'admin',
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /customers and vendors/);
});

test('login rejects missing credentials without querying the database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Email and password are required/);
});
