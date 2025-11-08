import { CSVNullable } from "../../util/parserUtil.js";
import Storage from "../storage.js";
import Route, { RouteConstructorOptions } from "./route.js";
import Shape from "./shape.js";

export default class Trip {
    id: string
    serviceId: string // maybe make a class for this
    shortName?: string
    headsign?: string
    direction?: TripDirection
    shape?: Shape
    wheelchairAccessable: WheelchairAccessable = WheelchairAccessable.NoData
    bikesAllowed: BikesAllowed = BikesAllowed.NoData
    carsAllowed: CarsAllowed = CarsAllowed.NoData

    constructor(public readonly route: Route, options: TripConstructorOptions) {
        this.id = options.trip_id
        this.serviceId = options.service_id
        this.shortName = CSVNullable(options.trip_short_name)
        this.headsign = CSVNullable(options.trip_headsign)
        this.direction = Number(CSVNullable(options.direction_id) || 0)
        this.wheelchairAccessable = Number(CSVNullable(options.wheelchair_accessible) || 0)
        this.bikesAllowed = Number(CSVNullable(options.bikes_allowed) || 0)
        this.carsAllowed = Number(CSVNullable(options.cars_allowed) || 0)

        this.route.trips[this.id] = this
        Storage.trip[this.id] = this
        Storage.rShapeTrip[options.shape_id] = this

        // shape is loaded after, on shape load time
    }

}

export interface TripConstructorOptions {
    route_id: string,
    trip_id: string,
    service_id: string,
    trip_short_name: string,
    trip_headsign: string,
    direction_id: string,
    block_id: string,
    shape_id: string,
    wheelchair_accessible: string,
    bikes_allowed: string
    cars_allowed: string
}

export enum TripDirection {
    A,
    B
}

export enum WheelchairAccessable {
    NoData,
    Yes,
    No
}

export enum BikesAllowed {
    NoData,
    Yes,
    No
}

export enum CarsAllowed {
    NoData,
    Yes,
    No
}