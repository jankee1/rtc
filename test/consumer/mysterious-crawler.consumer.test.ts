import { describe, beforeEach, vi, it, expect } from "vitest";
import { MysteriousCrawlerConsumer } from "../../src/consumer";
import { ArrayOps } from "../../src/common";
import { SportEventBuilder } from "../../src/domain/model/sport-event.builder";

describe('MysteriousCrawlerConsumer', () => {
    let consumer: MysteriousCrawlerConsumer;
    const rawEvent = 'some,raw,event';
    const mapping = { key: 'value' };
    const context = 'test_context';
    const mockData = { rawEvents: [''], mapping };

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
        
        it('should return false and log message when rawEvents is [""] - simulation is being restarted', () => {
            consoleErrorSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            iterateSpy = vi.spyOn(consumer as any, 'iterateOverEvents');
            const result = (consumer as any).validateInput(mockData, context);

            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(iterateSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy.mock.calls[0][0]).toContain('Sport event is finished');
            expect(consoleErrorSpy.mock.calls[0][0]).toContain(context);
        });

        it('should return false and log error when invalid input occurs', () => {
            const data = {
                rawEvents: [rawEvent],
                mapping,
            };

            vi.spyOn(ArrayOps, 'areElementsValid').mockReturnValue(false);
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

    describe('process', () => {
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

            const result = (consumer as any).process(rawEvent, mapping, context);

            expect(isValidSpy).toHaveBeenCalled();
            expect(setScorePropertiesSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('should log error and return undefined if isValid returns false after setScoreProperties', () => {
            isValidSpy = vi.spyOn(SportEventBuilder.prototype, 'isValid')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            const result = (consumer as any).process(rawEvent, mapping, context);

            expect(setBasePropertiesSpy).toHaveBeenCalled();
            expect(setScorePropertiesSpy).toHaveBeenCalled();
            expect(isValidSpy).toHaveBeenCalledTimes(2);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});