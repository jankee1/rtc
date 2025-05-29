import { CompetitorsEnum } from "../enum";

export class RtcCompetitorDto {
    readonly type: CompetitorsEnum;
    readonly name: string;

    static fromRaw(type: CompetitorsEnum, name: string): RtcCompetitorDto {
        return {
            type,
            name,
        };
    }
}