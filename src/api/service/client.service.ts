import { SportEventModel } from "../../domain/model";
import { sportEventRepository } from "../../domain/store";

class ClientService {
    constructor() {}

    getCurrentEvents(): SportEventModel[] {
        return sportEventRepository.getCurrentState();
    }
}

export const clientService = new ClientService();