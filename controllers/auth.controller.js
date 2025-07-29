import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/otp.js";
import { sendOTPConfirmationEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

const otpCache = new Map();

export const register = async (req, res, next) => {
    try {

        const { name, email, password, phoneNumber } = req.body;

        const imageUrl = req.file?.path || ''

        // Validate required fields
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                requiredFields: ["name", "email", "password", "phoneNumber"]
            });
        }

        // name exist
        const existName = await User.findOne({
            name: { $regex: name, $options: 'i' } // Partial match, case-insensitive
        });


        if (existName) {
            return res.status(400).json({
                success: false,
                message: "name already exist",
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
                suggestion: existingUser.isVerified ?
                    "Try logging in or use password recovery" :
                    "Resend verification email"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP and store in cache
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        otpCache.set(email, {
            userData: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                image: imageUrl
            },
            otp,
            expires: otpExpiry,
            attempts: 0 // Track OTP verification attempts
        });

        // Schedule cleanup of expired OTPs
        setTimeout(() => {
            if (otpCache.get(email)?.expires <= Date.now()) {
                otpCache.delete(email);
            }
        }, 10 * 60 * 1000);

        try {
            // Send OTP email
            await sendOTPConfirmationEmail(email, otp, name);

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                expiresIn: "10 minutes",
                email: email // Return masked email in production
            });
        } catch (emailError) {
            // Clean up cache if email fails
            otpCache.delete(email);

            console.error("Email sending error:", emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email",
                error: process.env.NODE_ENV === 'development' ?
                    emailError.message : undefined
            });
        }

    } catch (err) {
        next(err);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        console.log('data', otpCache);

        const data = otpCache.get(email)
        if (!data) {
            return res.status(400).json({ message: "otp not sent" })
        }
        if (Date.now() > data.expires) {
            return res.status(400).json({ message: "otp expired" })
        }
        if (data.otp !== otp) {
            return res.status(400).json({ message: "Invalid otp" })
        }

        const newUser = new User(
            {
                ...data.userData,
            }
        )

        await newUser.save()
        otpCache.delete(email)
        return res.status(200).json({ message: "user registered successfully" })
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email, !password) {
            return res.status(400).json({ message: "These fields are required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Email not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password " });


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.json({
            message: "user logged successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, image: user.image },
        });
    } catch (error) {
        return res.status(500).json({ error: err.message });
    }

}