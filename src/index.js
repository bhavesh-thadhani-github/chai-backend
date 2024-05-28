// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'

import express from 'express'
import connectDB from "./db/index.js";
const app = express()
//You have to always require these 3 packages -> mongoose, express, dotenv
//2 MAIN IMP POINTS:
//1)Whenver we talk to a DB then there is a high probability that problems 'll arrive, so always use trycatch or promises
//2)DB is always in another continent, so always use async-await

dotenv.config({
    path: './env'
})

connectDB()










//The following is the IIFE Func
/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log('ERR: ', error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()*/