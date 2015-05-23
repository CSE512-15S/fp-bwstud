var data;

var width = 1200;
var height = 800;

var svg = d3.select("body").append("svg")
		.attr({
			"width": width,
			"height": height,
		})
		.style({
			"background": "#262626"
		})



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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBkYXRhO1xuXG52YXIgd2lkdGggPSAxMjAwO1xudmFyIGhlaWdodCA9IDgwMDtcblxudmFyIHN2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpXG5cdFx0LmF0dHIoe1xuXHRcdFx0XCJ3aWR0aFwiOiB3aWR0aCxcblx0XHRcdFwiaGVpZ2h0XCI6IGhlaWdodCxcblx0XHR9KVxuXHRcdC5zdHlsZSh7XG5cdFx0XHRcImJhY2tncm91bmRcIjogXCIjMjYyNjI2XCJcblx0XHR9KVxuXG5cblxuZDMuanNvbihcIi4vZGF0YS90ZXN0X3ByZXR0eS5qc29uXCIsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKXtcblx0dmFyIHRpbWVTZXJpZXMgPSBkYXRhLnZhbHVlLnRpbWVTZXJpZXM7XG5cdGNvbnNvbGUubG9nKGRhdGEudmFsdWUpO1xuXHRmb3IodmFyIG51bWJlciBpbiB0aW1lU2VyaWVzKXtcblx0XHRpZih0aW1lU2VyaWVzW251bWJlcl0udmFsdWVzWzBdLnZhbHVlLmxlbmd0aCA+IDApe1xuXHRcdFx0Y29uc29sZS5sb2coXCJ2YWx1ZTogXCIgKyB0aW1lU2VyaWVzW251bWJlcl0udmFsdWVzWzBdLnZhbHVlWzBdLnZhbHVlICsgXCJcXG5cIiArXG5cdFx0XHRcImRhdGVUaW1lOiBcIiArIHRpbWVTZXJpZXNbbnVtYmVyXS52YWx1ZXNbMF0udmFsdWVbMF0uZGF0ZVRpbWUgKyBcIlxcblwiICtcblx0XHRcdFwiTGF0OiBcIiArIHRpbWVTZXJpZXNbbnVtYmVyXS5zb3VyY2VJbmZvLmdlb0xvY2F0aW9uLmdlb2dMb2NhdGlvbi5sYXRpdHVkZSArIFxuXHRcdFx0XCJMb25nOiBcIiArIHRpbWVTZXJpZXNbbnVtYmVyXS5zb3VyY2VJbmZvLmdlb0xvY2F0aW9uLmdlb2dMb2NhdGlvbi5sb25naXR1ZGUpXG5cdFx0fVxuXHR9XG59KVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9