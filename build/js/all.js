var width = 960;
var height = 1120;

var map = new mapboxgl.Map({
    container: 'map',
    center: [37.772537, -122.420679],
    zoom: 13,
    style: style_object,
    hash: true
});

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
	.attr("cx", function(d, i){return 2 * i;})
	.attr("cy", 100)
	.attr("text", function(d){
		return d;
		}	
	);
    
});	
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHdpZHRoID0gOTYwO1xudmFyIGhlaWdodCA9IDExMjA7XG5cbnZhciBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICBjb250YWluZXI6ICdtYXAnLFxuICAgIGNlbnRlcjogWzM3Ljc3MjUzNywgLTEyMi40MjA2NzldLFxuICAgIHpvb206IDEzLFxuICAgIHN0eWxlOiBzdHlsZV9vYmplY3QsXG4gICAgaGFzaDogdHJ1ZVxufSk7XG5cbnZhciBzdmcgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcInN2Z1wiKVxuXHQuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cbnZhciBwcm9qZWN0aW9uID0gZDMuZ2VvLmFsYmVycygpXG5cdCAgICAuc2NhbGUoMTEwMCk7XG5cbnZhciBwYXRoID0gZDMuZ2VvLnBhdGgoKS5wcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuXG5kMy5qc29uKFwiLi9kYXRhL0hVQ18xNy50b3BvLmpzb25cIiwgZnVuY3Rpb24oZXJyb3IsIHRvcG9sb2d5KSB7XG5cdC8vIGlmIChlcnJvcikgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuXG5cdGNvbnNvbGUubG9nKHRvcG9sb2d5KTtcblxuXHRzdmcuc2VsZWN0QWxsKFwicGF0aFwiKVxuXHRcdFx0LmRhdGEodG9wb2pzb24uZmVhdHVyZSh0b3BvbG9neSwgdG9wb2xvZ3kub2JqZWN0cy5OSERGbG93bGluZSkuZmVhdHVyZXMpICBcdFxuXHRcdFx0LmVudGVyKClcblx0XHRcdC5hcHBlbmQoXCJwYXRoXCIpXG5cdFx0XHQuYXR0cihcImRcIiwgcGF0aCk7XG5cbn0pO1xuXG5cblxuZDMuanNvbihcIi4vZGF0YS90ZXN0X3ByZXR0eS5qc29uXCIsIGZ1bmN0aW9uKGVycm9yLCBzaXRlcyl7XG4gICAgdmFyIHRpbWVTZXJpZXMgPSBzaXRlcy52YWx1ZS50aW1lU2VyaWVzO1xuICAgIHN2Zy5zZWxlY3RBbGwoXCJjaXJjbGVcIilcbiAgICAuZGF0YShmdW5jdGlvbigpe2Zvcih2YXIgZW50cnkgaW4gdGltZVNlcmllcyl7XG4gICAgICAgICAgICByZXR1cm4gdGltZVNlcmllc1tlbnRyeV0uc291cmNlSW5mby5zaXRlTmFtZTtcbiAgICB9fSlcbiAgICAuZW50ZXIoKVxuXHQuYXBwZW5kKFwiY2lyY2xlXCIpXG5cdC5hdHRyKFwiY3hcIiwgZnVuY3Rpb24oZCwgaSl7cmV0dXJuIDIgKiBpO30pXG5cdC5hdHRyKFwiY3lcIiwgMTAwKVxuXHQuYXR0cihcInRleHRcIiwgZnVuY3Rpb24oZCl7XG5cdFx0cmV0dXJuIGQ7XG5cdFx0fVx0XG5cdCk7XG4gICAgXG59KTtcdCJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==