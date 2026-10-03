# LinkForge

LinkForge is a full-stack URL shortener built with React, Vite, Node.js, and Express. It creates shareable short links, supports optional custom aliases, tracks clicks in memory, and shows recently created links in the frontend.

## Project structure

```text
Linkforge/
├── server/                 # Express API and backend tests
│   ├── src/server.js       # Routes and HTTP server
│   └── src/store.js        # In-memory link store
├── web/                    # React/Vite frontend
├── tests/                  # API and opt-in integration tests
├── docs/                   # API and setup documentation
└── package.json            # Root development commands
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

Install all dependencies from the repository root:

```bash
npm install
npm install --prefix server
npm install --prefix web
```

## Development

Run the Express API and Vite frontend together:

```bash
npm run dev
```

The API runs on `http://localhost:5000` and the frontend normally runs on the Vite port shown in the terminal. Set `PORT` or `BASE_URL` for backend configuration. Set `VITE_API_URL` when the API is not available at `http://localhost:5000/api`.

## Testing and build

```bash
npm test                 # Backend and API tests
npm run build            # Production frontend build
npm run start            # Express API only
```

The optional black-box integration test requires a running API:

```bash
RUN_INTEGRATION=1 BASE_URL=http://127.0.0.1:5000 node --test tests/integration/black-box.test.js
```

## API

See [docs/api.md](docs/api.md) for endpoints and response shapes. Link data is intentionally in-memory and resets whenever the server restarts.

## Security

Do not commit `.env` files or secrets. Validate all user input at the API boundary before adding persistent storage or deploying publicly.
