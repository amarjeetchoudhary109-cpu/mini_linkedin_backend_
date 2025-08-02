import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});
export const uploadOnCloudinary = async (filePath, folder) => {
    try {
        if (!filePath || !folder) {
            throw new Error("File path and folder are required");
        }
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(filePath);
        return response;
    }
    catch (error) {
        fs.unlinkSync(filePath);
        console.error(`Error uploading to Cloudinary: ${error.message}`);
    }
};
