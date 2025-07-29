import express from "express";
import { login, register, verifyOtp } from "../controllers/auth.controller.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
const router = express.Router();

router.post('/register',cloudinaryUpload.single('image'),register)
router.post('/verifyOtp',verifyOtp)
router.post('/login',login)

export default router;