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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB3aWR0aCA9IDk2MDtcbnZhciBoZWlnaHQgPSAxMTIwO1xuXG5cbmQzLmpzb24oXCIuL2RhdGEvdGVzdF9wcmV0dHkuanNvblwiLCBmdW5jdGlvbihlcnJvciwgZGF0YSl7XG5cdHZhciB0aW1lU2VyaWVzID0gZGF0YS52YWx1ZS50aW1lU2VyaWVzO1xuXHRjb25zb2xlLmxvZyhkYXRhLnZhbHVlKTtcblx0Zm9yKHZhciBudW1iZXIgaW4gdGltZVNlcmllcyl7XG5cdFx0aWYodGltZVNlcmllc1tudW1iZXJdLnZhbHVlc1swXS52YWx1ZS5sZW5ndGggPiAwKXtcblx0XHRcdGNvbnNvbGUubG9nKFwidmFsdWU6IFwiICsgdGltZVNlcmllc1tudW1iZXJdLnZhbHVlc1swXS52YWx1ZVswXS52YWx1ZSArIFwiXFxuXCIgK1xuXHRcdFx0XCJkYXRlVGltZTogXCIgKyB0aW1lU2VyaWVzW251bWJlcl0udmFsdWVzWzBdLnZhbHVlWzBdLmRhdGVUaW1lICsgXCJcXG5cIiArXG5cdFx0XHRcIkxhdDogXCIgKyB0aW1lU2VyaWVzW251bWJlcl0uc291cmNlSW5mby5nZW9Mb2NhdGlvbi5nZW9nTG9jYXRpb24ubGF0aXR1ZGUgKyBcblx0XHRcdFwiTG9uZzogXCIgKyB0aW1lU2VyaWVzW251bWJlcl0uc291cmNlSW5mby5nZW9Mb2NhdGlvbi5nZW9nTG9jYXRpb24ubG9uZ2l0dWRlKVxuXHRcdH1cblx0fVxufSlcblxuXG52YXIgc3ZnID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdzdmcnKVxuXHQuYXR0cih7XG4gIFx0XHRcIndpZHRoXCI6IHdpZHRoLFxuICBcdFx0XCJoZWlnaHRcIjogaGVpZ2h0XG4gIFx0fSk7XG5cbnZhciBnID0gc3ZnLmFwcGVuZChcImdcIik7XG5cbnZhciBwYXRoID0gZDMuZ2VvLnBhdGgoKTtcblxuZDMuanNvbihcIi4vZGF0YS9IVUNfMTcudG9wby5qc29uXCIsIGZ1bmN0aW9uKGVycm9yLCB0b3BvbG9neSkge1xuXHRpZiAoZXJyb3IpIHJldHVybiBjb25zb2xlLmVycm9yKGVycm9yKTtcblx0Y29uc29sZS5sb2codG9wb2xvZ3kpO1xuXG5cdHZhciBmbG93bGluZXMgPSB0b3BvanNvbi5mZWF0dXJlKHRvcG9sb2d5LCB0b3BvbG9neS5vYmplY3RzLk5IREZsb3dsaW5lKTtcblx0dmFyIGJvdW5kcyA9IGQzLmdlby5ib3VuZHMoZmxvd2xpbmVzXHQpO1xuXHR2YXIgY2VudGVyWCA9IGQzLnN1bShib3VuZHMsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTt9KSAvIDIsXG5cdFx0Y2VudGVyWSA9IGQzLnN1bShib3VuZHMsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTt9KSAvIDI7XG5cblx0dmFyIHByb2plY3Rpb24gPSBkMy5nZW8uYWxiZXJzKClcblx0XHQuY2VudGVyKFtjZW50ZXJYLCBjZW50ZXJZXSlcblx0ICAgIC5zY2FsZSgxMTAwKVxuXG4gICAgcGF0aC5wcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuXG5cdHN2Zy5zZWxlY3RBbGwoJ3BhdGgnKVxuXHRcdFx0LmRhdGEoZmxvd2xpbmVzLmZlYXR1cmVzKTsgIFx0XG5cdFx0XHQuZW50ZXIoKS5hcHBlbmQoXCJwYXRoXCIpXG5cdFx0XHQuYXR0cihcImRcIiwgcGF0aCk7XG59KTtcblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9