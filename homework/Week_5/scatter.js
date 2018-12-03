/*
Koen Dielhoff, 11269693
This page holds the javascript script for scatter.html
*/
window.onload = function() {
  let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  let requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    let dataset = dataParse();
    console.log(dataset)
  }).catch(function(e){
    throw(e);
  });
};

function dataParse() {
  let dict = {};
  for (let i = 0; i < 2; i++) {
    let countries = dataPoints(i)["Country"];
    let years = dataYears(i);
    for (let countryKey in response[i].dataSets[0].series) {
      let route = response[i].dataSets[0].series[countryKey].observations;
      let country = {};
      for (let yearKey in route) {
        country[years[yearKey]] = route[yearKey][0];
      }
      if (i) {dict[countries[countryKey[0]]].push(country)}
      else {dict[countries[countryKey[2]]] = country};
    }
  }
  return dict;
};

function dataYears(index) {
  let array = [];
  for (let key in response[index].structure.dimensions.observation[0].values) {
    array.push(response[index].structure.dimensions.observation[0].values[key].name);
  };
  return array;
}

function dataPoints(index) {
  let dict = {};
  for (let key in response[index].structure.dimensions.series) {
    let array = [];
    let route = response[index].structure.dimensions.series[key];
    for (let key in route.values) {
      array.push(route.values[key].name);
    }
    dict[route.name] = array;
  }
  return dict;
};

function createGraph(dataset) {
  let svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

  svg.selectAll("circle")
     .data(dataset)
     .enter()
     .append("circle")
     .attr("cx", function(d) {
        return d[0];
     })
     .attr("cy", function(d) {
          return d[1];
     })
     .attr("r", 5);
}
