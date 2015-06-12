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