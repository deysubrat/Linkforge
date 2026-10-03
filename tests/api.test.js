import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import http from 'node:http';

import { app } from '../server/src/server.js';
import { clearLinks } from '../server/src/store.js';

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => clearLinks());

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

describe('URL shortener API', () => {
  it('reports health', async () => {
    const { response, body } = await request('/api/health');
    assert.equal(response.status, 200);
    assert.equal(body.data.status, 'ok');
  });

  it('rejects invalid shorten requests', async () => {
    const { response, body } = await request('/api/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'not-a-url' }),
    });
    assert.equal(response.status, 400);
    assert.ok(body.error);
  });

  it('creates and lists a link', async () => {
    const created = await request('/api/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/docs' }),
    });
    assert.equal(created.response.status, 201);
    assert.match(created.body.data.code, /^[A-Za-z0-9_-]+$/);
    assert.equal(created.body.data.url, 'https://example.com/docs');

    const listed = await request('/api/links');
    assert.equal(listed.response.status, 200);
    assert.ok(listed.body.data.some((link) => link.code === created.body.data.code));
  });

  it('redirects a short code to its destination', async () => {
    const created = await request('/api/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/redirect-target' }),
    });
    const redirected = await fetch(`${baseUrl}/${created.body.data.code}`, { redirect: 'manual' });
    assert.equal(redirected.status, 302);
    assert.equal(redirected.headers.get('location'), 'https://example.com/redirect-target');
  });

  it('supports custom aliases', async () => {
    const created = await request('/api/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/custom', alias: 'docs-home' }),
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.code, 'docs-home');
  });
});
