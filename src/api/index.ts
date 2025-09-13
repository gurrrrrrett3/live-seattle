import { Router } from 'express';
import DataManager from '../data/dataManager.js';
import Database from '../database/index.js';
import Route from '../database/entities/route.entity.js';
import { resolve } from 'path';
import Trip from '../database/entities/trip.entity.js';

const apiRouter = Router();

apiRouter.get("/", async (req, res) => {
    const routes = await Database.repo.route.findAll();
    const trips = await Database.repo.trip.findAll({
        populate: ["route.color"]
    })

    const agencies: Record<string, {
        name: string;
        routes: {
            id: string
            description: string
            color: string
        }[];
    }> = {};

    const shapeColors: Record<string, string> = {}

    routes.forEach(route => {
        const agencyId = route.agencyId;
        if (!agencies[agencyId]) {
            agencies[agencyId] = {
                name: DataManager.agencies[agencyId]?.name || agencyId,
                routes: []
            };
        }
        agencies[agencyId].routes.push({
            id: route.id,
            description: route.description,
            color: route.color
        });
    });

    trips.forEach(trip => {
        shapeColors[trip.shapeId] = trip.route.color
    })

    res.json({
        agencies,
        shapeColors
    });
})

apiRouter.get("/shapes.shp", (req, res) => {
    res.sendFile(resolve("./data/shapes.shp"))
})

export default apiRouter;