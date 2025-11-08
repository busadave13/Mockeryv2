import { MockService } from '../../../src/services/MockService'
import { FileSystemRepository } from '../../../src/repositories/FileSystemRepository'
import { ValidationError, NotFoundError } from '../../../src/errors'

// Mock the FileSystemRepository
jest.mock('../../../src/repositories/FileSystemRepository')

describe('MockService', () => {
  let mockService: MockService
  let mockRepository: jest.Mocked<FileSystemRepository>

  beforeEach(() => {
    mockRepository = new FileSystemRepository() as jest.Mocked<FileSystemRepository>
    mockService = new MockService(mockRepository)
  })

  describe('parseMockIds', () => {
    it('should parse single mock ID', () => {
      const result = mockService.parseMockIds('1234')
      expect(result).toEqual(['1234'])
    })

    it('should parse multiple comma-separated mock IDs', () => {
      const result = mockService.parseMockIds('1234,5678,9012')
      expect(result).toEqual(['1234', '5678', '9012'])
    })

    it('should trim whitespace from mock IDs', () => {
      const result = mockService.parseMockIds(' 1234 , 5678 , 9012 ')
      expect(result).toEqual(['1234', '5678', '9012'])
    })

    it('should throw ValidationError for empty header', () => {
      expect(() => mockService.parseMockIds('')).toThrow(ValidationError)
      expect(() => mockService.parseMockIds('   ')).toThrow(ValidationError)
    })

    it('should filter out empty strings after splitting', () => {
      const result = mockService.parseMockIds('1234,,5678')
      expect(result).toEqual(['1234', '5678'])
    })
  })

  describe('selectRandomId', () => {
    it('should return the only ID when array has one element', () => {
      const result = mockService.selectRandomId(['1234'])
      expect(result).toBe('1234')
    })

    it('should return one of the IDs when array has multiple elements', () => {
      const ids = ['1234', '5678', '9012']
      const result = mockService.selectRandomId(ids)
      expect(ids).toContain(result)
    })

    it('should throw ValidationError for empty array', () => {
      expect(() => mockService.selectRandomId([])).toThrow(ValidationError)
    })
  })

  describe('getMockResponse', () => {
    it('should return mock data for valid single ID', async () => {
      const mockData = { userId: 123, name: 'Test' }
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.readMock.mockResolvedValue(mockData)

      const result = await mockService.getMockResponse(['1234'])

      expect(mockRepository.exists).toHaveBeenCalledWith('1234')
      expect(mockRepository.readMock).toHaveBeenCalledWith('1234')
      expect(result).toEqual(mockData)
    })

    it('should randomly select from multiple valid IDs', async () => {
      const mockData = { data: 'test' }
      mockRepository.exists.mockResolvedValue(true)
      mockRepository.readMock.mockResolvedValue(mockData)

      const result = await mockService.getMockResponse(['1234', '5678'])

      expect(mockRepository.exists).toHaveBeenCalled()
      expect(mockRepository.readMock).toHaveBeenCalled()
      expect(result).toEqual(mockData)
    })

    it('should skip invalid IDs and use valid ones', async () => {
      const mockData = { data: 'test' }
      mockRepository.exists
        .mockResolvedValueOnce(false) // 'invalid' doesn't exist
        .mockResolvedValueOnce(true) // '1234' exists
      mockRepository.readMock.mockResolvedValue(mockData)

      const result = await mockService.getMockResponse(['invalid', '1234'])

      expect(result).toEqual(mockData)
    })

    it('should throw NotFoundError when no valid mocks found', async () => {
      mockRepository.exists.mockResolvedValue(false)

      await expect(
        mockService.getMockResponse(['invalid1', 'invalid2'])
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError for empty array', async () => {
      await expect(mockService.getMockResponse([])).rejects.toThrow(
        ValidationError
      )
    })
  })
})
