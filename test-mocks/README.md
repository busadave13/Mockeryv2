# Test Mock Repository

This directory contains sample JSON mock files for testing the Mockery service.

## Available Mocks

| Mock ID | Description |
|---------|-------------|
| `1234` | Simple user object with basic fields |
| `5678` | Order with nested items array |
| `success-response` | Generic success response with data |
| `error-response` | Error response with validation details |
| `user-profile` | Complex nested user profile with settings and stats |

## Usage

Set the `MOCK_REPO_PATH` environment variable to point to this directory:

```bash
export MOCK_REPO_PATH=/path/to/Mockeryv2/test-mocks
```

## Testing Variation

To test random mock selection, use multiple IDs in the `X-Mock-ID` header:

```bash
curl -H "X-Mock-ID: 1234,5678,user-profile" http://localhost:3000/api/mock
```

The service will randomly select one of the provided mock files.

## Adding New Mocks

Create a new JSON file following the naming convention: `{mock-id}.json`

Valid characters for mock IDs:
- Alphanumeric (a-z, A-Z, 0-9)
- Hyphens (-)
- Underscores (_)

Examples:
- `my-mock.json` ✓
- `test_123.json` ✓
- `user-profile.json` ✓
- `../etc/passwd.json` ✗ (path traversal attempt)
- `mock with spaces.json` ✗ (spaces not allowed)
