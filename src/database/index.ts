import { MikroORM } from "@mikro-orm/core";
import { EntityManager, EntityRepository, SqliteDriver } from "@mikro-orm/sqlite";
import Route from "./entities/route.entity.js";
import Trip from "./entities/trip.entity.js";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

export default class Database {

    private static _orm: MikroORM<PostgreSqlDriver>;
    private static _em: EntityManager<PostgreSqlDriver>;

    public static repo: {
        route: EntityRepository<Route>;
        trip: EntityRepository<Trip>;
    }

    public static async connect() {
        this._orm = await MikroORM.init({
            driver: PostgreSqlDriver,
            dbName: 'liveseatle',
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            entities: [Route, Trip],
            // debug: true,
        })

        this._em = this._orm.em.fork();

        this.repo = {
            route: this._em.getRepository(Route),
            trip: this._em.getRepository(Trip),
        }
    }

    public static get em(): EntityManager<PostgreSqlDriver> {
        return this._em;
    }

    public static get orm(): MikroORM<PostgreSqlDriver> {
        return this._orm;
    }
}