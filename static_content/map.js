var covidData;
var features;
var geojson;

var scales = {
    cases: scaleCases,
    // TodayCases: scaleTodayCases

}

function getCovidData() {
    var settings = {
        "url": "https://corona.lmao.ninja/v2/countries?yesterday&sort",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        covidData = response;
        // console.log(covidData);
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
                // console.log(jqXHR.status+" "+text_status + ": got map");

                // add to map
                features = data.features;
                applyCovidData(features, covidData);

                console.log('country data:');
                console.log(features);

                geojson = L.geoJson(features, { style: style, onEachFeature: onEachFeature });
                geojson.addTo(mymap);
                
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

// put into onload
getCovidData();

// Making a map and tiles
// Setting a higher initial zoom to make effect more obvious
const mymap = L.map('covidMap').setView([25, 0], 2);
const attribution =
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

// put into onload
getCountries();

// old dataset
const cases_api_url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/web-data/data/cases_country.csv'; 

// ============================================

function scaleCases(cases) {
    return cases > 20000000 ? '#800026' :
           cases > 10000000 ? '#BD0026' :
           cases > 5000000  ? '#E31A1C' :
           cases > 1000000  ? '#FC4E2A' :
           cases > 500000   ? '#FD8D3C' :
           cases > 100000   ? '#FEB24C' :
           cases > 50000    ? '#FED976' :
           cases > 20000    ? '#FFEDA0' :
           cases > 10000    ? '#FFF7D4' :
                              '#FFFCED';
}

function scaleTodayCases(cases){
    return cases > 200000 ? '#800026' :
           cases > 100000 ? '#BD0026' :
           cases > 50000  ? '#E31A1C' :
           cases > 20000  ? '#FC4E2A' :
           cases > 10000  ? '#FD8D3C' :
           cases > 5000   ? '#FEB24C' :
           cases > 2000   ? '#FED976' :
           cases > 1000   ? '#FFEDA0' :
           cases > 500    ? '#FFF7D4' :
                            '#FFFCED';
}

function getColor(value, scaleType) {
    let scale = scales[scaleType];
    return scale(value);
}

function style(feature) {
		return {
			weight: 1,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.cases, 'cases')
		};
	}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
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

// ============================================


document.body.onload = function () {
    // getISS();
    // setInterval(getISS, 1000);
};