import L from "leaflet"
import { map } from "."

export default class ShapeLoader {

    private static edges = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }

    public static colors: Record<string, string>

    public static async load() {
        const res = await fetch("/api/shapes.shp")
        const file = await res.arrayBuffer()

        await this.parseFile(file)
    }

    public static async parseFile(file: ArrayBuffer) {

        const view = new DataView(file)

        const magic = ShapeLoader.getString(view, 0, 4)

        if (magic != "SHAP") {
            throw new Error("shape file not valid!")
        }

        const lookupOffset = view.getUint32(4, true) + 24

        this.edges = {
            top: view.getFloat32(8, true),
            bottom: view.getFloat32(12, true),
            left: view.getFloat32(16, true),
            right: view.getFloat32(20, true)
        }

        const lookupTableSize = view.getUint16(lookupOffset, true)

        const lookupTable: {
            id: string,
            offset: number,
            count: number
        }[] = []

        let fileOffset = lookupOffset + 2
        for (let index = 0; index < lookupTableSize; index++) {
            const idLen = view.getUint8(fileOffset)
            const id = ShapeLoader.getString(view, fileOffset + 1, idLen)
            const offset = view.getUint32(fileOffset + idLen + 1, true) + 0x18
            const count = view.getUint16(fileOffset + idLen + 5, true)

            lookupTable.push({
                id,
                offset,
                count
            })

            console.log({
                index,
                id, offset, count,
                left: `${view.byteLength - (fileOffset + idLen + 7)} ${lookupTableSize}`
            })

            fileOffset += idLen + 7;
        }

        // load shape data
        // note: maybe split these off and dispatch to workers
        // going to try single threaded approach first

        for (const entry of lookupTable) {
            const shapeData = ShapeLoader.getShapePositions(view, entry.offset, entry.count);
            const color = this.colors[entry.id]

            L.polyline(shapeData.map(pos => [pos.lat, pos.lon]), {
                color: color != "" ? `#${color}` : "#ffffff",
                fill: false,
            })
                .addTo(map)
                .addEventListener("click", (e) => {
                    console.log(entry.id)
                })

        }

        L.rectangle([[this.edges.top, this.edges.left], [this.edges.bottom, this.edges.right]], {
            color: "#f00",
            fill: false
        }).addTo(map)

    }

    public static getShapePositions(view: DataView, offset: number, count: number) {
        const positions: {
            lat: number,
            lon: number
        }[] = []

        for (let index = 0; index < count; index++) {
            const lat = view.getUint16(offset + index * 4, true)
            const lon = view.getUint16(offset + index * 4 + 2, true)

            positions.push(ShapeLoader.componentToLatLong(lat, lon))
        }

        return positions
    }

    public static componentToLatLong(lat: number, lon: number) {
        return {
            lat: (lat / 65535) * (this.edges.bottom - this.edges.top) + this.edges.top,
            lon: (lon / 65535) * (this.edges.right - this.edges.left) + this.edges.left
        }
    }

    public static getString(dataView: DataView, offset: number, length: number): string {
        let string = "";
        for (let i = 0; i < length; i++) {
            const char = dataView.getUint8(offset + i);
            if (char === 0) break;
            string += String.fromCharCode(char);
        }
        return string;
    }

}