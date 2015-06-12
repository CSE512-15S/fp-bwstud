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
url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&startDT=2015-01-01&endDT=2015-06-04&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"

# create request as json
r = requests.get(url)
# content = r.content
data = json.loads(r.text)
# #deserialize so I can manipulate the data prior to writing it to a file
# data = r.json()
new_json = [];

for row in data