import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

// to store the routes of the user
// we'll make a router now, this 'll repeat many times

const router = Router()

// to go out which route, and then do what work
router.route('/register').post(registerUser)
// router.route('/login').post(registerUser)

export default router
