import OnebusawaySDK from "onebusaway-sdk";
import { References } from "onebusaway-sdk/resources/shared.mjs";
import { TempShape } from "./gtfs.js";

export default class DataManager {
    public static readonly OBA_API_KEY = process.env.OBA_API_KEY || "";
    public static client = new OnebusawaySDK({
        apiKey: this.OBA_API_KEY
    })

    public static agencies: Record<string, References.Agency> = {};

    public static async start() {
        this.agencies = (await this.client.agenciesWithCoverage.list()).data.references.agencies.reduce((acc, agency) => {
            acc[agency.id] = agency;
            return acc;
        }, {} as Record<string, References.Agency>);

    }

    public static async updateRoutes() {
        for (const agencyId in this.agencies) {
            const routes = (await this.client.routesForAgency.list(agencyId)).data.list;
        }
    }


}