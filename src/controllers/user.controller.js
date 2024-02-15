import {asyncHandler} from "../utills/AsyncHandler.js"
import {User} from "../models/user.model.js"
import{ApiError} from "../utills/ApiErrors.js"
import{upload} from "../Middlewares/multer.middleware.js"
import { uploadToCloudinary } from "../utills/Cloudinary.js"
import {ApiResponse} from "../utills/ApiResponse.js"


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

    const coverimageLocalPath= req.files?.coverImage[0]?.path;

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



export {registerUser}
