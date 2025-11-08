# Mockery v2 - Component Dependencies

**Version**: 1.0
**Date**: 2025-11-07
**Status**: MVP Dependency Graph

## Overview

This document defines the dependency relationships between components in the Mockery system, enabling parallel development where possible while ensuring proper integration order.

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation (Can be built in parallel)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Error Classes    │    │  TypeScript      │             │
│  │ (errors/)        │    │  Type Definitions│             │
│  │                  │    │  (types/)        │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Configuration    │    │  Project Setup   │             │
│  │ (config/)        │    │  - package.json  │             │
│  │                  │    │  - tsconfig.json │             │
│  └──────────────────┘    │  - .gitignore    │             │
│                          └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Repository Layer                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ FileSystemRepository                                  │  │
│  │ - readMock(mockId)                                   │  │
│  │ - exists(mockId)                                     │  │
│  │ - validateRepository()                               │  │
│  │                                                       │  │
│  │ Depends on: Config, Error Classes, Types             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Service Layer                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MockService                                           │  │
│  │ - parseMockIds(headerValue)                          │  │
│  │ - selectRandomId(ids)                                │  │
│  │ - getMockResponse(mockIds)                           │  │
│  │                                                       │  │
│  │ Depends on: FileSystemRepository, Error Classes      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Middleware (Can be built in parallel)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Error Handler    │    │ Request Logger   │             │
│  │ Middleware       │    │ Middleware       │             │
│  │                  │    │                  │             │
│  │ Depends on:      │    │ Depends on:      │             │
│  │ - Error Classes  │    │ - Pino           │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Validator        │                                      │
│  │ Middleware       │                                      │
│  │                  │                                      │
│  │ Depends on:      │                                      │
│  │ - Error Classes  │                                      │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Controllers (Can be built in parallel)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Mock Controller  │    │ Health Controller│             │
│  │                  │    │                  │             │
│  │ Depends on:      │    │ Depends on:      │             │
│  │ - MockService    │    │ - Repository     │             │
│  │ - Error Classes  │    │                  │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: Routes (Can be built in parallel)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Mock Routes      │    │ Health Routes    │             │
│  │                  │    │                  │             │
│  │ Depends on:      │    │ Depends on:      │             │
│  │ - Mock Controller│    │ - Health Ctrl    │             │
│  │ - Validator      │    │                  │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: Application Integration                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express App (app.ts)                                  │  │
│  │ - Configure middleware                                │  │
│  │ - Register routes                                     │  │
│  │ - Error handler                                       │  │
│  │                                                       │  │
│  │ Depends on: All middleware, all routes                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 8: Server Startup                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Server (server.ts)                                    │  │
│  │ - Load environment config                             │  │
│  │ - Validate repository path                            │  │
│  │ - Start HTTP server                                   │  │
│  │                                                       │  │
│  │ Depends on: App, Config                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Dependency Details

### Phase 1: Foundation

**No external dependencies within project**

These can all be built simultaneously:

1. **Error Classes** (`src/errors/index.ts`)
   - ValidationError
   - NotFoundError
   - ServerError
   - No internal dependencies

2. **Type Definitions** (`src/types/index.ts`)
   - Request/Response types
   - Configuration types
   - No internal dependencies

3. **Configuration** (`src/config/index.ts`)
   - Loads environment variables
   - Depends on: dotenv (external)

4. **Project Setup**
   - package.json
   - tsconfig.json
   - .gitignore
   - .nvmrc
   - No dependencies

---

### Phase 2: Repository Layer

**Build after Phase 1 completes**

1. **FileSystemRepository** (`src/repositories/FileSystemRepository.ts`)
   - **Depends on:**
     - `config/` - for MOCK_REPO_PATH
     - `errors/` - for throwing NotFoundError, ServerError
     - `types/` - for type definitions
     - Node.js fs.promises (external)
   - **Provides:**
     - readMock(mockId): Promise<any>
     - exists(mockId): Promise<boolean>
     - validateRepository(): Promise<boolean>

---

### Phase 3: Service Layer

**Build after Phase 2 completes**

1. **MockService** (`src/services/MockService.ts`)
   - **Depends on:**
     - `repositories/FileSystemRepository` - for file operations
     - `errors/` - for throwing ValidationError, NotFoundError
     - Node.js crypto (external) - for random selection
   - **Provides:**
     - parseMockIds(headerValue): string[]
     - selectRandomId(ids): string
     - getMockResponse(mockIds): Promise<any>

---

### Phase 4: Middleware

**Build after Phase 1 completes (parallel with Phase 2)**

These can be built in parallel:

1. **Error Handler Middleware** (`src/middleware/errorHandler.ts`)
   - **Depends on:**
     - `errors/` - for error type checking
   - **Provides:**
     - Express error handler middleware

2. **Request Logger Middleware** (`src/middleware/requestLogger.ts`)
   - **Depends on:**
     - pino-http (external)
   - **Provides:**
     - Request/response logging middleware

3. **Validator Middleware** (`src/middleware/validator.ts`)
   - **Depends on:**
     - `errors/` - for throwing ValidationError
   - **Provides:**
     - validateMockIdHeader() middleware

---

### Phase 5: Controllers

**Build after Phase 3 completes (MockController) and Phase 2 completes (HealthController)**

These can be built in parallel:

1. **Mock Controller** (`src/controllers/mockController.ts`)
   - **Depends on:**
     - `services/MockService` - for business logic
     - `errors/` - for error handling
   - **Provides:**
     - getMock(req, res, next) handler

2. **Health Controller** (`src/controllers/healthController.ts`)
   - **Depends on:**
     - `repositories/FileSystemRepository` - for repository validation
   - **Provides:**
     - getHealth(req, res) handler

---

### Phase 6: Routes

**Build after Phase 5 completes**

These can be built in parallel:

1. **Mock Routes** (`src/routes/mockRoutes.ts`)
   - **Depends on:**
     - `controllers/mockController`
     - `middleware/validator`
   - **Provides:**
     - GET /api/mock route configuration

2. **Health Routes** (`src/routes/healthRoutes.ts`)
   - **Depends on:**
     - `controllers/healthController`
   - **Provides:**
     - GET /health route configuration

---

### Phase 7: Application Integration

**Build after Phase 4 and Phase 6 complete**

1. **Express App** (`src/app.ts`)
   - **Depends on:**
     - All middleware (Phase 4)
     - All routes (Phase 6)
     - express (external)
   - **Provides:**
     - Configured Express application instance

---

### Phase 8: Server Startup

**Build after Phase 7 completes**

1. **Server** (`src/server.ts`)
   - **Depends on:**
     - `app.ts` - configured Express app
     - `config/` - environment configuration
   - **Provides:**
     - HTTP server startup and shutdown logic

---

## Test Dependencies

### Unit Tests

Can be written in parallel with component implementation:

- **errors/** tests - No dependencies
- **config/** tests - No dependencies
- **repositories/** tests - After repository implementation
- **services/** tests - After service implementation
- **middleware/** tests - After middleware implementation
- **controllers/** tests - After controller implementation (mock dependencies)

### Integration Tests

Require multiple components:

- **API tests** - Require complete app (Phase 7)
- **Route tests** - Require routes + controllers (Phase 6)
- **Service integration tests** - Require service + repository (Phase 3)

### E2E Tests

Require complete system:

- **Playwright tests** - Require server running (Phase 8) + test mock repository

---

## Build Order for Maximum Parallelism

### Sprint 1: Core Implementation

**Week 1 - Foundation**
- Day 1-2: Phase 1 (all components in parallel)
  - Developer A: Error classes + Types
  - Developer B: Configuration + Project setup
  - Developer C: Test mock repository creation

**Week 1 - Core Logic**
- Day 3-4: Phase 2 + Phase 4 (parallel)
  - Developer A: FileSystemRepository
  - Developer B: All middleware (parallel)
  - Developer C: Unit tests for Phase 1

**Week 2 - Business Logic**
- Day 5-6: Phase 3
  - Developer A: MockService
  - Developer B: Unit tests for repositories
  - Developer C: Unit tests for middleware

**Week 2 - API Layer**
- Day 7-8: Phase 5 + Phase 6 (parallel after Phase 5)
  - Developer A: Both controllers (parallel)
  - Developer B: Both routes (after controllers)
  - Developer C: Integration tests

**Week 2 - Integration**
- Day 9-10: Phase 7 + Phase 8
  - Developer A: App integration
  - Developer B: Server startup
  - Developer C: E2E tests

---

## Critical Path

The critical path (longest dependency chain) is:

```
Error Classes → FileSystemRepository → MockService →
MockController → MockRoutes → App → Server
```

**Estimated Critical Path Duration**: 8-10 days

Components NOT on critical path can be built in parallel:
- Types, Config, Project Setup (parallel with Errors)
- All middleware (parallel with Repository)
- HealthController + HealthRoutes (shorter path than MockController)

---

## External Dependencies

### Runtime Dependencies
- express
- pino
- pino-http
- dotenv

### Development Dependencies
- typescript
- @types/node
- @types/express
- jest
- ts-jest
- playwright
- tsx

**Installation**: All dependencies installed at project start (Phase 1)

---

## File Creation Order

For a single developer, optimal order:

1. ✅ `.gitignore` (prevent accidental commits)
2. ✅ `package.json` (define dependencies)
3. ✅ `tsconfig.json` (TypeScript configuration)
4. ✅ `.nvmrc` (Node version)
5. ✅ `.env.example` (configuration template)
6. ✅ `src/types/index.ts`
7. ✅ `src/errors/index.ts`
8. ✅ `src/config/index.ts`
9. ✅ `src/repositories/FileSystemRepository.ts`
10. ✅ `src/services/MockService.ts`
11. ✅ `src/middleware/errorHandler.ts`
12. ✅ `src/middleware/requestLogger.ts`
13. ✅ `src/middleware/validator.ts`
14. ✅ `src/controllers/mockController.ts`
15. ✅ `src/controllers/healthController.ts`
16. ✅ `src/routes/mockRoutes.ts`
17. ✅ `src/routes/healthRoutes.ts`
18. ✅ `src/app.ts`
19. ✅ `src/server.ts`
20. ✅ Test mock repository files
21. ✅ Unit tests (alongside implementation)
22. ✅ Integration tests
23. ✅ E2E tests

---

## Interface Contracts

Each component exposes specific interfaces that dependent components rely on:

### FileSystemRepository Interface
```typescript
interface IFileSystemRepository {
  readMock(mockId: string): Promise<any>
  exists(mockId: string): Promise<boolean>
  validateRepository(): Promise<boolean>
}
```

### MockService Interface
```typescript
interface IMockService {
  getMockResponse(mockIds: string[]): Promise<any>
}
```

### Controller Interfaces
```typescript
// Mock Controller
function getMock(req: Request, res: Response, next: NextFunction): Promise<void>

// Health Controller
function getHealth(req: Request, res: Response): Promise<void>
```

---

## Change Impact Analysis

If a component changes, these components are affected:

### Error Classes Change
- **Impact**: FileSystemRepository, MockService, all middleware, all controllers
- **Severity**: High (widely used)

### Configuration Change
- **Impact**: Server, FileSystemRepository
- **Severity**: Medium

### FileSystemRepository Change
- **Impact**: MockService, HealthController
- **Severity**: Medium

### MockService Change
- **Impact**: MockController only
- **Severity**: Low

### Middleware Change
- **Impact**: App only (if interface unchanged)
- **Severity**: Low

---

## Success Criteria

Dependency management is successful when:
- All components can be built in defined order without blockers
- Parallel development possible for independent components
- Changes to one component have predictable impact on others
- Integration completes without circular dependencies
- All interfaces are clearly defined before implementation begins
