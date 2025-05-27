import { NextFunction,  Request, Response } from "express";

export function globalErrorHandlerMiddleware(
    err: Error & { status: number }, 
    req: Request, 
    res: Response, 
    next: NextFunction
): void {
    const status = err?.status || 500;

    res
        .status(status)
        .json({
            message: err.message,
        });
}