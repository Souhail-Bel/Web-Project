// cool spots
const LOCATIONS = {
  CUN: [36.848, 10.205],
  INSAT: [36.843, 10.196],
  Kebili: [33.704, 8.969],
  Sousse: [35.825, 10.636],
  Bizerte: [37.274, 9.873],
  Tunis: [36.806, 10.181],
  Marsa: [36.878, 10.324],
  Manouba: [36.808, 10.097],
  BorjElKhadra: [30.25, 9.55],
};

// el rides
const ridesData = [
  {
    driver: "Linus Torvalds",
    from: "INSAT",
    to: "Kebili",
    price: 35,
    coords: [LOCATIONS.INSAT, LOCATIONS.Kebili],
  },
  {
    driver: "Ahmed Mohsen",
    from: "INSAT",
    to: "Sousse",
    price: 15,
    coords: [LOCATIONS.INSAT, LOCATIONS.Sousse],
  },
  {
    driver: "Ali Ali",
    from: "Bizerte",
    to: "Tunis",
    price: 8,
    coords: [LOCATIONS.Bizerte, LOCATIONS.Tunis],
  },
  {
    driver: "Khammar Hbibiii",
    from: "Marsa",
    to: "Manouba",
    price: 5,
    coords: [LOCATIONS.Marsa, LOCATIONS.Manouba],
  },
  {
    driver: "Walter White",
    from: "Bizerte",
    to: "Borj El Khadra",
    price: 1,
    coords: [LOCATIONS.Bizerte, LOCATIONS.BorjElKhadra],
  },
];

// leaflet shenanigans
const map = L.map("map", { zoomControl: false }).setView(LOCATIONS.CUN, 11);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  },
).addTo(map);

// im here :)))
const userIcon = L.divIcon({ className: "my-loc-marker", iconSize: [16, 16] });
L.marker(LOCATIONS.CUN, { icon: userIcon })
  .addTo(map)
  .bindPopup("<b>You (CUN)</b>");

// state
let activeRouteControl = null;
let markersLayer = L.layerGroup().addTo(map);

// clusters
const markersGroup = L.markerClusterGroup();
map.addLayer(markersGroup);

function renderList(searchTo = "", searchFrom = "") {
  const list = document.getElementById("ride-list");
  const countBadge = document.getElementById("count-badge");

  markersGroup.clearLayers();

  // search thingy
  const filtered = ridesData.filter((r) => {
    const matchTo = r.to.toLowerCase().includes(searchTo.toLowerCase());
    const matchFrom = r.from.toLowerCase().includes(searchFrom.toLowerCase());
    return matchTo && matchFrom;
  });

  countBadge.innerText = filtered.length;
  list.innerHTML = "";
  markersLayer.clearLayers();

  filtered.forEach((ride, index) => {
    // ride cards
    const card = document.createElement("div");
    card.className = "ride-card";
    card.innerHTML = `
    <div class="route-info">
    <span>${ride.from}</span>
    <i data-lucide="arrow-right" class="arrow-icon" style="width:16px"></i>
    <span>${ride.to}</span>
    </div>
    <div class="driver-info">
    <span><i data-lucide="user" style="width:12px"></i> ${ride.driver}</span>
    <span class="price-tag">${ride.price} DT</span>
    </div>
    `;

    // preview
    card.addEventListener("mouseenter", () => showRoute(ride.coords, card));
    // locked in >w<
    card.addEventListener("click", () => {
      map.flyTo(ride.coords[0], 10);
      showRoute(ride.coords, card);
    });

    list.appendChild(card);

    const marker = L.circleMarker(ride.coords[0], {
      radius: 8,
      color: "#e67e22",
      fillColor: "#fff",
      fillOpacity: 1,
      weight: 3,
    }).addTo(markersLayer);

    marker.on("dblclick", (e) => {
      L.DomEvent.stopPropagation(e); // no default zoom
      map.flyTo(ride.coords[0], map.getZoom());
      showRoute(ride.coords, card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    //marker.bindPopup(`<b>${ride.driver}</b><br>${ride.from} → ${ride.to}`);
    marker.bindTooltip(`<b>${ride.driver}</b><br>${ride.from} → ${ride.to}`);

    markersGroup.addLayer(marker);
  });

  lucide.createIcons();
}

function showRoute(coords, cardElement) {
  // swtich route
  if (activeRouteControl) {
    map.removeControl(activeRouteControl);
  }

  document
    .querySelectorAll(".ride-card")
    .forEach((c) => c.classList.remove("active"));
  cardElement.classList.add("active");

  // traceroute
  activeRouteControl = L.Routing.control({
    waypoints: [L.latLng(coords[0]), L.latLng(coords[1])],
    lineOptions: {
      styles: [{ color: "#e67e22", opacity: 0.8, weight: 6 }],
    },
    createMarker: function () {
      return null;
    },
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    show: false,
  }).addTo(map);
}

const inputTo = document.getElementById("input-to");
const inputFrom = document.getElementById("input-from");

const update = () => renderList(inputTo.value, inputFrom.value);

inputTo.addEventListener("input", update);
inputFrom.addEventListener("input", update);

// Init
renderList();
