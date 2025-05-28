import { EventStatusEnum } from "../enum";
import { SportEventModel } from "../model";
import { DbSet } from "./db-set";

export class SportEventRepository {
    private dbSet = DbSet.getInstance();

    getCurrentState(): SportEventModel[] {
        const pre = this.dbSet.getEventsByStatus(EventStatusEnum.PRE);
        const live = this.dbSet.getEventsByStatus(EventStatusEnum.LIVE);

        return Array.from(pre.values()).concat(Array.from(live.values()));
    }

    setOngoingEvent(newEvent: SportEventModel): void {
        if(newEvent.sportEventStatus === EventStatusEnum.PRE) {
            this.dbSet.setEventByStatus(EventStatusEnum.PRE, newEvent);
        } else if (newEvent.sportEventStatus === EventStatusEnum.LIVE) {
            this.dbSet.deleteEventByStatusAndId(EventStatusEnum.PRE, newEvent.id);
            this.dbSet.setEventByStatus(EventStatusEnum.LIVE, newEvent);
        }
    }

    moveToArchive(events: SportEventModel[] = []): void {
        const live = this.dbSet.getEventsByStatus(EventStatusEnum.LIVE);

        for(const event of live.values()) {
            if(events.length === 0) {
                this.dbSet.setEventByStatus(EventStatusEnum.REMOVED, event);
                this.dbSet.deleteEventByStatusAndId(EventStatusEnum.LIVE, event.id);
            } else if (!events.find(e => e.id === event.id)) {
                this.dbSet.setEventByStatus(EventStatusEnum.REMOVED, event);
                this.dbSet.deleteEventByStatusAndId(EventStatusEnum.LIVE, event.id);
            }
        }
    }
}

export const sportEventRepository = new SportEventRepository();