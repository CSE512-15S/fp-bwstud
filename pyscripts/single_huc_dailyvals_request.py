#libs
import requests
import json
import os

try:
    os.remove('newdata.json')
except OSError:
    pass

# daily values request url, generated from USGS web services
#url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&&period=P3D&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"
url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&startDT=2015-05-01&endDT=2015-05-07&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"

# create request as json
r = requests.get(url).json()
# content = r.content
# data = json.loads(r.text)
# #deserialize so I can manipulate the data prior to writing it to a file
# data = r.json()

timeSeries = r['value']['timeSeries']
counter = 0
#reserialize the content and write it to 'data.json'
with open('lildata.json', 'a+') as f:
	for site in timeSeries:
		if counter==0:
			json_data = '{'
		else:
			counter+=1
		json_data = json_data + '"sitecode": "{}"'.format(site['sourceInfo']['siteCode'][0]['value']) + ',' + \
		'"properties": { "usgs_name":  ' + '"' + site['sourceInfo']['siteName'] + '",' + \
		'"HUC": "{}"'.format(site['sourceInfo']['siteProperty'][1]['value']) + ',' + \
		'"lat": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['latitude']) + ',' + \
		'"long": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['longitude']) + \
		'}, "timeSeries": ['
		for chunk in site['values']:
			counter2 = 0
			for daily in chunk['value']:
				counter2+=1
				json_data = json_data + '{"streamflow": ' + '"' + daily['value'] + '",' + \
				'"dateTime": ' + '"' + daily['dateTime'] + '"'
				if counter2 < len(chunk['value']):
					json_data = json_data + '},'
				else:
					json_data = json_data +'}]'
		if counter < len(timeSeries):
			json_data = json_data + '},'
		else:
			json_data = json_data + '}'
		f.write(json_data)


