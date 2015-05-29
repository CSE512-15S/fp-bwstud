var width = 960;
var height = 1120;


d3.json("./data/test_pretty.json", function(error, data){
	var timeSeries = data.value.timeSeries;
	console.log(data.value);
	for(var number in timeSeries){
		if(timeSeries[number].values[0].value.length > 0){
			console.log("value: " + timeSeries[number].values[0].value[0].value + "\n" +
			"dateTime: " + timeSeries[number].values[0].value[0].dateTime + "\n" +
			"Lat: " + timeSeries[number].sourceInfo.geoLocation.geogLocation.latitude + 
			"Long: " + timeSeries[number].sourceInfo.geoLocation.geogLocation.longitude)
		}
	}
})


var svg = d3.select('body').append('svg')
	.attr({
  		"width": width,
  		"height": height
  	});

var g = svg.append("g");

var path = d3.geo.path();

d3.json("./data/HUC_17.topo.json", function(error, topology) {
	if (error) return console.error(error);
	console.log(topology);

	var flowlines = topojson.feature(topology, topology.objects.NHDFlowline);
	var bounds = d3.geo.bounds(flowlines	);
	var centerX = d3.sum(bounds, function(d) {return d[0];}) / 2,
		centerY = d3.sum(bounds, function(d) {return d[1];}) / 2;

	var projection = d3.geo.albers()
		.center([centerX, centerY])
	    .scale(1100)

    path.projection(projection);

	svg.selectAll('path')
			.data(flowlines.features);  	
			.enter().append("path")
			.attr("d", path);
});

