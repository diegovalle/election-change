var oneDigitPer = d3.format(".1%"); //format numbers as e.g. 59.1%
var comma = d3.format(",.0f");
var width = 1000,
    height = 650, munis,
    active, lines, data, winner = {PRI:new Array(2434), PRD:new Array(2434),  
				 PAN:new Array(2434)};

//A mercator projection centered in Mexico
var projection = d3.geo.mercator()
    .scale(11000)
    .center([-102.34034978813841, 26.012062015793]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    //.call(d3.behavior.zoom()
    //.on("zoom", redraw))
    ;

function redraw() {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}



svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset)
;


var g = svg.append("g");
var mun = svg.append("g");

var PRIColor  = "#E41A1C", PANColor = "#377EB8", PRDColor = "#FFFF33";
//The colors of Mexico's main parties
var color = function(col) {
    switch(col)
    {
    case "PRI":
	return "#E41A1C";
    case "PRD":
	return "#FFFF33";
    case "PAN": 
	return "#377EB8" ;
    }
};

//Useful from when the information comes in the form of an index
var colorNum = function(col) {
    switch(col)
    {
    case 0:
	return "#E41A1C";
    case 1:
	return "#FFFF33";
    case 2: 
	return "#377EB8" ;
    
    }
};

//the arrow's for each party have different css styles associated with them
var getArrow = function(party) {
    switch(party)
    {
    case "PAN": 
	return "url(#arrowBlue)" ;
    case "PRI":
	return "url(#arrowRed)";
    case "PRD":
	return "url(#arrowYellow)";
    }
}

//This is useful for the labels in the slope chart
//return how many pixels should the label be moved not to overlap
var detectCollision = function(d, start, results) {
    var offset = 0, 
        size = 9,  //the height of the label 
        idx; 
    
    start == true ? idx = 0 : idx = 1; //are we dealing with the left of right labels
    var resSort = [results[0][idx],results[1][idx],results[2][idx]].sort();
    //if the top label overlaps the middle one make it a little bit higher
    if (d == d3.max(resSort) && 
	Math.abs(y(d) - y(resSort[1])) < size )
	offset = -10;  
    //if the bottom label overlaps the middle one make it a little bit lower
    if (d == d3.min(resSort) && 
	Math.abs(y(d) - y(resSort[1])) < size )
	offset = 10;
    return(offset);     
}

//read the electoral data and a topojson of mexico's states
queue()
    .defer(d3.json, "maps/mx_tj.json") //map with states and municipalities combined
    .defer(d3.csv, "change.csv")
    .await(ready);


function ready(error, states, coords, muns) {
    
    //The angle of the arrow. The more it points to the North Pole, the smaller the gain
    //The more it points towards the South Pole, the smaller the loss
    var diffToAngle = function(value) {
	return value * 90 * Math.PI/180;
    };
    //End points of the end of the arrow
    //Calculate the length of the arrow on the map based on some
    //simple algebra and the percent change in vote
    var arrowLatLong = function(d, party) {
	var angle, party06 = party + "06", 
            diff = d[party] - d[party06], 
	    endLat, endLong, party2, party2a,
	    party3, party3a;
	if(party == "PAN") {
	    party3  = "PRI";
	    party3a = "PRI06";
	    party2  = "PRD";
	    party2a = "PRD06";
	}
	if(party == "PRD") {
	    party2  = "PAN";
	    party2a = "PAN06";
	    party3  = "PRI";
	    party3a = "PRI06";
	}
	if(party == "PRI") {
	    party2  = "PAN";
	    party2a = "PAN06";
	    party3  = "PRD";
	    party3a = "PRD06";
	}
	//Calculate the color of the arrow
	//If the current party gained votes the use that color
	//If the current party lost votes use the color of the party that
	//gained the most votes
	if(diff >= 0)
	    d["color" + party] = party;
	else if((d[party2] - d[party2a]) >= (d[party3] - d[party3a]))
	    d["color" + party] = party2;
	else
	    d["color" + party] = party3;
        //add 45 degrees to totally reverse direction
	diff < 0 ? angle = diffToAngle(diff) + 45 : angle = diffToAngle(diff);
	endLat = Number(d.Lat) + ((diff * 1.3) * Math.cos(angle));
	endLong = Number(d.Long) + ((diff * 1.3) * Math.sin(angle));
	
	
	d["EndLatLng" + party] = projection([endLong, endLat]);
	return d;
    };

    //The biggest winners and losers of the presidential election
    var biggestChange = function(d, dir) {
        var diffs = [d.PRI - d.PRI06, d.PRD - d.PRD06, d.PAN - d.PAN06];
	var fun, angle, endLat, endLong;;
	dir == "BiggestWinner" ? fun = d3.max : fun = d3.min; 
	var extreme = diffs.indexOf(fun(diffs));

	if (extreme == 0)
	    d["color" + dir] = "PRI" ;
	else if(extreme == 1)
	    d["color" + dir] = "PRD";
	else
	    d["color" + dir] = "PAN";
	dir == "BiggestWinner" ? angle = diffToAngle(diffs[extreme]) : angle = diffToAngle(diffs[extreme]) + 45 ;
	endLat = Number(d.Lat) + ((diffs[extreme] * 1.3) * Math.cos(angle));
	endLong = Number(d.Long) + ((diffs[extreme] * 1.3) * Math.sin(angle));
	d["EndLatLng" + dir] = projection([endLong, endLat]);
	return d;
    };

    //convert all the lat and longs to their projected values and add
    //the change data
    console.time('someFunction timer');
    coords.forEach(function(d, i) {
                       if(d.TOTAL_VOTOS !=0) {
			   d.PRI = d.PRI / d.TOTAL_VOTOS;
			   d.PRD = d.PRD / d.TOTAL_VOTOS;
			   d.PAN = d.PAN / d.TOTAL_VOTOS;
		       }
		       d.PRI06 = d.PRI06 / d.TOTAL_VOTOS06;
		       d.PRD06 = d.PRD06 / d.TOTAL_VOTOS06;
		       d.PAN06 = d.PAN06 / d.TOTAL_VOTOS06;
		       d.LatLng = projection([Number(d.Long), Number(d.Lat)]);
		       d = arrowLatLong(d, "PRI");
		       d = arrowLatLong(d, "PRD");
		       d = arrowLatLong(d, "PAN");
		       d = biggestChange(d, "BiggestWinner");
		       d = biggestChange(d, "BiggestLoser");
		       return d;		       
		   });
   
    data = coords;
    
    
    
    //draw Mexico's states
    g.selectAll("path")
	.data(topojson.object(states, states.objects.estados).geometries)
	.enter().append("path")
	.attr("d", path)
	.attr("class", "feature")
	.on("click", click);
        
    // g.append("path")
    // 	.datum(topojson.mesh(states, states.objects.estados, function(a, b) { return a !== b; }))
    // 	.attr("class", "mesh")
    // 	.attr("d", path);
    
    //all the municipalities
    munis = topojson.object(states, states.objects.municipios).geometries;
    
    var positions = [];

    data.forEach(function(d) {
		     positions.push([d.LatLng[0], d.LatLng[1]]);
		 });



    console.timeEnd('someFunction timer');
    //draw a municipality
    g.append("path")
	.datum([munis[1]])
	.attr("id", "municipality")
	.attr("d", path)
	.attr("class", "feature")
	//.style("stroke-width", ".3px")
	.style("stroke-dasharray", "5, 1")
	.on("click", click).style("stroke", "#999").style("fill", "transparent");

    //Draw the arrow marking wether a party lost or gained votes in each municipio
    
    //the marker at the end of each arrow
    var marker = g.selectAll(".line")
	.data(["arrowRed", "arrowYellow", "arrowBlue"])
        .enter()
        .append("marker")
	.attr("id", function(d) {return d;})
	.attr("viewBox", "0 0 10 10")
	.attr("refX", 1)
	.attr("refY", 5)
	.attr("markerWidth", 3)
	.attr("markerHeight", 3)
	.attr("orient", "auto")
	.append("path")
	.attr("d", "M 0 0 L 10 5 L 0 10 z");
    
    //the lines for each municipality
    lines = g.selectAll(".line")
	.data(coords)
	.enter().append("line");  
     
     
    lines.attr("index", function(d, i) { return "i" + i; })
	.attr("x1", function(d) { return d.LatLng[0]; })
	.attr("y1", function(d) { return d.LatLng[1]; })
	.attr("x2", function(d) { return d.EndLatLngPRI[0]; })
	.attr("y2", function(d) { return d.EndLatLngPRI[1]; })
	.style("stroke", function(d) {return color(d.colorPRI);})
	.style("stroke-width", function(d) {return "1.5px";})
	.attr("marker-end", function(d) {return getArrow(d.colorPRI); })
	.on("mouseover", function(d, i) {
		
		//draw the outline of municipalities when hovering over
		//the arrows. The topojson has the municipalities sorted
		//in the same order as the change.csv file so we just
		//index the municipality with no need for searching
		console.time('municipality timer');
		g.selectAll("#municipality")
		    .data([munis[d.num]])
		    .transition().duration(0)
		    .attr("d", path);
		console.timeEnd('municipality timer');		

                //change the title of the chart the current municipality
		d3.select("#title").text(d.name);
		d3.select("#total2012").text(comma(d.TOTAL_VOTOS));
		d3.select("#total2006").text(comma(d.TOTAL_VOTOS06));
                //the percentage of the vote each party received
		results = [[d.PRI06, d.PRI],[d.PRD06, d.PRD],[d.PAN06, d.PAN]];
                //On mouseover we have to change the slopegraph
		slopeEndText.selectAll('line.slope-line')
		    .data(results)
		    .transition()
		    .duration(400)
		    .attr({
			      x1: function(d) {return 60;},
			      x2: function(d) { return 250;},
			      y1: function(d) { return y(d[0]);},
			      y2: function(d) { return y(d[1]);}})
		    .style('stroke', function(d, i) {return colorNum(i);});
		
                //the labels for the slopegraph
		slopeEndText.selectAll("text")
                    .data(results).transition().duration(400)
		    .attr("x", 255)
		    .attr("y", function(d) {return y(d[1])+ 5 + detectCollision(d[1], false, results);})
		    .text(function(d, i) {if(i == 0) return oneDigitPer(d[1]) + " PRI"; 
					  else if(i == 1) return oneDigitPer(d[1]) + " PRD";
					  else return oneDigitPer(d[1]) + " PAN";});
                
		slopeStartText.selectAll("text")
                    .data(results).transition().duration(400)
		    .attr("x", 0)
		    .attr("y", function(d) { return y(d[0])+ 5 + detectCollision(d[0], true, results);})
		    .text(function(d, i) {if(i == 0) return oneDigitPer(d[0]) + " PRI"; 
					  else if(i == 1) return oneDigitPer(d[0]) + " PRD";
					  else return oneDigitPer(d[0]) + " PAN";});
	
	    });
    
};


//Zoom in on the map
/**
           Code borrowed from https://gist.github.com/mbostock/4699541
**/
function click(d) {
    
    if (active === d) return reset();
    g.selectAll(".active").classed("active", false);
    d3.select(this).classed("active", active = d);
    
    var b = path.bounds(d);
    
    g.selectAll("line").style("stroke-width", String(Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height)*5));

    g.transition()
    .duration(1000)
    .attr("transform",
	  "translate(" + projection.translate() + ")"
	  + "scale(" +  .68 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
	  //+ "translate(" + 0+ "," + 0 + ")");
	  + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1] ) / 2+ ")");  
};

function reset() {
    g.selectAll(".active").classed("active", active = false);
    g.transition().duration(1000).attr("transform", "");
    var lines = g.selectAll("line").style("stroke-width","1.5px");
}



