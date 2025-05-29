import { describe, beforeEach, it, expect } from "vitest";
import { EventStatusEnum } from "../../../src/domain/enum";
import { SportEventModel } from "../../../src/domain/model";
import { DbSet, SportEventRepository } from "../../../src/domain/store";

describe('SportEventRepository', () => {
  const mockPreEvent: SportEventModel = {
    id: '1',
    sportEventStatus: EventStatusEnum.PRE,
  } as SportEventModel;

  const mockLiveEvent: SportEventModel = {
    id: '2',
    sportEventStatus: EventStatusEnum.LIVE,
  } as SportEventModel;
  const mockLiveEvent2: SportEventModel = {
    id: '3',
    sportEventStatus: EventStatusEnum.LIVE,
  } as SportEventModel;
  let repo: SportEventRepository;

  beforeEach(() => {
    repo = new SportEventRepository();
    (DbSet as any).instance = undefined;
    (repo as any).dbSet = DbSet.getInstance();
  });

  describe('getCurrentState', () => {
        it('should return both PRE and LIVE events', () => {
            repo.setOngoingEvent({...mockPreEvent});
            repo.setOngoingEvent({...mockLiveEvent});
            const result = repo.getCurrentState();

            expect(result).toHaveLength(2);
            expect(result).toEqual(
                expect.arrayContaining([expect.objectContaining({...mockPreEvent}), expect.objectContaining({...mockLiveEvent})])
            );
        });
    })

    describe('setOngoingEvent', () => {
        const preEvent: SportEventModel = {
            id: '1',
            sportEventStatus: EventStatusEnum.PRE,
        } as SportEventModel;

        const liveEvent: SportEventModel = {
            id: '1',
            sportEventStatus: EventStatusEnum.LIVE,
        } as SportEventModel;

        beforeEach(() => {
            (DbSet as any).instance = undefined;
            repo = new SportEventRepository();
            (repo as any).dbSet = DbSet.getInstance();
        });

        it('should add a PRE event to the PRE map', () => {
            repo.setOngoingEvent(preEvent);

            const preMap = (repo as any).dbSet.getEventsByStatus(EventStatusEnum.PRE);
            const liveMap = (repo as any).dbSet.getEventsByStatus(EventStatusEnum.LIVE);

            expect(preMap.has(preEvent.id)).toBe(true);
            expect(preMap.get(preEvent.id)).toMatchObject(preEvent);
            expect(liveMap.has(preEvent.id)).toBe(false);
        });

        it('should move event from PRE to LIVE', () => {
            repo.setOngoingEvent(preEvent);
            repo.setOngoingEvent(liveEvent);

            const preMap = (repo as any).dbSet.getEventsByStatus(EventStatusEnum.PRE);
            const liveMap = (repo as any).dbSet.getEventsByStatus(EventStatusEnum.LIVE);

            expect(preMap.has(preEvent.id)).toBe(false);
            expect(liveMap.has(liveEvent.id)).toBe(true);
            expect(liveMap.get(liveEvent.id)).toMatchObject(liveEvent);
        });
    })
});