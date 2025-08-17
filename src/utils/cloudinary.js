import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDNINARY_API_SECRET
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload file om cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file has been uploaded
        console.log("fille uploaded succesfully", response.url)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //used for removing local file as upload operation got failed
    }

}

export {uploadOnCloud}