var wLegend = 320,
    hLegend = 60;
var legend = d3.select("#legend")
    .append("svg:svg")
    .attr("width", wLegend)
    .attr("height", hLegend);

var upArrowPRI = {x1: 5, y1: 15, x2: 10, y2: 6, 
                  arrow:"url(#arrowRed)", color:PRIColor};
var downArrowPRI = {x1: 10, y1: 0, x2: 5, y2: 9, 
                  arrow:"url(#arrowRed)", color:PRIColor};
var upArrowPRD = {x1 : 5, y1 : 35, x2: 10, y2: 26, 
                    arrow:"url(#arrowYellow)", color:PRDColor};
var downArrowPRD = {x1 : 10, y1 : 20, x2: 5, y2: 29, 
                    arrow:"url(#arrowYellow)", color:PRDColor};
var upArrowPAN = {x1: 5, y1:54, x2: 10, y2:45, 
                    arrow:"url(#arrowBlue)", color:PANColor};
var downArrowPAN = {x1: 10, y1:40, x2:5, y2:49, 
                    arrow:"url(#arrowBlue)", color:PANColor};

var arrowsPRI = [upArrowPRI, downArrowPRD, downArrowPAN];
var arrowsPRD = [upArrowPRD, downArrowPRI, downArrowPAN];
var arrowsPAN = [upArrowPAN, downArrowPRI, downArrowPRD];
var arrowsBiggestLoser = [downArrowPRI, downArrowPRD, downArrowPAN];
var arrowsBiggestWinner = [upArrowPRI, upArrowPRD, upArrowPAN];

var legendPRI = ["PRI incrementó su porcentaje del voto",
                 "PRI perdió votos, el PRD ganó más votos",
                 "PRI perdió votos, el PAN ganó más votos"];
var legendPRD = ["PRD perdió votos, PRI ganó votos",
		 "PRD incrementó su porcentaje del voto",
                 "PRD perdió votos, el PAN ganó más votos"];
var legendPAN = ["PAN perdió votos, el PRI ganó más votos",
                 "PAN perdió votos, el PRD ganó más votos",
		 "PAN incrementó su porcentaje del voto"];
var legendBiggestLoser = ["El PRI perdió más votos",
                   "El PRD perdió más votos",
                   "El PAN perdió más votos"];
var legendBiggestWinner = ["El PRI incrementó más sus votos",
                    "El PRD incrementó más sus votos",
                    "El PAN incrementó más sus votos"];


var legendText = legendPRI;

var legendLines = legend.selectAll(".line-legend")
    .data(arrowsPRI)
    .enter().append("line")  
    .attr("index", function(d, i) { return "i" + i; })
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; })
    .attr("marker-end", function(d) {return d.arrow; })
    .style("stroke", function(d, i) {return d.color; })
    .style("stroke-width", "3px");

legend.selectAll("text")
    .data(legendText)
    .enter()
    .append("text")
    .style("font-family", "Verdana")
    .style("font-size", "13px")
    .style("color", "#ddd")
    .attr("x", 20)
    .attr("y", function(d, i) {return [11.5,31.5,51.5][i];}) 
    .text(function(d) { return d; });
