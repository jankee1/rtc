import { describe, beforeEach, vi, it, expect } from "vitest";
import { MysteriousCrawlerConsumer } from "../../src/consumer";
import { SportEventBuilder } from "../../src/domain/model/sport-event.builder";
import { sportEventRepository } from "../../src/domain/store";
import { EventStatusEnum } from "../../src/domain/enum";
import { SportEventModel, ScoreModel } from "../../src/domain/model";

describe('MysteriousCrawlerConsumer', () => {
    let consumer: MysteriousCrawlerConsumer;
    const rawEvent = 'some,raw,event';
    const mapping = { key: 'value' };
    const context = 'test_context';
    const mockData = { rawEvents: [''], mapping };
    const oldEvent: SportEventModel = {
        id: '1',
        sport: 'football',
        competition: 'Premier League',
        startTime: '2025-05-29T18:00:00Z',
        homeCompetitor: 'Team A',
        awayCompetitor: 'Team B',
        sportEventStatus: EventStatusEnum.PRE,
        scores: [],
    };

    const oldScore: ScoreModel = {
        id: 's1',
        period: '1H',
        homeScore: '1',
        awayScore: '0',
    };

    beforeEach(() => {
        consumer = new MysteriousCrawlerConsumer();
        vi.restoreAllMocks();
        vi.spyOn(global, 'setTimeout');
    });

    describe('init', () => {
        it('should skip iteration if invalid data is received', async () => {
            vi.spyOn(consumer as any, 'fetchData').mockResolvedValue(mockData);
            const validateInputSpy = vi.spyOn(consumer as any, 'validateInput').mockReturnValue(false);
            const iterateSpy = vi.spyOn(consumer as any, 'iterateOverEvents');

            await consumer.init();

            expect(validateInputSpy).toHaveBeenCalled();
            expect(iterateSpy).not.toHaveBeenCalled();
        });
    })

    describe('validateInput', () => {
        let consoleErrorSpy: vi.SpyInstance;
        let iterateSpy: vi.SpyInstance;

        beforeEach(() => {
            vi.restoreAllMocks();
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            iterateSpy = vi.spyOn(consumer as any, 'iterateOverEvents');
        });

        it('should return false and log error when invalid input occurs', () => {
            const data = {
                rawEvents: [rawEvent],
                mapping,
            };

            vi.spyOn(Array, 'isArray').mockReturnValue(false);
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            iterateSpy = vi.spyOn(consumer as any, 'iterateOverEvents');
            const result = (consumer as any).validateInput(data, context);

            expect(result).toBe(false);
            expect(iterateSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy.mock.calls[0][0]).toContain('Invalid data received');
            expect(consoleErrorSpy.mock.calls[0][0]).toContain(context);
        });
    });

    describe('createModel', () => {
        let consoleErrorSpy: vi.SpyInstance;
        let isValidSpy: vi.SpyInstance;
        let setScorePropertiesSpy: vi.SpyInstance;
        let setBasePropertiesSpy: vi.SpyInstance;

        beforeEach(() => {
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            setScorePropertiesSpy = vi.spyOn(SportEventBuilder.prototype, 'setScoreProperties').mockImplementation(() => {});
            setBasePropertiesSpy = vi.spyOn(SportEventBuilder.prototype, 'setBaseProperties').mockImplementation(() => {});
        });

        it('should skip processing when builder has error', () => {
            isValidSpy = vi.spyOn(SportEventBuilder.prototype, 'isValid').mockReturnValue(false);

            const result = (consumer as any).createModel(rawEvent, mapping, context);

            expect(isValidSpy).toHaveBeenCalled();
            expect(setScorePropertiesSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('should log error and return undefined if isValid returns false after setScoreProperties', () => {
            isValidSpy = vi.spyOn(SportEventBuilder.prototype, 'isValid')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            const result = (consumer as any).createModel(rawEvent, mapping, context);

            expect(setBasePropertiesSpy).toHaveBeenCalled();
            expect(setScorePropertiesSpy).toHaveBeenCalled();
            expect(isValidSpy).toHaveBeenCalledTimes(2);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('createLogMessage', () => {
        it('should return updated score and status with new event and score provided', () => {
            const newEvent: SportEventModel = {
                ...oldEvent,
                sportEventStatus: EventStatusEnum.LIVE,
            };

            const newScore: ScoreModel = {
                id: 's2',
                period: 'FT',
                homeScore: '2',
                awayScore: '1',
            };

            const result = (consumer as any).createLogMessage(oldEvent, oldScore, newEvent, newScore);

            expect(result).toBe(
                `[Premier League] | Status: ${EventStatusEnum.PRE} -> ${EventStatusEnum.LIVE} | Score: 1 - 0 -> 2 - 1`
            );
        });
    });

    describe('createLogMessagelogChanges', () => {
        let consoleLogSpy: vi.SpyInstance;

        beforeEach(() => {
            consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        });


        it('should detect status change', () => {
            const newEvent = {
                ...oldEvent,
                sportEventStatus: EventStatusEnum.LIVE
            };

            vi.spyOn(sportEventRepository, 'getCurrentEvent').mockReturnValue(newEvent);

            (consumer as any).logChanges(context, oldEvent);

            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });
});