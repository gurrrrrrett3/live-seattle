import Agency from "./classes/agency.js"
import Route from "./classes/route.js"
import Shape from "./classes/shape.js"
import Trip from "./classes/trip.js"

export default class Storage {

    // main storages 
    public static agency: AgencyStorage = {}
    public static route: RouteStorage = {}
    public static trip: TripStorage = {}
    public static shape: ShapeStorage = {}

    // reverse lookups

    public static rShapeTrip: TripStorage = {}
}

// @TODO convert all interfaces into classes

export type AgencyStorage = Record<number, Agency>
export type RouteStorage = Record<string, Route>
export type TripStorage = Record<string, Trip>
export type ShapeStorage = Record<string, Shape>
