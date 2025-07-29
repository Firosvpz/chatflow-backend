import express from 'express'
import { getSidebarUsers } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/',authMiddleware, getSidebarUsers)

export default router