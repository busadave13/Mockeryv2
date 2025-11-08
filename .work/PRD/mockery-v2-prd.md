# Mockery v2 - Product Requirements Document

**Version**: 1.0
**Date**: 2025-11-07
**Status**: MVP Scope

## Overview

Mockery is a backend service written in Node.js that provides APIs for retrieving mock JSON responses to support testing of services that depend on external APIs. The service integrates with a git repository where mock responses are stored, managed, and version-controlled.

## Problem Statement

When developing new services that consume external APIs, developers face challenges:
- Integration with dependencies may not be available yet
- Testing different response scenarios (success, errors, edge cases) without modifying dependencies
- Need for consistent, version-controlled test data

## Solution

Mockery provides a centralized mock API service that:
- Returns stored JSON responses from a git repository
- Supports mock identification via file-based IDs
- Enables response variation through random selection from multiple mock options
- Allows developers to version-control mock responses alongside their code

## Target Users

- Backend developers building services that consume external APIs
- QA engineers testing integration scenarios
- Development teams needing isolated testing environments

## MVP Scope

### In Scope
1. **Mock Retrieval API**: HTTP endpoint to retrieve mock JSON responses
2. **Mock ID-based Matching**: Identify mocks by filename (e.g., "1234.json")
3. **Variation Support**: Accept multiple mock IDs and randomly select one response
4. **Git Repository Integration**: Read mock files from a git repository
5. **Header-based ID Passing**: Accept mock IDs via HTTP headers

### Out of Scope (Future Enhancements)
- Write operations via API (mocks are manually committed to git)
- Complex request matching (method, path, query params, body)
- Branch/commit-specific mock retrieval
- Mock response templating or dynamic values
- Analytics or usage tracking
- Authentication/authorization

## Technical Requirements

### Functional Requirements

1. **Mock Retrieval**
   - Accept mock IDs via HTTP header
   - Support single or multiple comma-separated IDs
   - Return corresponding JSON file content from git repository
   - Return appropriate error if mock ID not found

2. **Variation Support**
   - When multiple IDs provided, randomly select one
   - Each request should be independent (new random selection)
   - All provided IDs should have equal probability of selection

3. **Git Integration**
   - Read mock files from configured git repository location
   - Support local git repository (cloned/updated separately)
   - File naming convention: `{mock-id}.json`

4. **Response Format**
   - Return exact JSON content from selected mock file
   - Preserve original mock response structure
   - Include standard HTTP response codes

### Non-Functional Requirements

1. **Performance**: Fast file reads (under 100ms for typical mock files)
2. **Reliability**: Graceful error handling for missing files or invalid JSON
3. **Maintainability**: Clear separation between API layer and git integration
4. **Scalability**: Support hundreds of concurrent requests

## User Workflows

### Primary Workflow: Retrieve Mock Response

1. Developer's service needs to call external dependency
2. Service makes HTTP request to Mockery API
3. Request includes header with mock ID(s)
4. Mockery retrieves and returns JSON mock response
5. Developer's service uses mock response instead of calling real dependency

### Mock Management Workflow

1. Developer creates/updates JSON mock file locally
2. Developer commits JSON file to git repository (with mock ID as filename)
3. Git changes are pulled/synced to location where Mockery reads files
4. Mockery immediately has access to new/updated mocks

## Success Metrics

- API response time < 100ms (p95)
- Zero downtime during mock repository updates
- Successfully handles 100+ concurrent requests
- Clear error messages for all failure scenarios

## Open Questions

- Git repository location/configuration (environment variable? config file?)
- Should we support subdirectories in git repo for mock organization?
- Health check endpoint requirements?
- Logging requirements (access logs, error logs)?
