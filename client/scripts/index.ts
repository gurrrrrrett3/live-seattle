import "./gui.js";
import L from 'leaflet';

export const map = L.map('map').setView([47.603889, -122.33], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map);

L.control.scale({ imperial: true, metric: true }).addTo(map);
