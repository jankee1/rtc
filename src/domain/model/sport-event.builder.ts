import { ScoreModel, SportEventModel } from ".";
import { ArrayOps } from "../../common";
import { EventStatusEnum } from "../enum";

export class SportEventBuilder {
    private sportModel: SportEventModel;
    private scores: ScoreModel[] = [];

    error: string;

    constructor(private mapping: Record<string, string>, public rawData: string[]) {
        this.sportModel = new SportEventModel();
    }

    setBaseProperties(): this {
        this.sportModel.id = this.rawData[0];

        const result = this.validateBaseProperties();

        if (!this.isValid()) {
            return;
        }

        this.sportModel.sport = result[1];
        this.sportModel.competition = result[2];
        this.sportModel.startTime = result[3];
        this.sportModel.homeCompetitor = result[4];
        this.sportModel.awayCompetitor = result[5];
        this.sportModel.sportEventStatus = result[6] as EventStatusEnum;

        return this;
    }

    setScoreProperties(): this {
        const rawScores = this.rawData[7].split('|');

        for(const rawScore of rawScores) {
            const score = new ScoreModel();

            const [id, home, away, period] = this.validateScoreProperties(rawScore);

            if (!this.isValid()) {
                return;
            }

            score.homeScore = home;
            score.awayScore = away;
            score.id = id;
            score.period = period;

            this.scores.push(score);
        }

        return this;
    }

    isValid(): boolean {
        return !this.error?.length;
    }

    build(): SportEventModel {
        this.sportModel.scores = this.scores;
        return this.sportModel;
    }

    private validateBaseProperties(): string[] {
        const id = this.rawData[0];
        const sport = this.mapping[this.rawData[1]];
        const competition = this.mapping[this.rawData[2]];
        const rawTime = this.rawData[3];
        const homeCompetitor = this.mapping[this.rawData[4]];
        const awayCompetitor = this.mapping[this.rawData[5]];
        const sportEventStatus = this.mapping[this.rawData[6]] as EventStatusEnum;
        const timeNumber = Number(rawTime);

        const isValid = ArrayOps.areElementsValid<string>(
            [id, sport, competition, homeCompetitor, awayCompetitor, sportEventStatus]
        ) && timeNumber > 0;

        if (!isValid) {
            this.setError();
            return [];
        }

        const startTime = new Date(timeNumber).toISOString();

        return [id, sport, competition, startTime, homeCompetitor, awayCompetitor, sportEventStatus];
    }

    private validateScoreProperties(raw: string): string[] {
        const [id, rawScore] = raw.split('@');
        const [home, away] = rawScore.split(':');
        const period = this.mapping[id];
        const arr = [id, home, away, period];
        const isValid = ArrayOps.areElementsValid<string>(arr) 

        if (!isValid) {
            this.setError();
            return [];
        }
        return arr;
    }

    private setError(): void {
        this.error = JSON.stringify({
            message: 'Invalid input data',
            rawEvent: this.rawData.join(','),
            mapping: this.mapping
        });
    }
}