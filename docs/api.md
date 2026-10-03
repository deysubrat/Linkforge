# LinkForge API

The API uses JSON responses shaped as `{ "data": ... }` for successful requests and `{ "error": ... }` for failures.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Return service health. |
| `POST` | `/api/links` | Create a short link from `{ "url": "https://...", "alias": "optional-name" }`. Returns `201`. |
| `GET` | `/api/links` | List links created in the current process. |
| `GET` | `/:shortCode` | Redirect to the stored destination with HTTP `302`. |

Invalid or missing URLs return HTTP `400`. Aliases use 3-32 letters, numbers, hyphens, or underscores. Duplicate aliases return `409`. Unknown short codes should return HTTP `404`.

## Test interface

`tests/api.test.js` imports the named `app` export and owns an ephemeral HTTP port. The server avoids listening during `NODE_ENV=test`, while the test resets the in-memory store between cases through its explicit `clearLinks()` helper.
