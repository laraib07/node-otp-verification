import { ApiResponse } from './index.js';

export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch((err) => {
        res
          .status(err.statusCode)
          .json(new ApiResponse(err.statusCode, err.error, err.message))
        next(err)
      });
  }
}