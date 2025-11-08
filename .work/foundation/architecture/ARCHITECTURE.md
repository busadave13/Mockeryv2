# Mockery v2 - System Architecture

**Version**: 1.0
**Date**: 2025-11-07
**Status**: MVP Architecture

## System Overview

Mockery is a lightweight HTTP service that retrieves mock JSON responses from a git-backed file system. The architecture prioritizes simplicity, performance, and maintainability for the MVP scope.

## High-Level Architecture

```
┌─────────────────┐
│  Client Service │
│   (HTTP Client) │
└────────┬────────┘
         │ HTTP GET /api/mock
         │ Header: X-Mock-ID
         ↓
┌─────────────────────────────────────────┐
│         Mockery HTTP Service            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Express.js App Layer        │  │
│  │  - Route Handlers                │  │
│  │  - Request Validation            │  │
│  │  - Error Handling Middleware     │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│  ┌──────────▼───────────────────────┐  │
│  │    Mock Service Layer            │  │
│  │  - Mock ID Parsing               │  │
│  │  - Random Selection Logic        │  │
│  │  - Business Logic                │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│  ┌──────────▼───────────────────────┐  │
│  │  File System Repository Layer    │  │
│  │  - File Read Operations          │  │
│  │  - Path Resolution               │  │
│  │  - JSON Parsing                  │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼───────────────────────────┘
              │
              ↓
     ┌────────────────┐
     │  Git Repository│
     │   (File System)│
     │  - {id}.json   │
     └────────────────┘
```

## Component Architecture

### 1. HTTP Layer (Express.js)

**Responsibility**: Handle HTTP requests, routing, and response formatting

**Components**:
- `server.ts` - Express server initialization and configuration
- `routes/mockRoutes.ts` - Route definitions for /api/mock and /health
- `middleware/errorHandler.ts` - Global error handling middleware
- `middleware/requestLogger.ts` - Request/response logging middleware
- `middleware/validator.ts` - Request validation middleware

**Key Decisions**:
- Express.js for HTTP framework (lightweight, well-documented)
- Middleware-based architecture for cross-cutting concerns
- JSON-only responses (no HTML/template rendering)

**Interfaces**:
```typescript
// Request format
GET /api/mock
Headers:
  X-Mock-ID: string (single ID or comma-separated IDs)

// Success response
HTTP 200 OK
Content-Type: application/json
Body: <contents of selected mock file>

// Error responses
HTTP 400 Bad Request - Missing/invalid header
HTTP 404 Not Found - Mock ID not found
HTTP 500 Internal Server Error - Server errors (invalid JSON, file read errors)
```

---

### 2. Service Layer

**Responsibility**: Business logic for mock selection and retrieval

**Components**:
- `services/MockService.ts` - Core mock retrieval logic

**Key Operations**:
```typescript
class MockService {
  // Parse comma-separated mock IDs from header
  parseMockIds(headerValue: string): string[]

  // Select random ID from array
  selectRandomId(ids: string[]): string

  // Get mock response (orchestrates repository calls)
  getMockResponse(mockIds: string[]): Promise<any>
}
```

**Logic Flow**:
1. Parse X-Mock-ID header value (split by comma, trim whitespace)
2. Validate at least one ID is provided
3. If multiple IDs, randomly select one using crypto.randomInt()
4. Call repository layer to read file
5. Return parsed JSON to controller

**Error Handling**:
- Empty/missing IDs → throw ValidationError (400)
- All IDs invalid/not found → throw NotFoundError (404)
- JSON parse failures → throw ServerError (500)

---

### 3. Repository Layer

**Responsibility**: File system access and JSON parsing

**Components**:
- `repositories/FileSystemRepository.ts` - File operations

**Key Operations**:
```typescript
class FileSystemRepository {
  private mockRepoPath: string

  // Check if mock file exists
  exists(mockId: string): Promise<boolean>

  // Read and parse mock file
  readMock(mockId: string): Promise<any>

  // Verify repository path is accessible
  validateRepository(): Promise<boolean>
}
```

**Implementation Details**:
- File path construction: `${MOCK_REPO_PATH}/${mockId}.json`
- Use `fs.promises` for async file operations
- JSON.parse() for file content parsing
- File existence check before read to provide better errors

**Error Handling**:
- File not found (ENOENT) → return null or throw NotFoundError
- Invalid JSON → throw ServerError with parse error details
- Permission errors → throw ServerError

---

### 4. Configuration Layer

**Responsibility**: Environment configuration and validation

**Components**:
- `config/index.ts` - Configuration loading and validation

**Configuration Values**:
```typescript
interface Config {
  port: number              // Default: 3000
  mockRepoPath: string      // Required: MOCK_REPO_PATH env var
  nodeEnv: string          // Default: 'development'
  logLevel: string         // Default: 'info'
}
```

**Validation**:
- `MOCK_REPO_PATH` must be set and point to accessible directory
- Fail fast on startup if configuration invalid

---

### 5. Error Handling Architecture

**Custom Error Classes**:
```typescript
class ValidationError extends Error {
  statusCode = 400
}

class NotFoundError extends Error {
  statusCode = 404
}

class ServerError extends Error {
  statusCode = 500
}
```

**Error Middleware Flow**:
1. Errors thrown in any layer bubble up to Express error handler
2. Error handler maps error types to HTTP status codes
3. Consistent error response format:
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional context
  }
}
```

---

### 6. Logging Architecture

**Logging Strategy**:
- Structured JSON logs for easy parsing
- Log levels: error, warn, info, debug
- Request logging includes:
  - Request ID (generated per request)
  - Method, path, headers (filtered)
  - Response status code and time
  - Mock IDs attempted

**Log Events**:
- Server startup/shutdown
- Each request (with duration)
- Mock file reads (success/failure)
- All errors with stack traces

**Implementation**:
- Use `winston` or `pino` for structured logging
- Console output in development, JSON in production

---

## Data Flow

### Successful Request Flow

```
1. Client → Express: GET /api/mock, X-Mock-ID: "123,456"
2. Express → Validator Middleware: Validate header present
3. Express → Mock Controller: Route to handler
4. Controller → MockService: getMockResponse(["123", "456"])
5. MockService: selectRandomId() → "456"
6. MockService → FileSystemRepository: readMock("456")
7. FileSystemRepository: Read {MOCK_REPO_PATH}/456.json
8. FileSystemRepository: JSON.parse(fileContent)
9. FileSystemRepository → MockService: Return parsed JSON
10. MockService → Controller: Return mock data
11. Controller → Express: res.json(mockData)
12. Express → Client: HTTP 200 with JSON body
```

### Error Flow (Mock Not Found)

```
1. Client → Express: GET /api/mock, X-Mock-ID: "999"
2. ... (steps 2-6 same as above)
3. FileSystemRepository: File not found
4. FileSystemRepository: throws NotFoundError("Mock not found: 999")
5. Express Error Middleware: Catches NotFoundError
6. Express Error Middleware → Client: HTTP 404 with error JSON
```

---

## Directory Structure

```
mockery/
├── src/
│   ├── server.ts                    # Express app initialization
│   ├── app.ts                       # App configuration
│   ├── config/
│   │   └── index.ts                 # Configuration loading
│   ├── controllers/
│   │   ├── mockController.ts        # Mock API handlers
│   │   └── healthController.ts      # Health check handler
│   ├── services/
│   │   └── MockService.ts           # Business logic
│   ├── repositories/
│   │   └── FileSystemRepository.ts  # File operations
│   ├── middleware/
│   │   ├── errorHandler.ts          # Global error handler
│   │   ├── requestLogger.ts         # Request logging
│   │   └── validator.ts             # Request validation
│   ├── errors/
│   │   └── index.ts                 # Custom error classes
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── repositories/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── mockRetrieval.spec.ts
├── test-mocks/                      # Test mock repository
│   ├── 1234.json
│   ├── 5678.json
│   └── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## API Specification

### GET /api/mock

Retrieve a mock JSON response by ID(s).

**Request**:
```
GET /api/mock HTTP/1.1
Host: localhost:3000
X-Mock-ID: 1234
```

**Success Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "userId": 123,
  "name": "Test User"
}
```

**Error Responses**:

Missing Header:
```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "message": "Missing X-Mock-ID header",
    "code": "MISSING_MOCK_ID"
  }
}
```

Mock Not Found:
```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "message": "Mock not found: 9999",
    "code": "MOCK_NOT_FOUND",
    "details": {
      "attemptedIds": ["9999"]
    }
  }
}
```

Invalid JSON:
```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": {
    "message": "Failed to parse mock file: invalid.json",
    "code": "INVALID_MOCK_FORMAT"
  }
}
```

---

### GET /health

Check service health status.

**Success Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "timestamp": "2025-11-07T10:30:00.000Z",
  "mockRepoAccessible": true
}
```

**Error Response**:
```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{
  "status": "error",
  "message": "Mock repository not accessible",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP server port |
| `MOCK_REPO_PATH` | **Yes** | - | Absolute path to git repository containing mocks |
| `NODE_ENV` | No | development | Environment (development/production) |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

### Example Configuration

```bash
# .env
PORT=3000
MOCK_REPO_PATH=/Users/dev/mockery-data
NODE_ENV=development
LOG_LEVEL=info
```

---

## Non-Functional Requirements

### Performance
- Target response time: < 100ms (p95) for typical mock files (< 100KB)
- Support 100+ concurrent requests
- Minimal memory footprint (no caching in MVP)

### Reliability
- Graceful error handling for all failure scenarios
- Clear error messages for debugging
- Service continues running even if individual requests fail

### Maintainability
- Clear separation of concerns (layered architecture)
- TypeScript for type safety
- Comprehensive error handling
- Unit test coverage > 80%

### Scalability
- Stateless service (can run multiple instances)
- No in-memory state (reads files on each request)
- Horizontal scaling possible with load balancer

---

## Security Considerations

### In Scope for MVP
- Input validation (header format, mock ID format)
- Path traversal prevention (validate mock ID contains only safe characters)
- JSON parsing limits (reject files > 10MB)

### Out of Scope for MVP
- Authentication/Authorization (handled by network policies)
- Rate limiting (handled by API gateway/proxy)
- TLS/HTTPS (handled by reverse proxy)

### Mock ID Validation
- Allow: alphanumeric, hyphens, underscores
- Reject: path separators (/, \), parent directory (..)
- Regex: `^[a-zA-Z0-9_-]+$`

---

## Testing Strategy

### Unit Tests
- Service layer logic (ID parsing, random selection)
- Repository layer (file reading, error handling)
- Middleware (validation, error formatting)

### Integration Tests
- API endpoints with test mock repository
- Error scenarios (missing files, invalid JSON)
- Multiple ID variation testing

### E2E Tests (Playwright)
- Full request/response cycle
- Service startup/shutdown
- Health check validation
- Multiple concurrent requests

---

## Deployment Model

### MVP Deployment
- Single Docker container
- Mount git repository as volume
- Environment variables for configuration
- Docker health check using /health endpoint

### Future Considerations
- Kubernetes deployment with multiple replicas
- Git repository sync via sidecar container
- Metrics and monitoring integration

---

## Open Design Decisions

The following design decisions are finalized for MVP:

1. **No Caching**: Read files on each request (simplicity over performance)
2. **No Hot Reload**: Restart required for mock changes (acceptable for MVP)
3. **Single Repository**: Only one mock repository path (no multi-tenancy)
4. **Flat Structure**: All mocks in repository root (no subdirectories in MVP)
5. **No Response Transformation**: Return exact file contents (no templating)

---

## Future Architecture Enhancements

Documented for post-MVP planning:

1. **In-Memory Cache**: Cache frequently accessed mocks with TTL
2. **Hot Reload**: Watch file system for changes and reload without restart
3. **Subdirectory Support**: Organize mocks in folders (e.g., /service-a/endpoint1.json)
4. **Request Matching**: Support matching based on path, method, query params
5. **Response Customization**: Headers, status codes per mock
6. **Metrics/Analytics**: Track mock usage, latency, error rates
7. **Git Integration**: Direct git operations (branch switching, commit history)

---

## Success Criteria

Architecture is complete and validated when:
- All user stories can be implemented within this design
- No TBD or unresolved design questions remain
- Component interfaces are clearly defined
- Error handling strategy covers all scenarios
- Testing strategy validates all requirements
