import { Router } from 'express'
import { getMock } from '../controllers/mockController'
import { validateMockIdHeader } from '../middleware/validator'

const router = Router()

// GET /api/mock - Retrieve mock response
router.get('/mock', validateMockIdHeader, getMock)

export default router
