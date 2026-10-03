import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const integrationEnabled = Boolean(process.env.RUN_INTEGRATION);

describe('running service integration', { skip: !integrationEnabled }, () => {
  it('creates a link through the configured public HTTP endpoint', async () => {
    const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5000';
    const response = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/integration' }),
    });
    assert.equal(response.status, 201);
    assert.ok((await response.json()).data.code);
  });
});
