import { EventStatusEnum } from "../enum";
import { SportEventModel } from "../model";

export class DbSet {
  private static instance: DbSet;

  private events: Record<EventStatusEnum, Map<string, SportEventModel>> = {
    [EventStatusEnum.LIVE]: new Map<string, SportEventModel>(),
    [EventStatusEnum.PRE]: new Map<string, SportEventModel>(),
    [EventStatusEnum.REMOVED]: new Map<string, SportEventModel>(),
  };

  static getInstance(): DbSet {
    if (!DbSet.instance) {
      DbSet.instance = new DbSet();
    }
    return DbSet.instance;
  }

  getEventsByStatus(status: EventStatusEnum): Map<string, SportEventModel> {
    return this.events[status];
  }

  setEventByStatus(
    status: EventStatusEnum,
    event: SportEventModel
  ): void {
    const eventsMap = this.getEventsByStatus(status);
    eventsMap.set(event.id, event);
  }

  deleteEventByStatusAndId(status: EventStatusEnum, id: string): void {
    const eventsMap = this.getEventsByStatus(status);
    if (eventsMap.has(id)) {
      eventsMap.delete(id);
    }
  }
}