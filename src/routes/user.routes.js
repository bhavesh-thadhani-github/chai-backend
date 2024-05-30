import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router
