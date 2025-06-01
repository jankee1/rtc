import { contextId, logger } from "../../common";
import { SportEventModel } from "../../domain/model";
import { sportEventRepository } from "../../domain/store";

class ClientService {
    private counter = 0;
    constructor() {}

    getCurrentEvents(): SportEventModel[] {
        const state =  sportEventRepository.getCurrentState();
        const context = contextId(ClientService.name, this.counter);
        this.counter++;
        logger('log', context, `Fetching current state. Elements: [${state.length}]`);
        return state;
    }
}

export const clientService = new ClientService();