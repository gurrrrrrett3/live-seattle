import { exec } from "child_process";
import { parse } from "fast-csv";
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import { resolve as pathResolve } from "path";
import DataManager from "./dataManager.js";
import Database from "../database/index.js";
import Route from "../database/entities/route.entity.js";
import Trip from "../database/entities/trip.entity.js";
import ShapeFileBuilder from "./shapeFileBuilder.js";

export interface CSVRoute {
    agency_id: string;
    route_id: string;
    route_short_name: string;
    route_long_name: string;
    route_type: string;
    route_desc: string;
    route_url: string;
    route_color: string;
    route_text_color: string;
    network_id: string;
    route_sort_order: string;
}

export interface CSVTrip {
    route_id: string;
    trip_id: string;
    service_id: string;
    trip_short_name: string;
    trip_headsign: string;
    direction_id: string;
    block_id: string;
    shape_id: string;
    wheelchair_accessible: string;
    drt_advance_book_min: string;
    bikes_allowed: string;
    fare_id: string;
    peak_offpeak: string;
    boarding_type: string;
}

export interface CSVShape {
    shape_id: string;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_pt_sequence: number;
    shape_dist_traveled: number;
}

export interface TempShape {
    shapeId: string;
    positions: {
        lat: number;
        lon: number;
        sequence: number;
    }[]
}

export default class GTFS {

    public static CACHE_PATH = "./data/gtfs";
    public static GTFS_URL = "https://gtfs.sound.obaweb.org/prod/gtfs_puget_sound_consolidated.zip"

    private static _cache: {
        routes: Record<string, Route>,
        trips: Record<string, Trip>,
    } = {
            routes: {},
            trips: {},
        }

    public static readonly ignoreShapes = [
        "372", "375"
    ]

    public static async load() {
        if (!existsSync(pathResolve(this.CACHE_PATH))
            || !existsSync(pathResolve("./data/shapes.shp"))
            || (await Database.repo.route.count()) === 0
        ) {
            console.log("Creating GTFS cache directory...");
            mkdirSync(pathResolve(this.CACHE_PATH), { recursive: true });
            await this.downloadAndExtractGTFS(this.GTFS_URL);

            await Database.em.qb<Route>(Route).delete().execute();
            await Database.em.qb<Trip>(Trip).delete().execute();

            await this.convertShapes();
            await this.convertRoutes();
            await this.convertTrips();

            this._cache = {
                routes: {},
                trips: {},
            }
        }

    }

    public static downloadAndExtractGTFS(url: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            writeFileSync(pathResolve(this.CACHE_PATH, "gtfs.zip"), Buffer.from(buffer));

            exec(`unzip -o ${pathResolve(this.CACHE_PATH, "gtfs.zip")} -d ${this.CACHE_PATH}`, (error) => {
                if (error) {
                    console.error(`Error extracting GTFS data: ${error}`);
                    unlinkSync(pathResolve(this.CACHE_PATH));
                }
            }).on("exit", () => {
                unlinkSync(pathResolve(this.CACHE_PATH, "gtfs.zip"));

                resolve();
            });
        })
    }

    public static convertRoutes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log("Converting routes...");
            createReadStream(pathResolve(this.CACHE_PATH, "routes.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row) => {
                    const route = new Route();
                    route.id = row.route_id;
                    route.agencyId = row.agency_id;
                    route.shortName = row.route_short_name;
                    route.longName = row.route_long_name;
                    route.type = parseInt(row.route_type, 10);
                    route.description = row.route_desc;
                    route.url = row.route_url;
                    route.color = row.route_color;
                    route.textColor = row.route_text_color;
                    route.networkId = row.network_id;
                    route.sortOrder = parseInt(row.route_sort_order || 0, 10);
                    this._cache.routes[route.id] = route;
                })
                .on("end", async () => {
                    await Database.em.persistAndFlush(Object.values(this._cache.routes));
                    resolve();
                })
                .on("error", (error) => {
                    console.error(`Error loading routes: ${error}`);
                    reject(error);
                });
        });
    }

    public static convertTrips(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log("Converting trips...");
            createReadStream(pathResolve(this.CACHE_PATH, "trips.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row) => {
                    if (!this._cache.routes[row.route_id]) {
                        console.warn(`Trip ${row.trip_id} references unknown route ${row.route_id}, skipping...`);
                        return;
                    }

                    const trip = new Trip();
                    trip.id = row.trip_id;
                    trip.route = this._cache.routes[row.route_id];
                    trip.serviceId = row.service_id;
                    trip.headSign = row.trip_headsign;
                    // trip.shortName = row.trip_short_name;
                    trip.direction = row.direction_id === "0" ? 0 : 1;
                    trip.blockId = row.block_id;
                    trip.shapeId = row.shape_id
                    trip.wheelChairAccessible = row.wheelchair_accessible === "1";
                    // trip.drtAdvanceBookMin = row.drt_advance_book_min;
                    trip.bikesAllowed = row.bikes_allowed === "1";
                    // trip.fareId = row.fare_id;
                    // trip.peakOffPeak = row.peak_offpeak == 1;
                    // trip.boardingType = row.boarding_type;
                    this._cache.trips[trip.id] = trip;
                })
                .on("end", async () => {

                    await Database.em.persistAndFlush(Object.values(this._cache.trips));
                    resolve();
                })
                .on("error", (error) => {
                    console.error(`Error loading trips: ${error}`);
                    reject(error);
                });
        });
    }

    public static convertShapes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const shapes: Record<string, TempShape> = {};

            createReadStream(pathResolve(this.CACHE_PATH, "shapes.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row) => {

                    if (this.ignoreShapes.includes(row.shape_id)) return

                    if (!shapes[row.shape_id]) {
                        const shape: TempShape = {
                            shapeId: row.shape_id,
                            positions: [{
                                lat: parseFloat(row.shape_pt_lat),
                                lon: parseFloat(row.shape_pt_lon),
                                sequence: parseInt(row.shape_pt_sequence, 10),
                            }]
                        };

                        shapes[row.shape_id] = shape;
                    } else {
                        shapes[row.shape_id].positions.push({
                            lat: parseFloat(row.shape_pt_lat),
                            lon: parseFloat(row.shape_pt_lon),
                            sequence: parseInt(row.shape_pt_sequence, 10),
                        });
                    }
                })
                .on("end", async () => {

                    ShapeFileBuilder.buildShapeFile(shapes)
                    resolve()

                    // drop all shapes
                    // await Database.em.qb<ShapePoint>(ShapePoint).delete().execute();
                    // await Database.em.qb<Shape>(Shape).delete().execute();

                    // await Database.em.flush();
                    // 
                    // const toPersist: (Shape | ShapePoint)[] = [];
                    // await Promise.all(Object.entries(shapes).map(async ([shapeId, shape]) => {
                    // 
                    // const shapeEntity = Database.repo.shape.create({
                    // id: shapeId,
                    // });
                    // 
                    // this._cache.shapes[shapeId] = shapeEntity;
                    // toPersist.push(shapeEntity);
                    // 
                    // for (const pos of shape.positions) {
                    // const shapePoint = new ShapePoint();
                    // shapePoint.shape = shapeEntity;
                    // shapePoint.lat = pos.lat;
                    // shapePoint.lng = pos.lon;
                    // shapePoint.sequenceId = pos.sequence;
                    // toPersist.push(shapePoint);
                    // }
                    // 
                    // }))
                    // 
                    // await Database.em.persistAndFlush(toPersist);
                    // resolve();
                });
        })

    }


}