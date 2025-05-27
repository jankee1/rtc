import { NextFunction, Request, Response } from "express";
import { ApiError } from "../error";

export function unknownRouter(req: Request, res: Response, next: NextFunction): void {
    throw new ApiError("Unknown Url", 404);
}