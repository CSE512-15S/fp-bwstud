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
