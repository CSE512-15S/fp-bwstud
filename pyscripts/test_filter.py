#lib
import json

#open json file
with open('lildata.json', 'r+') as f:
	data = json.load(f)

	#declare time-series variable which gets us a two layers deep in the json response object
	timeSeries = data['value']['timeSeries']

	#extract the vlaues we care about, assigning them readable keys 

	for entry in timeSeries:
	    new_json = bytes('streamflow_ft3/s: ' + entry['values'][0]['value']['value'], 'UTF-8')
	    data.write(new_json)