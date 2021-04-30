function getCountries() {
        $.ajax({
                method: "GET",
                url: "/api/countries"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status + ": got map");

                // add to map
                const features = data.features;
                const countries = L.geoJson(features);
                countries.addTo(mymap);
                
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}


// Making a map and tiles
// Setting a higher initial zoom to make effect more obvious
const mymap = L.map('covidMap').setView([0, 0], 1);
const attribution =
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

getCountries();

// Making a marker with a custom icon
//   const issIcon = L.icon({
//     iconUrl: 'iss200.png',
//     iconSize: [50, 32],
//     iconAnchor: [25, 16]
//   });
let marker = L.marker([0, 0]).addTo(mymap);

// mymap.on('zoomend', function() {
//     const zoom = mymap.getZoom() + 1;
//     const w = 50 * zoom;
//     const h = 32 * zoom;
//     issIcon.options.iconSize = [w, h];
//     issIcon.options.iconAnchor = [w / 2, h / 2];
//     mymap.removeLayer(marker);
//     let latlng = marker.getLatLng();
//     marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);
//     marker.setLatLng(latlng);
// });

const api_url = 'https://api.wheretheiss.at/v1/satellites/25544';
const cases_api_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/web-data/data/cases_country.csv'; 

let firstTime = true;

// ============================================
function getColor(cases) {
    return d > 5000000 ? '#800026' :
           d > 1000000  ? '#BD0026' :
           d > 500000  ? '#E31A1C' :
           d > 200000  ? '#FC4E2A' :
           d > 100000   ? '#FD8D3C' :
           d > 50000   ? '#FEB24C' :
           d > 10000   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.density)
		};
	}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    // for info card on top-right of tutorial map
    // info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    // info.update();
}

function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// geojson = L.geoJson(statesData, {
//     style: style,
//     onEachFeature: onEachFeature
// }).addTo(mymap);

// ============================================


async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    const { latitude, longitude } = data;

    // Always set the view to current lat lon and zoom!
    // mymap.setView([latitude, longitude], mymap.getZoom());
    marker.setLatLng([latitude, longitude]);

    // document.getElementById('lat').textContent = latitude.toFixed(2);
    // document.getElementById('lon').textContent = longitude.toFixed(2);
}

document.body.onload = function () {
    getISS();
    // setInterval(getISS, 1000);
};