// Initialize the map
var map = L.map('map').setView([31.5204, 74.3587], 12);

// Add base layers
var layer1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add hospital markers
var hospitalIcon = L.icon({
    iconUrl: 'hospitalll.png',
    iconSize: [30, 41],
    iconAnchor: [13, 43],
    popupAnchor: [0, -21]
});

var Hospitals = L.geoJSON(hospitals, {
    pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, { icon: hospitalIcon });
        marker.bindPopup("<b>" + feature.properties["Name"] + "</b><br>" + feature.properties.Snippet);
        return marker;
    }
}).addTo(map);

// Fetch hospital names for dropdown
var hospitalOptions = '';
Hospitals.eachLayer(function (layer) {
    var hospitalName = layer.feature.properties["Name"];
    hospitalOptions += `<option value="${layer._leaflet_id}">${hospitalName}</option>`;
});
document.getElementById('hospital-select').innerHTML = hospitalOptions;

// Initialize location marker
var pmarker;
var routingControl;

// Function to add start marker manually
function addStartMarker(latlng) {
    if (pmarker) {
        map.removeLayer(pmarker);
    }
    pmarker = L.marker(latlng).addTo(map).bindPopup('Starting Point').openPopup();
}

// Event listener for manual starting point selection
map.on('click', function (e) {
    addStartMarker(e.latlng);
});

// Fetch live location
function fetchLiveLocation() {
    navigator.geolocation.getCurrentPosition(geoposition);
}

// Handle geolocation
function geoposition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var latlng = L.latLng(lat, lon);
    addStartMarker(latlng);
}

// Calculate and display the route
function calculateRoute() {
    if (!pmarker) {
        alert('Please select a starting point.');
        return;
    }
    var selectedHospitalId = document.getElementById('hospital-select').value;
    var selectedHospitalLayer = Hospitals.getLayer(selectedHospitalId);
    if (!selectedHospitalLayer) {
        alert('Please select a hospital.');
        return;
    }
    var startLatLng = pmarker.getLatLng();
    var endLatLng = selectedHospitalLayer.getLatLng();

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            startLatLng,
            endLatLng
        ],
        routeWhileDragging: true,
        lineOptions: {
            styles: [{ color: 'blue', opacity: 0.7, weight: 7 }]
        }
    }).addTo(map);
}

// Add event listener to the button
document.getElementById('route-button').addEventListener('click', calculateRoute);
