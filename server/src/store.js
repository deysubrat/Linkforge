import crypto from 'node:crypto';

const links = new Map();

function createCode() {
  let code;
  do {
    code = crypto.randomBytes(4).toString('base64url');
  } while (links.has(code));
  return code;
}

export function createLink(url, alias) {
  const now = new Date().toISOString();
  const link = {
    code: alias || createCode(),
    url,
    createdAt: now,
    clicks: 0,
  };

  links.set(link.code, link);
  return { ...link };
}

export function getLink(code) {
  return links.get(code);
}

export function recordClick(code) {
  const link = links.get(code);
  if (!link) return undefined;

  link.clicks += 1;
  return link;
}

export function listLinks() {
  return [...links.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((link) => ({ ...link }));
}

export function clearLinks() {
  links.clear();
}
