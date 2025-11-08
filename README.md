# Mockery v2

A lightweight backend service that provides mock JSON responses from a git-backed repository for testing API dependencies.

## Overview

Mockery is a Node.js service that returns stored JSON responses to help developers test their applications without hitting real dependencies. Mock responses are version-controlled in a git repository and retrieved via a simple HTTP API.

## Features

- **Simple Mock Retrieval**: Get mock responses by ID via HTTP header
- **Response Variation**: Provide multiple mock IDs for random selection
- **Git-Based Storage**: All mocks version-controlled in git
- **Health Monitoring**: Built-in health check endpoint
- **Fast & Lightweight**: Minimal dependencies, quick response times
- **Type Safe**: Written in TypeScript with strict mode

## Quick Start

### Prerequisites

- Node.js v20 or higher
- A directory containing mock JSON files

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Mockeryv2

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` file:

```bash
PORT=3000
NODE_ENV=development
MOCK_REPO_PATH=/path/to/your/mock-repository
LOG_LEVEL=info
```

### Running the Service

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Usage

### Retrieve a Mock Response

```bash
# Single mock ID
curl -H "X-Mock-ID: 1234" http://localhost:3000/api/mock

# Multiple IDs (random selection)
curl -H "X-Mock-ID: 1234,5678,user-profile" http://localhost:3000/api/mock
```

### Health Check

```bash
curl http://localhost:3000/health
```

## API Reference

### GET /api/mock

Retrieve a mock JSON response.

**Request Headers:**
- `X-Mock-ID` (required): Single mock ID or comma-separated list of IDs

**Success Response (200):**
```json
{
  "userId": 123,
  "name": "Test User",
  "email": "test@example.com"
}
```

**Error Responses:**

400 Bad Request - Missing header:
```json
{
  "error": {
    "message": "Missing X-Mock-ID header",
    "code": "MISSING_MOCK_ID"
  }
}
```

404 Not Found - Mock not found:
```json
{
  "error": {
    "message": "No valid mocks found",
    "code": "NO_VALID_MOCKS",
    "details": {
      "attemptedIds": ["9999"]
    }
  }
}
```

500 Internal Server Error - Invalid JSON or server error:
```json
{
  "error": {
    "message": "Failed to parse mock file: invalid.json",
    "code": "INVALID_MOCK_FORMAT"
  }
}
```

### GET /health

Check service health status.

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T10:00:00.000Z",
  "mockRepoAccessible": true
}
```

**Error Response (503):**
```json
{
  "status": "error",
  "timestamp": "2025-11-07T10:00:00.000Z",
  "mockRepoAccessible": false,
  "message": "Mock repository not accessible"
}
```

## Mock Repository Structure

Create a directory with JSON files named by mock ID:

```
mock-repository/
├── 1234.json
├── 5678.json
├── user-profile.json
├── success-response.json
└── error-response.json
```

**Valid Mock ID Format:**
- Alphanumeric characters (a-z, A-Z, 0-9)
- Hyphens (-)
- Underscores (_)

**Examples:**
- ✅ `my-mock.json`
- ✅ `test_123.json`
- ✅ `user-profile.json`
- ❌ `mock with spaces.json`
- ❌ `../etc/passwd.json`

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP GET /api/mock
       │ Header: X-Mock-ID
       ↓
┌─────────────────────┐
│  Express.js API     │
│  - Routes           │
│  - Middleware       │
│  - Controllers      │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  MockService        │
│  - ID Parsing       │
│  - Random Selection │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  FileSystemRepo     │
│  - File Reading     │
│  - JSON Parsing     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────┐
│ Git Repository  │
│  (File System)  │
└─────────────────┘
```

## Development

### Project Structure

```
src/
├── config/              # Environment configuration
├── controllers/         # Request handlers
├── errors/              # Custom error classes
├── middleware/          # Express middleware
├── repositories/        # Data access layer
├── routes/              # API routes
├── services/            # Business logic
├── types/               # TypeScript types
├── app.ts              # Express app setup
└── server.ts           # Server startup

tests/
├── unit/               # Unit tests
└── e2e/                # End-to-end tests

test-mocks/             # Sample mock files
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Docker Support

```dockerfile
# Build
docker build -t mockery .

# Run
docker run -p 3000:3000 \
  -v /path/to/mocks:/mocks \
  -e MOCK_REPO_PATH=/mocks \
  mockery
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP server port |
| `MOCK_REPO_PATH` | **Yes** | - | Path to mock repository |
| `NODE_ENV` | No | development | Environment mode |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

## Performance

- **Response Time**: < 100ms (p95) for typical files
- **File Size Limit**: 10MB maximum per mock file
- **Concurrency**: Handles 100+ concurrent requests
- **Memory**: < 100MB under normal load

## Security

- **Path Traversal Prevention**: Mock IDs validated to prevent directory traversal
- **File Size Limits**: Rejects files larger than 10MB
- **Input Validation**: All headers and inputs validated
- **No Code Execution**: Only reads and parses JSON files

## Limitations (MVP)

- No caching (reads from disk on every request)
- No hot reload (restart required for mock changes)
- No authentication/authorization
- Single repository only (no multi-tenancy)
- Flat directory structure (no subdirectories)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
