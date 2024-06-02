// PURPOSE: this middleware 'll verify that the user exists or not

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

//we are verifying this bcoz - we 'll check that we have send the right cookies & tokens to the user or not, we 'll check on the basis of these tokens
//we are checking that the user has the correct tokens or not that match with the DB tokens
//OR
//when we logged in the user then we have send the access & refresh tokens to it, on the basis of it we will check that the user has right tokens or not
//if the tokens are correct then in the req.body of the file user.controller.js, we'll add the new object req.user(or any name you want to give it)
//middlewares are mostly used in the routes
//we have write _ instead of res bcoz we are not using the res
export const verifyJWT = asyncHandler(async (req, _, next) => {
    //MAIN STEPS: take the tokens either from the cookies or from the tokens -> verify & decode them -> then add the req.user and then add the user -> and then move to next
    try {
        //now how to take the access of tokens -> req has the access of cookies, we have given it the access of using app.use(cookieParser in the app.js file)
        //either extract the tokens from the cookies or from the header
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer', '')
    
        if (!token) {
            throw new ApiError(401, 'Unauthorized request')
        }
    
        //now we are verifying the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken')
    
        if (!user) {
            throw new ApiError(401, 'Invalid Access Token')    
        }
    
        //we are adding a new object to the req
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid Access Token')
    }
})