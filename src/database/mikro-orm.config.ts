import { defineConfig } from "@mikro-orm/core";
import Route from "./entities/route.entity.js";
import Trip from "./entities/trip.entity.js";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

export default defineConfig({
    driver: PostgreSqlDriver,
    dbName: 'liveseatle',
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    entities: [Route, Trip],
    debug: true,
});