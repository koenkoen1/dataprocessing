/*
Koen Dielhoff, 11269693
This page holds the javascript script for scatter.html
*/
window.onload = function() {
  let womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  let consConf = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  let requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    let dataset = dataParse(response);
    dataset = clean(dataset);
    createGraph(dataset["2007"]);
    document.getElementById("year").onchange=function() {
      var year = this.value
      createGraph(dataset[year])
    }
  }).catch(function(e){
    throw(e);
  });
};

// parses responsetext
function dataParse(response) {
  let dict = {};

  // parses both datasets
  for (let i = 0; i < 2; i++) {
    // gets the names of the countries and years
    const countries = dataPoints(response, i)["Country"];
    const years = dataYears(response, i);

    // iterates over evey country in the datasets
    for (let countryKey in response[i].dataSets[0].series) {
      const route = response[i].dataSets[0].series[countryKey].observations;

      //iterates over every year in the datasets
      for (let yearKey in route) {
        // the country is saved at different indexes between the datasets
        let country
        if (i) { country = countries[countryKey[0]] }
        else { country = countries[countryKey[2]] };

        // adds the value of each dataset together into a list in an object
        dict[years[yearKey]] = dict[years[yearKey]] || {};
        dict[years[yearKey]][country] = dict[years[yearKey]][country] || [];
        dict[years[yearKey]][country].push(route[yearKey][0])
      }
    }
  }
  return dict;
};

// extracts years from responsetext
function dataYears(response, index) {
  let array = [];
  const route = response[index].structure.dimensions.observation[0].values;
  for (let key in route) { array.push(route[key].name) };
  return array;
}

// extracts countries from responsetext
function dataPoints(response, index) {
  let dict = {};
  for (let key in response[index].structure.dimensions.series) {
    let array = [];
    const route = response[index].structure.dimensions.series[key];
    for (let key in route.values) { array.push(route.values[key].name) };
    dict[route.name] = array;
  }
  return dict;
};

// removes data with less than two values
function clean(dataset) {
  const years = Object.keys(dataset);
  years.forEach(function(year) {
    const countries = Object.keys(dataset[year]);
    countries.forEach(function(country) {
      if (dataset[year][country].length < 2) { delete dataset[year][country] }
    })
  })
  return dataset
}

function createGraph(dataset) {
  // removes previous graph if any, so there is space for a new one
  d3.selectAll("svg")
      .remove();

  // height, width and margin
  const w = 1000;
  const h = 500;
  const margin = 30;

  // initializes a svg
  let svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

  // adds graphtitle to svg
  svg.append("text")
     .attr("transform", "translate(" + (w/2) + ", 12)")
     .style("text-anchor", "middle")
     .text("customer confidence vs. percentage of women in science");

  // different colours for different data
  let colours = ['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f']

  // basically parsing the dataset again as the previous parse did not work here
  let data = [];
  let xData = [];
  let yData = [];
  const countries = Object.keys(dataset)
  let i = 0;
  countries.forEach(function(country) {
    // saving x- and y-data separately for easy making of scales
    xData.push(dataset[country][0]);
    yData.push(dataset[country][1]);

    let dataVal = [dataset[country][0], dataset[country][1], country];
    data.push(dataVal);
  });

  // creates scales for the data
  let yScale = d3.scaleLinear()
            .domain([Math.min(...yData), Math.max(...yData)])
            .range([h - margin, margin])
            .nice()
  let xScale = d3.scaleLinear()
            .domain([Math.min(...xData), Math.max(...xData)])
            .range([2 * margin, w - margin])
            .nice()
  let yAxis = d3.axisLeft(yScale)
  let xAxis = d3.axisBottom(xScale)

  // fill the scatterplot with dots
  svg.selectAll("circle")
     .data(data)
     .enter()
     .append("circle")
     .attr("class", "circle")
     .attr("cx", function(d) { return xScale(d[0]) })
     .attr("cy", function(d) { return yScale(d[1]) })
     .attr("r", 5)
     .attr("fill", function(d) {
       return colours[data.indexOf(d)]
     })

  // adds axes
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + (2 * margin) + ",0)")
     .call(yAxis);
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (h - margin) + ")")
     .call(xAxis);

  // adds axes labels
  svg.append("text")
     .attr("transform", "translate(" + (w/2) + "," + (h-5) + ")")
     .style("text-anchor", "middle")
     .text("percent of women in science");
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0)
     .attr("x",0 - (h/2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("Customer confidence index");

  // initializes legend
  let legend = svg.append("g")
     .attr("class", "legend")
     .attr("x", w - 65)
     .attr("y", margin)
     .attr("height", 100)
     .attr("width", 65);

  // adds colours to the legend
  legend.selectAll('rect')
        .data(data)
        .enter()
        .append("rect")
        .attr("x", w - 125)
        .attr("y", function(d, i){ return i *  20;})
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d) {
          return colours[data.indexOf(d)];
        });

  // adds country names to legend
  legend.selectAll('text')
        .data(data)
        .enter()
        .append("text")
        .attr("x", w - 110)
        .attr("y", function(d, i){ return 10 + i *  20;})
        .text(function(d) {
          return d[2];
        });
}
