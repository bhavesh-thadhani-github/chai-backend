import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'    //to perform crud operations on the cookies of the user's browser

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//we write these middleware before only
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
//if any user writes the url /users then the control goes to the userRouter
//here the files asyncHandler.js, user.controller.js, user.router.js and app.js work synchronously
app.use('/api/v1/users', userRouter)
//the above code 'll work like this: 
//http://localhost/8000/api/v1/users/register
//http://localhost/8000/api/v1/users/login
//there 'll be no change here in the above code the only change 'll come into user.router.js file's code
//we use /api/v1/ to define the version of the api, it's a good practice

export {app}
