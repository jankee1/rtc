import axios from "axios";
import { mysteriousCrawlerConfig, requestConfig } from "./config";
import { MysteriousCrawlerMappingsDto, MysteriousCrawlerStateDto } from "./dto";

export async function mysteriousCrawlerConsumer() {
  try {
    const [stateResponse, mappingsResponse] = await Promise.all([
      axios.get(`${mysteriousCrawlerConfig.baseUrl}/state`, requestConfig),
      axios.get(`${mysteriousCrawlerConfig.baseUrl}/mappings`, requestConfig),
    ]);
    const state = stateResponse.data as MysteriousCrawlerStateDto;
    const mappings = mappingsResponse.data as MysteriousCrawlerMappingsDto;
    console.log('State:', state);
    console.log('Mappings:', mappings);

  } catch (err) {
    // console.error('Error fetching data:', err.message);
  } finally {
    setTimeout(mysteriousCrawlerConsumer, 1000);
  }
}