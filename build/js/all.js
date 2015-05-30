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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgd2lkdGggPSA5NjA7XG52YXIgaGVpZ2h0ID0gMTEyMDtcblxudmFyIHN2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpXG5cdC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxudmFyIHByb2plY3Rpb24gPSBkMy5nZW8uYWxiZXJzKClcblx0ICAgIC5zY2FsZSgxMTAwKTtcblxudmFyIHBhdGggPSBkMy5nZW8ucGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbmQzLmpzb24oXCIuL2RhdGEvSFVDXzE3LnRvcG8uanNvblwiLCBmdW5jdGlvbihlcnJvciwgdG9wb2xvZ3kpIHtcblx0Ly8gaWYgKGVycm9yKSByZXR1cm4gY29uc29sZS5lcnJvcihlcnJvcik7XG5cblx0Y29uc29sZS5sb2codG9wb2xvZ3kpO1xuXG5cdHN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpXG5cdFx0XHQuZGF0YSh0b3BvanNvbi5mZWF0dXJlKHRvcG9sb2d5LCB0b3BvbG9neS5vYmplY3RzLk5IREZsb3dsaW5lKS5mZWF0dXJlcykgIFx0XG5cdFx0XHQuZW50ZXIoKVxuXHRcdFx0LmFwcGVuZChcInBhdGhcIilcblx0XHRcdC5hdHRyKFwiZFwiLCBwYXRoKTtcblxufSk7XG5cblxuXG5kMy5qc29uKFwiLi9kYXRhL3Rlc3RfcHJldHR5Lmpzb25cIiwgZnVuY3Rpb24oZXJyb3IsIHNpdGVzKXtcbiAgICB2YXIgdGltZVNlcmllcyA9IHNpdGVzLnZhbHVlLnRpbWVTZXJpZXM7XG4gICAgc3ZnLnNlbGVjdEFsbChcImNpcmNsZVwiKVxuICAgIC5kYXRhKGZ1bmN0aW9uKCl7Zm9yKHZhciBlbnRyeSBpbiB0aW1lU2VyaWVzKXtcbiAgICAgICAgICAgIHJldHVybiB0aW1lU2VyaWVzW2VudHJ5XS5zb3VyY2VJbmZvLnNpdGVOYW1lO1xuICAgIH19KVxuICAgIC5lbnRlcigpXG5cdC5hcHBlbmQoXCJjaXJjbGVcIilcblx0LmF0dHIoXCJjeFwiLCBmdW5jdGlvbihkLCBpKXtyZXR1cm4gMiAqIGl9KVxuXHQuYXR0cihcImN5XCIsIDEwMClcblx0LmF0dHIoXCJ0ZXh0XCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkfSk7XG4gICAgXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=