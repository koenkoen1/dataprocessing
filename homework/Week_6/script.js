/*
Koen Dielhoff, 11269693
This page holds the javascript script for parsing data and making two linked
interactive views
*/
window.onload = function() {
  d3.json("prunedData.json").then(function(data) {
    let parsedData = dataParse(data);
    console.log(parsedData);
    createBarGraph(parsedData);
    let reparsedData = calenderParse(parsedData);
    console.log(reparsedData["North America"]);
    createCalender(reparsedData["North America"]);
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
      .attr("class", "bar")
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

function calenderParse(data) {
  countries = Object.keys(data);
  parsedData = {}
  countries.forEach(function(country) {
    let prevDate = new Date();
    let value = [];
    let values = [];
    for (key in data[country]) {
      const brief = data[country][key]
      let newDate = new Date(brief["year"], brief["month"] - 1, brief["day"])
      if (prevDate.getTime() === newDate.getTime()) {
        value[1] = value[1] + 1;
      }
      else {
        values.push(value);
        value = [newDate, 1];
        prevDate = newDate;
      };
    };
    values.splice(0, 1)
    parsedData[country] = values;
  });
  return parsedData
}

function createCalender(data) {
  const w = 964;
  const cellSize = 17;
  const h = cellSize * 9;

  const years = d3.nest()
      .key(d => d[0].getFullYear())
    .entries(data)
    .reverse();

  console.log(years)

  // initializes a svg
  let svg = d3.select("body")
            .append("svg")
            .attr("class", "calenderGraph")
            .attr("width", w)
            .attr("height", (h * years.length));

  let year = svg.selectAll("g")
          .data(years)
          .enter()
          .append("g")
          .attr("transform", function(d, i) {
            return "translate(40, " + (h * i + 1.5 * cellSize) + ")";
          });

  year.append("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text(function(d) { return d.key; });

  year.append("g")
      .attr("text-anchor", "end")
    .selectAll("text")
    .data(d3.range(7).map(i => new Date(1995, 0, i)))
    .enter().append("text")
      .attr("x", -5)
      .attr("y", d => (d.getDay() + 0.8) * cellSize)
      .text(d => "SMTWTFS"[d.getDay()]);

  year.append("g")
    .selectAll("rect")
    .data(function(d) { return d.values})
    .enter().append("rect")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => d3.timeMonday.count(d3.timeYear(d[0]), d[0]) * cellSize + 0.5)
      .attr("y", d => d[0].getDay() * cellSize)
      .attr("fill", "darkred")
    .append("title")
      .text(function(d) { return "" + d[0] + d[1]});
}
