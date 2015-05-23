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
	for(var number in timeSeries){
		if(timeSeries[number].values[0].value.length > 0){
			console.log("value: " + timeSeries[number].values[0].value[0].value + "\n","dateTime: " + timeSeries[number].values[0].value[0].dateTime)
		}
	}
})

		// console.log(number);
		// var value_array = timeSeries[number].values[0].value[0];
		// if (value_array.hasOwnProperty("value"){
			// console.log(timeSeries[number].values[0].value[0].value)
		// }
		// console.log(timeSeries[number].values[0].value[0])

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBkYXRhO1xuXG52YXIgd2lkdGggPSAxMjAwO1xudmFyIGhlaWdodCA9IDgwMDtcblxudmFyIHN2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpXG5cdFx0LmF0dHIoe1xuXHRcdFx0XCJ3aWR0aFwiOiB3aWR0aCxcblx0XHRcdFwiaGVpZ2h0XCI6IGhlaWdodCxcblx0XHR9KVxuXHRcdC5zdHlsZSh7XG5cdFx0XHRcImJhY2tncm91bmRcIjogXCIjMjYyNjI2XCJcblx0XHR9KVxuXG5cblxuZDMuanNvbihcIi4vZGF0YS90ZXN0X3ByZXR0eS5qc29uXCIsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKXtcblx0dmFyIHRpbWVTZXJpZXMgPSBkYXRhLnZhbHVlLnRpbWVTZXJpZXM7XG5cdGZvcih2YXIgbnVtYmVyIGluIHRpbWVTZXJpZXMpe1xuXHRcdGlmKHRpbWVTZXJpZXNbbnVtYmVyXS52YWx1ZXNbMF0udmFsdWUubGVuZ3RoID4gMCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcInZhbHVlOiBcIiArIHRpbWVTZXJpZXNbbnVtYmVyXS52YWx1ZXNbMF0udmFsdWVbMF0udmFsdWUgKyBcIlxcblwiLFwiZGF0ZVRpbWU6IFwiICsgdGltZVNlcmllc1tudW1iZXJdLnZhbHVlc1swXS52YWx1ZVswXS5kYXRlVGltZSlcblx0XHR9XG5cdH1cbn0pXG5cblx0XHQvLyBjb25zb2xlLmxvZyhudW1iZXIpO1xuXHRcdC8vIHZhciB2YWx1ZV9hcnJheSA9IHRpbWVTZXJpZXNbbnVtYmVyXS52YWx1ZXNbMF0udmFsdWVbMF07XG5cdFx0Ly8gaWYgKHZhbHVlX2FycmF5Lmhhc093blByb3BlcnR5KFwidmFsdWVcIil7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aW1lU2VyaWVzW251bWJlcl0udmFsdWVzWzBdLnZhbHVlWzBdLnZhbHVlKVxuXHRcdC8vIH1cblx0XHQvLyBjb25zb2xlLmxvZyh0aW1lU2VyaWVzW251bWJlcl0udmFsdWVzWzBdLnZhbHVlWzBdKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9