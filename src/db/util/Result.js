export class Result {
  success(data) {
    return { data, success: true }
  }
  
  error(message, errorCode = 500) {
    return {
      success: false,
      error: {
        code: errorCode,
        message
      }
    }
  }
}