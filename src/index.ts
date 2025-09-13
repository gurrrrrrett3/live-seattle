import "dotenv/config";
import Webserver from "./server.js";
import DataManager from "./data/dataManager.js";
import GTFS from "./data/gtfs.js";
import Database from "./database/index.js";

(async () => {
    await Database.connect();
    await GTFS.load();
    await DataManager.start();
    Webserver.start();

})();