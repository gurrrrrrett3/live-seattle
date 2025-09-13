import * as dat from "dat.gui"
import Shapes from "./shapes";
import ShapeLoader from "./shapeLoader";

export const gui = new dat.GUI()

export const routeState: Record<string, Record<string, boolean>> = {};

fetch("/api").then(res => res.json()).then((data: {
    agencies: Record<string, {
        name: string;
        routes: {
            id: string
            description: string
            color: string
        }[];
    }>,
    shapeColors: Record<string, string>
}) => {
    Object.entries(data.agencies).forEach(([key, agency]) => {
        const folder = gui.addFolder(agency.name);
        const toggleAll = folder.add({ toggle: true }, 'toggle').name('Toggle All')

        let children: dat.GUIController[] = [];

        toggleAll.onChange((value) => {
            agency.routes.forEach(route => {
                routeState[agency.name][route.id] = value;
            });

            children.forEach(child => {
                child.setValue(value);
            });

            // Shapes.update();
        });

        agency.routes.forEach(route => {
            routeState[agency.name] = routeState[agency.name] || {};
            routeState[agency.name][route.id] = false
            const toggle = folder.add(routeState[agency.name], route.id)
            toggle.name(route.description ? `${route.id} | ${route.description}` : route.id);
            toggle.onChange((value) => {
                routeState[agency.name][route.id] = value;

                // Shapes.update();
            });

            children.push(toggle);
        });
    });

    ShapeLoader.colors = data.shapeColors
    ShapeLoader.load()

})

