import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/server.js';
import { clearLinks } from '../src/store.js';

let server;

async function startServer() {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

afterEach(async () => {
  clearLinks();
  if (server) await new Promise((resolve) => server.close(resolve));
  server = undefined;
});

test('reports API health', async () => {
  const baseUrl = await startServer();
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { status: 'ok' } });
});

test('creates, lists, and redirects a short link', async () => {
  const baseUrl = await startServer();
  const createResponse = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com/docs' }),
  });
  const created = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(created.data.url, 'https://example.com/docs');
  assert.match(created.data.shortUrl, /\/[-_A-Za-z0-9]+$/);

  const listResponse = await fetch(`${baseUrl}/api/links`);
  const listed = await listResponse.json();
  assert.equal(listed.data.length, 1);

  const redirectResponse = await fetch(`${baseUrl}/${created.data.code}`, { redirect: 'manual' });
  assert.equal(redirectResponse.status, 302);
  assert.equal(redirectResponse.headers.get('location'), 'https://example.com/docs');
});

test('rejects invalid URLs and missing links', async () => {
  const baseUrl = await startServer();
  const invalidResponse = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });
  assert.equal(invalidResponse.status, 400);
  assert.ok((await invalidResponse.json()).error);

  const missingResponse = await fetch(`${baseUrl}/missing`, { redirect: 'manual' });
  assert.equal(missingResponse.status, 404);
  assert.ok((await missingResponse.json()).error);
});
