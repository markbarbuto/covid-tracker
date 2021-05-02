import { CovidMap } from "./model.js";

const map;
const features;
const covidData;

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

document.body.onload = function () {
    getCountries();
    getCovidData();

    map = new CovidMap('cases', features);
    map.applyCovidData(covidData)
    map.populateMap();
    // setInterval(getISS, 1000);
};