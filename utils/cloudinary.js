import cloudinaryPackage from 'cloudinary';
const { v2: cloudinary } = cloudinaryPackage;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();



// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true // Always use HTTPS
});

// Create storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        return {
            folder: 'chatflow',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            //   public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            resource_type: 'auto',
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' }
            ]
        };
    }
});




// File filter for image validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure Multer upload middleware
const cloudinaryUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files:1
    }
    
});


export { cloudinaryUpload, cloudinary };