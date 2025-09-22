const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,  
});

// Uploads a file buffer directly to Cloudinary (no temporary local files required)
const uploadToCloudinaryBuffer = (fileBuffer, folder = '') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            folder ? { folder } : {},
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};


const uploadToCloudinaryFile = (filePath, folder = '') => {
    return cloudinary.uploader.upload(filePath, folder ? { folder } : {});
}

module.exports = { 
    cloudinary, 
    uploadToCloudinaryBuffer, 
    uploadToCloudinaryFile 
}; 