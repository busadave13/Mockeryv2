# Mockery v2 - Technology Stack

**Version**: 1.0
**Date**: 2025-11-07
**Status**: MVP Technology Decisions

## Core Technology Decisions

### Runtime & Language

**Node.js v20 LTS + TypeScript 5.x**

**Rationale**:
- Node.js v20 is the current LTS with long-term support until April 2026
- Excellent performance for I/O-bound operations (file reading)
- Large ecosystem of HTTP and file system libraries
- TypeScript provides type safety and better IDE support
- Team familiarity with Node.js ecosystem

**Alternatives Considered**:
- Deno: Too new, smaller ecosystem
- Go: Better performance but higher complexity for simple MVP
- Python: Slower for concurrent HTTP requests

---

### HTTP Framework

**Express.js v4.18+**

**Rationale**:
- Industry standard with massive ecosystem
- Excellent middleware support for cross-cutting concerns
- Simple routing API
- Well-documented and stable
- Large community for troubleshooting
- Lightweight (minimal overhead)

**Alternatives Considered**:
- Fastify: Faster but less mature ecosystem
- Koa: More modern but smaller community
- NestJS: Too heavy for simple API service
- Native Node.js http: Too low-level, reinventing middleware

---

### File System Operations

**Node.js fs.promises (Native)**

**Rationale**:
- No external dependencies needed
- Built-in async/await support
- Sufficient performance for MVP
- Direct integration with Node.js runtime

**Alternatives Considered**:
- fs-extra: Not needed for simple read operations
- Third-party libraries: Unnecessary complexity

---

### Logging

**Pino v8.x**

**Rationale**:
- Fastest JSON logger for Node.js (benchmarked)
- Structured logging out of the box
- Low overhead in production
- Child loggers for request context
- Excellent ecosystem (pino-http, pino-pretty)

**Alternatives Considered**:
- Winston: Slower, more complex configuration
- Bunyan: Less actively maintained
- console.log: No structured logging, poor production use

---

### Environment Configuration

**dotenv v16.x**

**Rationale**:
- Standard for environment variable management
- Simple .env file support for local development
- Zero configuration needed
- Production deployment uses native env vars

**Alternatives Considered**:
- config: Overly complex for simple env var needs
- Native process.env: Works but no .env file support for local dev

---

### Input Validation

**Custom Validation Functions**

**Rationale**:
- Simple header validation doesn't require heavy library
- Regex-based mock ID validation sufficient
- Reduces dependencies
- Full control over validation logic and errors

**Alternatives Considered**:
- Joi: Too heavy for simple header validation
- Yup: Designed for object validation, overkill
- express-validator: Adds unnecessary middleware complexity

---

### Testing Framework

**Jest v29.x**

**Rationale**:
- Industry standard for Node.js/TypeScript testing
- Built-in mocking capabilities
- Code coverage reporting
- Excellent TypeScript support
- Fast watch mode for development

**Alternatives Considered**:
- Mocha/Chai: More setup required, less integrated
- Vitest: Too new, smaller ecosystem
- AVA: Less popular, harder to find examples

---

### E2E Testing

**Playwright v1.40+**

**Rationale**:
- Can test HTTP APIs (not just browsers)
- Built-in retry and timeout handling
- Excellent TypeScript support
- Modern async/await API
- Great documentation

**Alternatives Considered**:
- Supertest: Limited to simple HTTP assertions
- Postman/Newman: Less programmable, harder CI integration
- Raw fetch: No test framework features

---

### TypeScript Configuration

**Strict Mode Enabled**

**Configuration**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

**Rationale**:
- Strict mode catches more errors at compile time
- Target ES2022 for modern JavaScript features
- CommonJS for Node.js compatibility

---

### Development Tools

**tsx v4.x (Dev Dependency)**

**Rationale**:
- Fast TypeScript execution for development
- No build step needed for development
- Hot reload capability

**Alternatives Considered**:
- ts-node: Slower, requires more configuration
- nodemon + ts-node: Extra dependency

**ESLint + Prettier**

**Rationale**:
- Consistent code style across team
- Catch common bugs and anti-patterns
- Auto-formatting reduces PR review comments

---

### Containerization

**Docker with Node.js Alpine Base**

**Dockerfile Strategy**:
- Multi-stage build (build + production)
- Alpine Linux for smaller image size
- Non-root user for security
- Health check built-in

**Rationale**:
- Consistent deployment across environments
- Easy local testing
- Production-ready packaging

---

## Dependency List

### Production Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pino": "^8.16.2",
    "pino-http": "^8.5.1",
    "dotenv": "^16.3.1"
  }
}
```

**Total Production Dependencies**: 4 (minimal, secure)

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.10",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "playwright": "^1.40.1",
    "@typescript-eslint/parser": "^6.13.2",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Version Strategy

### Node.js Version
- **Target**: Node.js v20 LTS
- **Enforcement**: `.nvmrc` file and package.json engines field
- **CI/CD**: Lock to specific v20.x.x version

### Dependency Updates
- **Strategy**: Conservative updates (test thoroughly)
- **Security**: Automated security updates via Dependabot/Renovate
- **Major Versions**: Manual review before upgrading

---

## Performance Characteristics

### Expected Performance (MVP)

| Metric | Target | Rationale |
|--------|--------|-----------|
| Response Time (p50) | < 50ms | File read + JSON parse is fast |
| Response Time (p95) | < 100ms | Accounts for larger files |
| Memory Usage | < 100MB | Stateless, no caching |
| Startup Time | < 2s | Simple initialization |
| Concurrent Requests | 100+ | Node.js event loop handles I/O well |

### Bottlenecks (Identified)

1. **File System I/O**: Limited by disk speed (SSD recommended)
2. **JSON Parsing**: Large files (> 1MB) will be slower
3. **No Caching**: Every request reads from disk

**Mitigation** (Future):
- In-memory cache for frequently accessed mocks
- Stream large JSON files
- Read-through cache with TTL

---

## Security Dependencies

### Vulnerability Scanning

**npm audit**
- Run on every CI build
- Block PR if high/critical vulnerabilities

**Snyk/Dependabot**
- Automated dependency updates
- Security advisories

### Security Best Practices

1. **No eval() or Function()**: No dynamic code execution
2. **Input Validation**: Mock ID sanitization prevents path traversal
3. **Limited JSON Size**: Reject files > 10MB
4. **No User Code Execution**: Only read and parse JSON
5. **Minimal Dependencies**: Reduce attack surface

---

## Browser/Client Compatibility

Not applicable - Mockery is a backend HTTP service with no browser dependencies.

**Client Requirements**:
- HTTP/1.1 client
- Support for custom headers (X-Mock-ID)
- JSON parsing capability

---

## Deployment Environment

### Development
- Local Node.js v20 installation
- Environment variables via .env file
- tsx for hot reload

### Testing (CI)
- GitHub Actions / GitLab CI
- Docker container for isolation
- Test mock repository in-repo

### Production
- Docker container
- Kubernetes (recommended) or Docker Compose
- External git repository mounted as volume
- Environment variables via secrets management

---

## Build & Deployment

### Build Process

```bash
# Development
npm run dev          # tsx src/server.ts

# Build for production
npm run build        # tsc

# Production
npm start            # node dist/server.js
```

### Docker Build

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
USER node
CMD ["node", "dist/server.js"]
```

---

## Technology Decision Matrix

| Decision Area | Chosen | Rationale Summary |
|---------------|--------|-------------------|
| Runtime | Node.js v20 | Performance, ecosystem, team familiarity |
| Language | TypeScript | Type safety, better tooling |
| HTTP Framework | Express.js | Battle-tested, large ecosystem |
| Logging | Pino | Fastest, structured logging |
| Testing | Jest + Playwright | Industry standard, full-featured |
| Config | dotenv | Simple, standard |
| Validation | Custom | Sufficient for simple needs |
| Container | Docker Alpine | Small size, security |

---

## Tech Stack Risks & Mitigations

### Risk: Express.js is older technology
**Impact**: Medium
**Mitigation**: Express.js v5 is in development; upgrade path exists. For MVP, v4 is stable and sufficient.

### Risk: No caching = performance bottleneck
**Impact**: Low (MVP)
**Mitigation**: File system reads are fast for small files. Can add caching post-MVP if needed.

### Risk: TypeScript compilation adds build step
**Impact**: Low
**Mitigation**: Build is fast (<5s). Benefits of type safety outweigh cost.

### Risk: Limited dependencies = more custom code
**Impact**: Low
**Mitigation**: Custom code is simple (validation, file reading). Reduces supply chain risk.

---

## Success Criteria

Tech stack is validated when:
- All user stories can be implemented with chosen technologies
- Performance targets are met in load testing
- Development experience is smooth (fast feedback loops)
- Production deployment is straightforward
- No blockers or missing capabilities discovered

---

## Future Technology Considerations

Post-MVP enhancements may require:

1. **Caching Layer**: Redis or in-memory cache
2. **Metrics**: Prometheus client for observability
3. **API Documentation**: OpenAPI/Swagger for API spec
4. **GraphQL**: Alternative query interface
5. **gRPC**: For high-performance internal services
6. **WebSockets**: Real-time mock updates

These are explicitly out of scope for MVP.
