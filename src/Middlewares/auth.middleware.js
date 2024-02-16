import { ApiError } from "../utills/ApiErrors";
import { asyncHandler } from "../utills/AsyncHandler";
import { User } from "../models/user.model";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(400,"Unauthorised Request")
        }
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
            const user= await User.findById(decodedToken._id).select("-password -refreshToken")
    
            if(!user){
                throw new ApiError(400,"Invalid Access Token")
            }
            req.user=user;
            next()

    } catch (error) {
        throw new ApiError(401,error.message ||"Invalid Access Token" )
        
    }

})