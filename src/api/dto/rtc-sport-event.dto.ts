import { RtcCompetitorDto, RtcScoreDto } from ".";
import { EventStatusEnum, ScoreEnum } from "../../domain/enum";
import { SportEventModel } from "../../domain/model";
import { CompetitorsEnum } from "../enum";

export class RtcSportEventDto {
    readonly id: string;
    readonly status: EventStatusEnum;
    readonly scores: Record<string, RtcScoreDto>;
    readonly startTime: string;
    readonly sport: string;
    readonly competitors: Record<CompetitorsEnum, RtcCompetitorDto>;
    readonly competition: string

    static fromDomain(model: SportEventModel): RtcSportEventDto {
        let scores = {}

        if(model.sportEventStatus === EventStatusEnum.LIVE) {
            const currentScore = model.scores.find(score => score.period === ScoreEnum.CURRENT);
            scores = {[ScoreEnum.CURRENT]: RtcScoreDto.fromDomain(currentScore)}
        }

        return {
            id: model.id,
            status: model.sportEventStatus,
            scores,
            startTime: model.startTime,
            sport: model.sport,
            competitors: {
                [CompetitorsEnum.HOME]: RtcCompetitorDto.fromRaw(CompetitorsEnum.HOME, model.homeCompetitor),
                [CompetitorsEnum.AWAY]: RtcCompetitorDto.fromRaw(CompetitorsEnum.AWAY, model.awayCompetitor),
            },
            competition: model.competition,
        };
    }
}