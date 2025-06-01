import axios from "axios";
import { mysteriousCrawlerConfig, requestConfig } from "./config";
import { MysteriousCrawlerMappingsDto, MysteriousCrawlerStateDto } from "./dto";
import { SportEventBuilder } from "../domain/model/sport-event.builder";
import { parseMappings, sleep } from "./utils";
import { contextId, logger } from "../common";
import { ScoreModel, SportEventModel } from "../domain/model";
import { MysteriousCrawlerRawModel } from "./model";
import { sportEventRepository } from "../domain/store";
import { EventStatusEnum, ScoreEnum } from "../domain/enum";

export class MysteriousCrawlerConsumer {
  private currentSessionEventsCounter = 0;
  private counter = 0;

  constructor() {
    this.init();
  }

  async init() {
    const context = contextId(MysteriousCrawlerConsumer.name, this.counter);

    try {
      const data = await this.fetchData();
      const isValid = this.validateInput(data, context);

      if (!isValid) {
        return;
      }

      this.iterateOverEvents(data, context);

    } catch (err) {
      logger('error', context, `Error fetching or processing data. Data: [${err?.stack || ''}]`);
    } finally {
      this.counter++;
      await sleep(1000);
      this.init();
    }
  }

  private async fetchData(): Promise<MysteriousCrawlerRawModel> {
    const [stateResponse, mappingsResponse] = await Promise.all([
      axios.get(`${mysteriousCrawlerConfig.baseUrl}/state`, requestConfig),
      axios.get(`${mysteriousCrawlerConfig.baseUrl}/mappings`, requestConfig),
    ]);
    const stateDto = stateResponse.data as MysteriousCrawlerStateDto;
    const mappingsDto = mappingsResponse.data as MysteriousCrawlerMappingsDto;

    return { 
      rawEvents: stateDto?.odds?.split('\n')?.filter( el => el !== '' ) || [], 
      mapping: parseMappings(mappingsDto?.mappings || '') 
    };
  }

  private validateInput(data: MysteriousCrawlerRawModel, context: string ): boolean {
    const { rawEvents, mapping } = data;

    if(!Array.isArray(rawEvents) || !Object.keys(mapping).length) {
      logger('error', context, `Invalid data received. Data: [${JSON.stringify(data)})}]`);
      return false;
    }

    return true;
  }

  private iterateOverEvents(data: MysteriousCrawlerRawModel, context: string): void {
      const shouldUpdateArchive = this.shouldUpdateArchive(data.rawEvents.length);
      const currentState = sportEventRepository.getCurrentState();
      const currentSessionEvents: SportEventModel[] = [];

      if(!data.rawEvents.length) {
        this.currentSessionEventsCounter = 0;
        logger('log', context, `Sport event is finished. Awaiting for another one. Data: [${JSON.stringify(data)}]`);
        this.moveToArchive(context, currentState, currentSessionEvents)
        return;
      }

      for(const rawEvent of data.rawEvents) {
        const model = this.createModel(rawEvent, data.mapping, context);

        if(!model) {
          return;
        }

        if(shouldUpdateArchive) {
          model.sportEventStatus = EventStatusEnum.REMOVED;
          currentSessionEvents.push(model);
        }

        this.logChanges(context, model);

        sportEventRepository.setOngoingEvent(model);
      }

      if(shouldUpdateArchive) {
        this.moveToArchive(context, currentState, currentSessionEvents)
      }
  }

  private shouldUpdateArchive(currentSessionEvents: number): boolean {
    if(this.currentSessionEventsCounter === 0) {
      this.currentSessionEventsCounter = currentSessionEvents;
      return false;
    } else if (this.currentSessionEventsCounter > currentSessionEvents) {
      this.currentSessionEventsCounter = currentSessionEvents;
      return true
    }

    return false;
  }

  private createModel(rawEvent: string, mapping: Record<string, string>, context: string): SportEventModel {
      const builder = new SportEventBuilder(mapping, rawEvent.split(','));

      builder.setBaseProperties();

      if (!builder.isValid()) {
        logger('error', context, `Invalid base properties for event. Data [${rawEvent}]`);
        return;
      }

      builder.setScoreProperties();

      if (!builder.isValid()) {
        logger('error', context, `Invalid score properties for event. Data [${rawEvent}]`);
        return;
      }

      return builder.build();
  }

  private getCurrentScore(event: SportEventModel): ScoreModel {
    return event?.scores?.find(s => s.period === ScoreEnum.CURRENT);
  }

  private moveToArchive(context: string, currentState: SportEventModel[], events: SportEventModel[]): void {
    for(const event of currentState) {
        if(events.length === 0 || !events.find(e => e.id === event.id)) {
          logger('log', context, this.createLogMessage(event, this.getCurrentScore(event)));
          event.sportEventStatus = EventStatusEnum.REMOVED;
          sportEventRepository.moveToArchive(event);
        }
      }
  }

  private logChanges(context: string, model: SportEventModel): void {
      const current = sportEventRepository.getCurrentEvent(model.id);

      if(!current || model?.sportEventStatus === EventStatusEnum.PRE && current?.sportEventStatus === EventStatusEnum.PRE) {
        return;
      }

      const currentScore = this.getCurrentScore(current);
      const modelScore = this.getCurrentScore(model);
      const statusChanged = model?.sportEventStatus !== current?.sportEventStatus;
      const scoreChanged = modelScore && currentScore && JSON.stringify(modelScore) !== JSON.stringify(currentScore);

      if (statusChanged || scoreChanged) {
        logger('log', context, this.createLogMessage(current, currentScore, model, modelScore));
      }
  }

  private createLogMessage(oldEvent: SportEventModel, oldScore: ScoreModel, newEvent?: SportEventModel, newScore?: ScoreModel): string {
    const newEventStatus = newEvent?.sportEventStatus || EventStatusEnum.REMOVED;
    const newHomeScore = newScore?.homeScore || oldScore?.homeScore;
    const newAwayScore = newScore?.awayScore || oldScore?.awayScore;
    return `[${oldEvent?.competition}] | Status: ${oldEvent?.sportEventStatus} -> ${newEventStatus} | Score: ${oldScore?.homeScore} - ${oldScore?.awayScore} -> ${newHomeScore} - ${newAwayScore}`;
  }
}