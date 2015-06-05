#libs
import requests
import json
import simplejson

# daily values request url, generated from USGS web services
#url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&&period=P3D&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"
url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&startDT=2015-01-01&endDT=2015-06-04&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"

# create request as json
r = requests.get(url)
# content = r.content
data = simplejson.loads(r.text)
# #deserialize so I can manipulate the data prior to writing it to a file
# data = r.json()

values = data['value']['timeSeries'][0]['values'][0]['value']
#reserialize the content and write it to 'data.json'
with open('newdata.json', 'w+') as f:
	for entry in values:
		f.write(entry['value'] + "\n")

	# for site_values in values:
	# 	for daily_value in site_values
	# 	f.write(str(entry['value']['value']))
