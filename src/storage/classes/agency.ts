import { CSVNullable, CSVObjectNullable } from "../../util/parserUtil.js"
import Storage from "../storage.js"
import Route from "./route.js"

export default class Agency {
    id: number
    name: string
    url: string
    fareUrl?: string
    phoneNumber?: string
    routes: Record<string, Route> = {}

    constructor(options: AgencyConstructorOptions) {
        this.id = Number(options.agency_id)
        this.name = options.agency_name
        this.url = options.agency_url
        this.fareUrl = CSVNullable(options.agency_fare_url)
        this.phoneNumber = CSVNullable(options.agency_phone)

        Storage.agency[this.id] = this
    }
}

export interface AgencyConstructorOptions {
    agency_id: string,
    agency_name: string,
    agency_url: string,
    agency_timezone: string,
    agency_lang: string,
    agency_phone: string,
    agency_fare_url: string,
    agency_email: string
}

