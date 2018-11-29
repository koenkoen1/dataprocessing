/*
Koen Dielhoff, 11269693
This page holds the javascript script for scatter.html
*/

let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
let requests = [d3.json(womenInScience), d3.json(consConf)];

Promise.all(requests).then(function(response) {
    console.log(dataParse(0));
    console.log(dataParse(1));

    function dataParse(index) {
      let dict = {};
      let countries = dataPoints(index)["Country"];
      let years = dataYears(index)
      for (let countryKey in response[index].dataSets[0].series) {
        let route = response[index].dataSets[0].series[countryKey].observations;
        let country = {}
        for (let yearKey in route) {
          country[years[yearKey]] = route[yearKey][0]
        }
        if (index === 1) {dict[countries[countryKey[0]]] = country}
        else {dict[countries[countryKey[2]]] = country};
      }
      return dict;
    };

    function dataYears(index) {
      let array = [];
      for (let key in response[index].structure.dimensions.observation[0].values) {
        array.push(response[index].structure.dimensions.observation[0].values[key].name)
      };
      return array
    }

    function dataPoints(index) {
      let dict = {}
      for (let key in response[index].structure.dimensions.series) {
        let array = []
        let route = response[index].structure.dimensions.series[key]
        for (let key in route.values) {
          array.push(route.values[key].name)
        }
        dict[route.name] = array
      }
      return dict
    };

}).catch(function(e){
    throw(e);
});
