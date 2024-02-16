import { Router } from "express";
import {loginUser, registerUser,logoutUser,refreshAccesstoken} from "../controllers/user.controller.js";
import {upload} from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router=Router();

router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    
    ]),
    registerUser);

    router.route("/login").post(loginUser);


//secured Routes
    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh").post(refreshAccesstoken);




export default router;
