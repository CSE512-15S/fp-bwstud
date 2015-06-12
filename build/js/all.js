var width = 960;
var height = 1120;

// mapboxgl.accessToken = 'pk.eyJ1IjoiYndzdHVkIiwiYSI6ImQ2ZTJlMTdjODMwNGJhZjlmOWM5MTY2NzZhYmY1YmIwIn0.fDkR66VlhLh5BHk6f1MeIA';
// var map = new mapboxgl.Map({
//     container: 'map',
//     center: [45.6199, -117.727],
//     zoom: 9,
//     style: 'https://www.mapbox.com/mapbox-gl-styles/styles/dark-v7.json',
//     hash: true
// });

L.mapbox.accessToken = 'pk.eyJ1IjoiYndzdHVkIiwiYSI6ImQ2ZTJlMTdjODMwNGJhZjlmOWM5MTY2NzZhYmY1YmIwIn0.fDkR66VlhLh5BHk6f1MeIA';
// L.mapbox.map('map-one', 'mapbox.streets').setView([45.6199, -117.727], 6);

// var map = L.map('map', {
// 	center: [45.6199, -117.727],
// 	zoom: 8
// });


mapboxgl.accessToken = 'pk.eyJ1IjoiYndzdHVkIiwiYSI6ImQ2ZTJlMTdjODMwNGJhZjlmOWM5MTY2NzZhYmY1YmIwIn0.fDkR66VlhLh5BHk6f1MeIA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'https://www.mapbox.com/mapbox-gl-styles/styles/dark-v7.json', //stylesheet location
  center: [45.6199, -117.727], // starting position
  zoom: 6 // starting zoom
});

var svg = d3.select("body").append("svg")
	.attr("width", width)
    .attr("height", height);

var projection = d3.geo.mercator()
    .scale(1600)
    .translate([4000, 1900]);

var path = d3.geo.path().projection(projection);

d3.csv("../../data/real_h17.csv", function(error, data){
	console.log(data);
	data.forEach(function(d){
		d.lng = +d.lng;
		d.lat = +d.lat;
	});

	var markers = svg.append('g')
		.attr('class', 'gage_site')
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', function(d){
			return projection([d.lng, d.lat])[0];
		})
		.attr('cy', function(d){
			return projection([d.lng, d.lat])[1];
		})
		.attr('r', 3);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHdpZHRoID0gOTYwO1xudmFyIGhlaWdodCA9IDExMjA7XG5cbi8vIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWW5kemRIVmtJaXdpWVNJNkltUTJaVEpsTVRkak9ETXdOR0poWmpsbU9XTTVNVFkyTnpaaFltWTFZbUl3SW4wLmZEa1I2NlZsaExoNUJIazZmMU1lSUEnO1xuLy8gdmFyIG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuLy8gICAgIGNvbnRhaW5lcjogJ21hcCcsXG4vLyAgICAgY2VudGVyOiBbNDUuNjE5OSwgLTExNy43MjddLFxuLy8gICAgIHpvb206IDksXG4vLyAgICAgc3R5bGU6ICdodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1zdHlsZXMvc3R5bGVzL2RhcmstdjcuanNvbicsXG4vLyAgICAgaGFzaDogdHJ1ZVxuLy8gfSk7XG5cbkwubWFwYm94LmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWW5kemRIVmtJaXdpWVNJNkltUTJaVEpsTVRkak9ETXdOR0poWmpsbU9XTTVNVFkyTnpaaFltWTFZbUl3SW4wLmZEa1I2NlZsaExoNUJIazZmMU1lSUEnO1xuLy8gTC5tYXBib3gubWFwKCdtYXAtb25lJywgJ21hcGJveC5zdHJlZXRzJykuc2V0VmlldyhbNDUuNjE5OSwgLTExNy43MjddLCA2KTtcblxuLy8gdmFyIG1hcCA9IEwubWFwKCdtYXAnLCB7XG4vLyBcdGNlbnRlcjogWzQ1LjYxOTksIC0xMTcuNzI3XSxcbi8vIFx0em9vbTogOFxuLy8gfSk7XG5cblxubWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2lZbmR6ZEhWa0lpd2lZU0k2SW1RMlpUSmxNVGRqT0RNd05HSmhaamxtT1dNNU1UWTJOelpoWW1ZMVltSXdJbjAuZkRrUjY2VmxoTGg1QkhrNmYxTWVJQSc7XG52YXIgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gIGNvbnRhaW5lcjogJ21hcCcsIC8vIGNvbnRhaW5lciBpZFxuICBzdHlsZTogJ2h0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlcy9zdHlsZXMvZGFyay12Ny5qc29uJywgLy9zdHlsZXNoZWV0IGxvY2F0aW9uXG4gIGNlbnRlcjogWzQ1LjYxOTksIC0xMTcuNzI3XSwgLy8gc3RhcnRpbmcgcG9zaXRpb25cbiAgem9vbTogNiAvLyBzdGFydGluZyB6b29tXG59KTtcblxudmFyIHN2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpXG5cdC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxudmFyIHByb2plY3Rpb24gPSBkMy5nZW8ubWVyY2F0b3IoKVxuICAgIC5zY2FsZSgxNjAwKVxuICAgIC50cmFuc2xhdGUoWzQwMDAsIDE5MDBdKTtcblxudmFyIHBhdGggPSBkMy5nZW8ucGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbmQzLmNzdihcIi4uLy4uL2RhdGEvcmVhbF9oMTcuY3N2XCIsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKXtcblx0Y29uc29sZS5sb2coZGF0YSk7XG5cdGRhdGEuZm9yRWFjaChmdW5jdGlvbihkKXtcblx0XHRkLmxuZyA9ICtkLmxuZztcblx0XHRkLmxhdCA9ICtkLmxhdDtcblx0fSk7XG5cblx0dmFyIG1hcmtlcnMgPSBzdmcuYXBwZW5kKCdnJylcblx0XHQuYXR0cignY2xhc3MnLCAnZ2FnZV9zaXRlJylcblx0XHQuc2VsZWN0QWxsKCdjaXJjbGUnKVxuXHRcdC5kYXRhKGRhdGEpXG5cdFx0LmVudGVyKClcblx0XHQuYXBwZW5kKCdjaXJjbGUnKVxuXHRcdC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpe1xuXHRcdFx0cmV0dXJuIHByb2plY3Rpb24oW2QubG5nLCBkLmxhdF0pWzBdO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ2N5JywgZnVuY3Rpb24oZCl7XG5cdFx0XHRyZXR1cm4gcHJvamVjdGlvbihbZC5sbmcsIGQubGF0XSlbMV07XG5cdFx0fSlcblx0XHQuYXR0cigncicsIDMpO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9