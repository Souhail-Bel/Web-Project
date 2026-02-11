const map = L.map("map").setView([36.836, 10.215], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function addCarRoute(start, end, color) {
  const routingControl = L.Routing.control({
    waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    lineOptions: {
      styles: [{ color: color, opacity: 0.7, weight: 6 }],
    },

    createMarker: function (i, wp, nthWaypoint) {
      let wpColor = i === 0 ? "green" : "red";

      return L.circleMarker(wp.latLng, {
        radius: 5,
        fillColor: wpColor,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).bindPopup(i === 0 ? "Start" : "End");
    },
  }).addTo(map);

  routingControl.getContainer().style.display = "none";
}

addCarRoute([36.836, 10.215], [33.458, 9.022], "red");
addCarRoute([36.424, 10.093], [35.123, 10.741], "blue");
addCarRoute([45, 10], [45, 45], "green");

// TODO make a function that would attach an event listener for each line and append it to the carpooling list
