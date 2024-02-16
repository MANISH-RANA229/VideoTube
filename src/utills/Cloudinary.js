import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

const uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
       const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto",
       })
      
       fs.unlinkSync(localFilePath) 
       return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath) //delete the file from the local storage
        console.error("Error Uploading File To Cloudinary",error)
        return null
    }
}

export {uploadToCloudinary}
