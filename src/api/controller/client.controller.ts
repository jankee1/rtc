import { NextFunction, Request, Response } from "express";
import { ApiError } from "../error";

export async function getState(req: Request, res: Response, next: NextFunction): Promise<void>  {
    try {
        throw new ApiError("test error", 401);
    } catch(error: unknown) {
        next(error);
    }
}