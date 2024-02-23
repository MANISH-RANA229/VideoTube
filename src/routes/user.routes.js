import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router=Router();

router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    
    ]),
    registerUser); //working

    router.route("/login").post(loginUser); //working


//secured Routes
    router.route("/logout").post(verifyJWT,logoutUser) //working
    router.route("/refresh-token").post(refreshAccesstoken)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword) //working
    router.route("/current-user").get(verifyJWT,getCurrentuser) //working
    router.route("/update-account").patch(verifyJWT,UpdateAccountsDetails) //working
    router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatarImage)
    router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage) //working
    router.route("/c/:username").get(verifyJWT,getUserChannelProfile) //working
    router.route("/history").get(verifyJWT,getWatchHistory) //working


    


export default router;
