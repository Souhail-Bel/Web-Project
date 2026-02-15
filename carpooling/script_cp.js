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
  Sfax: [34.74, 10.76],
  Nabeul: [36.456, 10.735],
  Kairouan: [35.678, 10.097],
};

// el rides
const ridesData = [
  {
    driver: "Linus Torvalds",
    from: "INSAT",
    to: "Kebili",
    price: 35,
    coords: [LOCATIONS.INSAT, LOCATIONS.Kebili],
    seats: 3,
    departure: "14:30",
  },
  {
    driver: "Ahmed Mohsen",
    from: "INSAT",
    to: "Sousse",
    price: 15,
    coords: [LOCATIONS.INSAT, LOCATIONS.Sousse],
    seats: 2,
    departure: "09:00",
  },
  {
    driver: "Ali Ali",
    from: "Bizerte",
    to: "Tunis",
    price: 8,
    coords: [LOCATIONS.Bizerte, LOCATIONS.Tunis],
    seats: 4,
    departure: "16:45",
  },
  {
    driver: "Khammar Hbibiii",
    from: "Marsa",
    to: "Manouba",
    price: 5,
    coords: [LOCATIONS.Marsa, LOCATIONS.Manouba],
    seats: 1,
    departure: "08:15",
  },
  {
    driver: "Walter White",
    from: "Bizerte",
    to: "Borj El Khadra",
    price: 1,
    coords: [LOCATIONS.Bizerte, LOCATIONS.BorjElKhadra],
    seats: 2,
    departure: "12:00",
  },
  {
    driver: "Grace Hopper",
    from: "CUN",
    to: "Sfax",
    price: 25,
    coords: [LOCATIONS.CUN, LOCATIONS.Sfax],
    seats: 3,
    departure: "07:30",
  },
  {
    driver: "Ada Lovelace",
    from: "Nabeul",
    to: "Tunis",
    price: 12,
    coords: [LOCATIONS.Nabeul, LOCATIONS.Tunis],
    seats: 2,
    departure: "10:00",
  },
  {
    driver: "Dennis Ritchie",
    from: "Kairouan",
    to: "Sousse",
    price: 10,
    coords: [LOCATIONS.Kairouan, LOCATIONS.Sousse],
    seats: 4,
    departure: "15:20",
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

L.control.zoom({ position: "bottomright" }).addTo(map);

// im here :)))
const userIcon = L.divIcon({ className: "my-loc-marker", iconSize: [16, 16] });
L.marker(LOCATIONS.CUN, { icon: userIcon })
  .addTo(map)
  .bindPopup("<b>You (CUN)</b>");

// state
let activeRouteControl = null;
let markersLayer = L.layerGroup().addTo(map);
let currentSort = "all";
let selectedRide = null;

// clusters
const markersGroup = L.markerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
});
map.addLayer(markersGroup);

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function formatDistance(meters) {
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

function renderList(searchTo = "", searchFrom = "") {
  const list = document.getElementById("ride-list");
  const countBadge = document.getElementById("count-badge");
  const emptyState = document.getElementById("empty-state");

  markersGroup.clearLayers();

  // search thingy
  let filtered = ridesData.filter((r) => {
    const matchTo = r.to.toLowerCase().includes(searchTo.toLowerCase());
    const matchFrom = r.from.toLowerCase().includes(searchFrom.toLowerCase());
    return matchTo && matchFrom;
  });

  // sorting
  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "time-soon") {
    filtered.sort((a, b) => {
      const timeA =
        parseInt(a.departure.split(":")[0]) * 60 +
        parseInt(a.departure.split(":")[1]);
      const timeB =
        parseInt(b.departure.split(":")[0]) * 60 +
        parseInt(b.departure.split(":")[1]);
      return timeA - timeB;
    });
  }

  countBadge.innerText = filtered.length;
  list.innerHTML = "";
  markersLayer.clearLayers();

  if (filtered.length === 0) {
    emptyState.style.display = "flex";
    list.style.display = "none";
    lucide.createIcons();
    return;
  } else {
    emptyState.style.display = "none";
    list.style.display = "block";
  }

  filtered.forEach((ride, index) => {
    // ride cards
    const card = document.createElement("div");
    card.className = "ride-card";
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
    <div class="card-header">
    <div class="route-info">
    <span class="location-name">${ride.from}</span>
    <i data-lucide="arrow-right" class="arrow-icon"></i>
    <span class="location-name">${ride.to}</span>
    </div>
    <span class="price-tag">${ride.price} DT</span>
    </div>
    <div class="driver-info">
    <div class="driver-avatar">
    <i data-lucide="user"></i>
    </div>
    <div class="driver-details">
    <span class="driver-name">${ride.driver}</span>
    <div class="ride-meta">
    <span class="meta-item">
    <i data-lucide="clock"></i>
    ${ride.departure}
    </span>
    <span class="meta-item">
    <i data-lucide="users"></i>
    ${ride.seats} seats
    </span>
    </div>
    </div>
    </div>
    `;

    // preview
    card.addEventListener("mouseenter", () => {
      if (!selectedRide || selectedRide !== ride) {
        previewRoute(ride.coords);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (!selectedRide) {
        clearPreview();
      }
    });

    // locked in >w<
    card.addEventListener("click", () => {
      selectedRide = ride;
      map.flyTo(ride.coords[0], 12, { duration: 1 });
      showRoute(ride.coords, card, ride);
    });

    list.appendChild(card);

    const marker = L.circleMarker(ride.coords[0], {
      radius: 8,
      color: "#e67e22",
      fillColor: "#fff",
      fillOpacity: 1,
      weight: 3,
    }).addTo(markersLayer);

    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      selectedRide = ride;
      map.flyTo(ride.coords[0], 12, { duration: 1 });
      showRoute(ride.coords, card, ride);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    marker.bindTooltip(
      `<div class="custom-tooltip">
      <strong>${ride.driver}</strong>
      <div>${ride.from} → ${ride.to}</div>
      <div class="tooltip-price">${ride.price} DT</div>
      </div>`,
      { className: "custom-tooltip-wrapper" },
    );

    markersGroup.addLayer(marker);
  });

  lucide.createIcons();
}

let previewControl = null;

function previewRoute(coords) {
  if (previewControl) {
    map.removeControl(previewControl);
  }

  previewControl = L.Routing.control({
    waypoints: [L.latLng(coords[0]), L.latLng(coords[1])],
    lineOptions: {
      styles: [
        { color: "#94a3b8", opacity: 0.4, weight: 4, dashArray: "5, 10" },
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
  // swtich route
  if (activeRouteControl) {
    map.removeControl(activeRouteControl);
  }
  if (previewControl) {
    map.removeControl(previewControl);
    previewControl = null;
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
    createMarker: () => null,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    show: false,
  }).addTo(map);

  activeRouteControl.on("routesfound", function (e) {
    const route = e.routes[0];
    updateRouteDetails(rideData, route);
  });
}

function updateRouteDetails(ride, route) {
  const detailsPanel = document.getElementById("route-details");
  document.getElementById("route-driver").textContent = ride.driver;
  document.getElementById("route-from").textContent = ride.from;
  document.getElementById("route-to").textContent = ride.to;
  document.getElementById("route-price").textContent = `${ride.price} DT`;
  document.getElementById("route-duration").textContent = formatDuration(
    route.summary.totalTime,
  );
  document.getElementById("route-distance").textContent = formatDistance(
    route.summary.totalDistance,
  );

  detailsPanel.style.display = "block";
  setTimeout(() => detailsPanel.classList.add("visible"), 10);
  lucide.createIcons();
}

const inputTo = document.getElementById("input-to");
const inputFrom = document.getElementById("input-from");
const clearToBtn = document.getElementById("clear-to");
const clearFromBtn = document.getElementById("clear-from");
const swapBtn = document.getElementById("swap-locations");

const update = () => {
  renderList(inputTo.value, inputFrom.value);
  clearToBtn.style.display = inputTo.value ? "flex" : "none";
  clearFromBtn.style.display = inputFrom.value ? "flex" : "none";
  lucide.createIcons();
};

inputTo.addEventListener("input", update);
inputFrom.addEventListener("input", update);

clearToBtn.addEventListener("click", () => {
  inputTo.value = "";
  update();
});

clearFromBtn.addEventListener("click", () => {
  inputFrom.value = "";
  update();
});

swapBtn.addEventListener("click", () => {
  const temp = inputTo.value;
  inputTo.value = inputFrom.value;
  inputFrom.value = temp;
  update();
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentSort = chip.dataset.sort;
    renderList(inputTo.value, inputFrom.value);
  });
});

document.getElementById("locate-btn").addEventListener("click", () => {
  map.flyTo(LOCATIONS.CUN, 11, { duration: 1 });
});

document.getElementById("fit-bounds-btn").addEventListener("click", () => {
  if (markersGroup.getLayers().length > 0) {
    map.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
  }
});

document.getElementById("close-route").addEventListener("click", () => {
  const detailsPanel = document.getElementById("route-details");
  detailsPanel.classList.remove("visible");
  setTimeout(() => (detailsPanel.style.display = "none"), 300);

  if (activeRouteControl) {
    map.removeControl(activeRouteControl);
    activeRouteControl = null;
  }

  selectedRide = null;

  document
    .querySelectorAll(".ride-card")
    .forEach((c) => c.classList.remove("active"));
});

document.querySelector(".book-btn").addEventListener("click", () => {
  alert("Booking feature coming soon! 🚗");
});

// Init
renderList();
