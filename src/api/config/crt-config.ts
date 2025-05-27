import { CrtConfigModel } from "./crt-config.model";

export const crtConfig: CrtConfigModel = {
    port: Number(process.env.CRT_PORT) || 4000
}