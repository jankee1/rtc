import { describe, it, expect } from "vitest";
import { RtcCompetitorDto } from "../../../src/api/dto";
import { CompetitorsEnum } from "../../../src/api/enum";

describe('RtcCompetitorDto', () => {
    describe('fromRaw', () => {
        it('should correctly map competitor', () => {
            const result = RtcCompetitorDto.fromRaw(CompetitorsEnum.HOME, 'Team A');

            expect(result).toEqual({
                type: CompetitorsEnum.HOME,
                name: 'Team A',
            });
        });
    });
});