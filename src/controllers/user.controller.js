import { asyncHandler } from "../utils/asyncHandler.js";

//PURPOSE: To only register the user
//this syntax we 'll repeat many 1000 times
//we use asyncHandler func so that we don't have to write the code to handler errors again and again
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'chai aur code'
    })
})

export {registerUser}
