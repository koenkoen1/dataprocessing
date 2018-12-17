/*
Koen Dielhoff, 11269693
This page holds the javascript script for parsing data and making two linked
interactive views
*/
window.onload = function() {
  d3.json("prunedData.json").then(function(data) {

    // parse data and create bargraph
    let parsedData = dataParse(data);
    createBarGraph(parsedData);

    // reparse as previous parse does not fit
    let reparsedData = calenderParse(parsedData);

    // create initial calender graph with data from North America
    createCalender(reparsedData["North America"]);

    // update calender graph when bars in bargraph is clicked
    d3.selectAll(".bar").on("click", function(d) {
      d3.select(".calenderGraph").select(".graphTitle").text("Terrorism in " + d.x);
      calenderUpdate(reparsedData[d.x]);
    });
  })
}

function dataParse(data) {
  // saves dates of datapoints
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
  // height, width, barpadding and margin
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

  // adds graphtitle to svg
  svg.append("text")
     .attr("transform", "translate(" + (w/2) + ", 12)")
     .style("text-anchor", "middle")
     .text("Global terrorism");

  // calculates the amount of datapoints per country
  let countries = Object.keys(data);
  let newData = [];
  countries.forEach(function(country) {
    countryData = {x: country, y: data[country].length};
    newData.push(countryData);
  })

  // creates scales for the data
  let yScale = d3.scaleLinear()
            .domain([0, Math.max.apply(Math, newData.map(function(o) { return o.y; }))])
            .range([h - 1.5 * margin, margin])
            .nice();
  let xScale = d3.scaleBand()
            .domain(countries)
            .range([2 * margin, w - margin])
            .padding(0.5);
  let yAxis = d3.axisLeft(yScale);
  let xAxis = d3.axisBottom(xScale);

  // adds bargraphbars
  svg.selectAll("rect")
      .data(newData)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) { return yScale(d.y); })
        .attr("width", xScale.bandwidth)
        .attr("height", function(d){
          return h - yScale(d.y) - 1.5 * margin
        })
        .append("title")
          .text(function(d) {return "Amount: " + d.y; });

  // adds axes
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + (2 * margin) + ",0)")
     .call(yAxis);
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (h - 1.5 * margin) + ")")
     .call(xAxis)
    .selectAll("text")
      .attr("transform", "rotate(6)")

   // adds axes labels
   svg.append("text")
      .attr("transform", "translate(" + (w/2) + "," + (h-5) + ")")
      .style("text-anchor", "middle")
      .text("Region");
   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (h/2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Amount of terrorist attacks");
}

function calenderParse(data) {
  // combines datapoints with the same date
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
  // calender based on https://beta.observablehq.com/@mbostock/d3-calendar-view

  // width, size of calender cells and height
  const w = 964;
  const cellSize = 17;
  const h = cellSize * 9;

  // nests data per year
  const years = d3.nest()
      .key(d => d[0].getFullYear())
    .entries(data)

  // initializes a svg
  let svg = d3.select("body")
            .append("svg")
            .attr("class", "calenderGraph")
            .attr("width", w)
            .attr("height", (h * years.length));

  // adds graphtitle to svg
  svg.append("text")
     .attr("transform", "translate(" + (w/2) + ", 12)")
     .attr("class", "graphTitle")
     .style("text-anchor", "middle")
     .text("Terrorism in North America");

  // initializes a group for every year
  let year = svg.selectAll("g")
          .data(years)
          .enter()
          .append("g")
          .attr("class", function(d) { return "year" + d.key; })
          .attr("transform", function(d, i) {
            return "translate(40, " + (h * i + 1.5 * cellSize) + ")";
          });

  // adds year title
  year.append("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text(function(d) { return d.key; });

  // adds legend for days
  year.append("g")
      .attr("text-anchor", "end")
    .selectAll("text")
    .data(d3.range(7).map(i => new Date(1995, 0, i)))
    .enter().append("text")
      .attr("x", -5)
      .attr("y", d => (d.getDay() + 0.8) * cellSize)
      .text(d => "SMTWTFS"[d.getDay()]);

  // adds cells to calender
  year.append("g")
    .attr("class", "rects")
    .selectAll("rect")
    .data(function(d) { return d.values})
    .enter().append("rect")
      .attr("class", "calenderBlock")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => d3.timeMonday.count(d3.timeYear(d[0]), d[0]) * cellSize + 0.5)
      .attr("y", d => d[0].getDay() * cellSize)
      .attr("fill", "darkred")
    .append("title")
      .text(function(d) { return "Terrorist attacks: " + d[1] + " Date: " + d[0].toLocaleDateString(); })
}

function calenderUpdate(data) {
  const cellSize = 17

  // removes previous cells from calender
  d3.selectAll("rect.calenderBlock").remove()

  // nests data per year
  const years = d3.nest()
      .key(d => d[0].getFullYear())
    .entries(data)

  // iterates over every year group
  for (key in years) {
    // replaces cells in calender
    d3.selectAll("g.year" + years[key].key)
        .selectAll("rect")
        .data(years[key].values)
        .enter().append("rect")
          .attr("class", "calenderBlock")
          .attr("width", cellSize - 1)
          .attr("height", cellSize - 1)
          .attr("x", d => d3.timeMonday.count(d3.timeYear(d[0]), d[0]) * cellSize + 0.5)
          .attr("y", d => d[0].getDay() * cellSize)
          .attr("fill", "darkred")
        .append("title")
          .text(function(d) { return "Terrorist attacks: " + d[1] + " Date: " + d[0].toLocaleDateString(); })

  }


}
