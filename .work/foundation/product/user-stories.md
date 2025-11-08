# Mockery v2 - User Stories

**Version**: 1.0
**Date**: 2025-11-07

## Epic: Mock Response Retrieval System

Enable developers to retrieve mock JSON responses from a git-backed repository to support isolated testing of service dependencies.

---

## User Story 1: Retrieve Mock by Single ID

**As a** backend developer
**I want to** retrieve a mock JSON response by providing a single mock ID
**So that** my service can use predefined test data instead of calling real dependencies

### Acceptance Criteria

1. **Given** a mock file "1234.json" exists in the git repository
   **When** I send a GET request to `/api/mock` with header `X-Mock-ID: 1234`
   **Then** I receive HTTP 200 with the exact JSON content from "1234.json"

2. **Given** a mock file "1234.json" exists with content `{"userId": 123, "name": "Test User"}`
   **When** I request mock ID "1234"
   **Then** the response body is exactly `{"userId": 123, "name": "Test User"}`

3. **Given** the mock repository contains nested JSON structures
   **When** I request a mock with nested objects and arrays
   **Then** the entire structure is returned without modification

4. **Given** a mock file does not exist for ID "9999"
   **When** I send request with header `X-Mock-ID: 9999`
   **Then** I receive HTTP 404 with error message "Mock not found: 9999"

5. **Given** a mock file "bad.json" contains invalid JSON
   **When** I request mock ID "bad"
   **Then** I receive HTTP 500 with error message indicating JSON parsing failure

6. **Given** no mock ID header is provided
   **When** I send a request without `X-Mock-ID` header
   **Then** I receive HTTP 400 with error message "Missing X-Mock-ID header"

### Technical Notes
- Header name: `X-Mock-ID`
- Mock files stored as `{id}.json` in git repository
- Content-Type response header should be `application/json`

---

## User Story 2: Support Mock Response Variation

**As a** backend developer
**I want to** provide multiple mock IDs so the service randomly selects one response
**So that** I can test my service's behavior with varying dependency responses

### Acceptance Criteria

1. **Given** mock files "success1.json", "success2.json", and "success3.json" exist
   **When** I send request with header `X-Mock-ID: success1,success2,success3`
   **Then** I receive HTTP 200 with content from one of the three files

2. **Given** I send 30 requests with header `X-Mock-ID: mock1,mock2,mock3`
   **When** I analyze the responses
   **Then** I observe responses from all three mocks (proving randomness)

3. **Given** multiple mock IDs are provided "1234,5678"
   **When** any of the selected mock files doesn't exist
   **Then** that ID is skipped and another valid ID is used

4. **Given** header contains "valid1,invalid1,invalid2"
   **When** only "valid1" exists in repository
   **Then** "valid1" is returned (invalid IDs are ignored)

5. **Given** header contains "invalid1,invalid2,invalid3"
   **When** none of the mock IDs exist
   **Then** I receive HTTP 404 with error message listing all attempted IDs

6. **Given** header contains comma-separated IDs with whitespace "1234, 5678 , 9012"
   **When** I send the request
   **Then** whitespace is trimmed and all IDs are processed correctly

7. **Given** the same multiple IDs are provided in consecutive requests
   **When** I make 10 requests
   **Then** the selected mock varies across requests (not always the same)

### Technical Notes
- Multiple IDs separated by commas in single header value
- Random selection should use cryptographically secure randomness (not needed for MVP but good practice)
- Equal probability for each valid mock ID

---

## User Story 3: Git Repository Integration

**As a** developer or DevOps engineer
**I want to** store mock responses in a git repository
**So that** mocks are version-controlled and can be managed like code

### Acceptance Criteria

1. **Given** Mockery is configured with a git repository path
   **When** the service starts
   **Then** it successfully reads mock files from that location

2. **Given** the git repository path is configured via environment variable `MOCK_REPO_PATH`
   **When** Mockery starts without this variable
   **Then** it logs an error and fails to start with clear message

3. **Given** the configured repository path doesn't exist
   **When** Mockery starts
   **Then** it fails with error message indicating invalid path

4. **Given** new mock files are added to the git repository
   **When** I restart Mockery service
   **Then** the new mocks are immediately available via API

5. **Given** an existing mock file is updated in git
   **When** I restart Mockery service
   **Then** API returns the updated mock content

6. **Given** a mock file is deleted from git repository
   **When** I restart Mockery and request that mock ID
   **Then** I receive HTTP 404 (file not found)

### Technical Notes
- Support local git repository (Mockery reads files, doesn't perform git operations)
- Configuration via environment variable: `MOCK_REPO_PATH`
- No hot-reload in MVP (restart required for changes)

---

## User Story 4: Service Health and Observability

**As a** DevOps engineer
**I want to** check if Mockery service is healthy and operational
**So that** I can monitor service availability and troubleshoot issues

### Acceptance Criteria

1. **Given** Mockery service is running
   **When** I send GET request to `/health`
   **Then** I receive HTTP 200 with `{"status": "ok"}`

2. **Given** the mock repository path is inaccessible
   **When** I check `/health` endpoint
   **Then** I receive HTTP 503 with `{"status": "error", "message": "Mock repository not accessible"}`

3. **Given** a request is made to Mockery API
   **When** the request completes (success or failure)
   **Then** a log entry is written with timestamp, mock ID(s), status code, and response time

4. **Given** an error occurs (file not found, invalid JSON)
   **When** handling the request
   **Then** detailed error information is logged including mock ID and error type

5. **Given** Mockery is running
   **When** I check the logs
   **Then** I can see service startup confirmation with configured repository path

### Technical Notes
- Health endpoint: `GET /health`
- Log format: JSON structured logs preferred for easier parsing
- Include correlation IDs for request tracing (optional for MVP but recommended)

---

## Out of Scope (Documented for Future)

The following are explicitly NOT included in MVP:

1. **Write/Update Operations**: Mocks are only managed via git commits
2. **Path-based Matching**: Only ID-based lookup (no URL pattern matching)
3. **Request Body Matching**: No dynamic response based on request content
4. **Branch/Commit Specific Mocks**: Always reads from configured location
5. **Authentication/Authorization**: Service is open (secure via network policies)
6. **Mock Response Headers**: Only JSON body is returned (headers not customizable per mock)
7. **Response Delays/Simulation**: Immediate response (no latency simulation)
8. **Hot Reload**: Restart required to pick up git changes

---

## Success Criteria Summary

MVP is successful when:
- All acceptance criteria above are met
- E2E tests demonstrate all user stories working end-to-end
- Service handles errors gracefully with clear messages
- Documentation exists for setup and usage
- Git repository structure is documented with examples
