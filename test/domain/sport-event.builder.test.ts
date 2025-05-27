import { describe, it, vi, expect } from "vitest";
import { ArrayOps } from "../../src/common";
import { SportEventModel } from "../../src/domain/model";
import { SportEventBuilder } from "../../src/domain/model/sport-event.builder";
import { EventStatusEnum } from "../../src/domain/enum";


describe('SportEventBuilder', () => {
    const validMapping = {
        'football': 'Football',
        'premier': 'Premier League',
        'teamA': 'Team A',
        'teamB': 'Team B',
        'status': EventStatusEnum.LIVE,
        '1': 'First Half'
    };

    const validTimestamp = Date.now().toString();

    const validRawData = [
        'event123',
        'football',
        'premier',
        validTimestamp,
        'teamA',
        'teamB',
        'status',
        '1@3:2'
    ];

    describe('setBaseProperties', () => {
        it('should populate sportModel when valid', () => {
            const spy = vi.spyOn(ArrayOps, 'areElementsValid').mockReturnValue(true);

            const builder = new SportEventBuilder(validMapping, validRawData);
            builder.setBaseProperties();

            expect(builder.isValid()).toBe(true);
            expect(builder['sportModel'].id).toBe('event123');
            expect(builder['sportModel'].sport).toBe('Football');

            spy.mockRestore();
        });

        it('should set error when validation fails', () => {
            const spy = vi.spyOn(ArrayOps, 'areElementsValid').mockReturnValue(false);

            const builder = new SportEventBuilder(validMapping, validRawData);
            builder.setBaseProperties();

            expect(builder.isValid()).toBe(false);
            expect(builder.error).toContain('Invalid input data');

            spy.mockRestore();
        });
    })

    describe('setScoreProperties', () => {
        it('should stop and set error on invalid score', () => {
            const spy = vi.spyOn(ArrayOps, 'areElementsValid').mockImplementation((arr) => {
                return arr.length !== 4;
            });

            const builder = new SportEventBuilder(validMapping, validRawData);
            builder.setBaseProperties().setScoreProperties();

            expect(builder.isValid()).toBe(false);
            expect(builder['scores']).toHaveLength(0);
            expect(builder.error).toContain('Invalid input data');

            spy.mockRestore();
        });
    })

    describe('build', () => {
        it('should return valid SportEventModel', () => {
            const builder = new SportEventBuilder(validMapping, validRawData);
            builder.setBaseProperties().setScoreProperties();

            const model = builder.build();

            expect(model).toBeInstanceOf(SportEventModel);
            expect(model.id).toBe('event123');
            expect(model.sport).toBe('Football');
            expect(model.competition).toBe('Premier League');
            expect(model.startTime).toBe(new Date(Number(validTimestamp)).toISOString());
            expect(model.scores).toHaveLength(1);
            expect(model.awayCompetitor).toBe('Team B');
            expect(model.homeCompetitor).toBe('Team A');
            expect(model.sportEventStatus).toBe(EventStatusEnum.LIVE);
            expect(model.sport).toBe('Football');
            
            expect(model.scores[0].id).toBeDefined();
            expect(model.scores[0].awayScore).toBe('2');
            expect(model.scores[0].homeScore).toBe('3');
            expect(model.scores[0].period).toBe('First Half');
        });
    })
});