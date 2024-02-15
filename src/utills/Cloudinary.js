import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

const uploadToCloudinary = async (localFilepath) => {
    try {
        if(!localFilepath) return null
       const response=await cloudinary.uploader.upload(localFilepath,{
        resource_type: "auto",
       })
       console.log("File Has Been Uploaded To Cloudinary",response.url);
       return response.url
    }
    catch (error) {
        fs.unlikeSync(localFilepath) //delete the file from the local storage
        console.error("Error Uploading File To Cloudinary",error)
        return null
    }
}

export {uploadToCloudinary}
