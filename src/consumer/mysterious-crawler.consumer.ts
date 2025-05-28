import axios from "axios";
import { mysteriousCrawlerConfig, requestConfig } from "./config";
import { MysteriousCrawlerMappingsDto, MysteriousCrawlerStateDto } from "./dto";
import { SportEventBuilder } from "../domain/model/sport-event.builder";
import { parseMappings, sleep } from "./utils";
import { ArrayOps, contextId, logger } from "../common";
import { SportEventModel } from "../domain/model";
import { MysteriousCrawlerRawModel } from "./model";
import { sportEventRepository } from "../domain/store";

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
      const message = `Error fetching or processing data. Data: [${err?.stack || ''}]`;
      logger('error', context, message);
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
      rawEvents: stateDto?.odds?.split('\n') || [], 
      mapping: parseMappings(mappingsDto?.mappings || '') 
    };
  }

  private validateInput(data: MysteriousCrawlerRawModel, context: string ) {
    const { rawEvents, mapping } = data;

    if(rawEvents.length === 1 && rawEvents[0] === '') {
      this.currentSessionEventsCounter = 0;
      sportEventRepository.moveToArchive();
      const message = `Sport event is finished. Awaiting for another one. Data: [${JSON.stringify(data)}]`;
      logger('log', context, message);
      return false;
    }

    if(!ArrayOps.areElementsValid(rawEvents) || !Object.keys(mapping).length) {
      const message = `Invalid data received. Data: [${JSON.stringify(data)})}]`;
      logger('error', context, message);
      return false;
    }

    return true;
  }

  private iterateOverEvents(data: MysteriousCrawlerRawModel, context: string): void {
      const shouldUpdateArchive = this.shouldUpdateArchive(data.rawEvents.length);
      const currentSessionEvents: SportEventModel[] = [];

      for(const rawEvent of data.rawEvents) {
        const model = this.process(rawEvent, data.mapping, context);

        if(!model) {
          return;
        }

        if(shouldUpdateArchive) {
          currentSessionEvents.push(model);
        }
        
        sportEventRepository.setOngoingEvent(model);
      }

      if(shouldUpdateArchive) {
        sportEventRepository.moveToArchive(currentSessionEvents);
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

  private process(rawEvent: string, mapping: Record<string, string>, context: string): SportEventModel {
      const builder = new SportEventBuilder(mapping, rawEvent.split(','));

      builder.setBaseProperties();

      if (!builder.isValid()) {
        const message = `Invalid base properties for event. Data [${rawEvent}]`;
        logger('error', context, message);
        return;
      }

      builder.setScoreProperties();

      if (!builder.isValid()) {
        const message = `Invalid score properties for event. Data [${rawEvent}]`;
        logger('error', context, message);
        return;
      }

      return builder.build();
  }
}