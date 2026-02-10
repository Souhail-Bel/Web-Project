let map = L.map('map').setView([36.836, 10.215], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function addCarRoute(start, end, color) {
    let routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1])
        ],
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        lineOptions: {
            styles: [{color: color, opacity: 0.7, weight: 6}]
        },

        createMarker: function() { return null; }
    }).addTo(map);

    routingControl.getContainer().style.display = 'none';
}


addCarRoute([36.836, 10.215], [36.846, 10.225], 'red');
addCarRoute([36.826, 10.213], [36.806, 10.235], 'blue');
