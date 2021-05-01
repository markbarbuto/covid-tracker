var covidData;
var features;

function getCovidData() {
    var settings = {
        "url": "https://corona.lmao.ninja/v2/countries?yesterday&sort",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        covidData = response;
        console.log(covidData);
    }).catch(err => console.log(err));
}

function applyCovidData(features, covidData) {
    for (let i = 0; i < features.length; i++) {
        const country = features[i];
        const covidCountry = covidData.find(
            (covidCountry) => country.properties.ISO_A3 === covidCountry.countryInfo.iso3
        );

        // initialize new properties
        country.properties.cases = 0;
        country.properties.todayCases = 0;
        country.properties.todayDeaths = 0;
        country.properties.casesPerOneMillion = 0;

        // add relevant data to feature properties
        if (covidCountry != null) {
            country.properties.cases = covidCountry.cases;
            country.properties.todayCases = covidCountry.todayCases;
            country.properties.todayDeaths = covidCountry.todayDeaths;
            country.properties.casesPerOneMillion = covidCountry.casesPerOneMillion;
        }
    }
}

function getCountries() {
        $.ajax({
                method: "GET",
                url: "/api/countries"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status + ": got map");

                // add to map
                const features = data.features;
                applyCovidData(features, covidData);

                console.log(features);

                const countries = L.geoJson(features, { style: style });
                countries.addTo(mymap);
                
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

getCovidData();

// Making a map and tiles
// Setting a higher initial zoom to make effect more obvious
const mymap = L.map('covidMap').setView([0, 0], 1);
const attribution =
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

getCountries();

// old dataset
const cases_api_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/web-data/data/cases_country.csv'; 

let firstTime = true;

// ============================================
function getColor(cases) {
    return cases > 5000000 ? '#800026' :
           cases > 1000000  ? '#BD0026' :
           cases > 500000  ? '#E31A1C' :
           cases > 200000  ? '#FC4E2A' :
           cases > 100000   ? '#FD8D3C' :
           cases > 50000   ? '#FEB24C' :
           cases > 10000   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.cases)
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