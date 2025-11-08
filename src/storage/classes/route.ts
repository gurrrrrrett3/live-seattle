import { CSVNullable } from "../../util/parserUtil.js";
import Storage from "../storage.js";
import Agency from "./agency.js";
import Trip from "./trip.js";

export default class Route {
    id: string
    shortName?: string
    longName?: string
    type: RouteType
    description: string
    url: string
    color: string
    textColor: string
    networkId?: string
    sortOrder?: number
    trips: Record<string, Trip> = {}

    constructor(public readonly agency: Agency, options: RouteConstructorOptions) {
        this.id = options.route_id
        this.shortName = CSVNullable(options.route_short_name)
        this.longName = CSVNullable(options.route_long_name)
        this.type = Number(options.route_type) as RouteType
        this.description = options.route_desc
        this.url = options.route_url
        this.color = options.route_color
        this.textColor = options.route_text_color
        this.networkId = CSVNullable(options.network_id)
        this.sortOrder = Number(CSVNullable(options.route_sort_order) || 0)

        this.agency.routes[this.id] = this
        Storage.route[this.id] = this
    }

}

export interface RouteConstructorOptions {
    agency_id: string,
    route_id: string,
    route_short_name: string,
    route_long_name: string,
    route_type: string,
    route_desc: string,
    route_url: string,
    route_color: string,
    route_text_color: string,
    network_id: string,
    route_sort_order: string
}

export enum RouteType {
    LightRail = 0,
    Subway = 1,
    Rail = 2,
    Bus = 3,
    Ferry = 4
}