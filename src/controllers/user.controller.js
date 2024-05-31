import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/apiResponse.js";
//PURPOSE: To only register the user
//this syntax we 'll repeat many 1000 times
//we use asyncHandler func so that we don't have to write the code to handler errors again and again
/*const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'chai aur code'
    })
})*/

const registerUser = asyncHandler(async (req, res) => {
    //ALGORITHM for Logic: 
    // get user details from frontend (postman)
    // validation (at backend) - not empty
    // check if user already exists: username or, email
    // check for images, check for avatar 
    // upload them to cloudinary, avatar
    // create user object (to send data to mongoDB) - create entry in DB(db calls)
    // remove password & refresh token field from response
    // check for user creation
    // return response

    //BEGINS: -----------------

// 1) GET USER DETAIL FROM FRONTEND
    //if the data is coming from form or json then use req.body & if it comes from url then there is another thing(req.params)
    //we created the object to destructure the data
    //params is also a way to send the data from the frontend, but for now we are not going to params, we are going to body
    //we are getting data in req.body
    //raw means json in postman
    //we have also created fileUpload using multer & middleware, see user.route.js for more info.
    const {fullName, email, username, password} = req.body
    console.log('email: ', email );

// 2) VALIDATION
    // --More Optimized Approach
    if ([fullName, email, username, password].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are compulsary')
    }
    // --Beginners Approach
    /*if (fullName === '') {
        throw new ApiError(400, 'fullname is required')
    }*/
    //we can check as many validations as we can, usually there is separate file for validation checks in the companies

// 3) CHECK IF USER ALREADY EXISTS (we can make it more better by approaching that we first check the email & then the username)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exist')
    }
    console.log(req.files);

// 4) CHECK FOR IMAGES, CHECK FOR AVATAR
    //middleware give us more access to the methods after req. ,just like req.body gives by default by express, similarly multer gives the access of req.files
    //console.log(req.files, req.body) curiosity
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //another approach for coverImageLocalPath
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    //checking the avatar image
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }

// 5) UPLOAD THEM TO CLOUDINARY
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(409, 'User with email or username already exist')
    }

// 6) CREATE USER OBJECT
    //in this whole file only the User is talking to the DB
    //if we only want to send the data then we use json format, with json we can't send files
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',   //coverImage can be or not uploaded by the user so we check the condition
        email,
        password,
        username: username.toLowerCase()
    })

// 7) REMOVE PASSWORD & REFRESH TOKEN FIELD FROM THE RESPONSE
    //this is extra DB call to check if the user object is created or not
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'   //this is a weird syntax, we are passing fields in the string & removing which we do not want, we 'll not get these 2 fields.
    )

// 8) CHECK FOR USER CREATION
    if (!createdUser) {
        throw new ApiError(500, 'Somethign went wrong while registering the user')
    }

// 9) RETURN RESPONSE
    console.log(res)
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered Successfully')
    )

})

// console.log() to the following things: res, req.body, req.files

export {registerUser}
