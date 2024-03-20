import {Video} from "../models/video.model.js"
import mongoose from "mongoose"
import {asyncHandler} from "../utills/AsyncHandler.js"
import {ApiErrors} from "../utills/ApiErrors.js"
import {ApiResponse} from "../utills/ApiResponse.js"
import {uploadToCloudinary} from "../utills/Cloudinary.js"



const getPublicid =async(cloudinaryUrl)=>{
  const urlArray=cloudinaryUrl.split('/');
  const Image=urlArray[urlArray.length-1];
  const ImageName=Image.split('.')[0];

  return ImageName;
}

const DeleteFromCloudinary=async(PublicId)=>{
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Deleted resource:', result.result);
    return result;
  } catch (errors) {
    console.error('Error deleting resource:', errors.message);
    throw new ApiErrors(500,errors, "error while uploadnig in cloudinray");
  }
}



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
        throw new ApiErrors(400, "All fields are required");
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

  if (!UpdatedVideo){
    throw new ApiErrors(500, "error while updating video!");
  }
 return response
.status(200)
.json(new ApiResponse(200,UpdateVideo,"Video Updated sucessfully"))

})

const deleteVideo= asyncHandler(async(req,res)=>{
  //get the video ID


  const {videoID}= req.params;
  //find in dataBase
  const video= await Video.findById(videoID);

  if(!video){
    throw new ApiErrors(400,"Video does not found")
  }
  if(video.owner.toString()!=(req.user._id).toString()){
    throw new ApiErrors(400,"Unauthorised access while deleting");
  }

  //delete from cloudinary

   //get public id 

   const thumbnailPublicId= getPublicid(video.thumbnail);

   await DeleteFromCloudinary(thumbnailPublicId);

   const VideoPublicId= getPublicid(video.videoFile);

   await DeleteFromCloudinary(VideoPublicId);

   //delete video
  

  const DeleteVideo=await Video.findByIdAndDelete(videoID);

  if(!DeleteVideo){
    throw new ApiErrors(500, "error while Deleting video in DB");
  }

  //return response
  return response
  .status(200)
  .json(new ApiResponse(200,"video Deleted Successfully"));


})

const toggelPublishStatus=asyncHandler(async(req,res)=>{


  const VideoId=req.params.id;

  if(!VideoId){
    throw new ApiErrors(400,"VideoId is require");
  }

  const video=await Video.find(VideoId);

  if(video.owner.toString()!=(req.user._id).toString()){
    throw new ApiErrors(400,"Unauthorised User")
  }


  video.isPublished = !(video.isPublished);
   await video.save();

  return response 
  .status(200)
  .json(new ApiResponse(200,"Toggle Succesfully"));
})