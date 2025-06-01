import { describe, it, expect } from "vitest";
import { RtcSportEventDto } from "../../../src/api/dto";
import { CompetitorsEnum } from "../../../src/api/enum";
import { EventStatusEnum, ScoreEnum } from "../../../src/domain/enum";
import { SportEventModel } from "../../../src/domain/model";

const mockModel = {
    id: 'event1',
    sportEventStatus: EventStatusEnum.LIVE,
    scores: [
        { period: 'FIRST_HALF', homeScore: '1', awayScore: '0' },
        { period: 'CURRENT', homeScore: '2', awayScore: '1' },
    ],
    startTime: '2025-05-28T18:00:00Z',
    sport: 'football',
    homeCompetitor: 'Team A',
    awayCompetitor: 'Team B',
    competition: 'Premier League',
} as SportEventModel;;

describe('RtcSportEventDto', () => {
    describe('fromDomain', () => {
        it('should correctly map SportEventModel to RtcSportEventDto', () => {
            const result = RtcSportEventDto.fromDomain(mockModel);

            expect(result).toEqual({
                id: 'event1',
                status: EventStatusEnum.LIVE,
                scores: {
                    [ScoreEnum.CURRENT]: {
                        type: 'CURRENT',
                        home: '2',
                        away: '1',
                    },
                },
                startTime: '2025-05-28T18:00:00Z',
                sport: 'football',
                competitors: {
                    [CompetitorsEnum.HOME]: {
                        type: CompetitorsEnum.HOME,
                        name: 'Team A',
                    },
                    [CompetitorsEnum.AWAY]: {
                        type: CompetitorsEnum.AWAY,
                        name: 'Team B',
                    },
                },
                competition: 'Premier League',
            });
        });
    });
});