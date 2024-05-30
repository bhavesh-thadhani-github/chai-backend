//MAIN PURPOSE: Simplify error handling in asynchronous Express route handlers by automatically catching and forwarding any errors to the next middleware

// alternative 
//the following is the Higher Order Function: we accept a function & return a function only
const asyncHandler = (requsetHandler) => {
    return (req, res, next) => {
        Promise.resolve(requsetHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = () => async () => {}

// this asyncHandler is a wrapper function, this thing happens in all production-grade apps, & makes the things very easier bcoz we'll use it very much & everywhere
/*const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)        
    } catch (error) {
        console.log(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}*/