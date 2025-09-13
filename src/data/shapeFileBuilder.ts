import { writeFileSync } from "fs";
import { TempShape } from "./gtfs.js";
import { resolve } from "path";

export default class ShapeFileBuilder {

    private static readonly edges = {
        top: Infinity,
        bottom: -Infinity,
        left: Infinity,
        right: -Infinity
    }

    public static readonly lookupTable: {
        id: string,
        offset: number,
        count: number
    }[] = []

    public static buildShapeFile(shapes: Record<string, TempShape>) {
        // initial scan to get bounding box

        const headerBuffer = Buffer.alloc(8)
        headerBuffer.write("SHAP", 0, "ascii")

        Object.values(shapes).forEach((shape) => {
            shape.positions.forEach((pos) => {
                if (pos.lat < this.edges.top) {
                    this.edges.top = pos.lat
                }

                if (pos.lat > this.edges.bottom) {
                    this.edges.bottom = pos.lat
                }

                if (pos.lon < this.edges.left) {
                    this.edges.left = pos.lon
                }

                if (pos.lon > this.edges.right) {
                    this.edges.right = pos.lon
                }
            })
        })

        console.log("bounding box", this.edges)

        const boundingBoxBuffer = Buffer.alloc(16)
        boundingBoxBuffer.writeFloatLE(this.edges.top)
        boundingBoxBuffer.writeFloatLE(this.edges.bottom, 4)
        boundingBoxBuffer.writeFloatLE(this.edges.left, 8)
        boundingBoxBuffer.writeFloatLE(this.edges.right, 12)

        // create entries

        let offset = 0
        const shapeDataBuffers: Buffer[] = []
        Object.values(shapes).forEach((shape) => {

            let localOffset = 0

            this.lookupTable.push({
                id: shape.shapeId,
                count: shape.positions.length,
                offset
            })

            const buf = Buffer.alloc(shape.positions.length * 4)
            shape.positions
                .sort((a, b) => b.sequence - a.sequence)
                .forEach((pos) => {
                    const component = ShapeFileBuilder.latLonToComponent(pos.lat, pos.lon)
                    buf.writeUint16LE(component.lat, localOffset)
                    buf.writeUint16LE(component.lon, localOffset + 2)
                    localOffset += 4
                })

            shapeDataBuffers.push(buf)
            offset += shape.positions.length * 4
        })

        // write lookup table offset
        headerBuffer.writeUint32LE(offset, 4)

        const lookupTableHeaderBuffer = Buffer.alloc(2)
        lookupTableHeaderBuffer.writeUint16LE(this.lookupTable.length)

        // build lookup data buffer

        const lookupTableBuffers: Buffer[] = []
        this.lookupTable.forEach((entry) => {
            let idLen = entry.id.length

            const buf = Buffer.alloc(7 + idLen)
            buf.writeUint8(idLen)
            buf.write(entry.id, 1, "ascii")

            buf.writeUint32LE(entry.offset, idLen + 1)
            buf.writeUInt16LE(entry.count, idLen + 5)

            lookupTableBuffers.push(buf)
        })

        // combine everything 

        const file = Buffer.concat([
            headerBuffer,
            boundingBoxBuffer,
            ...shapeDataBuffers,
            lookupTableHeaderBuffer,
            ...lookupTableBuffers
        ])

        writeFileSync(resolve("./data/shapes.shp"), file)
    }

    public static latLonToComponent(lat: number, lon: number) {
        return {
            lat: Math.round((lat - this.edges.top) / (this.edges.bottom - this.edges.top) * 65535),
            lon: Math.round((lon - this.edges.left) / (this.edges.right - this.edges.left) * 65535)
        }
    }

}