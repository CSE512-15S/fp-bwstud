
# Import libraries.
import requests
import json

# declare request url, generated from USGS web services
url='http://waterservices.usgs.gov/nwis/iv/?format=json&huc=01&period=P1D&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active'

# declare header for gzip compression
headers={'Accept-Encoding': 'gzip, compress'}

# create request as json
data = requests.get(url, headers=headers).json()

# access timeSeries
time_series = data['value']['timeSeries']


for number in time_series:
	if(len(number['values'][0]['value']) > 0):
		print('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
		'Name: ' + number['name'] + '\n' + \
		'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
		'Longitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
		'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']))
	

