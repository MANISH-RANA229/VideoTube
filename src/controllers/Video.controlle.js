import {Video} from "../models/video.model.js"
import mongoose from "mongoose"
import {asyncHandler} from "../utills/AsyncHandler.js"
import {ApiErrors} from "../utills/ApiErrors.js"
import {ApiResponse} from "../utills/ApiResponse.js"
import {uploadToCloudinary} from "../utills/Cloudinary.js"
import {User} from "../models/user.model.js"



const publishVideos = asyncHandler(async(req,res) =>{

    const {title,description}=req.body;
    


    const videoPath=req.files.videoFile[0].path;
    const thumbnailPath=req.files.thumbnail[0].path;


    if(!videoPath){
        throw new ApiErrors(400,"Video is required");
    }
    const UploadVideo= await uploadToCloudinary(videoPath);

    
    if(!UploadVideo){
        throw new ApiErrors(400,"Error while uploading the video");
    }


    console.log(UploadVideo);

    if(!thumbnailPath){
        throw new ApiErrors(400,"thumbnail is required");
       
    }

    const UploadThumbnail= await uploadToCloudinary(thumbnailPath);
    if(!UploadThumbnail){
        throw new ApiErrors(400,"Error while uploading the Thumbnail");
    }

    console.log(thumbnailPath);


    const UploadInfo= await Video.create({
        videoFile:videoPath.url,
        title:title,
        description,
        owner: new mongoose.Types.ObjectId(req.user?._id),
        duration:videoFile.duration

    });

    const newVideo= await Video.findById(UploadInfo.id).select("-owner");
    if(!newVideo){
        throw new ApiErrors(400,"Error while storing video data into database");

    }

    return response
    .status(200)
    .json(new ApiResponse(200,newVideo,"VideoPublished SuccessFully"));
})


const updateVideo= asyncHandler(async(req,res)=>{
    const { videoId }=req.params;
    const { title, description } = req.body;
    if (!title && !description) {
        throw new ApiError(400, "All fields are required");
      }

    const videoPath=req.files.videoFile[0].path;
    if(!videoPath){
        throw new ApiErrors(400, "video is required")
    }
    const UpdateVideo= await uploadToCloudinary(videoPath);


    const Oldvideo =await Video.findById(videoId);

    if (!Oldvideo) {
        throw new ApiErrors(404, "video not found !");
      }

      if(Oldvideo.owner.toString() != (req.user._id).toString()){
        throw new ApiErrors(404, "You do not have the permission to update this video");

      }

      const thumbnailLocalFilePath = req.file?.path;
      if (thumbnailLocalFilePath) {
        var response = await uploadToCloudinary(thumbnailLocalFilePath);
        console.log(response);
        if (!response.url) {
          throw new ApiErrors(500, "error while uploadnig in cloudinray");
        }
      }
  const UpdatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {$set:{
        title,
        description,
        thumbnail: response?.url,
    },
},
{
    new:true
}
  
  );

  if (!UpdatedVideo) {
    throw new ApiErrors(500, "error while updating video!");
  }
return response
.status(200)
.json(new ApiResponse(200,UpdateVideo,"Video Updated sucessfully"))

})