/*
Koen Dielhoff, 11269693
This page holds the javascript script for scatter.html
*/

let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
let requests = [d3.json(womenInScience), d3.json(consConf)];

Promise.all(requests).then(function(response) {
    console.log(response[0]);
    console.log(response[1].dataSets[0].series);
    console.log(response[1].structure.dimensions.observation[0]);
    console.log(response[1].structure.dimensions.series);
}).catch(function(e){
    throw(e);
});
