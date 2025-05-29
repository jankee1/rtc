import { ScoreModel } from "../../domain/model";

export class RtcScoreDto {
    type: string;
    home: string;
    away: string;

    static fromDomain(score: ScoreModel): RtcScoreDto {
        return {
            type: score.period,
            home: score.homeScore,
            away: score.awayScore,
        }
    }
}
