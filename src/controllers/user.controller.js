import {asyncHandler} from "../utills/AsyncHandler.js"
import {User} from "../models/user.model.js"
import{ApiError} from "../utills/ApiErrors.js"
import { uploadToCloudinary } from "../utills/Cloudinary.js"
import {ApiResponse} from "../utills/ApiResponse.js"
import {Subscription} from "../models/Subscription.model.js"
import mongoose from "mongoose"


const generateAccessAndRefereshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh token and access token")
        
    }
}

const registerUser = asyncHandler( async (req, res) => {
   
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);
    if([fullName, email, username, password].some((field) => field?.trim() ==="")){
        throw new ApiError(400, "All fields are required")
    }

    const ExistedUser=await User.findOne({
        $or: [
            {email},
            {username}
        ]
    })

    if(ExistedUser){
        throw new ApiError(400, "User With Email or username already exists")
    }  
    
    const avatarLocalPath=req.files?.avatar[0]?.path;


    let coverimageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverimageLocalPath= req.files?.coverImage[0]?.path;

    }

   

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar=await uploadToCloudinary(avatarLocalPath);
    console.log("avatar: ", avatar);
    const coverImage=await uploadToCloudinary(coverimageLocalPath);
    if(!avatar){
        throw new ApiError(500, "Error Uploading Image")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    }) 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


} )

const loginUser = asyncHandler(async (req, res) =>{
   

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
 

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const logoutUser=asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined 
            }
         },
         {
            new:true
         }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {},
            "User logout Successfully"
        )
    )

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})
const refreshAccesstoken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user =await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }

        if(incomingRefreshToken!=user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }


        
    } catch (error) {
        
    }
})

const getCurrentuser=asyncHandler(async(req,res)=>{
    
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile fetched successfully"))
})

const UpdateAccountsDetails=asyncHandler(async(req,res)=>{
    const {fullName, email, username}=req.body
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email,
                username
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"))
})

const updateAvatarImage=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar=await uploadToCloudinary(avatarLocalPath);
   
    if(!avatar){
        throw new ApiError(500, "Error Uploading When changing Avatar Image")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"))
})


const updateCoverImage=asyncHandler(async(req,res)=>{
    const CoverImagePath=req.file?.path;

    if(!CoverImagePath){
        throw new ApiError(400, "Avatar is required")
    }

    const CoverImage=await uploadToCloudinary(CoverImagePath);
   
    if(!CoverImage){
        throw new ApiError(500, "Error Uploading When changing CoverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:CoverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage profile updated successfully"))
})



const getUserChannelProfile= asyncHandler(async(req,res)=>{
    const {username}=req.params
    
    if(!username){
        throw new ApiError(400, "username is required")
    }
    const ChannelProfile=await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"

            }
        },
        {
            $addFields:{
                subscribersCount:{$size:"$subscribers"},
                subscribedCount:{$size:"$subscribedTo"},
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project: {
                fullName:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                subscribedCount:1,
                isSubscribed:1
    
            }

        }
       
    ])


    if(!ChannelProfile){
        throw new ApiError(404, "Channel Profile not found")
    }
    console.log("ChannelProfile: ", ChannelProfile);

    return res
    .status(200)
    .json(new ApiResponse(200, ChannelProfile[0], "Channel Profile fetched successfully"))

  

})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }

        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                    }
                }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "WatchHistory fetched"
        )
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    refreshAccesstoken,
    getCurrentuser,
    UpdateAccountsDetails,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
