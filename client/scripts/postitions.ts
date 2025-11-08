import L from "leaflet"
import { map } from "."

let positions: L.Circle[] = []

document.addEventListener("DOMContentLoaded", async () => {
    setInterval(update, 5000)
})

async function update() {


    const res = await fetch("https://cors.gart.sh/https://s3.amazonaws.com/kcm-alerts-realtime-prod/vehiclepositions_enhanced.json")
    const json = await res.json()

    positions.forEach((v) => v.remove())
    positions = []

    json.entity.forEach((entity: any) => {
        const pos = entity.vehicle.position
        const circle = L.circle([pos.latitude, pos.longitude], {
            radius: 10
        })

        circle.addTo(map)
        positions.push(circle)

    })
}