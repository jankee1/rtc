import { EventStatusEnum } from "../enum";
import { SportEventModel } from "../model";
import { DbSet } from "./db-set";

export class SportEventRepository {
    private dbSet = DbSet.getInstance();

    getCurrentState(): SportEventModel[] {
        const {pre, live} = this.getCurrent();
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

    moveToArchive(event: SportEventModel): void {
        this.dbSet.setEventByStatus(EventStatusEnum.REMOVED, event);
        this.dbSet.deleteEventByStatusAndId(EventStatusEnum.LIVE, event.id);
    }

    getCurrentEvent(id: string): SportEventModel {
        const {pre, live} = this.getCurrent();
        return pre.get(id) ?? live.get(id);
    }

    private getCurrent(): { pre: Map<string, SportEventModel>; live: Map<string, SportEventModel>} {
        return {
            pre: this.dbSet.getEventsByStatus(EventStatusEnum.PRE),
            live: this.dbSet.getEventsByStatus(EventStatusEnum.LIVE) 
        }
    }
}

export const sportEventRepository = new SportEventRepository();