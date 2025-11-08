import Storage from "../storage.js";
import Trip from "./trip.js";

export default class Shape {
    id: string
    pt: {
        lat: number,
        lon: number,
        dist: number, // dist from start
        seq?: number
    }[] = []

    constructor(public readonly trip: Trip, id: string) {
        this.id = id

    }

    public static loadRow(options: ShapeConstructorOptions) {
        const existingShape = Storage.shape[options.shape_id] || new Shape(Storage.rShapeTrip[options.shape_id], options.shape_id)
        existingShape.pt.push({
            lat: Number(options.shape_pt_lat),
            lon: Number(options.shape_pt_lon),
            dist: Number(options.shape_dist_traveled),
            seq: Number(options.shape_pt_sequence)
        })
    }
}

export interface ShapeConstructorOptions {
    shape_id: string;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_pt_sequence: number;
    shape_dist_traveled: number;
}