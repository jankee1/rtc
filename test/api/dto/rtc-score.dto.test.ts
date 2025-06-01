import { describe, it, expect } from "vitest";
import { RtcScoreDto } from "../../../src/api/dto";
import { ScoreModel } from "../../../src/domain/model";

describe('RtcScoreDto', () => {
    describe('fromDomain', () => {
        it('should correctly map ScoreModel to RtcScoreDto', () => {
            const mockScoreModel = {
                period: 'CURRENT',
                homeScore: '2',
                awayScore: '1',
            } as ScoreModel;

            const result = RtcScoreDto.fromDomain(mockScoreModel);

            expect(result).toEqual({
                type: 'CURRENT',
                home: '2',
                away: '1',
            });
        });
    });
});