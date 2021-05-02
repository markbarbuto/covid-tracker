class CovidMap {
    constructor (displayType, features){
        // data to display: cases, todayCases, casesPerMillion, deaths, todayDeaths
        this.displayType = displayType;
        this.features = features;
        this.map = L.map('covidMap');
    }

    applyCovidData(covidData) {
        for (let i = 0; i < this.features.length; i++) {
            const country = this.features[i];
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

    createMap() {
        this.map.setView([25, 0], 2);
        
        const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const tiles = L.tileLayer(tileUrl, { attribution });
        tiles.addTo(this.map);
    }

    populateMap() {
        createMap();
        const geojson = L.geoJson(this.features, { style: style, onEachFeature: onEachFeature });
        geojson.addTo(mymap);
    }
}

module.exports = { CovidMap };