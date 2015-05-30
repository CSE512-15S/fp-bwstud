var width = 960;
var height = 1120;

var svg = d3.select("body").append("svg")
	.attr("width", width)
    .attr("height", height);

var projection = d3.geo.albers()
	    .scale(1100);

var path = d3.geo.path().projection(projection);

d3.json("./data/HUC_17.topo.json", function(error, topology) {
	// if (error) return console.error(error);

	console.log(topology);

	svg.selectAll("path")
			.data(topojson.feature(topology, topology.objects.NHDFlowline).features)  	
			.enter()
			.append("path")
			.attr("d", path);

});



d3.json("./data/test_pretty.json", function(error, sites){
    var timeSeries = sites.value.timeSeries;
    svg.selectAll("circle")
    .data(function(){for(var entry in timeSeries){
            return timeSeries[entry].sourceInfo.siteName;
    }})
    .enter()
	.append("circle")
	.attr("cx", function(d, i){return 2 * i})
	.attr("cy", 100)
	.attr("text", function(d){return d});
    
});