import { ScoreModel } from ".";
import { EventStatusEnum } from "../enum";

export class SportEventModel{
    id: string;
    sport: string;
    competition: string;
    startTime: string;
    homeCompetitor: string;
    awayCompetitor: string;
    sportEventStatus: EventStatusEnum;
    scores: ScoreModel[] = [];
}