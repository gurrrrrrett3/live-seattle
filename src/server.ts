import express, { Application } from "express";
import { createServer, Server } from "http";
import { resolve } from "path";
import DataManager from "./data/dataManager.js";
import apiRouter from "./api/index.js";

export default class Webserver {
    public static server: Server
    public static app: Application

    public static start() {
        this.app = express();
        this.server = createServer(this.app);

        this.app.use(express.static("dist/client"));
        this.app.use("/api", apiRouter);

        this.app.get("/", (req, res) => {
            res.sendFile(resolve("dist/client/index.html"));
        });



        this.server.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });

    }
}