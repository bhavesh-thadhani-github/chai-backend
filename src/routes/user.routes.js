import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// to store the routes of the user
// we'll make a router now, this 'll repeat many times

const router = Router()

// to go out which route, and then do what work
// we have used a middleware here bcoz of which a user can send(post) the images before getting the message which 'll execute through the method
// bcoz of inserting the middleware now a user can send the images
router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser)
// router.route('/login').post(registerUser)

router.route('/login').post(loginUser)

//secured routes
//we are adding the middleware first(which is verifyJWT) before logging out the user
//we can add more middlewares after this verifyJWT as many as we want to 
router.route('/logout').post(verifyJWT, logoutUser)
//generating the endpoint to get the access tokens
router.route('/refresh-token').post(refreshAcessToken)

export default router
