
# Import libraries.
import requests
import json
import pprint

# declare request url, generated from USGS web services
url='http://waterservices.usgs.gov/nwis/iv/?format=json&huc=01&period=P1D&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active'

# declare header for gzip compression
# headers={'Accept-Encoding': 'gzip, compress'}

# create parameters dict to pass to url
payload = {'indent': 'on'}

# create request as json
#data = requests.get(url, headers=headers, stream=True).json()
data = requests.get(url, params=payload, stream=True).json()

# access timeSeries
time_series = data['value']['timeSeries']

# with open('data.json', 'wb') as output:
# 	for number in time_series:
# 		if(len(number['values'][0]['value']) > 0):
# 			output.write(bytes('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
# 			'Name: ' + number['name'] + '\n' + \
# 			'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
# 			'Longitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
# 			'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']), 'UTF-8'))
	

with open('data.json', 'wb') as output:
# I need to write this with a root element.
	root = bytes('{"time_series": {', 'UTF-8')
	counter = 0
	for number in time_series:
		counter+=1
		
		if(len(number['values'][0]['value']) > 0): 
			json_data = bytes('"site": { "properties": { "usgs_name": ' + '"' + number['name'] + '",' + \
			'"site_name": ' + '"' + number['sourceInfo']['siteName'] + '",' + \
			'"streamflow": ' + '"' + number['values'][0]['value'][0]['value'] + '",' + \
			'"longitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + ',' + \
			'"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}},', 'UTF-8')
			#pretty = pprint.pprint(json_data)
			if(counter==1):
				output.write(root + json_data)
			else:
				output.write(json_data)
	output.write(bytes('}}', 'UTF-8'))