import express from 'express';
import cors from 'cors';
import { createLink, getLink, listLinks, recordClick } from './store.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function publicLink(link, request) {
  const baseUrl = process.env.BASE_URL || `${request.protocol}://${request.get('host')}`;
  return {
    ...link,
    shortCode: link.code,
    shortUrl: `${baseUrl.replace(/\/$/, '')}/${link.code}`,
  };
}

app.get('/api/health', (request, response) => {
  response.json({ data: { status: 'ok' } });
});

app.post('/api/links', (request, response) => {
  const { url, alias } = request.body ?? {};

  if (typeof url !== 'string' || !isValidUrl(url.trim())) {
    return response.status(400).json({
      error: { message: 'url must be a valid http or https URL' },
    });
  }

  if (alias !== undefined && (typeof alias !== 'string' || !/^[A-Za-z0-9_-]{3,32}$/.test(alias))) {
    return response.status(400).json({
      error: { message: 'alias must be 3-32 characters using letters, numbers, hyphens, or underscores' },
    });
  }

  if (alias && getLink(alias)) {
    return response.status(409).json({ error: { message: 'alias is already in use' } });
  }

  const link = createLink(url.trim(), alias?.trim());
  return response.status(201).json({ data: publicLink(link, request) });
});

app.get('/api/links', (request, response) => {
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 20, 1), 100);
  const links = listLinks().slice(0, limit).map((link) => publicLink(link, request));
  response.json({ data: links });
});

app.get('/:code', (request, response) => {
  const link = recordClick(request.params.code);
  if (!link) {
    return response.status(404).json({ error: { message: 'Short link not found' } });
  }

  return response.redirect(302, link.url);
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ error: { message: 'Request body must be valid JSON' } });
  }
  return next(error);
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`LinkForge API listening on port ${port}`);
  });
}
