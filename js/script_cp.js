const LOCATIONS = {
  INSAT: [36.843, 10.196],
  Tunis: [36.806, 10.181],
  Marsa: [36.878, 10.324],
  Manouba: [36.808, 10.097],
  Ariana: [36.86, 10.193],
  Bizerte: [37.274, 9.873],
  Sousse: [35.825, 10.636],
  Nabeul: [36.456, 10.735],
  Kairouan: [35.678, 10.097],
  Sfax: [34.74, 10.76],
  Zaghouan: [36.402, 10.143],
  BenArous: [36.753, 10.222],
  اخر_البلاد: [-34.71324128084323, 19.805924101256004],
};

const ridesData = [
  {
    driver: "Sousou",
    other: "middle of nowhere",
    direction: "from-insat",
    price: 0,
    departure: "2026-03-24T03:33",
    seats: 1,
    otherCoord: LOCATIONS.اخر_البلاد,
  },
  {
    driver: "Linus Torvalds",
    other: "Bizerte",
    direction: "to-insat",
    price: 8,
    departure: "2026-03-25T07:45",
    seats: 3,
    otherCoord: LOCATIONS.Bizerte,
  },
  {
    driver: "Ahmed Mohsen",
    other: "Sousse",
    direction: "from-insat",
    price: 15,
    departure: "2026-03-26T18:00",
    seats: 2,
    otherCoord: LOCATIONS.Sousse,
  },
  {
    driver: "Ada Lovelace",
    other: "Nabeul",
    direction: "to-insat",
    price: 12,
    departure: "2026-04-20T07:00",
    seats: 2,
    otherCoord: LOCATIONS.Nabeul,
  },
  {
    driver: "Khammar Hbibiii",
    other: "Hencha",
    direction: "to-insat",
    price: 5,
    departure: "2026-06-06T08:15",
    seats: 1,
    otherCoord: LOCATIONS.Sfax,
  },
  {
    driver: "Grace Aschcroft",
    other: "Sfax",
    direction: "from-insat",
    price: 25,
    departure: "2026-04-12T17:30",
    seats: 3,
    otherCoord: LOCATIONS.Sfax,
  },
  {
    driver: "Leon S. Kennedy",
    other: "Zaghouan",
    direction: "from-insat",
    price: 0.1,
    departure: "2026-09-26T00:07",
    seats: 100,
    otherCoord: LOCATIONS.Zaghouan,
  },
  {
    driver: "Walter White",
    other: "Kairouan",
    direction: "to-insat",
    price: 6.9,
    departure: "2027-01-01T04:20",
    seats: 2,
    otherCoord: LOCATIONS.Kairouan,
  },
  {
    driver: "Kh Tlili",
    other: "Ariana",
    direction: "to-insat",
    price: 1,
    departure: "2026-03-24T08:00",
    seats: 3,
    otherCoord: LOCATIONS.Ariana,
  },
  {
    driver: "nubmer one",
    other: "Ben Arous",
    direction: "from-insat",
    price: 3,
    departure: "2026-03-21T17:17",
    seats: 2,
    otherCoord: LOCATIONS.BenArous,
  },
  {
    driver: "Napoleon Bonaparte",
    other: "Manouba",
    direction: "to-insat",
    price: 20,
    departure: "1800-01-01T08:30",
    seats: 1,
    otherCoord: LOCATIONS.Manouba,
  },
];

const map = L.map("map", { zoomControl: false }).setView(LOCATIONS.INSAT, 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

// L.tileLayer(
//   "https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png",
//   {
//     attribution: "&copy; OpenStreetMap &copy; CARTO",
//     subdomains: "abcd",
//     maxZoom: 19,
//   },
// ).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);

const userIcon = L.divIcon({ className: "my-loc-marker", iconSize: [14, 14] });
L.marker(LOCATIONS.INSAT, { icon: userIcon })
  .addTo(map)
  .bindPopup("<b>INSAT</b>");

let activeRouteControl = null;
let previewControl = null;
let markersLayer = L.layerGroup().addTo(map);
let currentSort = "all";
let currentDirection = "all";
let selectedRide = null;

const markersGroup = L.markerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
});
map.addLayer(markersGroup);

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function formatDistance(meters) {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDeparture(dateStr) {
  const depDate = new Date(dateStr);
  const now = new Date();

  const isToday =
    depDate.getDate() === now.getDate() &&
    depDate.getMonth() === now.getMonth() &&
    depDate.getFullYear() === now.getFullYear();

  const timeString = depDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) {
    return timeString;
  } else {
    const dateString = depDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    return `${dateString}, ${timeString}`;
  }
}

function updateSearchLabel() {
  const labelEl = document.getElementById("search-label");
  const pillEl = document.getElementById("insat-pill-label");
  const searchInp = document.getElementById("input-search");

  if (currentDirection === "to-insat") {
    labelEl.textContent = "Departing from";
    pillEl.textContent = "→ INSAT";
    searchInp.placeholder = "e.g. Bizerte, Marsa…";
  } else if (currentDirection === "from-insat") {
    labelEl.textContent = "Arriving at";
    pillEl.textContent = "← INSAT";
    searchInp.placeholder = "e.g. Sousse, Sfax…";
  } else {
    labelEl.textContent = "City";
    pillEl.textContent = "↔ INSAT";
    searchInp.placeholder = "Any city…";
  }
}

function renderList(searchTerm = "") {
  const list = document.getElementById("ride-list");
  const badge = document.getElementById("count-badge");
  const emptyState = document.getElementById("empty-state");

  markersGroup.clearLayers();
  markersLayer.clearLayers();

  let filtered = ridesData.filter((r) => {
    const matchDir =
      currentDirection === "all" || r.direction === currentDirection;
    const matchSearch = r.other
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchDir && matchSearch;
  });

  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "time-soon") {
    filtered.sort((a, b) => new Date(a.departure) - new Date(b.departure));
  }

  badge.textContent = filtered.length;
  list.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "flex";
    list.style.display = "none";
    lucide.createIcons();
    return;
  }

  emptyState.style.display = "none";
  list.style.display = "flex";

  filtered.forEach((ride, index) => {
    const isFromINSAT = ride.direction === "from-insat";
    const fromLabel = isFromINSAT ? "INSAT" : ride.other;
    const toLabel = isFromINSAT ? ride.other : "INSAT";
    const dirLabel = isFromINSAT ? "Leaving INSAT" : "Heading to INSAT";

    const rideCoords = isFromINSAT
      ? [LOCATIONS.INSAT, ride.otherCoord]
      : [ride.otherCoord, LOCATIONS.INSAT];

    const card = document.createElement("div");
    card.className = "ride-card";
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
    <div class="card-top">
    <div class="route-label">
    <span class="route-direction">${dirLabel}</span>
    <div class="route-main">
    <span>${fromLabel}</span>
    <i data-lucide="arrow-right"></i>
    <span>${toLabel}</span>
    </div>
    </div>
    <div class="price-display">
    <span class="price-amount">${ride.price}</span>
    <span class="price-unit">DT</span>
    </div>
    </div>
    <div class="card-bottom">
    <div class="driver-row">
    <div class="driver-avatar"><i data-lucide="user"></i></div>
    <span class="driver-name">${ride.driver}</span>
    </div>
    <div class="card-meta">
    <span class="meta-item"><i data-lucide="clock"></i>${formatDeparture(ride.departure)}</span>
    <span class="meta-item"><i data-lucide="users"></i>${ride.seats}</span>
    </div>
    </div>
    `;

    // card.addEventListener("mouseenter", () => {
    //   if (!selectedRide || selectedRide !== ride) previewRoute(rideCoords);
    // });
    //
    // card.addEventListener("mouseleave", () => {
    //   if (!selectedRide) clearPreview();
    // });

    card.addEventListener("click", () => {
      selectedRide = ride;
      // good for UX
      const latOffset = window.innerWidth < 768 ? -0.035 : 0;
      const focusPoint = ride.otherCoord;
      const adjPoint = [focusPoint[0] + latOffset, focusPoint[1]];
      map.flyTo(adjPoint, 12, { duration: 1 });
      showRoute(rideCoords, card, ride);
    });

    list.appendChild(card);

    const marker = L.circleMarker(ride.otherCoord, {
      radius: 8,
      color: "#e8395a",
      fillColor: "#07070f",
      fillOpacity: 1,
      weight: 2.5,
    });

    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      selectedRide = ride;
      map.flyTo(ride.otherCoord, 12, { duration: 1 });
      showRoute(rideCoords, card, ride);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    marker.bindTooltip(
      `<div class="custom-tooltip">
      <strong>${ride.driver}</strong>
      <div>${fromLabel} → ${toLabel}</div>
      <div class="tooltip-price">${ride.price} DT · ${formatDeparture(ride.departure)}</div>
      </div>`,
      { className: "custom-tooltip-wrapper" },
    );

    markersGroup.addLayer(marker);
  });

  lucide.createIcons();
}

function previewRoute(coords) {
  if (previewControl) map.removeControl(previewControl);

  previewControl = L.Routing.control({
    waypoints: [L.latLng(coords[0]), L.latLng(coords[1])],
    lineOptions: {
      styles: [
        { color: "#e8395a", opacity: 0.2, weight: 4, dashArray: "6, 10" },
      ],
    },
    createMarker: () => null,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    show: false,
  }).addTo(map);
}

function clearPreview() {
  if (previewControl && !activeRouteControl) {
    map.removeControl(previewControl);
    previewControl = null;
  }
}

function showRoute(coords, cardElement, rideData) {
  if (activeRouteControl) map.removeControl(activeRouteControl);
  if (previewControl) {
    map.removeControl(previewControl);
    previewControl = null;
  }

  document
    .querySelectorAll(".ride-card")
    .forEach((c) => c.classList.remove("active"));
  cardElement.classList.add("active");

  activeRouteControl = L.Routing.control({
    waypoints: [L.latLng(coords[0]), L.latLng(coords[1])],
    lineOptions: {
      styles: [{ color: "#dc143c", opacity: 0.85, weight: 5 }],
    },
    createMarker: () => null,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    show: false,
  }).addTo(map);

  activeRouteControl.on("routesfound", (e) => {
    updateRouteDetails(rideData, e.routes[0]);
  });
}

function updateRouteDetails(ride, route) {
  const panel = document.getElementById("route-details");
  const isFromINSAT = ride.direction === "from-insat";

  document.getElementById("route-driver").textContent = ride.driver;
  document.getElementById("route-from").textContent = isFromINSAT
    ? "INSAT"
    : ride.other;
  document.getElementById("route-to").textContent = isFromINSAT
    ? ride.other
    : "INSAT";
  document.getElementById("route-price").textContent = `${ride.price} DT`;
  document.getElementById("route-duration").textContent = formatDuration(
    route.summary.totalTime,
  );
  document.getElementById("route-distance").textContent = formatDistance(
    route.summary.totalDistance,
  );

  // panel.classList.remove("collapsed");

  panel.style.display = "block";
  setTimeout(() => panel.classList.add("visible"), 10);
  lucide.createIcons();
}

document.querySelectorAll(".dir-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".dir-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDirection = btn.dataset.dir;
    updateSearchLabel();
    renderList(document.getElementById("input-search").value);
  });
});

const inputSearch = document.getElementById("input-search");
const clearSearch = document.getElementById("clear-search");

inputSearch.addEventListener("input", () => {
  clearSearch.style.display = inputSearch.value ? "flex" : "none";
  renderList(inputSearch.value);
});

clearSearch.addEventListener("click", () => {
  inputSearch.value = "";
  clearSearch.style.display = "none";
  renderList();
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentSort = chip.dataset.sort;
    renderList(inputSearch.value);
  });
});

document.getElementById("locate-btn").addEventListener("click", () => {
  map.flyTo(LOCATIONS.INSAT, 12, { duration: 1 });
});

document.getElementById("fit-bounds-btn").addEventListener("click", () => {
  if (markersGroup.getLayers().length > 0) {
    map.fitBounds(markersGroup.getBounds(), { padding: [60, 60] });
  }
});

document.getElementById("close-route").addEventListener("click", () => {
  const panel = document.getElementById("route-details");
  panel.classList.remove("visible");
  setTimeout(() => (panel.style.display = "none"), 300);

  if (activeRouteControl) {
    map.removeControl(activeRouteControl);
    activeRouteControl = null;
  }

  selectedRide = null;
  document
    .querySelectorAll(".ride-card")
    .forEach((c) => c.classList.remove("active"));
});

document.getElementById("toggle-route").addEventListener("click", () => {
  document.getElementById("route-details").classList.toggle("collapsed");
});

document.querySelector(".book-btn").addEventListener("click", () => {
  alert("n o.");
});

updateSearchLabel();
renderList();
