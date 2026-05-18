import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRequestHandler<
  RequestBody = unknown,
  Params extends ParamsDictionary = ParamsDictionary,
> = (
  req: Request<Params, unknown, RequestBody>,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler = <
  RequestBody = unknown,
  Params extends ParamsDictionary = ParamsDictionary,
>(
  handler: AsyncRequestHandler<RequestBody, Params>,
): RequestHandler<Params, unknown, RequestBody> => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};

export { asyncHandler };
