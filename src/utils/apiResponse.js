//whenever we send a response, then we send to this class only
class ApiResponse {
    constructor(statusCode, data, message = 'Success'){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}