import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function normalizeLink(item) {
  const data = item?.data || item;
  return {
    id: data.id || data.shortCode || data.alias || data.shortUrl,
    shortCode: data.shortCode || data.code || data.alias,
    shortUrl: data.shortUrl || data.url || `${window.location.origin}/${data.alias || data.shortCode}`,
    originalUrl: data.originalUrl || data.longUrl || data.destination || data.target || data.url,
    createdAt: data.createdAt,
  };
}

function App() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState('');
  const [deleting, setDeleting] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/links`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error())))
      .then((payload) => setLinks((payload.data || payload).map(normalizeLink)))
      .catch(() => setLinks([]));
  }, []);

  async function shortenUrl(event) {
    event.preventDefault();
    setMessage('');
    setResult(null);

    try {
      new URL(url);
    } catch {
      setStatus('error');
      setMessage('Enter a complete URL, including https://');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE_URL}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...(alias.trim() ? { alias: alias.trim() } : {}) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || payload.error || 'Unable to shorten this link.');

      const link = normalizeLink(payload);
      setResult(link);
      setLinks((current) => [link, ...current.filter((item) => item.id !== link.id)].slice(0, 5));
      setUrl('');
      setAlias('');
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'The service is unavailable. Try again shortly.');
    }
  }

  async function copyLink(link) {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopied(link.id || link.shortUrl);
    window.setTimeout(() => setCopied(''), 1800);
  }

  async function deleteLink(link) {
    if (!window.confirm(`Delete ${link.shortUrl}?`)) return;

    setDeleting(link.id);
    setDeleteMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/links/${encodeURIComponent(link.shortCode)}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to delete this link.');
      setLinks((current) => current.filter((item) => item.id !== link.id));
      if (result?.id === link.id) setResult(null);
    } catch (error) {
      setDeleteMessage(error.message || 'Unable to delete this link.');
    } finally {
      setDeleting('');
    }
  }

  return (
    <main className="page-shell">
      <nav className="nav-bar">
        <a className="brand" href="/" aria-label="LinkForge home"><span className="brand-mark">↗</span> LinkForge</a>
        <span className="nav-note"><span className="status-dot" /> Simple links. Better reach.</span>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">LINK MANAGEMENT, WITHOUT THE NOISE</p>
          <h1>Make every link<br /><em>count.</em></h1>
          <p className="intro">Turn long, unwieldy URLs into clean links that are easy to share, remember, and track.</p>
          <div className="trust-row"><span>✦</span> Fast to create <span>✦</span> No clutter <span>✦</span> Yours to share</div>
        </div>

        <div className="shortener-card">
          <div className="card-heading"><div><p className="card-kicker">CREATE A SHORT LINK</p><h2>What are you sharing?</h2></div><span className="sparkle">✦</span></div>
          <form onSubmit={shortenUrl}>
            <label htmlFor="url">Paste your long URL</label>
            <div className="input-wrap"><span className="input-icon">↗</span><input id="url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourwebsite.com/very-long-link" required /></div>
            <label htmlFor="alias">Custom alias <span>(optional)</span></label>
            <div className="alias-wrap"><span>linkforge.to/</span><input id="alias" value={alias} onChange={(event) => setAlias(event.target.value.replace(/\s/g, '-'))} placeholder="your-alias" maxLength="32" /></div>
            <button className="submit-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Creating your link…' : 'Shorten URL'} <span>→</span></button>
          </form>
          {status === 'error' && <p className="feedback error">{message}</p>}
          {status === 'success' && result && <div className="result-box"><div><span className="success-label">YOUR SHORT LINK IS READY</span><a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a></div><button onClick={() => copyLink(result)}>{copied === result.id ? 'Copied!' : 'Copy link'}</button></div>}
        </div>
      </section>

      <section className="recent-section"><div className="section-heading"><div><p className="eyebrow">YOUR LINK DESK</p><h2>Recent links</h2></div><span className="link-count">{links.length} {links.length === 1 ? 'link' : 'links'}</span></div>
        {deleteMessage && <p className="feedback error">{deleteMessage}</p>}
        {links.length ? <div className="link-list">{links.map((link) => <article className="link-row" key={link.id || link.shortUrl}><div className="link-orb">↗</div><div className="link-details"><a href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortUrl}</a><span>{link.originalUrl}</span></div><div className="row-actions"><button className="icon-button" onClick={() => copyLink(link)} aria-label={`Copy ${link.shortUrl}`}>{copied === link.id ? '✓' : '⧉'}</button><button className="delete-button" onClick={() => deleteLink(link)} disabled={deleting === link.id}>{deleting === link.id ? 'Deleting…' : 'Delete'}</button></div></article>)}</div> : <div className="empty-state"><span>✦</span><p>Your freshly shortened links will appear here.</p></div>}
      </section>
      <footer><span>© {new Date().getFullYear()} LinkForge</span><span>Made for sharing</span></footer>
    </main>
  );
}

export default App;
