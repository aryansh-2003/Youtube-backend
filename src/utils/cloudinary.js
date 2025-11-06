import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Promise-based fs

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDNINARY_API_SECRET,
    secure: true
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log(response)

        await fs.unlink(localFilePath);
        return response;

    } catch (error) {
        try {
            await fs.unlink(localFilePath);
        } catch (cleanupErr) {
            console.error("Error deleting temp file:", cleanupErr.message);
        }

        console.error("Upload failed:", error.message);
        throw error; 
    }
}


const deleteFromCloudinary = async (url) =>{

    try {
        if (!url) return null
        const public_id = url.split('/')[6].split('.')[0]
        console.log(public_id)
        return await cloudinary.uploader.destroy(public_id,
            {
                resource_type:"auto"
            }
        );
    } catch (error) {
        return(error,error.message)
    }

}

export {uploadOnCloud,deleteFromCloudinary}