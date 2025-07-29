import express from 'express'
import { getMessages, sendMessage, sendMessageWIthFile } from '../controllers/message.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { cloudinaryUpload } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/:userId',authMiddleware,getMessages)
router.post('/sendMessage/:userId',authMiddleware,sendMessage)
router.post('/sendFile/:recieverId',authMiddleware,cloudinaryUpload.single('image'),sendMessageWIthFile)

export default router