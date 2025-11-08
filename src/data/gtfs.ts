import { exec } from "child_process";
import { parse } from "fast-csv";
import { createReadStream, existsSync, mkdirSync, unlinkSync, write, writeFileSync } from "fs";
import fetch from "node-fetch";
import { resolve as pathResolve } from "path";
import DataManager from "./dataManager.js";
import Database from "../database/index.js";
import ShapeFileBuilder from "./shapeFileBuilder.js";
import Storage from "../storage/storage.js";
import Agency, { AgencyConstructorOptions } from "../storage/classes/agency.js";
import Route, { RouteConstructorOptions } from "../storage/classes/route.js";
import Trip, { TripConstructorOptions } from "../storage/classes/trip.js";
import Shape from "../storage/classes/shape.js";

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

    public static readonly ignoreShapes = [
        "372",
        "375",
        "1310",
        "1810",
        "1815",
        "1513",
        "151",
        "1813",
        "131"
    ]

    public static async load() {
        if (!existsSync(pathResolve(this.CACHE_PATH))
            || !existsSync(pathResolve("./data/shapes.shp"))
            || process.argv.includes("--load")
        ) {
            console.log("Creating GTFS cache directory...");
            // mkdirSync(pathResolve(this.CACHE_PATH), { recursive: true });
            // await this.downloadAndExtractGTFS(this.GTFS_URL);

            await this.loadAgencies()
            await this.loadRoutes()
            await this.loadTrips()
            await this.loadShapes()

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

    public static loadAgencies(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            createReadStream(pathResolve(this.CACHE_PATH, "agency.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row: AgencyConstructorOptions) => {
                    new Agency(row) // agency handles adding itself to cache
                })
                .on("end", resolve)
        })
    }

    public static loadRoutes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log("Converting routes...");
            createReadStream(pathResolve(this.CACHE_PATH, "routes.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row: RouteConstructorOptions) => {
                    new Route(Storage.agency[Number(row.agency_id)], row)
                })
                .on("end", resolve)

        });
    }

    public static loadTrips(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log("Converting trips...");
            createReadStream(pathResolve(this.CACHE_PATH, "trips.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row: TripConstructorOptions) => {
                    new Trip(Storage.route[row.route_id], row)
                })
                .on("end", resolve)

        });
    }

    public static loadShapes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            createReadStream(pathResolve(this.CACHE_PATH, "shapes.txt"))
                .pipe(parse({ headers: true }))
                .on("data", (row) => {
                    Shape.loadRow(row)
                })
                .on("end", resolve);
        })

    }


}