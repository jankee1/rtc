import { NextFunction, Request, Response } from "express";
import { clientService } from "../service";
import { RtcSportEventDto } from "../dto";

export async function getState(req: Request, res: Response, next: NextFunction): Promise<void>  {
    try {
        const state = clientService.getCurrentEvents();
        const result: Record<string, RtcSportEventDto> = {}

        for(const item of state) {
            result[item.id] = RtcSportEventDto.fromDomain(item);
        }

        res.status(200).json(result);
    } catch(error: unknown) {
        next(error);
    }
}