import { test, expect } from '@playwright/test'

test.describe('Mock Retrieval API', () => {
  test('should retrieve mock by single ID', async ({ request }) => {
    const response = await request.get('/api/mock', {
      headers: {
        'X-Mock-ID': '1234',
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('userId', 123)
    expect(data).toHaveProperty('name', 'Test User')
  })

  test('should retrieve mock with multiple IDs', async ({ request }) => {
    const response = await request.get('/api/mock', {
      headers: {
        'X-Mock-ID': '1234,5678',
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    // Should be one of the two mocks
    expect(data).toBeDefined()
  })

  test('should return 400 when X-Mock-ID header is missing', async ({
    request,
  }) => {
    const response = await request.get('/api/mock')

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error.code).toBe('MISSING_MOCK_ID')
  })

  test('should return 404 when mock does not exist', async ({ request }) => {
    const response = await request.get('/api/mock', {
      headers: {
        'X-Mock-ID': 'nonexistent-mock',
      },
    })

    expect(response.status()).toBe(404)
    const data = await response.json()
    expect(data.error.code).toBe('NO_VALID_MOCKS')
  })

  test('should handle complex nested mock', async ({ request }) => {
    const response = await request.get('/api/mock', {
      headers: {
        'X-Mock-ID': 'user-profile',
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('username', 'johndoe')
    expect(data.profile).toHaveProperty('firstName', 'John')
    expect(data.settings).toHaveProperty('theme', 'dark')
  })
})

test.describe('Health Check API', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/health')

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.mockRepoAccessible).toBe(true)
    expect(data).toHaveProperty('timestamp')
  })
})
