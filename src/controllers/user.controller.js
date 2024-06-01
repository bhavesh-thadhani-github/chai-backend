import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//PURPOSE: To only register the user

//this syntax we 'll repeat many 1000 times
//we use asyncHandler func so that we don't have to write the code to handler errors again and again
/*const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'chai aur code'
    })
})*/

//when we have to generate access token & refresh token then we 'll use the following method, bcoz this work is very common & we 'll use it many times
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    //first we have to find the user(or userId) from the DB
    const user = await User.findById(userId);
    //we have generated the access & refresh tokens 
    //we give accessToken to the user but refreshToken remains in the Database(so we don't have to ask the password again & again from the user)
    //the user in this case in the object only
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //we are adding the refreshToken value to the user object
    //the user.refreshToken comes from the userSchema model that we have generated in the user.model.js file
    //while the refreshToken is the value that we have generated upwards
    user.refreshToken = refreshToken;
    //when we save it then the mongoose model gets kick in like the password field whose required value is trueo so bcoz of it we have used validateBeforeSave
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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
  const { fullName, email, username, password } = req.body;
  // console.log("email: ", email);

  // 2) VALIDATION
  // --More Optimized Approach
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsary");
  }
  // --Beginners Approach
  /*if (fullName === '') {
        throw new ApiError(400, 'fullname is required')
    }*/
  //we can check as many validations as we can, usually there is separate file for validation checks in the companies

  // 3) CHECK IF USER ALREADY EXISTS (we can make it more better by approaching that we first check the email & then the username)
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }
  // console.log(req.files);

  // 4) CHECK FOR IMAGES, CHECK FOR AVATAR
  //middleware give us more access to the methods after req. ,just like req.body gives by default by express, similarly multer gives the access of req.files
  //console.log(req.files, req.body) curiosity
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //another approach for coverImageLocalPath
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //checking the avatar image
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 5) UPLOAD THEM TO CLOUDINARY
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "User with email or username already exist");
  }

  // 6) CREATE USER OBJECT
  //in this whole file only the User is talking to the DB
  //if we only want to send the data then we use json format, with json we can't send files
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //coverImage can be or not uploaded by the user so we check the condition
    email,
    password,
    username: username.toLowerCase(),
  });

  // 7) REMOVE PASSWORD & REFRESH TOKEN FIELD FROM THE RESPONSE
  //this is extra DB call to check if the user object is created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //this is a weird syntax, we are passing fields in the string & removing which we do not want, we 'll not get these 2 fields.
  );

  // 8) CHECK FOR USER CREATION
  if (!createdUser) {
    throw new ApiError(500, "Somethign went wrong while registering the user");
  }

  // 9) RETURN RESPONSE
  // console.log(res);
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
// console.log() to the following things: res, req.body, req.files


//Now we are creating Login User
const loginUser = asyncHandler(async (req, res) => {
  //TODOs(my approach):
  //check if the user already exists - if he does not exists then ask him to registe - if he exists then login him: -- check the username, email and password correctly match with any in the DB

  //TODOs - Algorithm:
  //req body -> data
  //check username or email
  //find the user
  //password check
  //access and refresh token - generated and send both to the user
  //send the tokens in (secured)cookies
  //send the res that the user has been logged in successfuly

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  //finding the user either from email or username
  //the refreshToken in this user is empty
  const user = await User.findOne({
    //the next code finds the user exists or not either on the username basis or email basis, [either find email or find username]
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not Exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

//NOW ACCESS & REFRESH TOKEN
  //there can be time to generate access and refresh token
  //we 'll get & return the accessToken & refreshToken from this method so we are destructuring it and storing it in the variable
  //but now here the user var has the access & refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  //this is optional step, we are doing this bcoz we do not require password & refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //now we have to send the cookies, options is an object below
  const options = {
    //by doing the following steps the user cannot modify the cookies at the frontend, they can only be modifiable by the backend server(can access it) only
    httpOnly: true,
    secure: true,
  };


  //in the following code 'accessToken' is key and then accessToken and options are the value
  //we have the access of cookie bcoz of the cookieParser
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
});


const logoutUser = asyncHandler(async (req, res) => {
  //NOW HOW TO LOGOUT THE USER:
  //clear the cookies(which can be managed fromt the server only) of the user from the local system
  //also reset the refreshToken from the model, then only he can logout

  //there is a problem that we cannot ask the user for its username(or email) and password for him to logout

  //we can design our own middleware also
  //User.findByIdAndUpdate(how to find the user, what to update, )
  await User.findByIdAndUpdate(
    //since we get the user from the DB using the id & we can get the whole user now & then delete its refresh tokens
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,  //the response we get in the return, we 'll get a new updated value, now refresh token has been removed from the DB
    }
  );
  //now for cookies
  const options = {
    //by doing the following steps the user cannot modify the cookies at the frontend, they can only be modifiable by the backend server(can access it) only
    httpOnly: true,
    secure: true,
  };
  //clearing the cookies
  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(new ApiResponse(200, {}, 'User logged out successfully'))
});

const refreshAcessToken = asyncHandler(async (req, res) => {
  //accessing the refresh & access token
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized Request')
  }

  try {
  
    //user get the encrypted token but the DB contains the raw token
    const decodedToken = jwt.verify(
      incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token')
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh Token is expired or used')
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, 'Access token refreshed'))
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Refresh Token')
  }
})

export { registerUser, loginUser, logoutUser, refreshAcessToken };
