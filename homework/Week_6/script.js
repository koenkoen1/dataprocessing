/*
Koen Dielhoff, 11269693
This page holds the javascript script for parsing data and making two linked
interactive views
*/
window.onload = function() {
  d3.json("prunedData.json").then(function(data) {
    parsedData = dataParse(data);
    createBarGraph(parsedData);
  })
}

function dataParse(data) {
  let dict = {};
  let keys = Object.keys(data)
  keys.forEach(function(key) {
    let tempDict = {};
    tempDict["year"] = data[key]["iyear"];
    tempDict["month"] = data[key]["imonth"];
    tempDict["day"] = data[key]["iday"];
    dict[data[key]["region_txt"]] = dict[data[key]["region_txt"]] || [];
    dict[data[key]["region_txt"]].push(tempDict);
  })
  return dict
}

function createBarGraph(data) {
  // height, width and margin
  const w = 1000;
  const h = 500;
  const barPadding = 5;
  const margin = 30;

  // initializes a svg
  let svg = d3.select("body")
            .append("svg")
            .attr("class", "barGraph")
            .attr("width", w)
            .attr("height", h);

  let countries = Object.keys(data);
  let newData = [];
  countries.forEach(function(country) {
    countryData = {x: country, y: data[country].length};
    newData.push(countryData);
  })

  console.log(newData);

  // creates scales for the data
  let yScale = d3.scaleLinear()
            .domain([0, Math.max.apply(Math, newData.map(function(o) { return o.y; }))])
            .range([h - margin, margin])
            .nice();
  let xScale = d3.scaleBand()
            .domain(countries)
            .range([2 * margin, w - margin])
            .padding(0.5);
  let yAxis = d3.axisLeft(yScale);
  let xAxis = d3.axisBottom(xScale);

  svg.selectAll("rect")
      .data(newData)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.x); })
      .attr("y", function(d){ return yScale(d.y); })
      .attr("width", xScale.bandwidth)
      .attr("height", function(d){
        return h - yScale(d.y) - margin;
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
      .text("countries");
   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (h/2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("amount of terrorist strikes");
}

function createCalender(data) {

}
