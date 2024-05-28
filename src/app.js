import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'    //to perform crud operations on the cookies of the user's browser

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


export {app}