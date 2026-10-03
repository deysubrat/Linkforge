# Local Setup and Testing

## Setup

Install dependencies for each application once:

```bash
npm install --prefix server
npm install --prefix web
```

Run the API and React development server together using the repository's development command:

```bash
npm run dev
```

The backend should honor `PORT` and `BASE_URL`. Link data is in memory and resets when the API restarts.

## Tests

Run the Node built-in test suite:

```bash
node --test tests/api.test.js
```

The black-box example is skipped by default. Start the API separately, then opt in:

```bash
RUN_INTEGRATION=1 BASE_URL=http://127.0.0.1:5000 node --test tests/integration/black-box.test.js
```

The tests use Node's built-in `node:test`, assertions, HTTP server, and `fetch`; no test framework or extra test dependency is required. The backend store is reset between tests and is not persistent.
