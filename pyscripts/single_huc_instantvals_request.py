# Import libraries.
import requests
import json
import pprint

# declare request url, generated from USGS web services
url='http://waterservices.usgs.gov/nwis/iv/?format=json&huc=01&period=P3D&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active'

# declare header for gzip compression
# headers={'Accept-Encoding': 'gzip, compress'}

# create parameters dict to pass to url
payload = {'indent': 'on'}

# create request as json
#data = requests.get(url, headers=headers, stream=True).json()
data = requests.get(url, params=payload, stream=True).json()

# access timeSeries
time_series = data['value']['timeSeries']
	
# using open, create a file called data.json which we'll refer to as "output" in the code below
with open('data/data.json', 'wb') as output:
	# create a single root element.
	root = bytes('{"time_series": {', 'UTF-8')
# create counter. this is used to add the 'root' element during the first write, and to get rid of an extra comma after latitude in the final iteration.
	counter = 0
# for every object in the time series
	for number in time_series:
		counter+=1
# if the site has recorded values
		if(len(number['values'][0]['value']) > 0): 
# pull out the data we want
			json_data = bytes('"site": { "properties": { "usgs_name": ' + '"' + number['name'] + '",' + \
			'"site_name": ' + '"' + number['sourceInfo']['siteName'] + '",' + \
			'"huc": "{}"'.format(number['sourceInfo']['siteCode'][0]['value']) + ',' + \
			'"streamflow": ' + '"' + number['values'][0]['value'][0]['value'] + '",' + \
			'"dateTime": ' + '"' + number['values'][0]['value'][0]['dateTime'] + '",' + \
			'"longitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + ',', 'UTF-8')
			
			if counter < len(time_series) :
				json_data = json_data + bytes('"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}},', 'UTF-8')
			else:
				json_data = json_data + bytes('"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}}', 'UTF-8')
# if it's the first iteration, prepend the 'root' of the json heirarchy		
			if(counter==1):
				output.write(root + json_data)
			else:
				output.write(json_data)
# close the json object				
	output.write(bytes('}}', 'UTF-8'))