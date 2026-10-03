# LinkForge

LinkForge is a full-stack JavaScript application built with React on the frontend and Express.js on the backend.

## Tech stack

- **Frontend:** React.js
- **Backend:** Node.js and Express.js
- **Language:** JavaScript
- **Package manager:** npm

## Project structure

The project is organized into separate frontend and backend applications:

```text
Linkforge/
├── client/          # React application
├── server/          # Express.js API
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before getting started:

- Node.js 18 or newer
- npm 9 or newer

You can check your installed versions with:

```bash
node --version
npm --version
```

## Getting started

Clone the repository and move into the project directory:

```bash
git clone <repository-url>
cd Linkforge
```

Install dependencies for both applications:

```bash
cd server
npm install

cd ../client
npm install
```

Create environment files as needed by each application. For example:

```text
server/.env
client/.env
```

Do not commit secrets or private credentials to the repository.

## Running the application

Start the Express API in one terminal:

```bash
cd server
npm run dev
```

Start the React development server in another terminal:

```bash
cd client
npm start
```

The frontend will normally be available at `http://localhost:3000`. The backend port is defined by the server configuration, commonly `http://localhost:5000`.

If the frontend and backend use different ports, configure the frontend API base URL through its environment configuration.

## Production build

Build the React application for production:

```bash
cd client
npm run build
```

Start the Express server using its production script:

```bash
cd server
npm start
```

The exact script names may vary depending on the `package.json` files in each application.

## API

The Express application exposes the backend API. Add endpoint documentation here as routes are implemented.

Example format:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/...` | Describe the endpoint |

## Development guidelines

- Keep frontend code inside `client/` and backend code inside `server/`.
- Store configuration and secrets in environment variables.
- Validate API input on the server.
- Add tests for new functionality where practical.
- Run linting and tests before opening a pull request.

## Contributing

1. Create a feature branch.
2. Make your changes and verify them locally.
3. Commit the changes with a clear message.
4. Open a pull request describing what changed and how it was tested.

## License

Add the project license here.
