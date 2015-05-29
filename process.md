5.16.15
====================================================
I think recording some notes on what I'm trying to do, and the issues I'm facing could be valuable for later reference. This is the first entry of a kind of work journal for the project. I started working on this stuff a few days ago, so this is going to mix together several days of struggling. The latest issue, that finally prompted me to start writing this stuff down, is that in trying to install QGIS with homebrew the install fails because it doesn't find the gdal library. Gdal is most definitely installed on my machine via homebrew, and is fully up to date. I attempted to isntall qgis via homebrew as well through the osgeo4mac tap, but it turns out that qgis also exists in the homebrew/science tap, which I installed to muck around with Python, and they're known to conflict over a pyqt error that I was getting. You just can't win.

Objective: Convert shapefile acquired from NHDPlus to topojson so I can start trying to render it in D3.
NHDPlus www.horizon-systems.com/nhdplus/NHDPlusV2_home.php

ISSUE #1
- trying to convert this file NationalWBDSnapshot.shp
- following Mike Bostock's, ["Let's Make a Map"](http://bost.ocks.org/mike/map/), tutorial for inspiration, specifically with regards to data conversion.
- Converting to GeoJSON using ogr2ogr took forever and produced a 4.8 **gigabyte** file.
- tried running topojson (filename)
- topojson can't accept json files over 1gb. Erroring out due to running out of process memory.
- see github issues [here](https://github.com/mbostock/topojson/issues/169) and [here](https://github.com/mbostock/topojson/issues/71)

	BRIANs-MacBook-Pro:NHDPlusNationalData_shapefile bwstud$ topojson NationalWBDSnapshot.shp
	FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - process out of memory
	Abort trap: 6
	BRIANs-MacBook-Pro:NHDPlusNationalData_shapefile bwstud$ 

- It seems that the thing to do is process the shapefile directly, as shapefiles support *streaming*, which I don't fully understand.
- In order to do so I'm supposed to use the command ``node --max_old_space_size=8192 `which topojson` …``
- I ran the above command with the filename in place of the ellipsis
	
	node --max_old_space_size=8192 `which topojson` NationalWBDSnapshot.shp

- And, interestingly, it started to work. I got bounds and a pre-quantization:

	BRIANs-MacBook-Pro:NHDPlusNationalData_shapefile bwstud$ node --max_old_space_size=8192 `which topojson` NationalWBDSnapshot.shp
	bounds: -160.24704101099996 17.67373597900007 -64.56519115299994 50.634716809000054 (spherical)
	pre-quantization: 10.6m (0.0000957°) 3.67m (0.0000330°)


- But I Still getting a memory error. Turns out the shapefile is rather large at 1.68gb
- This time the error is an invalid table size allocation, whatever that means

	BRIANs-MacBook-Pro:NHDPlusNationalData_shapefile bwstud$ node --max_old_space_size=8192 `which topojson` NationalWBDSnapshot.shp
	bounds: -160.24704101099996 17.67373597900007 -64.56519115299994 50.634716809000054 (spherical)
	pre-quantization: 10.6m (0.0000957°) 3.67m (0.0000330°)
	FATAL ERROR: invalid table size Allocation failed - process out of memory
	Abort trap: 6
	BRIANs-MacBook-Pro:NHDPlusNationalData_shapefile bwstud$ 


ISSUE #2
- So, on to the problem I'm dealing with now. I would like to view the shapefile in QGIS so I can see what I'm dealing with and think about how to break it up into manageable pieces. 
- When I try to install qgis it fails because gdal is not installed, even though it is. See fig 2.1 and 2.2.
- I figured I would just try to install qgis through homebrew. After some quick searching I came to this [osgeo tap](https://github.com/OSGeo/homebrew-osgeo4mac)
- I tapped their thing, but attempting to install returned no available formula now that I've untapped homebrew/science. fig 2.3
- I guess I'll try tapping osgeo again?

	brew tap osgeo/osgeo4mac

- Already tapped. I thought so. 
- there were two qgis things listed before the homebrew/science tap in that printout, qgis-26 and qgis-28. One of the most recent commits to the osgeo repo mentioned moving qgis-26 to the'boneyard' where old formula are retired. I ran brew install qgis-28 and it's working.
- The dependencies of qgis are numerous. This is taking a minute.
- Success. I was promted to symlink into /Applications and did so. fig 2.4
- There it is. fig 2.5
- Fails to open. 2.6
- Incomprehensible details. 2.7
- See issue [here](https://github.com/OSGeo/homebrew-osgeo4mac/issues/90)
- It's trying to open, but a new error, couldn't load 'processing'. fig 2.8
- Found an answer [here](http://scottdavey.net/article/Installing-GDAL-and-QGIS-on-OSX-Yosemite-231), I basically just needed to install some Python dependencies for reasons that remain unclear.
- And we're in. 2.9
- And it works. 2.10
- Booya.



5.18.15
====================================================
I've gotten the shapefiles I need from the NHDPlus. Instead of trying to download the whole thing, I've taken the snapshot and attributes file, which is what I saw was being acquire in the makefile of Bostock's U.S. Rivers project, for each of the 21 HUC's from [this url](http://www.horizon-systems.com/NHDPlus/NHDPlusV2_data.php). Topojson is working, no large file issues, no bogging down. Great. Geospatial data for the NHD layer is, at least in part, acquired. Additionally, there's a list of HUC subregions [here](http://water.usgs.gov/GIS/huc_name.html) another one [here](https://water.usgs.gov/GIS/wbd_huc8.pdf) and .gdb datasets for subregions [here](ftp://nhdftp.usgs.gov/DataSets/Staged/SubRegions/FileGDB/HighResolution/)(these can be converted to shapefiles or geojson with ogr2ogr or qgis).

I'm trying to get the streamflow data and it's proving more difficult. The data is available via a REST API, but the quantity of data that comes through with unfiltered requests is enormous. I'm going to have to build some kind of a backend, which I have no idea how to do. The data is for thousands of monitoring sites around the U.S. dating back to October 2007, and I need to strategize how to break it up. The country id divided into hydrologic units, which are assigned the severely apt Hydrologic Unit Codes 1-17. These, in turn, have subregions, which have subregions of their own and so on 6 layers deep. I may be able to manage the data more effectively by taking advantage of this structure.


Some reading on Vector Tiles:
https://github.com/NelsonMinar/vector-river-map
http://tilestache.org/
http://openstreetmap.us/~migurski/vector-datasource/
http://wiki.openstreetmap.org/wiki/Vector_tiles
https://github.com/mapbox/vector-tile-spec/wiki/Implementations
http://dimensionaledge.com/intro-vector-tiling-map-reduce-postgis/
https://nelsonslog.wordpress.com/2013/06/10/leaflet-geojson-vector-tiles/
http://mattmakesmaps.com/
https://github.com/SpatialServer/Leaflet.MapboxVectorTile
https://github.com/nrenner/leaflet-tilelayer-vector
http://bl.ocks.org/wboykinm/7393674
https://speakerdeck.com/hallahan/leaflet-vector-tiles
http://bl.ocks.org/nrenner/5635334
http://bl.ocks.org/svmatthews/6081504
https://www.mapbox.com/developers/vector-tiles/


5.20.15
====================================================
 Task Support
 - Compare volumes for a set of sites over time
 - Compare volumes for separate sites or sets of sites over time
 - Compare aggregate daily/monthly flow
 - Correlate streamflow to municipal spending on water infrastructure in a given time period
 - Examine streamflow during the period of effect of a given storm system
 - Examine seasonal patterns in streamflow
 - Surface anomylous sites in a local network
 -

Meeting w/Jeff Snyder 5.20.15
Data Savings by shortening string length
How can we confirm or reify peoples existing presumptions about streamflow data?
Interesting filters and subsetting?

5.21.15
====================================================
Tring to get data from the USGS water data portal to start evaluating. It's proving very challenging. There is a web data portal that seems like it's supposed to make accessing this data easier, but 


https://github.com/cpettitt/dagre/wiki
https://github.com/cpettitt/dagre-d3
http://bl.ocks.org/bobbydavid/5841683

http://jsonprettyprint.com/json-pretty-printer.php <<--- just saved me from losing my shit
http://jsonlint.com/
https://github.com/SublimeLinter/SublimeLinter-json
https://packagecontrol.io/packages/JSONLint

5.22.15
====================================================
Ok, I've at least gotten the data to parse and show up in the browser. It's only one HUC, for a period of record of 2 days...

It looks there are 363 discharge values in here(fig 3.0). That seems healthy. There's also an enormous quantity of data surrounding those figures(fig 3.1). How the **** do I get it out? That's tonight's task.

http://www.d3noob.org/2013/01/selecting-filtering-subset-of-objects.html
http://www.jeromecukier.net/blog/2012/05/28/manipulating-data-like-a-boss-with-d3/

It's taken me four hours to get to this point:

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		// for(var object in timeSeries){
		// 	console.log(object.getOwnPropertyNames());
		// }
		console.log(Object.keys(timeSeries))
	})

Now I can try to navigate this damn json file. Now I'm stuck. I can get three layers deep in the json with data.value.timeSeries, but to get to the next level I need to understand how to deal with keys that are all unique (fig3.2). I'm sure there's a way to use a loop to do this. Function(d) something?

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
http://stackoverflow.com/questions/7387303/jquery-templates-nested-json-unique-key-names

Yeeeesss! 
This post got me there. http://stackoverflow.com/questions/5113847/accessing-elements-of-json-object-without-knowing-the-key-names

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			console.log(number);
			console.log(timeSeries[number]);
		}
		console.log(Object.keys(timeSeries))
	})

That only took another hour...

Ok. Progress. With this code...

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			console.log(number);
			console.log(timeSeries[number].values[0].value[0].value);
			// console.log(Object.keys(timeSeries[number].values));
		}
	})

... I'm showing the list of values. Awesome. However, it appears that not all entities in the data actually have a value so the function stops after trying to read a property of an undefined. Sooo... Why did I get results from the USGS service that don't have the data I filtered for? Additionally, one of the values I do see is -99999, which is clearly wrong(fig 3.4).

http://stackoverflow.com/questions/5144491/better-way-to-determine-if-value-exists-in-json-feed
http://stackoverflow.com/questions/3021206/how-do-i-see-if-a-big-json-object-contains-a-value


So, this works (see fig 3.5): 

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			console.log(Object.keys(timeSeries[number].values[0]))
		}
	})

But this doesn't (fig 3.6):

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			console.log(Object.keys(timeSeries[number].values[0].value[0]))
		}
	})

Aha! This shows me the empty spots in the data (fig 3.7):

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			console.log(Object.keys(timeSeries[number].values[0].value))
		}
	})

Now... uh... what do I do about it? Check to make sure it's there?

Mother******! Read it and weep. LET THERE BE DATA:

	d3.json("./data/test_pretty.json", function(error, data){
		var timeSeries = data.value.timeSeries;
		for(var number in timeSeries){
			if(timeSeries[number].values[0].value.length > 0){
				console.log(timeSeries[number].values[0].value[0].value)
			}
		}
	})

(see fig3.8)

So this proves, in concept, that I can pull streamflow data from the USGS webservice, parse it, and render the actual streamflow value for a given site in the browser. I've been doing this with a test batch that covers, if I recall, just New England, and it's only daily summaries. And it's for a period of two days. So, that might mean I really only have half as many sites to work with as are shown here. And some of the values are negative. 

If I can sort all that out, figure out how to retrieve, store, parse and serve timeseries data for a period of several years, and correlate the values to their map coordinates, and figure out what these values actually _mean_ in terms of volume, and align the coordinates to flowlines from the NHDPlus dataset, and craft an appropriate visualization for them, I'll really be getting somewhere!

Oof.

First, coordinates.

I think I need to jump to a different web service for Lat/Long. I used the 'Daily Values' web service which doesn't offer coordinates, for some reason, for the sites it supports. There is a dedicated 'Site Service', but it doesn't offer JSON output. Instead, it outputs a legacy format called USGS RDB, which it says is tab-delimited. If it's tab delimited, I think D3 should still be able to use it?

Ok, I got a file with coordinates for all the sites in HUC 01(New England) from the Water Data for the Nation site (fig 3.9). http://waterdata.usgs.gov/nwis/inventory

Time to learn about TSV 
https://github.com/mbostock/d3/wiki/CSV#tsv
https://github.com/mbostock/d3/wiki/CSV

Uh-oh. Well, I guess it couldn't be easy, right? \

	d3.tsv("./data/test.tsv", function(error, tsv){
		if(error){console.error(error);}
		console.log(tsv);
	})

(see fig 3.10)

I see something about compliant formats:
http://tools.ietf.org/html/rfc4180

Maybe it would be easiest to convert to JSON?
https://github.com/RubenVerborgh/tsv-to-json
http://blaiprat.github.io/tsvToJson/
https://www.npmjs.com/package/tsv-to-json
http://thedatachef.blogspot.com/2011/01/convert-tsv-to-json-command-line.html

5.23.15
====================================================
Inventory time. The test_pretty json file weighs in at 3.3mb. I need 17 more of those files to complete the country. I can minify it, but I think I'll have to process the data somehow to get a set that I can render in the browser without freaking out. 

I need to map site names or numbers from the file with streamflow values, to coordinates from the other file. Holy shit. I just noticed this in the test_pretty.json.

	"geoLocation": {
	            "geogLocation": {
	              "srs": "EPSG:4326",
	              "latitude": 46.70055556,
	              "longitude": -69.7155556
	            },

I'm blind. Let's see if it's consistent through the data.

It's there for multiple sites in the console! (fig 3.11)
Let's see if I can print it out with the value + dateTime I had already.

awww yeahhh (fig 3.12). The code:

	timeSeries[number].sourceInfo.geoLocation.geogLocation

Money.


All together now.

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

That's a beautiful thing. (fig 3.13)

More coffee. Next task, I think, is to extract these values into a new file. I guess I need to learn Python now. Ideally, I want to pull time series data for every site across the US, for all values dating back to the beginning of the dataset in October of 2007. For reference, this test file was for two days. 

Also, how can I tell what rivers/streams these sites belong to? <-- _I just emailed the USGS guys about this one._

5.25.15
====================================================
Happy Memorial Day!
I had to work on another project yesterday, but I'm turning back to this.  I've gotta get this moving. I have exactly two weeks to finish this.

I've been working on a python script to extract the values I'm interested in (coordinates, site ID, streamflow), and spit them out in a new file. If I can do this on a test batch of data, I can set it up to process the whole timeseries and get a much more managable file. I've gotten the script to the point where it prints the relevant values. Now I need to figure out how to read those figures and write them to a file. Here is the script as it stands, which I've just been running from the Python interpreter in terminal. After some poking around on stackoverflow it seemed the consensus that for getting the data I should use the requests Python module which can be found [here](http://docs.python-requests.org/en/latest/). I'm using the USGS Instantaneous Values [web service](http://waterservices.usgs.gov/rest/IV-Test-Tool.html) as my data source. 

	
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
		print(number['values'][0]['value'][0]['value'])

It's doing pretty good. Gets through a portion of the request but then runs into a "list index out of range" error (fig 4.0). I was running in to something similar with the javascript function I wrote earlier, but there I could step through the data in the browser console. I don't know how to do that in Python. I'm going to try to build an if statement similar to the one I'm using in the javascript.

So, this, I think...

	for number in time_series:
	if(number['values'][0]['value'][0]['value']){
		print(number['values'][0]['value'][0]['value'])
	}

Invalid syntax. Right. Significant whitespace. Not curly brackets. 

Hmm. Still list index out of range. I need to try and step through each level of the json heirarchy and see what I can access. 

1. Dropping ['value'] from the end of the print call still gets the error.

	print(number['values'][0]['value'][0])

2. Dropping the [0] index also still results in the out of range error.

	print(number['values'][0]['value'])

Shit. The error was coming from the if statement, not the line I've been modifying. Read the error messages! (4.1) So, now I'm going back and redoing the tests having removed the if statement. The first test of, 'print(number['values'][0]['value'][0])', again returns the error. The second test of, 'print(number['values'][0]['value'])', runs through everything succesfully!

So the problem lies in trying to access a ['value'] object which is empty. I think I just need to modify that if statement from earlier. I also now realize that my previous if statement didn't actually have a length method or an evaluator. I feel sheepish. 

Success! This works.

	for number in time_series:
		if(len(number['values'][0]['value']) > 0):
			print(number['values'][0]['value'][0]['value'])

Let's get the other data to print out and give it labels. 

I'm so close. I can taste it. This...

	for number in time_series:
	if(len(number['values'][0]['value']) > 0):
		print('Site Name: ' + number['sourceInfo']['siteName'] + '\n'+ \
		'Name: ' + number['name'] + '\n' + \
		'Streamflow Value: ' + number['values'][0]['value'][0]['value']) + '\n' + \
		'Longitude: ' + number['sourceInfo']['geoLocation']['geogLocation']['longitude'] + '\n' + \
		'Latitude: ' + number['sourceInfo']['geoLocation']['geogLocation']['latitude']

...gives me the following error:

	Traceback (most recent call last):
		File "dowser.py", line 25, in <module>
			'Latitude: ' + number['sourceInfo']['geoLocation']['geogLocation']['latitude']
	TypeError: unsupported operand type(s) for +: 'NoneType' and 'str'

Figured it out. I had left the parentheses closing the print call at the end of the Streamflow Value argument. Moving it to the end solved that problem, but gave me this one: 

	Traceback (most recent call last):
	  File "dowser.py", line 25, in <module>
	    'Latitude: ' + number['sourceInfo']['geoLocation']['geogLocation']['latitude'])
	TypeError: Can't convert 'float' object to str implicitly

HA! EAT THAT, PYTHON! I mean, I guess I just learned how to use some its syntax, but our relationship right now feels very antagonistic. In any case, it's working. Almost. I'm reading the site name, the USGS name, the streamflow value and longitude/latitude. I needed to format the lat/long floats as strings to print them.

	for number in time_series:
	if(len(number['values'][0]['value']) > 0):
		print('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
		'Name: ' + number['name'] + '\n' + \
		'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
		'Longitude: '.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
		'Latitude: '.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']))

One problem. I don't actually see those values. Just their labels (4.2). Curious.

[http://www.python-course.eu/python3_formatted_output.php](http://www.python-course.eu/python3_formatted_output.php)

Haiooooo! We're in business (4.3). In the first couple of examples I saw I didn't pay attention to the { } placeholder (or format codes, I suppose). Here's the code:

	for number in time_series:
	if(len(number['values'][0]['value']) > 0):
		print('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
		'Name: ' + number['name'] + '\n' + \
		'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
		'Longitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
		'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']))

I've spent days on this, wandering through the desert, my throat parching in the bright white-hot heat of a thousand tutorials. I think I see a cool, quenching spring of data on the horizon. Still work to do. Time for coffee.

How do I retrieve the response, filter it, extracting only the values I've identified so far, and write those to a new file?
http://runnable.com/Uri5rHtisU8kAA5S/command-the-web-with-python-requests-for-tutorial-beginner-http-scrapping-and-json

After sifting through some less than straightforward information online I've attempted the following. 

	with open('data.json', 'wb') as output:
		for number in time_series:
			if(len(number['values'][0]['value']) > 0):
				output.write('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
				'Name: ' + number['name'] + '\n' + \
				'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
				'Longitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
				'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']))

I'm basically trying to replace the print function from earlier with .write() and wrapping the whole thing in a with open() block. I'm unclear as to what the first argument in with open should be, however. My first error is this: 
	
	Traceback (most recent call last):
	  File "dowser.py", line 25, in <module>
	    'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']))
	TypeError: 'str' does not support the buffer interface

This is tough.

http://stackoverflow.com/questions/26537592/python3-3-html-client-typeerror-str-does-not-support-the-buffer-interface
http://stackoverflow.com/questions/26945613/str-does-not-support-the-buffer-interface-python3-from-python2
http://stackoverflow.com/questions/25826610/typeerror-str-does-not-support-the-buffer-interface-in-3-4-1
http://stackoverflow.com/questions/5471158/typeerror-str-does-not-support-the-buffer-interface

Progress! Apparently the way strings are handled in Python3 requires that strings be cast as bytes. In Python 2.x literal strings were bytes, but in Python 3.x they're unicode, and need to be encoded. I patched together a couple stack answers and got here. The important bits are that I wrapped everything inside the write method inside a bytes() type-casting and added a second argument to ensure the encoding was UTF-8, because... uhh... someone on the internet said it was a good idea.

	with open('data.json', 'wb') as output:
		for number in time_series:
			if(len(number['values'][0]['value']) > 0):
				output.write(bytes('Site Name: ' + number['sourceInfo']['siteName'] + '\n' + \
				'Name: ' + number['name'] + '\n' + \
				'Streamflow Value: ' + number['values'][0]['value'][0]['value'] + '\n' + \
				'Longitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + '\n' + \
				'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']), 'UTF-8'))

And lo! data.json was written! (4.4)

It is not, however, valid JSON. I guess I need to add some step where the information is re-processed to constitute JSON.

https://docs.python.org/2/library/json.html
http://stackoverflow.com/questions/2835559/parsing-values-from-a-json-file-in-python
http://stackoverflow.com/questions/12309269/write-json-data-to-file-in-python
https://www.codementor.io/tips/4493721338/how-to-load-parse-json-file-in-python
http://docs.python-guide.org/en/latest/scenarios/json/
http://stackoverflow.com/questions/17043860/python-dump-dict-to-json-file

It could be that the .json() method of the requests module is converting the json response data to a dict, which is then being written as is. I'm going to try json.dumps to try and convert back. 

Well. That didn't even work a little.

	Traceback (most recent call last):
	  File "dowser.py", line 35, in <module>
	    'Latitude: {}'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']), 'UTF-8'))
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/__init__.py", line 230, in dumps
	    return _default_encoder.encode(obj)
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/encoder.py", line 192, in encode
	    chunks = self.iterencode(o, _one_shot=True)
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/encoder.py", line 250, in iterencode
	    return _iterencode(o, 0)
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/encoder.py", line 173, in default
	    raise TypeError(repr(o) + " is not JSON serializable")
	TypeError: b'Site Name: St. John River at Ninemile Bridge, Maine\nName: USGS:01010000:00060:00011\nStreamflow Value: 1190\nLongitude: -69.7155556\nLatitude: 46.70055556' is not JSON serializable

Maybe it's just formatting. Maybe I need to add the brackets and commas to my output to make the extracted values JSON serializable (a hard word to say).

Shit. The incoming data has commas in it.

	TypeError: b'{usgs_name: USGS:01010000:00060:00011, properties: {site_name: St. John River at Ninemile Bridge, Maine,streamflow: 1190,longitude: -69.7155556,latitude: 46.70055556}}' is not JSON serializable

How do I escape a character I don't have yet?

Ugh. I've tried a few things. Yes, formatting was a problem. I've added in double quotes throughout the code manually so that every resulting object is json. Removing the bytes() method allows json.dumps to run, but trying to stick that inside output.write() brings me right back to a type error where str does not support the buffer interface. I need to cast the latitude such that it can be, buffered? I guess? Also, why latitude and not longitude?

	with open('data.json', 'wb') as output:
		for number in time_series:
			if(len(number['values'][0]['value']) > 0):
				output.write(json.dumps('{"usgs_name": ' + '"' + number['name'] + '", "properties": {' + \
				'"site_name": ' + '"' + number['sourceInfo']['siteName'] + '",' + \
				'"streamflow": ' + '"' + number['values'][0]['value'][0]['value'] + '",' + \
				'"longitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + ',' + \
				'b"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}}', 'UTF-8'))

I separated the json.dumps and outpute.write methods from one another and I'm making progress. The json writes with all these extra \ characters, though. (4.5)

	with open('data.json', 'wb') as output:
		for number in time_series:
			if(len(number['values'][0]['value']) > 0):
				json_data = json.dumps('{"usgs_name": ' + '"' + number['name'] + '", "properties": {' + \
				'"site_name": ' + '"' + number['sourceInfo']['siteName'] + '",' + \
				'"streamflow": ' + '"' + number['values'][0]['value'][0]['value'] + '",' + \
				'"longitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + ',' + \
				'"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}}')
				output.write(bytes(json_data, 'UTF-8'))


I think I'm double encoding the json. 

I'm getting the data to come through. I couldn't get pritty printing to work and I don't want to invest much more time in it. I'm running the JSON through a validator (4.6) and it's found a problem with the way I was structuring the output. No commas between objects! No root object! I'll have to figure out how to assign unique ID's to different subsets of data down the road, probably as a factor of the time the data was collected, but for now I'm going to make it arbitrary.

	with open('data.json', 'wb') as output:
		for number in time_series:
			if(len(number['values'][0]['value']) > 0):
				json_data = bytes('{"usgs_name": ' + '"' + number['name'] + '", "properties": {' + \
				'"site_name": ' + '"' + number['sourceInfo']['siteName'] + '",' + \
				'"streamflow": ' + '"' + number['values'][0]['value'][0]['value'] + '",' + \
				'"longitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['longitude']) + ',' + \
				'"latitude": "{}"'.format(number['sourceInfo']['geoLocation']['geogLocation']['latitude']) + '}}', 'UTF-8')
				#pretty = pprint.pprint(json_data)
				output.write(json_data)

Oh my god. It's finally valid. It's not perfect. But it's valid. (4.7)
The for in loop leaves one extra comma in the json. I just need to add a counter of some kind to remove it. Other than that, I think it's lookin' good. Jesus. That was an endeavour. I'm putting this down for the night.


5.26.15
====================================================
From the infintely patient representatives of the USGS
http://help.waterdata.usgs.gov/faq/sites/do-station-numbers-have-any-particular-meaning
http://pubs.usgs.gov/wdr/WDR-WA-03-1/pdf/ADR_F.pdf
http://water.usgs.gov/osw/streamstats/index.html

5.27.15
====================================================
I'm gonna fix that comma real quick.
Done. Nice. Now I need to write it to the data directory. Stand by.
Boom.
OK. What's next? I should add the dateTime of the collected value and the HUC value. The guys at USGS have advised using HUC to determine wat waterbody a given site belongs to. 
https://water.usgs.gov/GIS/huc.html

What do I need to do? I need to:
- Demonstrate a mapping of the NHDPlus flowline data.
- Figure out how to pull multiple periods of record from the streamflow data in a form that's usable by my d3 code.
- Prototype the layout for the visualization.
- Figure out how to map either HUC values, or some other measure to the flowline data and render water bodies with their streamflow
- 


5.28.15
====================================================
http://en.wikipedia.org/wiki/North_American_Datum
http://en.wikipedia.org/wiki/Geodesy

NHDPlus 
Projection Information
All vector data in feature class format uses the following projection/coordinate system:
Projection GEOGRAPHIC
Datum NAD83
Zunits NO
Units DD
Spheroid GRS1980
Xshift 0.0000000000
Yshift 0.0000000000
All grid datasets (cat, fac, fdr, elev_cm, ext_fac, ext_fdr) for the conterminous U.S. are stored in
an Albers Equal-Area projection:
Projection ALBERS
Datum NAD83
Zunits 100 for elev_cm, otherwise “NO”
Units METERS
Spheroid GRS1980
Xshift 0.0000000000
Yshift 0.0000000000
Parameters
29 30 0.000 /* 1st standard parallel
45 30 0.000 /* 2nd standard parallel
-96 0 0.000 /* central meridian
23 0 0.000 /* latitude of projection’s origin
0.00000 /* false easting (meters)
0.00000 /* false northing (meters) 

I'm trying to render some of the flowline topojson in the browser so I can prototype layout and interactions. I keep getting stuck at the point of loading the data. There's something I don't understand about the syntax. The Let's Make a Map example from Mike Bostock uses the .datum() 

https://github.com/mbostock/d3/wiki/API-Reference
https://gist.github.com/hugolpz/824446bb2f9bc8cce607
https://github.com/mbostock/us-rivers
http://bost.ocks.org/mike/map/

http://water.usgs.gov/osw/streamstats/ssinfo1.html
http://streamstatsags.cr.usgs.gov/wa_ss/default.aspx?stabbr=wa&dt=1432798306262
https://water.usgs.gov/GIS/huc.html
http://pubs.usgs.gov/wsp/wsp2294/
http://water.usgs.gov/osw/streamstats/Ries-Navigation-Final.pdf


I'm not getting anywhere with this. I'm trying a new tack. Bostock's US Rivers map shows, very nearly, what I want to, and uses the same data. I'm reading the source for that project, particularly the topomerge. In the Let's Make a Map example the argument passed to .datum is the object uk.objects.subunits. The structure of my topojson is different and it's messing me up. I know, in principle, that I can just step through the json heirarchy to arrive at the appropriate object. In this case I'm trying to pass the object to .datum().

http://stackoverflow.com/questions/13728402/what-is-the-difference-d3-datum-vs-data
http://stackoverflow.com/questions/10086167/d3-how-to-deal-with-json-data-structures
https://github.com/mbostock/d3/wiki/Selections#datum

Aha. See below.

	"Unlike the selection.data method, this method does not compute a join (and thus does not compute enter and exit selections)."

and:

	"The datum method is useful for accessing HTML5 custom data attributes with D3. For example, given the following elements:"

So, in this case I want to append a, "path", for every... what? How is the data referring to the water bodies? And what is the path? Are we talking a polygon meant to represent an entire, distinct waterbody? A group of waterbodies? One edge of a section of a river's third tributary? Yikes. Here's a problem: I have the shapefile for HUC_17 (the PNW) converted to topojson. It would be great to view it's structure. Unfortunately, every time I open it it takes several minutes for Sublime to open the file, then crashes Sublime if I try to interact with it. Hm.

http://stackoverflow.com/questions/23533174/whats-the-difference-between-merge-mesh-and-mergearcs-mesharcs-in-topojson
http://en.wikipedia.org/wiki/Standard_streams
http://en.wikipedia.org/wiki/Topology

The topomerge file is written at a level of understanding that I don't have. It's requiring a node filereader, then creating a mesh using process.stdout.write. 

Then this, `if (mesh.length) process.stdout.write("[0]");`, which I don't get. Then, for every item in mesh, for ever line in this index of mesh, so long as 0 is less than its length, pull out the arc and write that to the json.

Then there's a reverse function for when index is less than 0, somehow. 

Then there's a function, 'absolute', which takes the argument, 'relative', and a function, 'relative', which takes the argument, 'absolute'.

Huh. I just typed node into the command line. Turns out node offers you a REPL. I guess I should have known that. 

https://nodejs.org/api/repl.html
https://github.com/mbostock/topojson/wiki/API-Reference#mesh
https://www.npmjs.com/package/stream-handbook

I can't work with this json file at all. I can't copy it into the browser, it kills the browser. It's actually not as big as I thought. It's only 42.1MB. That doesn't seem that big.

How can I get the damn flowlines to show up in the browser!

https://gist.github.com/mbostock/5557726
http://stackoverflow.com/questions/25062902/path-not-showing-in-d3-js-topojson-graph