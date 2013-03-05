//The election results in 2006 and 2012
//order [[2006, 2012]] [PRI, PRD, PAN]
var results = [[.2226,.3821],[.3531,.3159],[.3589, .2541]],
    w = 320,
    h = 200,
    topLabel = 20; //space for the years at the top of the slopechart

y = d3.scale.linear().domain([0, 1]).range([h-5 , 0 + topLabel]);
var vis = d3.select("#slopeGraph")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h);
			     
vis.append("svg:g").selectAll("text.label.axis")
    .data(["2006", "2012"]).enter().append("text")
    .attr("x", function(d, i) {return i == 0 ? 20 : 260;})
    .attr("y", 11) 
    .text(function(d) {return d})
    .style("stoke-color", "#aaa")
    .style("fill", "#aaa")
    .style("font-size", "13px");  

//The text at the left of the slopegraph
var slopeEndText = vis.append("svg:g");
//.attr("transform", "translate(0, 200)");
			    
        
			    
slopeEndText.selectAll('line.slope-line')
    .data(results).enter().append("line")
    .attr({
              class: 'slope-line',
              x1: function(d) { return 60;},
              x2: function(d) { return 250;},
              y1: function(d) { return y(d[0]);},
              y2: function(d) { return y(d[1]);}})
    .style('stroke', function(d, i) {return colorNum(i);});

slopeEndText.selectAll("text.label.start")
    .data(results).enter().append("text")
    .attr("x", 255)
    .attr("y", function(d) {return y(d[1])+5;})
    .text(function(d, i) {if(i == 0) return oneDigitPer(d[1]) + " PRI"; 
                          if(i == 1) return oneDigitPer(d[1]) + " PRD";
                          else return oneDigitPer(d[1]) + " PAN";});

//the text at the start of the slopegraph
var slopeStartText = vis.append("svg:g");
slopeStartText.selectAll("text")
    .data(results).enter().append("text")
    .attr("x", 0)
    .attr("y", function(d, i) {
              return y(d[0]) + 5 + detectCollision(d[0], true, results);})
    .attr("font-family", "Georgia")
    .text(function(d, i) {if(i == 0) return oneDigitPer(d[0]) + " PRI"; 
                          if(i == 1) return oneDigitPer(d[0]) + " PRD";
                          else return oneDigitPer(d[0]) + " PAN";});
           
//When the combo box changes, change the map
d3.select("select").on("change", function() {
			   var selection = this.value.toString();

			   legend.selectAll("text")
			       .data(window["legend" + selection]).transition(0)
			       .attr("x", 20)
			       .attr("y", function(d, i) {return [11.5,31.5,51.5][i];}) 
			       .text(function(d) { return d; });		   

			   legend.selectAll("line")
			       .data(window["arrows" + selection]).transition(0)
			       .attr("x1", function(d) { return d.x1; })
			       .attr("y1", function(d) { return d.y1; })
			       .attr("x2", function(d) { return d.x2; })
			       .attr("y2", function(d) { return d.y2; })
			       .attr("marker-end", function(d) {return d.arrow; })
			       .style("stroke", function(d, i) {return d.color; })
			       .style("stroke-width", "3px");

			   g.selectAll("line")
			       .data(data).transition(1000)			   
			       .attr("x2", function(d) { return d["EndLatLng" + selection][0]; })
			       .attr("y2", function(d) { return d["EndLatLng" + selection][1]; })
			       .style("stroke", function(d) {return color(d["color" + selection]);})
			   //.style("stroke-width", function(d) {return "1.5px";})
			       .attr("marker-end", function(d) {return getArrow(d["color" + selection]); });
});