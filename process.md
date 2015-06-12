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
https://github.com/mbostock/d3/wiki/Geo-Paths

5.29.15
====================================================
Fuck. I was working this morning and browser-sync kept disconnecting. I tried to fiddle with a few things and now I've butchered my gulpfile, app.js, and index.html. Salvage mode, engage.

Everything is back the way it was, but every time I reload the page it crashes after a few seconds. See fig 5.0. Not good.

Now I'm getting two errors.

	Failed to load resource: the server responded with a status of 404 (Not Found)

and

	Error: getTranslators: detection is already running at chrome-extension://ekhagklcjbdpajgpjgmbionohlpdbjgc/zotero/translation/translate.js:1023

I disabled the Zotero extension. It's an open source helper which allows you to save references and citations as you collect research. I doubt it's actually at fault here, but just in case. 

I reran gulp and, as expected, the Zotero error is gone, but I'm still failing to load the browser-sync-client. Wierd.

My package.json requires version 2.7.6:

	"devDependencies": {
	    "browser-sync": "^2.7.6",
	    "gulp": "^3.8.11",
	    "gulp-autoprefixer": "^2.3.0",
	    "gulp-concat": "^2.5.2",
	    "gulp-minify-css": "^1.1.1",
	    "gulp-plumber": "^1.0.1",
	    "gulp-rename": "^1.2.2",
	    "gulp-sass": "^2.0.1",
	    "gulp-sourcemaps": "^1.5.2",
	    "gulp-uglify": "^1.2.0",
	    "gulp-watch": "^4.2.4"
	  }

But running browser-sync --version returns 2.7.1, and the error message I'm getting shows Chrome looking for 2.7.3

I'm going to remove the node_modules directory entirely and reinstall everything.

Also, I'm not sure if it's related, but there's a wierd delay when I switch to the browser window and try to open the Chrome inspector with alt+command+i. It's usually immediate. 

OOOOOookkk. I had to clear my browser cache because it had stored the HTML calling for the old version. That was dumb.

And, the browser page is crashing again... :(

I've commented out this portion of my d3.json code and the page seems to stay alive.

	// var flowlines = topojson.feature(topology, topology.objects.NHDFlowline).features;
	// var bounds = d3.geo.bounds(flowlines);
	// var centerX = d3.sum(bounds, function(d) {return d[0];}) / 2,
	// 	centerY = d3.sum(bounds, function(d) {return d[1];}) / 2;

Here's the question now. Why, if I'm running this code, is there no svg element in my elements panel on the page?
	
	var svg = d3.select('body').append('svg')
		.attr("width", width)
	    .attr("height", height);

	 var projection = d3.geo.albers()
		// .center([centerX, centerY])
	    .scale(1100);

	var path = d3.geo.path().projection(projection);   

    d3.json("./data/HUC_17.topo.json", function(error, topology) {
		if (error) return console.error(error);
		console.log(topology);

		svg.selectAll("path")
			.data(topojson.feature(topology, topology.objects.NHDFlowline).features)  	
			.enter()
			.append("path")
			.attr("d", path);

	});


I'm not finding anything to help me here...
I look in the inspector and no SVG. I can manually add an SVG from the console. wtf.

So, on a hunch I built a test page without any of the build process stuff. No Gulp. No Browser-Sync. Just an html file with a script at the bottom of the body tag:

	var width = 960;
    var height = 1120;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.albers()
            .scale(1100);

    var path = d3.geo.path().projection(projection);

    d3.json("./data/HUC_17.topo.json", function(error, topology) {
        console.log(topology);

        svg.selectAll("path")
                .data(topojson.feature(topology, topology.objects.NHDFlowline).features)    
                .enter()
                .append("path")
                .attr("d", path);

    });

And I'll be damned but the thing actually showed up. There's something about using the build that messes up my work. For the time being I suppose I'm just going to go without the build. I am, however, now facing the problem of brower crashing again. After rendering for a few seconds it kills the page. I think it might be because of the size of what I'm trying to render? No, it's because I'm still trying to access this through browser-sync which is still running on the other page. Shutting it down and switching to simple python server.

Ok! Confirmed. It's not browser-sync's fault. It's still happening.

https://github.com/mapbox/mapbox-gl-js/issues/844

Best guess is that it's a simple fact of the file being too big. I'm not sure what to do. I'm going to go eat something.
https://mangomap.com/
There's some interesting stuff out there around WebGL. Do I have time to try to figure this out? Furthermore, I know that D3 can animate the time dimension of my data. Who knows how that would be done with WebGL.
https://www.mapbox.com/mapbox-gl-js/api/
https://www.mapbox.com/blog/mapping-millions-of-dots/

Switching gears. I'm going to try and map a single day's worth of streamgauge's for the whole country.

This is not working. I only got a limited set of the data I tried to request. 

At least I figured out how to print the json so I could actually read it in terminal. (5.1)


5.30.15
====================================================
This looks promising. Their demo renders a 100mb geojson file in the browser.
https://github.com/mapbox/geojson-vt/blob/master/README.md

This post is a goldmine. This guy is recapping some big FOSS conference for geospatial
http://geothought.blogspot.com/
https://2015.foss4g-na.org/session/state-vector-tiles

Not applicable to this project, but Cesium looks cool, too. 
http://cesiumjs.org/
http://analyticalgraphicsinc.github.io/cesium-google-earth-examples/demos/milktruck/

https://www.mapbox.com/mapbox.js/example/v1.0.0/timeline-scaled-markers/
https://gist.github.com/mapmeld/8866414b7fc8940e8540
http://gis.stackexchange.com/questions/125037/self-hosting-mapbox-vector-tiles
https://github.com/mapbox/tilelive.js
https://github.com/alexbirkett/ten20-tile-server
http://igortihonov.com/2014/10/21/taking-mapbox-gl-for-a-spin
http://www.reactnative.com/react-native-mapbox-gl/
http://calagator.org/events/1250468044
https://cnpmjs.org/package/mapbox-gl-style-lint

Very interesting:
https://github.com/mapbox/tippecanoe

Tippecanoe is a tool for breaking huge geojson datasets up into vector tiles. It's specifically built for situations where you want to maintain resolution across zoom levels. I'm trying it out.

First couple of runs failed. Here's the first:

	BRIANs-MacBook-Pro:Hydrography bwstud$ tippecanoe -o HUC_17.mbtiles HUC_17.geo.json 
	HUC_17.mbtiles:5: ignoring dimensions beyond two
	using layer 0 name HUC_17geo
	Sorting 272340 features
	272340 features, 60552346 bytes of geometry, 108678722 bytes of metadata
	tile 0/0/0 size is 747599 with detail 10, >500000    
	tile 1/0/0 size is 1395765 with detail 10, >500000    
	tile 1/0/0 size is 747599 with detail 9, >500000    
	tile 2/0/1 size is 2526316 with detail 10, >500000    
	tile 2/0/1 size is 1395759 with detail 9, >500000    
	tile 2/0/1 size is 747598 with detail 8, >500000    
	tile 3/1/2 size is 4198495 with detail 10, >500000    
	tile 3/1/2 size is 2526270 with detail 9, >500000    
	tile 3/1/2 size is 1396014 with detail 8, >500000    
	tile 3/1/2 size is 747224 with detail 7, >500000    
	could not make tile 3/1/2 small enough



	*** NOTE TILES ONLY COMPLETE THROUGH ZOOM 2 ***

And here's the second:

	BRIANs-MacBook-Pro:Hydrography bwstud$ ls
	HUC_17.ge.json		NHDArea.shx		NHDFlowline.prj		NHDLine.shx		NHDPoint.prj		NHDWaterbody.prj
	HUC_17.geo.json		NHDAreaEventFC.dbf	NHDFlowline.shp		NHDLineEventFC.dbf	NHDPointEventFC.dbf	NHDWaterbody.shp
	HUC_17.mbtiles		NHDAreaEventFC.prj	NHDFlowline.shx		NHDLineEventFC.prj	NHDPointEventFC.prj	NHDWaterbody.shx
	NHDArea.dbf		NHDAreaEventFC.shp	NHDLine.dbf		NHDLineEventFC.shp	NHDPointEventFC.shp	nhdpoint.shp
	NHDArea.prj		NHDAreaEventFC.shx	NHDLine.prj		NHDLineEventFC.shx	NHDPointEventFC.shx	nhdpoint.shx
	NHDArea.shp		NHDFlowline.dbf		NHDLine.shp		NHDPoint.dbf		NHDWaterbody.dbf
	BRIANs-MacBook-Pro:Hydrography bwstud$ rm -rf HUC_17.mbtiles 
	BRIANs-MacBook-Pro:Hydrography bwstud$ tippecanoe -o HUC_17.mbtiles -pk HUC_17.geo.json 
	HUC_17.mbtiles:5: ignoring dimensions beyond two
	using layer 0 name HUC_17geo
	Sorting 272340 features
	272340 features, 60552346 bytes of geometry, 108678722 bytes of metadata
	tile 5/5/11 has 206732 features, >200000    
	Try using -z to set a higher base zoom level.



	*** NOTE TILES ONLY COMPLETE THROUGH ZOOM 4 ***

There are several options available to Tippecanoe. I was guessing that because the error said it couldn't make something small enough, that I was again dealing with an issue of size, so I said to hell with it and added the two arguments that say don't limit size. 

	-pf: Don't limit tiles to 200,000 features
	-pk: Don't limit tiles to 500K bytes

I'm not sure what effect those rules have, yet, but, hey, I'm going with it. It worked. I officially have mapbox vector tiles of the Pacific Northwest's water bodies. (fig 6.2)

Now let's figure out what you do with mapbox tiles.
https://www.mapbox.com/developers/vector-tiles/

https://www.mapbox.com/blog/twitter-map-every-tweet/

So I need to upload the vector tiles to Mapbox.com, I guess. They're the ones that impose the 500k tile size limit (fig 6.3). Hrrmm. 

(fig 6.4)
I'm trying to open the straight GeoJSON in Mapbox Studio. My laptop sounds like it's going to have a panic attack (fig 6.5).

I'm still trying to understand how I'll be able to move through a timeseries using mapbox, but it looks like it can be done.
https://www.mapbox.com/blog/turf-nyc-311/
https://www.mapbox.com/blog/turf-nyc-311/


Well, it took a minute but the HUC data did eventually show up in Mapbox Studio (fig 6.6)

I just zoomed out on the map and my computer is freaking out again. Oh, man! It's trying SOOOO hard to render this stuff! (fig 6.7)

My poor computer.

This looks promising: http://gis.stackexchange.com/questions/125037/self-hosting-mapbox-vector-tiles/126550#126550
I have this mbtile file that's too big, right? If I can self host the file, cutting out mapbox.com, and consume it with mapboxgl.js, I can at least work with it locally. 

https://github.com/mapbox/tilelive.js
https://github.com/mapbox/node-mbtiles
https://github.com/spatialdev/PGRestAPI

I'm following some of the procedures here: https://www.mapbox.com/guides/converting-thousands-points-to-vts/ 
I removed a few columns from my shapefile properties (kept a backup). The info seems to be rendering much faster in mapbox studio. Now I'm trying to upload to mapbox.com. We'll see what happens (fig 6.7).

5.31.15
====================================================

Trying to figure out what to do with .mbtile files instead of uploading to mapbox.com. Mapbox is just a JS library. Their site is just a convenient hosting/editing service. Everything is open source. I should be able to do this.

https://www.mapbox.com/help/mbtiles-software-support/
http://mapproxy.org/
https://github.com/twpayne/tilecloud
http://tilestache.org/
https://github.com/mapbox/mbutil
https://github.com/mapbox/mbtiles-spec/wiki/Implementations
https://github.com/mapbox/tilestream

But now I'm confusing myself. Tippecanoe does the kind of thing I want to do. Render _vector_ tiles of huge datasets. 

https://www.mapbox.com/guides/an-open-platform/#mbtiles

	MBTiles

	Tile based web maps are made up of millions of tiles. Imagine loading all of those tiles; it would be inefficient and slow. That’s where MBTiles comes in. The MBTiles specification is an efficient format for storing millions of tiles in a single SQLite database.

	SQLite is ideal for serving tiles on the web or displaying directly on mobile devices because it’s used on so many platforms. If you’ve worked with SQL databases before, SQLite should feel very familiar. With SQLite, each database is self-contained and represented as a single .sqlite file. There’s no external setup required. You can copy a .sqlite file from desktop to a mobile device and have all its rows, tables, and indexes ready to be used. It’s a portable, single-file solution for storing and serving web maps.

	MBTiles takes advantage of utilities found in SQLite for solving problems like duplicate imagery. Maps that cover large areas of solid color like ocean or empty land can contain thousands of duplicate, redundant tiles.

	MBTiles in action

	TileMill uses MBTiles as the storage format used to export all the image tiles that make up your custom map. You can also use MBTiles files offline on mobile devices with Mapbox iOS toolkits. Vector tiles can also be stored in the MBTiles format; they’re not just for rasters!

To learn more or to contribute to the MBTiles specification visit the project page on [GitHub](http://github.com/mapbox/mbtiles-spec).
https://www.mapbox.com/mapbox-gl/
https://github.com/mapbox/vector-tile-spec
https://github.com/mapbox/make-surface

6.1.15
====================================================
I posted a question to the GIS stackexchange and I've gotten a couple of responses. I also emailed the Mapbox help team to see if they had any advice. Here is that message:

	"I'm a masters student at the University of Washington without any background in geo, so if this question seems naive or unclear, I apologize. Please let me know if I can add any information for clarity.

	I'm working on a data visualization project and my subject is streamflow data. I'm attempting to display streamflow over a map produced with NHDPlus flowline data, which shows the location of all the rivers and streams in a given region. I've chosen HUC 17, the PNW, because I'm trying to render in the browser and working with data at the national level looked unwieldy.

	I've come around to a vector tile approach as the best option for performance and interactivity. The shapefile, when converted to GeoJSON, weighs in at 438MB. To try and break that up I've found and am trying to use Tippecanoe, a tool for producing vector tiles from huge datasets. It works as advertised. It's awesome. Very easy if you're comfortable on the command line. The trick is that to upload these tiles to mapbox.com, where I could, ostensibly, view and style the tiles, each tile must be less than 500k and contain no more than 200,000 features.

	I would like to know how to slice and dice the data in such a way that I can get it up to mapbox, or, how to work with the tiles locally using something like tilelive?"

I actually got a response from someone who works at Mapbox on stackexchange:

	"Glad to hear that you like tippecanoe! I really love that tool, too, but have been through exactly what you're facing, though with point data. In that case, the answer is to adjust the minzoom, maxzoom and droprate parameters. If you specify a higher minzoom, the average number of features per tile will decrease. If you specify a higher droprate, more features will be discarded at low zoomlevels.

	But this brings me to the next point, which is that tippecanoe might not be the best tool for this data. Have a look at the work that Nelson Minar did with NHDPlus data. He prioritizes which features are included by their importance at low zoomlevels. This, rather than tippecanoe's randomized feature dropping, might be closer to what you want.

	I hope this provides some clues, but if they're not enough, get in touch (help@mapbox.com should work) and we'll connect you to team members who have more experience than me at using lines with tippecanoe.

	EDIT: if it's not already obvious, I work at Mapbox. Hi!"


https://2015.foss4g-na.org/sites/default/files/slides/foss4g-2015-sf-springmeyer.pdf

This looks super helpful http://blog.availabs.org/road-to-mapbox-vector-tiles-part-1-processing-the-data/
I guess I'm going to have to bite the bullet and figure out PostGIS tonight. 

https://www.mapbox.com/guides/postgis-manual/#install-postgresql
https://www.mapbox.com/guides/source-manual/
https://www.mapbox.com/blog/postgis-sql-studio/

Update all packages

	brew update

Upgrade any out of date packages

	brew upgrade

Make sure everything is healthy

	brew doctor

Install PostgreSQL

	brew install postgresql

Install PostGIS

	brew install postgis

Great. This guide isn't dub enough for me. It goes straight from installing everything to, "add our utility to your database!".
What database? How do I create a database? Time to go sift through more docs.

http://postgis.net/install/
http://postgis.net/docs/postgis_installation.html#install_short_version
http://www.postgresql.org/docs/9.3/static/tutorial-start.html

I'm failing to create a database. I've literally gotten to the third step of the PostgreSQL, 'getting started', section. I run the createdb command and get 

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ createdb flowlines
	createdb: could not connect to database template1: could not connect to server: No such file or directory
	Is the server running locally and accepting
	connections on Unix domain socket "/tmp/.s.PGSQL.5432"?

http://stackoverflow.com/questions/12472988/postgresql-error-could-not-connect-to-server-no-such-file-or-directory
http://stackoverflow.com/questions/17240516/mac-osx-lion-postgres-does-not-accept-connections-on-tmp-s-pgsql-5432

It sounds like this is an issue with having multiple installations of Postgres. I manage most of my software with Homebrew, and I need to symlink the expected location to the Homebrew location. 

Which psql is being requested?

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ which psql
	/usr/local/bin/psql

What is my path?

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ echo $PATH
	/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin



	BRIANs-MacBook-Pro:fp-bwstud bwstud$ locate PGSQL.5432

	WARNING: The locate database (/var/db/locate.database) does not exist.
	To create the database, run the following command:

	  sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.locate.plist

	Please be aware that the database can take some time to generate; once
	the database has been created, this message will no longer appear.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$  sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.locate.plist
	Password:
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ locate PGSQL.5432

	WARNING: The locate database (/var/db/locate.database) does not exist.
	To create the database, run the following command:

I found postgres. woo. 

	BRIANs-MacBook-Pro:var bwstud$ ..
	BRIANs-MacBook-Pro:/ bwstud$ cd usr
	BRIANs-MacBook-Pro:usr bwstud$ ls
	X11		X11R6		bin		include		lib		libexec		local		sbin		share		standalone
	BRIANs-MacBook-Pro:usr bwstud$ cd local/var
	BRIANs-MacBook-Pro:var bwstud$ ls
	cache		postgres
	BRIANs-MacBook-Pro:var bwstud$ 


That last command isn't working. Checking this:

	Old Answer:

	Here is the fix, more info here:

	https://github.com/mxcl/homebrew/issues/5004

	First, stop the db, then

	cd /var
	rm -r pgsql_socket
	ln -s /tmp pgsql_socket
	chown _postgres:_postgres pgsql_socket
	restart postgres (not your computer)

There is no pgsql_socket in my /var directory:

	BRIANs-MacBook-Pro:var bwstud$ ls -a
	.		agentx		backups		folders		log		netboot		rpc		spool		yp
	..		at		db		jabberd		mail		networkd	run		tmp
	Keychains	audit		empty		lib		msgs		root		rwho		vm
	


[This](http://stackoverflow.com/questions/17240516/mac-osx-lion-postgres-does-not-accept-connections-on-tmp-s-pgsql-5432?lq=1) suggests a path issue:

	The system client is being used and not your brew version. The symlink approach only lasts until the next restart. This approach fixes the root issue I believe

	sudo edit /etc/paths
	Move the line containing /usr/local/bin to the top of the file. (Before /usr/bin)
	Uninstall your postgres gem(s) (gem uninstall pg)
	Start up new shell to load the new environment settings
	bundle

but my path is fine. Homebrew packages have precedence over darwin.

	/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin

Jesus. I just uninstalled and reinstalled and it works. WHY!?

	BRIANs-MacBook-Pro:bin bwstud$ brew uninstall postgres
	Uninstalling /usr/local/Cellar/postgresql/9.4.2... (3004 files, 40M)
	bpostgresql 9.4.1_1 is still installed.
	Remove them all with `brew uninstall --force postgresql`.
	BRIANs-MacBook-Pro:bin bwstud$ brew uninstall --faorce postgresql
	Uninstalling /usr/local/Cellar/postgresql/9.4.1_1... (3064 files, 80M)
	BRIANs-MacBook-Pro:bin bwstud$ brew install postgresql
	==> Downloading https://homebrew.bintray.com/bottles/postgresql-9.4.2.yosemite.bottle.tar.gz
	Already downloaded: /Library/Caches/Homebrew/postgresql-9.4.2.yosemite.bottle.tar.gz
	==> Pouring postgresql-9.4.2.yosemite.bottle.tar.gz
	==> Caveats
	If builds of PostgreSQL 9 are failing and you have version 8.x installed,
	you may need to remove the previous version first. See:
	  https://github.com/Homebrew/homebrew/issues/2510

	To migrate existing data from a previous major version (pre-9.4) of PostgreSQL, see:
	  https://www.postgresql.org/docs/9.4/static/upgrading.html

	To have launchd start postgresql at login:
	    ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
	Then to load postgresql now:
	    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
	Or, if you don't want/need launchctl, you can just run:
	    postgres -D /usr/local/var/postgres
	==> Summary
	🍺  /usr/local/Cellar/postgresql/9.4.2: 3004 files, 40M
	BRIANs-MacBook-Pro:bin bwstud$ ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
	/Users/bwstud/Library/LaunchAgents/homebrew.mxcl.postgresql.plist -> /usr/local/opt/postgresql/homebrew.mxcl.postgresql.plist
	BRIANs-MacBook-Pro:bin bwstud$  launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
	BRIANs-MacBook-Pro:bin bwstud$ postgres
	postgres does not know where to find the server configuration file.
	You must specify the --config-file or -D invocation option or set the PGDATA environment variable.
	BRIANs-MacBook-Pro:bin bwstud$ fp
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ createDB flowlines
	BRIANs-MacBook-Pro:fp-bwstud bwstud$

So... where was I? What was I doing? Getting a beer? Yes. Ok. I was adding a PostGIS extension to the databse I just, finally, created.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql -d flowlines -c "CREATE EXTENSION postgis;"
	ERROR:  could not open extension control file "/usr/local/Cellar/postgresql/9.4.2/share/postgresql/extension/postgis.control": No such file or directory

Ok...

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ brew install postgis
	Warning: postgis-2.1.7_1 already installed

Damnit. 

Mother*@#$^&. Uninstalling and reinstalling worked. Again. I feel like I'm doing the command line equivalent of, "if something isn't working, unplug it and plug it back in."" 

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ brew uninstall postgis
	Uninstalling /usr/local/Cellar/postgis/2.1.7_1... (45 files, 8.3M)
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ brew install postgis
	==> Downloading http://download.osgeo.org/postgis/source/postgis-2.1.7.tar.gz
	Already downloaded: /Library/Caches/Homebrew/postgis-2.1.7.tar.gz
	==> ./configure --with-projdir=/usr/local --with-jsondir=/usr/local/opt/json-c --with-pgconfig=/usr/local/Cellar/postgresql/9.4.2/bin/pg_config --disable-nls
	==> make
	==> make install DESTDIR=/private/tmp/postgis20150602-37269-aauasq/postgis-2.1.7/stage
	==> Caveats
	To create a spatially-enabled database, see the documentation:
	  http://postgis.net/docs/manual-2.1/postgis_installation.html#create_new_db_extensions
	If you are currently using PostGIS 2.0+, you can go the soft upgrade path:
	  ALTER EXTENSION postgis UPDATE TO "2.1.5";
	Users of 1.5 and below will need to go the hard-upgrade path, see here:
	  http://postgis.net/docs/manual-2.1/postgis_installation.html#upgrading

	PostGIS SQL scripts installed to:
	  /usr/local/share/postgis
	PostGIS plugin libraries installed to:
	  /usr/local/opt/postgresql/lib
	PostGIS extension modules installed to:
	  /usr/local/opt/postgresql/share/postgresql/extension
	==> Summary
	🍺  /usr/local/Cellar/postgis/2.1.7_1: 45 files, 8.3M, built in 44 seconds
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql -d flowlines -c "CREATE EXTENSION postgis;"
	CREATE EXTENSION
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ 

Ok!

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql -d flowlines -c "CREATE EXTENSION postgis;"
	CREATE EXTENSION
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql -d flowlines -c "CREATE EXTENSION postgis_topology;"
	CREATE EXTENSION

Now I'm supposed to add Mapbox's PostGIS Vector Tile Utility. The first instruction just reads, "Download lib.sql", where lib.sql is a hyperlink which leads to a plain text file. Where am I supposed to download it to? I've literally just downloaded the page to my project root directory and it seems to work(fig 7.1.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql -U bwstud -d flowlines -f lib.sql
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION
	CREATE FUNCTION

Now, importing data to PostGIS

	ogr2ogr is the most versatile utility to get any kind of vector geodata into PostGIS. If you have a lot of data, you may want to look into shp2pgsql; it can import data much more quickly.

K.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -f PostgreSQL -t_srs EPSG:3857 PG: 'user=bwstud host=localhost dbname=flowlines' data/NHDPlus/HUC_17_Flowline.shp 
	FAILURE:
	Unable to open datasource `user=bwstud host=localhost dbname=flowlines' with the following drivers.
	  -> ESRI Shapefile
	  -> MapInfo File
	  -> UK .NTF
	  etc...

http://www.gdal.org/drv_pg.html. This gets the same error:

	ogr2ogr -f PostgreSQL -t_srs EPSG:3857 PG:"user='bwstud' host='localhost' dbname='flowlines'" data/NHDPlus/HUC_17_Flowline.shp 

As does this:

	ogr2ogr -f PostgreSQL -t_srs EPSG:3857 PG:"dbname=flowlines" data/NHDPlus/HUC_17_Flowline.shp

I'm in the right place, I think:

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ pwd
	/Users/bwstud/Projects/cse512/fp-bwstud

Ugh.

http://gis.stackexchange.com/questions/56652/how-to-move-and-open-shapefiles-with-ogr2ogr

Wait. Maybe I need all the files that go along with the .shp file. I added NHDFlowline.dbf, NHDFlowline.prj, and NHDFlowline.shx to the data directory next to NHDFlowline.shp. Still getting an error with:

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -f PostgreSQL -t_srs EPSG:3857 PG:"dbname=flowlines" data/NHDPlus/NHDFlowline.shp 
	Unable to find driver `PostgreSQL'.
	The following drivers are available:

But now it's a new error!

http://gis.stackexchange.com/questions/33346/how-can-i-update-ogr2ogr-to-include-the-postgresql-driver

	brew uninstall gdal
	brew install gdal --with-postgresql

That worked, but damn did I get an error on the next command.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -f PostgreSQL -t_srs EPSG:3857 PG:"dbname=flowlines" data/NHDPlus/NHDFlowline.shp 
	Warning 1: Geometry to be inserted is of type 3D Multi Line String, whereas the layer geometry type is 3D Line String.
	Insertion is likely to fail
	ERROR 1: INSERT command for new feature failed.
	ERROR:  Geometry type (MultiLineString) does not match column type (LineString)

	Command: INSERT INTO "nhdflowline" ("wkb_geometry" , "comid", "gnis_id", "gnis_name", "lengthkm", "reachcode", "wbareacomi", "ftype", "shape_leng", "gnis_nbr") VALUES ('01050000A0110F0000070000000102000080150000007ECF618A8BE068C1359CAF0A31B154410000000000380ABF2088554094E068C1F24C20452FB154410000000020380ABFB860C78D99E068C10C92871B29B1544100000000C0370ABF9B8D750F9DE068C1860D9A4920B1544100000000C0370ABFEC696F6AA1E068C11234673503B1544100000000A0370ABF9477FB56A5E068C16A39329CF3B0544100000000A0370ABFEDEF2250ADE068C1F5633596E2B054410000000080370ABF96CBC50BB3E068C1F08CE489DBB054410000000060370ABF33D75C49C3E068C15B540409D9B054410000000060370ABF4ED48E4CD8E068C18805BCFDF0B0544100000000C0370ABF24FF471FE8E068C1CC15FA01FDB054410000000060370ABFAD39828DEFE068C131E1300CFEB054410000000080370ABFC8C47022F6E068C17295F38AFAB054410000000060370ABFE508388D13E168C18B473C89DBB054410000000060370ABFE3CD09F122E168C15EACB413C1B054410000000040370ABFF98AE1B627E168C166418633ABB054410000000000370ABFFC58F88529E168C1F266F97095B054410000000000370ABFFC58F88529E168C12846AA1D6BB0544100000000A0360ABF15E4E61A30E168C112BCCF2D43B054410000000080360ABFF64FB31A37E168C16E9F565F26B054410000000020360ABF64787D8C3EE168C18B20416417B0544100000000E0350ABF010200008004000000BC1D365E5DE068C162A8103A28B154410000000000380ABF88D95FE564E068C1FFCD703331B154410000000020380ABFEF87F2CE7EE068C1C076D25236B1544100000000E0370ABF79CF618A8BE068C1319CAF0A31B154410000000020380ABF0102000080070000003CD54DA606DF68C1B873DAA41CB1544100000000C0370ABF98C7C1B902DF68C1E14401BA20B1544100000000C0370ABFADCCFC68FDDE68C1D974A64033B1544100000000C0370ABF94410ED4F6DE68C11FE6FC1E43B154410000000000380ABFB3D541D4EFDE68C1A9B39B505FB154410000000000380ABF7BE80870EEDE68C18D4EF4CA6AB154410000000060380ABFEE3382E7F2DE68C13EC2D2FE71B154410000000060380ABF010200008006000000E6E7880350DF68C129D5F123C8B054410000000040370ABFD290784E3BDF68C1CC5BC314D5B054410000000060370ABF78A60DE724DF68C1287D2A74E8B054410000000060370ABF9A47763423DF68C152A7E8B3F5B054410000000040370ABF7FBC879F1CDF68C1783A60CF09B1544100000000A0370ABF3CD54DA606DF68C1B873DAA41CB1544100000000C0370ABF01020000802B000000CD8C6CE468DE68C1F49A6B7FEBB2544100000000E03A0ABF9DB6E9F76BDE68C1158520F4E7B2544100000000803A0ABF2BD5B4ED6CDE68C1A022CD48DEB2544100000000C03A0ABF943B611E6BDE68C151A39B12D2B2544100000000603A0ABF04EBACF76BDE68C1300D2F99B1B2544100000000403A0ABF91F3FD3475DE68C10035AF28A7B2544100000000603A0ABF04B07E5B7BDE68C1E8E81EEB89B2544100000000203A0ABF8B321CB378DE68C1C13AD75079B2544100000000403A0ABFCC1F55177ADE68C143D650F571B2544100000000003A0ABFB6D4C0BF83DE68C1B10522106BB2544100000000203A0ABF93016F4187DE68C1CB6D21C965B2544100000000003A0ABF960EA48E8CDE68C1AF233B8042B2544100000000003A0ABFB1CB7B5491DE68C10C1301F53EB2544100000000E0390ABF5BA71E1097DE68C15145E3794BB2544100000000003A0ABFA68A68279ADE68C1C14232C574B2544100000000003A0ABF2F04C113A5DE68C10471544F8EB2544100000000403A0ABF14649485B3DE68C11600FC9EC1B2544100000000803A0ABF5B3E9931C4DE68C1095B4555E6B2544100000000C03A0ABF0C95C4C6CADE68C1ED7E7189EDB2544100000000803A0ABF3477C310E6DE68C1C97BEB48F8B2544100000000E03A0ABF6DF2AE5BFCDE68C14921FA450CB3544100000000203B0ABF844BB4BF04DF68C18C2F069B03B3544100000000C03A0ABF32A1A395FEDE68C129C1F36AEEB2544100000000A03A0ABF6BC0C52AFEDE68C1CEDD61FAE3B2544100000000C03A0ABF4C2C922A05DF68C1F45EE71AD3B2544100000000A03A0ABFB09EBAB821DF68C14E02161FC5B2544100000000403A0ABFB9AC2BC533DF68C1860F405DB4B2544100000000803A0ABF0989252038DF68C1328758ECA8B2544100000000603A0ABF793871F938DF68C171F11E07A2B2544100000000203A0ABF3DDA30E635DF68C13138025298B2544100000000603A0ABFD90EF3C408DF68C1DA6729135DB2544100000000C0390ABFDCCFD44605DF68C12A8D943E4EB2544100000000A0390ABFDCCFD44605DF68C1CFC9F0FD3FB254410000000080390ABF112E155A08DF68C12DB792C732B2544100000000C0390ABF650A0FB50CDF68C1AD4770E22BB254410000000060390ABFD071F7A417DF68C128E2F84C27B254410000000080390ABF5A01CA491ADF68C19CFB9DCB23B254410000000080390ABFD37E2CF21CDF68C18F7B863113B254410000000080390ABF412E78CB1DDF68C1938E14BBF8B154410000000020390ABF312B32CB16DF68C1D75C0B81C7B154410000000000390ABFFB218AEE0EDF68C174931D9CA6B1544100000000A0380ABF5614FE010BDF68C1C9095E539CB1544100000000A0380ABFEE3382E7F2DE68C13EC2D2FE71B154410000000060380ABF01020000800B00000062D0612D88DF68C1AC631A12B1B054410000000000370ABFEF84E8B583DF68C1FEF2F07FB5B054410000000000370ABFB326A8A280DF68C1B22FDDEFBFB054410000000060370ABF5F4AAE477CDF68C1654B710DC0B054410000000000370ABF76E8D09473DF68C1D76620AEACB054410000000040370ABF3ABC79B26EDF68C15098A2C9A6B054410000000020370ABFDCC8C9DF65DF68C184BA865DA7B054410000000000370ABFE0DE43985DDF68C10F6F13FFB2B054410000000040370ABF86DF9A375CDF68C17D09ECE3B9B054410000000020370ABFA573CE3755DF68C18183D6B7C8B054410000000000370ABFE6E7880350DF68C129D5F123C8B054410000000040370ABF01020000801E000000BC1D365E5DE068C162A8103A28B154410000000000380ABFA39247C956E068C1D99963D624B1544100000000E0370ABF7657B6BB50E068C191868FE430B154410000000020380ABF5E938E394DE068C1F14B57B433B1544100000000C0370ABF29354E264AE068C1507F381632B1544100000000E0370ABF463A89D544E068C1654D410621B1544100000000A0370ABFD68A3DFC43E068C1FCCF1AF814B1544100000000A0370ABF94B1740F40E068C158BB68F204B154410000000080370ABFB2A97A7135E068C111A482E8E8B054410000000080370ABF688712DC2EE068C118A1FA6DDCB054410000000080370ABFA3EE975A24E068C16D333F7FD5B054410000000060370ABFF2976CC51DE068C16C8B7DD4CBB054410000000060370ABF1439D5121CE068C1D5AD9E26B9B054410000000020370ABFC25CDBB717E068C1B2C2BA52AAB054410000000040370ABFB8C0AD1914E068C1BFF6FD82A7B054410000000000370ABFCD5ED0660BE068C1303BA683A7B054410000000020370ABF76E6A86D03E068C1826FAD1FA3B054410000000020370ABF5E29D1A7FEDF68C150F195A597B054410000000020370ABF56A11381F8DF68C1207B90B68FB054410000000020370ABFACC570C5F2DF68C1AAD9078B83B0544100000000E0360ABF70A64E30F3DF68C10F1E9FA763B054410000000040360ABF2C52FD69EEDF68C1EA1E35D455B054410000000080360ABF11C70ED5E7DF68C157FD5A0E53B054410000000060360ABF68EB6B19E2DF68C18EF03D5F59B0544100000000A0360ABF87062181D4DF68C1E0E25A6874B0544100000000C0360ABFB9DCA36DD1DF68C1F6A4372E77B0544100000000E0360ABF2EA269FFC9DF68C1E2B4FCEE87B0544100000000E0360ABF2D9534B2C4DF68C1E2B4FCEE87B0544100000000E0360ABFCB447F6A98DF68C1A036F14FA0B054410000000020370ABF62D0612D88DF68C1AC631A12B1B054410000000000370ABF'::GEOMETRY, 947050377, '1122760', 'Kingman Lateral', 8.15100000000, '17050110008796', 0, 'CanalDitch', 0.03525016885, 0) RETURNING "ogc_fid"
	ERROR 1: Unable to write feature 126608 from layer NHDFlowline.

	ERROR 1: Terminating translation prematurely after failed
	translation of layer NHDFlowline (use -skipfailures to skip errors)

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ 


http://gis.stackexchange.com/questions/54277/setting-geometry-types-importing-to-postgis-with-ogr
http://www.gdal.org/ogr2ogr.html
http://lists.osgeo.org/pipermail/gdal-dev/2012-September/034128.html

And we have another new error.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -nlt PROMOTE_TO_MULTI -f PostgreSQL -t_srs EPSG:3857 PG:"dbname=flowlines" data/NHDPlus/NHDFlowline.shp 
	FAILED: Layer NHDFlowline already exists, and -append not specified.
	        Consider using -append, or -overwrite.
	ERROR 1: Terminating translation prematurely after failed
	translation of layer NHDFlowline (use -skipfailures to skip errors)

http://gis.stackexchange.com/questions/60837/loading-shapefile-to-a-specific-table-in-postgis-using-ogr2ogr
http://suite.opengeo.org/opengeo-docs/dataadmin/pgGettingStarted/shp2pgsql.html

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -append -nlt PROMOTE_TO_MULTI -f PostgreSQL -t_srs EPSG:3857 PG:"dbname=flowlines" data/NHDPlus/NHDFlowline.shp 
	Warning 1: Geometry to be inserted is of type 3D Multi Line String, whereas the layer geometry type is 3D Line String.
	Insertion is likely to fail
	ERROR 1: INSERT command for new feature failed.
	ERROR:  Geometry type (MultiLineString) does not match column type (LineString)

	Command: INSERT INTO "nhdflowline" ("wkb_geometry" , "comid", "lengthkm", "reachcode", "wbareacomi", "ftype", "shape_leng", "gnis_nbr") VALUES ('01050000A0110F00000100000001020000800C0000000A4E736BAD3768C1882CD1F8CAEF57410000000000420FBF50F2118AAA3768C1DFE693BBA7EF574100000000C0410FBF7551304EA33768C154F57F5095EF574100000000E0410FBF994F06AF983768C1D53523848EEF574100000000A0410FBFB176C9368A3768C1D6DB4D9D6BEF57410000000040410FBF90E8211C7F3768C1C79914CE64EF57410000000080410FBFAEA863674C3768C1CB8B4BB364EF57410000000060410FBFF90826A4453768C123D6028E68EF57410000000080410FBF6D6A8C593F3768C15A4279F27AEF57410000000060410FBF44A7571A383768C151EBFEAC82EF574100000000C0410FBFCAB3156A2E3768C13FB2A600B6EF574100000000E0410FBFD1D081EB2D3768C1522A79F4CAEF57410000000040420FBF'::GEOMETRY, 9301535, 0.99900000000, '09040002011583', 0, 'StreamRiver', 0.01166131118, 0) RETURNING "ogc_fid"
	ERROR 1: Unable to write feature 0 from layer NHDFlowline.

	ERROR 1: Terminating translation prematurely after failed
	translation of layer NHDFlowline (use -skipfailures to skip errors)

This was wrong...

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -nlt PROMOTE_TO_MULTI -f PostgreSQL -t_srs EPSG:3857 PG:dbname=flowlines OVERWRITE=yes data/NHDPlus/NHDFlowline.shp 
	FAILURE:
	Unable to open datasource `OVERWRITE=yes' with the following drivers.

Alright, that seems to have worked.

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ ogr2ogr -overwrite -nlt PROMOTE_TO_MULTI -f PostgreSQL -t_srs EPSG:3857 PG:dbname=flowlines data/NHDPlus/NHDFlowline.shp 

So now how the *&% do I get this into Mapbox Studio? This tutorial is $%^&# garbage!

It seems I need to write SQL queries now. I have no idea how to do that. 

https://www.mapbox.com/guides/source-quickstart/
https://www.mapbox.com/guides/source-manual/
http://www.postgresql.org/docs/current/interactive/app-psql.html
http://dba.stackexchange.com/questions/1285/how-do-i-list-all-databases-and-tables-using-psql

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql \l flowlines
	psql: FATAL:  role "flowlines" does not exist
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql flowlines
	psql (9.4.2)
	Type "help" for help.

	flowlines=# psql \list
	                               List of databases
	   Name    | Owner  | Encoding |   Collate   |    Ctype    | Access privileges 
	-----------+--------+----------+-------------+-------------+-------------------
	 flowlines | bwstud | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
	 postgres  | bwstud | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
	 template0 | bwstud | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/bwstud        +
	           |        |          |             |             | bwstud=CTc/bwstud
	 template1 | bwstud | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/bwstud        +
	           |        |          |             |             | bwstud=CTc/bwstud
	(4 rows)

	flowlines-# 

So here is the schema:

	flowlines-# psql \dt
	              List of relations
	  Schema  |      Name       | Type  | Owner  
	----------+-----------------+-------+--------
	 public   | nhdflowline     | table | bwstud
	 public   | spatial_ref_sys | table | bwstud
	 topology | layer           | table | bwstud
	 topology | topology        | table | bwstud
	(4 rows)

	flowlines-# 

https://www.mapbox.com/tilemill/docs/guides/postgis-work/

There are three fields in the SQL tab of the PostGIS widget of the add new layer feature in Mapbox Studio. I have choice comments regarding the the discoverability of certain features in this UI. None of those fields seem to matter to me right now. I've written three queries. First I tried 

	(SELECT * from flowlines) as flowlines

Nonstarter. Error message said relation doesn't exist. Next I did:

	(SELECT * from nhdflowline) as flowlines

the screen flickers and some black squares show up! Progress.

Finally, I've tried:

	(SELECT * from topology) as flowlines 

WAIT!!!
While I was writing this, I had re-entered the second SQL query (_select from nhdflowline_) and the machine was rendering! It showed up!!! All the rivers and streams in the PNW in glorious bright green detail!!! (fig 7.3)



http://postgis.net/docs/manual-1.3/ch03.html#id434623

	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql flowlines
	psql (9.4.2)
	Type "help" for help.

	flowlines=# psql CREATE INDEX flowlines_index ON nhdflowline USING GIST (wkb_geometry);
	ERROR:  syntax error at or near "psql"
	LINE 1: psql CREATE INDEX flowlines_index ON nhdflowline USING GIST ...
	        ^
	flowlines=# CREATE INDEX flowlines_index ON nhdflowline USING GIST (wkb_geometry);
	CREATE INDEX
	flowlines=# \q
	BRIANs-MacBook-Pro:fp-bwstud bwstud$ psql flowlines
	psql (9.4.2)
	Type "help" for help.

	flowlines=# VACUUM ANALYZE nhdflowine

Now my eyes hurt and I've been up too late. I'm out.

6.3.15
====================================================
Because I removed some columns from the HUC 17 data in an effort to reduce its size I'm going to reinstall it. I preserved a version of the original shapefile, but didn't take into account that QGIS would alter the dbf and possibly others. I've gotten some (limited) advice back from Mapbox help, and the lead contributor of Tippecanoe actually just commited code to automatically constrain file size to the 500k limit in processing, so I'm going to give that a go. In the process now of re-downloading and unpacking the NHDPlus data.

That worked! Cool. But I did it wrong. I got the data up to Mapbox, but when I try to style it in Mapbox studio it doesn't show up. 

Something's been bothering me about Mapbox. I'm not sure how well it handles the kind of interactivity I'm trying to do. I found a library that combines D3 and WebGL
http://pathgl.com/documentation/start.html

Maybe that would allow me to use D3, which I'm more comfortable with, while still getting the render performance of WebGL.

https://vis4.net/blog/posts/no-more-mercator-tiles/
http://engineering.ayasdi.com/2015/01/09/converting-a-d3-visualization-to-webgl-how-and-why/
http://zevross.com/blog/2014/09/30/use-the-amazing-d3-library-to-animate-a-path-on-a-leaflet-map/
http://nyctaxi.herokuapp.com/
https://www.mapbox.com/mapbox-gl-js/api/
https://www.mapbox.com/mapbox.js/example/v1.0.0/timeline-scaled-markers/
http://codepen.io/smhigley/pen/BJAzC
http://www.crmarsh.com/svg-performance/
http://projects.delimited.io/experiments/threejs-maps/d3-map-example.html
https://github.com/cambecc/earth
http://blog.cartodb.com/cartodb-makes-d3-maps-a-breeze/
https://github.com/tilemapjp/mbtiles.js
http://bost.ocks.org/mike/simplify/
https://www.mapbox.com/mapbox.js/example/v1.0.0/animating-flight-paths/
https://www.mapbox.com/mapbox.js/example/v1.0.0/sync-layer-movement/
https://www.mapbox.com/mapbox.js/example/v1.0.0/swipe-layers/
http://cityhubla.github.io/LA_Building_Age/#12/34.0267/-118.2621
http://www.citylab.com/design/2014/10/mapping-the-age-of-every-building-in-manhattan/381676/


Just sent this:

Hi Lyzi,

I figured out how to work with mbtiles in MB Studio. I didn't know you needed to copy a url into the field at the bottom of the change source dialogue. 

I'm floundering a bit over here, and was wondering if I might pick your brain even more. My big stretch goal is to render a view of the rivers and streams in the PNW (HUC 17) with some animated element (particle, stroke, gradient, something...)  indicating streamflow. This could be diverging from an average point, or mapped along an absolute scale, or something else entirely. Here is n example varying width by flow. Here is a piece showing wind across the earth inspired by the famous windmap by Martin Wattenburg and Fernanda Viegas. Two projects I've been learning a great deal from are Nelson Minar's Vector River Map, and Mike Bostock's subsequent reinterpretation. That would be composed of:

1) River map - The NHDPlus data (Geospatial).
2) Streamflow measurement collection sites - USGS Water Web Services data (Geospatial).
3) Streamflow values by day dating back to October 2007 - USGS Water Web Services data (Numeric).

Within that graphic I would like to provide a brush, which the viewer could use to dynamically select a group of sites for closer view.
Below that I hope to include a control for scrubbing through a time range. 
The site values selected by the brush will be plotted in a secondary graphic with the x-axis representing time, and the y-axis representing streamflow volume. Multiple lines will occupy that view, depending on the selection.

Imagine a dense, high-level overview of the river networks in Washington, Oregon and Idaho, pulsing in relation to the water passing through their land. As you move a box around this map, every marker it captures creates a new graph line in a smaller graphic below, and as the box moves beyond the marker, it's paired line is also removed. Controls allow you to view a week, two weeks, perhaps a month at a time of data points for the selected region.

That's where I'd like to get. I simply don't know if Mapbox is the right tool to be working with. In parallel, I've also entered the data into a PostGIS database so I might explore serving the tiles with another tool. I had originally attempted to render TopoJSON with D3 straight into the browser. Needless to say, the file was too large. For the last few days I've been scrambling around trying to figure out what combination of technologies I should use to build this thing. What I know so far is the following:

- D3 is powerful, but SVG isn't suited to rendering something this dense. 
- Various vector tiling approaches can be employed to divide the relevant data into manageable chunks.
- Vector tiles need to be stored in a database where they are queried and served based on user input.
- There are a number of possible solutions for serving vector tiles.
- WebGL also offers a performance advantage over SVG in rendering large datasets.
- Mapbox provides a tool for viewing and styling vector tile data, as well as libraries for interactive mapping.
- MapboxGL does that with WebGL
- To make things more complicated, there's a library called pathgl which converts D3 selections to WebGL accessible buffers.

This example proves to me that I can link the map layer to a secondary graphic.
This example proves to me that I can scrub through time and include a D3 visualization alongside the map.
This example proves to me that I can animate features of the map.
and These Examples suggest to me that with appropriate preparation, a large dataset shouldn't be an obstacle.

Any advice you can offer me to help sort this out would be tremendously appreciated. I know that's a long email, so I thank you for bearing with me. Even pointing me in the direction of someone who might be a better person to ask would be great!

Thanks so much,
Brian


OK. I feel like I've gotten way off course here. I have less than three days til the poster is due and no visualization. I'm going to reign it in and refocus on the Python script to acquire my data.

OBJECTIVE: Obtain streamflow data for all active sites in HUC 17, grouped by data, going back to October 2007.

First. How can I snag the flow data and split it by day?

Whoa. This is cool. http://www.mapshaper.org/



6.4.15
====================================================
http://blogs.esri.com/esri/arcgis/2012/01/31/stream-tapering-adds-realism-to-your-map/

GeoJSON Utilities
https://github.com/tmcw/awesome-geojson

https://github.com/tmcw/vector-river-gl

Yakima Basin River flows and spring chinook downstream migration in 2005,
https://www.youtube.com/watch?v=untc1iCqF-I

Getting Real: Reflecting on the New Look of National Park Service Maps
http://www.shadedrelief.com/realism/index.html

Proportional vs Graduated Symbols 
http://blogs.esri.com/esri/arcgis/2008/05/03/u-s-hydro-flow-lines/

Possible Strahler Stream Order data
http://www.horizon-systems.com/NHDPlus/StrahlerList.php

https://gist.github.com/andrewxhill/acc28ed000a62de4d234
http://www.tuicool.com/articles/7Zju6r

Some shell scripting commands (redirection and pipelines)

	We use > to redirect stdout to a file, for instance, if we wanted to redirect a directory listing generated by the ls we could do the following: ls > file

	We use < to specify that we want the command immediately before the redirection symbol to get its input from the source specified immediately after the symbol, for instance, we could redirect the input to grep(which searches for strings within files) so that it comes from a file like this: grep searchterm < file

tool for reading .dbf files like the ones in the NHDPlusAttributes
http://sourceforge.net/projects/gtkdbfeditor/ (fig 8.0)

Nevermind. It crashes every time I try to open the file menu. (fig 8.1)

Notes from a meeting between The California State Water Atlas and Stamen Design, referencing Plus Flowline VAA for stream order.
http://ca.statewater.org/content/first-meeting-stamen-new-california-water-atlas

I am very sad I didn't find this book sooner:
http://www.archive.org/stream/The_California_Water_Atlas/5788000#page/n69/mode/2up

Interesting project with steps, but no instructions
https://code.env.duke.edu/projects/fay/wiki/EEP

Nelson Minar's notes on grouping criteria in the NHDPlus data, including information about flowline, flowline attributes, and reachcode/gnis_id/strahler

OK, I'm running this request right now:

	#libs
	import requests
	import json

	# daily values request url, generated from USGS web services
	url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&startDT=2007-10-01&endDT=2015-06-04&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"

	# create request as json
	r = requests.get(url)

	#deserialize so I can manipulate the data prior to writing it to a file
	data = r.json()

	#reserialize the content and write it to 'data.json'
	with open('data.json', 'w') as f:
		json.dump(data, f)		

Watching this [State of Vector Tiles](https://2015.foss4g-na.org/comment/360#comment-360) talk from FOSS4G 2015 while I wait
Mapnik is the rendering engine of mapbox http://mapnik.org/

Ok, the request went through. Took about 7 minutes. Let's take a look.

Way huge. 2.6GB. I'm trying to pull out a small part of it to look at. I just ran a query with a time period of 06/02/15-06/04-15. I'm looking at that to figure out the structure. 99% of this is manky junk. I'm working out how to process the data in my request, and to do so I need to see how to step through the json. Rather than load it into the browser and use the console as I was previously, this is a very convenient json [formatter and validator](http://jsonformatter.curiousconcept.com/) which allows me to collapse sections of the data. Much better than trying to track curly brace indenting manually. (fig 8.3)

The data is, again, in a {"value":{"timeSeries:[]"}} structure.

	{  
	   "value":{  
	      "queryInfo":{  },
	      "timeSeries":[  
	         {  
	            "sourceInfo":{  },
	            "variable":{  },
	            "values":[  ],

	         }

From the Python [docs](https://docs.python.org/2/tutorial/inputoutput.html):
open() returns a file object, and is most commonly used with two arguments: open(filename, mode).
The first argument is a string containing the filename. The second argument is another string containing a few characters describing the way in which the file will be used. mode can be 'r' when the file will only be read, 'w' for only writing (an existing file with the same name will be erased), and 'a' opens the file for appending; any data written to the file is automatically added to the end. 'r+' opens the file for both reading and writing. The mode argument is optional; 'r' will be assumed if it’s omitted.

First draft:

	#lib
	import json

	#open json file
	with open('lildata.json', 'a') as f:

		#declare time-series variable which gets us a two layers deep in the json response object
		timeSeries = f['value']['timeSeries']

		#extract the vlaues we care about, assigning them readable keys 

		for entry in timeSeries:
		    new_json = bytes('streamflow_ft3/s: ' + entry['values'][0]['value']['value'], 'UTF-8')
		    f.write(new_json)

Result:

	D-128-95-62-7:pyscripts bwstud$ python3 test_filter.py
	Traceback (most recent call last):
	  File "test_filter.py", line 8, in <module>
	    timeSeries = f['value']['timeSeries']
	TypeError: '_io.TextIOWrapper' object is not subscriptable

fix 1

	with open('lildata.json', 'r+') as f:
		data = json.load(f)

I ran

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

and got 

	D-128-95-62-7:pyscripts bwstud$ python3 test_filter.py 
	Traceback (most recent call last):
	  File "test_filter.py", line 6, in <module>
	    data = json.load(f)
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/__init__.py", line 265, in load
	    return loads(fp.read(),
	io.UnsupportedOperation: not readable

Fix 2, change the file mode to r+

I got

	D-128-95-62-7:pyscripts bwstud$ python3 test_filter.py 
	Traceback (most recent call last):
	  File "test_filter.py", line 14, in <module>
	    new_json = bytes('streamflow_ft3/s: ' + entry['values'][0]['value']['value'], 'UTF-8')
	TypeError: list indices must be integers, not str

	>>> import json
	>>> with open('data.json', 'r+') as f:
	...     data = json.load(f)
	...     timeSeries = data['value']['timeSeries'][0]
	...     print (timeSeries.keys())
	... 
	Traceback (most recent call last):
	  File "<stdin>", line 2, in <module>
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/__init__.py", line 265, in load
	    return loads(fp.read(),
	OSError: [Errno 22] Invalid argument
	>>> with open('data.json', 'r+') as f:
	...     data = json.load(f)
	...     print(data.keys())
	... 
	Traceback (most recent call last):
	  File "<stdin>", line 2, in <module>
	  File "/usr/local/Cellar/python3/3.4.3/Frameworks/Python.framework/Versions/3.4/lib/python3.4/json/__init__.py", line 265, in load
	    return loads(fp.read(),
	OSError: [Errno 22] Invalid argument
	>>> import os
	>>> os getcwd
	  File "<stdin>", line 1
	    os getcwd
	            ^
	SyntaxError: invalid syntax
	>>> os.getcwd 
	<built-in function getcwd>
	>>> os.getcwd()
	'/Users/bwstud/Projects/cse512/fp-bwstud/pyscripts'

I'm running out of time. This is bad. 

http://stackoverflow.com/questions/16168863/i-get-error-after-simple-try-to-store-json


I'm just getting royally screwed. The python script I wrote to handle instantaneous values (the values collected every 15 minutes), didn't work for the data the daily values returns. I've spent all fucking night trying to figure out how to deal with this daily values data. If I could get the daily values data I could at least plot markers on a map which would possess per-day streamflow volumes which I could then bind to graphics.

	>>> data['value']['timeSeries'][0]['values'].keys()
	Traceback (most recent call last):
	  File "<stdin>", line 1, in <module>
	AttributeError: 'list' object has no attribute 'keys'

http://stackoverflow.com/questions/23190074/python-dictionary-error-attributeerror-list-object-has-no-attribute-keys

	>>> values = data['value']['timeSeries'][0]['values']
	>>> for i in values:
	...     print(values[i])
	... 
	Traceback (most recent call last):
	  File "<stdin>", line 2, in <module>
	TypeError: list indices must be integers, not dict
	>>> 

aha.

	>>> print(values[0].keys())
	dict_keys(['value', 'qualifier', 'method', 'censorCode', 'units', 'sample', 'source', 'offset', 'qualityControlLevel'])

http://stackoverflow.com/questions/26266425/typeerror-list-indices-must-be-integers-not-dict

Better:

	>>> for i in values:
	>>>     print(i['value'])

Less better

	>>> for i in values:
	...     print(i['value'].keys())
	... 
	Traceback (most recent call last):
	  File "<stdin>", line 2, in <module>
	AttributeError: 'list' object has no attribute 'keys'

Warmer...

	>>> print(values[0]['value'][0])
	{'codedVocabulary': None, 'offsetTypeID': None, 'sampleID': None, 'accuracyStdDev': None, 'offsetValue': None, 'dateTimeAccuracyCd': None, 'qualityControlLevelCode': None, 'dateTimeUTC': None, 'methodCode': None, 'qualifiers': ['P', 'e'], 'timeOffset': None, 'methodID': None, 'sourceID': None, 'oid': None, 'offsetTypeCode': None, 'value': '30', 'sourceCode': None, 'labSampleCode': None, 'codedVocabularyTerm': None, 'metadataTime': None, 'censorCode': None, 'dateTime': '2015-01-01T00:00:00.000-05:00'}
  
Warmer...

	>>> for i in values[0]['value']:
	>>>     print(i.keys())

	dict_keys(['codedVocabulary', 'offsetTypeID', 'sampleID', 'accuracyStdDev', 'offsetValue', 'dateTimeAccuracyCd', 'qualityControlLevelCode', 'dateTimeUTC', 'methodCode', 'qualifiers', 'timeOffset', 'methodID', 'sourceID', 'oid', 'offsetTypeCode', 'value', 'sourceCode', 'labSampleCode', 'codedVocabularyTerm', 'metadataTime', 'censorCode', 'dateTime'])

So close, and yet, so far. Where are the streamflow measures!?

	>>> for i in values[0]['value']:
	>>>     print(i['dateTime'])

	2015-01-01T00:00:00.000-05:00
	2015-01-02T00:00:00.000-05:00
	2015-01-03T00:00:00.000-05:00
	2015-01-04T00:00:00.000-05:00
	2015-01-05T00:00:00.000-05:00
	2015-01-06T00:00:00.000-05:00
	2015-01-07T00:00:00.000-05:00
	2015-01-08T00:00:00.000-05:00
	2015-01-09T00:00:00.000-05:00
	2015-01-10T00:00:00.000-05:00
	2015-01-11T00:00:00.000-05:00
	2015-01-12T00:00:00.000-05:00
	2015-01-13T00:00:00.000-05:00
	2015-01-14T00:00:00.000-05:00
	2015-01-15T00:00:00.000-05:00
	2015-01-16T00:00:00.000-05:00
	2015-01-17T00:00:00.000-05:00
	2015-01-18T00:00:00.000-05:00
	2015-01-19T00:00:00.000-05:00
	2015-01-20T00:00:00.000-05:00
	2015-01-21T00:00:00.000-05:00
	2015-01-22T00:00:00.000-05:00
	2015-01-23T00:00:00.000-05:00
	2015-01-24T00:00:00.000-05:00
	2015-01-25T00:00:00.000-05:00
	2015-01-26T00:00:00.000-05:00
	2015-01-27T00:00:00.000-05:00
	2015-01-28T00:00:00.000-05:00
	2015-01-29T00:00:00.000-05:00
	2015-01-30T00:00:00.000-05:00
	2015-01-31T00:00:00.000-05:00
	2015-02-01T00:00:00.000-05:00
	2015-02-02T00:00:00.000-05:00
	2015-02-03T00:00:00.000-05:00
	2015-02-04T00:00:00.000-05:00
	2015-02-05T00:00:00.000-05:00
	2015-02-06T00:00:00.000-05:00
	2015-02-07T00:00:00.000-05:00
	2015-02-08T00:00:00.000-05:00
	2015-02-09T00:00:00.000-05:00
	2015-02-10T00:00:00.000-05:00
	2015-02-11T00:00:00.000-05:00
	2015-02-12T00:00:00.000-05:00
	2015-02-13T00:00:00.000-05:00
	2015-02-14T00:00:00.000-05:00
	2015-02-15T00:00:00.000-05:00
	2015-02-16T00:00:00.000-05:00
	2015-02-17T00:00:00.000-05:00
	2015-02-18T00:00:00.000-05:00
	2015-02-19T00:00:00.000-05:00
	2015-02-20T00:00:00.000-05:00
	2015-02-21T00:00:00.000-05:00
	2015-02-22T00:00:00.000-05:00
	2015-02-23T00:00:00.000-05:00
	2015-02-24T00:00:00.000-05:00
	2015-02-25T00:00:00.000-05:00
	2015-02-26T00:00:00.000-05:00
	2015-02-27T00:00:00.000-05:00
	2015-02-28T00:00:00.000-05:00
	2015-03-01T00:00:00.000-05:00
	2015-03-02T00:00:00.000-05:00
	2015-03-03T00:00:00.000-05:00
	2015-03-04T00:00:00.000-05:00
	2015-03-05T00:00:00.000-05:00
	2015-03-06T00:00:00.000-05:00
	2015-03-07T00:00:00.000-05:00
	2015-03-08T00:00:00.000-05:00
	2015-03-09T00:00:00.000-04:00
	2015-03-10T00:00:00.000-04:00
	2015-03-11T00:00:00.000-04:00
	2015-03-12T00:00:00.000-04:00
	2015-03-13T00:00:00.000-04:00
	2015-03-14T00:00:00.000-04:00
	2015-03-15T00:00:00.000-04:00
	2015-03-16T00:00:00.000-04:00
	2015-03-17T00:00:00.000-04:00
	2015-03-18T00:00:00.000-04:00
	2015-03-19T00:00:00.000-04:00
	2015-03-20T00:00:00.000-04:00
	2015-03-21T00:00:00.000-04:00
	2015-03-22T00:00:00.000-04:00
	2015-03-23T00:00:00.000-04:00
	2015-03-24T00:00:00.000-04:00
	2015-03-25T00:00:00.000-04:00
	2015-03-26T00:00:00.000-04:00
	2015-03-27T00:00:00.000-04:00
	2015-03-28T00:00:00.000-04:00
	2015-03-29T00:00:00.000-04:00
	2015-03-30T00:00:00.000-04:00
	2015-03-31T00:00:00.000-04:00
	2015-04-01T00:00:00.000-04:00
	2015-04-02T00:00:00.000-04:00
	2015-04-03T00:00:00.000-04:00
	2015-04-04T00:00:00.000-04:00
	2015-04-05T00:00:00.000-04:00
	2015-04-06T00:00:00.000-04:00
	2015-04-07T00:00:00.000-04:00
	2015-04-08T00:00:00.000-04:00
	2015-04-09T00:00:00.000-04:00
	2015-04-10T00:00:00.000-04:00
	2015-04-11T00:00:00.000-04:00
	2015-04-12T00:00:00.000-04:00
	2015-04-13T00:00:00.000-04:00
	2015-04-14T00:00:00.000-04:00
	2015-04-15T00:00:00.000-04:00
	2015-04-16T00:00:00.000-04:00
	2015-04-17T00:00:00.000-04:00
	2015-04-18T00:00:00.000-04:00
	2015-04-19T00:00:00.000-04:00
	2015-04-20T00:00:00.000-04:00
	2015-04-21T00:00:00.000-04:00
	2015-04-22T00:00:00.000-04:00
	2015-04-23T00:00:00.000-04:00
	2015-04-24T00:00:00.000-04:00
	2015-04-25T00:00:00.000-04:00
	2015-04-26T00:00:00.000-04:00
	2015-04-27T00:00:00.000-04:00
	2015-04-28T00:00:00.000-04:00
	2015-04-29T00:00:00.000-04:00
	2015-04-30T00:00:00.000-04:00
	2015-05-01T00:00:00.000-04:00
	2015-05-02T00:00:00.000-04:00
	2015-05-03T00:00:00.000-04:00
	2015-05-04T00:00:00.000-04:00
	2015-05-05T00:00:00.000-04:00
	2015-05-06T00:00:00.000-04:00
	2015-05-07T00:00:00.000-04:00
	2015-05-08T00:00:00.000-04:00
	2015-05-09T00:00:00.000-04:00
	2015-05-10T00:00:00.000-04:00
	2015-05-11T00:00:00.000-04:00
	2015-05-12T00:00:00.000-04:00
	2015-05-13T00:00:00.000-04:00
	2015-05-14T00:00:00.000-04:00
	2015-05-15T00:00:00.000-04:00
	2015-05-16T00:00:00.000-04:00
	2015-05-17T00:00:00.000-04:00
	2015-05-18T00:00:00.000-04:00
	2015-05-19T00:00:00.000-04:00
	2015-05-20T00:00:00.000-04:00
	2015-05-21T00:00:00.000-04:00
	2015-05-22T00:00:00.000-04:00
	2015-05-23T00:00:00.000-04:00
	2015-05-24T00:00:00.000-04:00
	2015-05-25T00:00:00.000-04:00
	2015-05-26T00:00:00.000-04:00
	2015-05-27T00:00:00.000-04:00
	2015-05-28T00:00:00.000-04:00
	2015-05-29T00:00:00.000-04:00
	2015-05-30T00:00:00.000-04:00
	2015-05-31T00:00:00.000-04:00
	2015-06-01T00:00:00.000-04:00
	2015-06-02T00:00:00.000-04:00
	2015-06-03T00:00:00.000-04:00

The file is too big for json formatters online. I found a [Sublime plugin](https://github.com/dzhibas/SublimePrettyJson) that might help. Also [this one](http://tech.flyclops.com/jsontree-sublime-text-3-plugin-407.)



	{
    "sampleID": null,
    "dateTimeUTC": null,
    "methodCode": null,
    "offsetTypeID": null,
    "timeOffset": null,
    "censorCode": null,
    "codedVocabularyTerm": null,
    "labSampleCode": null,
    "value": "2.3",
    "metadataTime": null,
    "sourceCode": null,
    "accuracyStdDev": null,
    "qualityControlLevelCode": null,
    "qualifiers": [
      "P"
    ],
	"offsetValue": null,
	"sourceID": null,
	"dateTimeAccuracyCd": null,
	"methodID": null,
	"codedVocabulary": null,
	"offsetTypeCode": null,
	"oid": null,
	"dateTime": "2015-05-31T00:00:00.000-04:00"
	},


	  "geoLocation": {
            "geogLocation": {
              "srs": "EPSG:4326",
              "latitude": 43.32206866,
              "longitude": -122.1955907

               {
              "name": "hucCd",
              "uri": null,
              "value": "17100301",
              "type": null
            },



OK! These look like values.

	30
	36
	44
	58
	62
	66
	92
	87
	75
	66
	67
	71
	77
	52
	50
	78
	100
	146
	108
	66
	60
	6

So, to sum up that endeavour:
1. In a directory containing data.json, open the Python interpreter ``$ python3``
2. Import the JSON Python library ``>>> import json``
3. Create the JSON file object ``>>> with open('data.json', 'r+') as f:``
4. Decode the JSON object ``>>>    data=json.load(f)``
5. Traverse through all of the container layers ``>>> values = data['value']['timeSeries'][0]['values']``
6. Iterate over all objects at the next level of the heirarchy. ``>>> for i in values[0]['value']:``
7. Print glorious Streamflow values to your screen. ``>>>  print(i['value'])``


Now, the script...

http://www.bogotobogo.com/python/python_http_web_services.php
http://chimera.labs.oreilly.com/books/1230000000393/ch06.html#_discussion_95
http://www.bogotobogo.com/WebTechnologies/OpenAPI_RESTful.php

#Import Libraries.
import requests
import json

# This URL is generated by the USGS water web services daily values service tester (what a mouthful). This is just HUC_17, and just for 2015 so far.
url = "http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&huc=17&startDT=2015-01-01&endDT=2015-06-04&parameterCd=00060&siteType=OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&siteStatus=active"

# Create the request
r = requests.get(url)

#deserialize so I can manipulate the data prior to writing it to a file
data = json.dumps(r, indent=4)

#reserialize the content and write it to 'data.json'
with open('data.json', 'r+') as f:
	data = json.load(f)	

http://stackoverflow.com/questions/27767346/extract-json-attributes-using-python-and-filter-out-some-data
https://docs.python.org/3/tutorial/inputoutput.html
http://stackoverflow.com/questions/12540564/write-python-dictionary-obtained-from-json-in-a-file

	with open('newdata.json', 'r+') as f:
	for entry in values:
		f.write(entry['value'])


	Traceback (most recent call last):
	  File "single_huc_dailyvals_request.py", line 19, in <module>
	    with open('newdata.json', 'r+') as f:
	FileNotFoundError: [Errno 2] No such file or directory: 'newdata.json'

	with open('newdata.json', 'w+') as f:
	for entry in values:
		f.write(entry['value'])

	Traceback (most recent call last):
	File "single_huc_dailyvals_request.py", line 21, in <module>
	f.write(entry['value'])
	TypeError: must be str, not list

	with open('newdata.json', 'w+') as f:
	for entry in values:
		f.write(bytes(entry['value']), 'UTF-8')

	Traceback (most recent call last):
		File "single_huc_dailyvals_request.py", line 21, in <module>
    		f.write(bytes(entry['value']), 'UTF-8')
    TypeError: 'dict' object cannot be interpreted as an integer

changing bytes() to str() seems to have worked.
I'm still running around in circles trying to understand the heirarchy of this JSON.

>>> with open('data_to_view.json', 'w+') as f:
...     json.dump(data, f)


http://www.diveintopython3.net/http-web-services.html
http://xahlee.info/perl-python/python_json_tutorial.html
https://www.jsoneditoronline.org/

6.5.15
====================================================
Ok, the Python script is working. It's requesting the data from the web service, parsing it, and writing the streamflow values to a new file. Here's that code:

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
			f.write('streamflow: ' + entry['value'] + "\n")

But now I'd like to do what I need to include datetime, geolocation and name. Let's do that. The dateTime is unecessarily long, but I'll worry about that later. Fuck. It just became clear that I need to refactor the script so the loop is higher in the tree. 

I'm so close.I've spent the last couple of hours figuring out how to get the script to spit out valid json. Here's where I'm at:

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

	timeSeries = data['value']['timeSeries']
	sourceInfo = data['value']['timeSeries'][0]['sourceInfo']
	counter = 0
	counter2 = 0
	#reserialize the content and write it to 'data.json'
	with open('newdata.json', 'w+') as f:
		for site in timeSeries:
			counter+=1
			json_data = '{"site": { "properties": { "usgs_name":  ' + '"' + site['sourceInfo']['siteName'] + '",' + \
			'"HUC": "{}"'.format(site['sourceInfo']['siteProperty'][1]['value']) + ',' + \
			'"Latitude": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['latitude']) + ',' + \
			'"Longitude": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['longitude']) + \
			'}, "timeSeries": ['
			for chunk in site['values']:
				for daily in chunk['value']:
					counter2+=1
					json_data = json_data + '{"streamflow": ' + '"' + daily['value'] + '",' + \
					'"dateTime": ' + '"' + daily['dateTime'] + '"'
					if counter2 == len(chunk['value']):
						json_data = json_data + '}]'
					else:
						json_data = json_data +'},'
			if counter == len(timeSeries):
				json_data = json_data + '}}'
			else:
				json_data = json_data + '},'
		f.write(json_data)

The resulting JSON looks like:

	{"site": { "properties": { "usgs_name":  "Libby Wetland Site bl Schrieber Lake nr Libby, MT","HUC": "17010102","Latitude": "48.1022259","Longitude": "-115.4089188"}, "timeSeries": [{"streamflow": "0.40","dateTime": "2015-01-01T00:00:00.000-05:00"},{"streamflow": "0.60","dateTime": "2015-01-02T00:00:00.000-05:00"},{"streamflow": "0.50","dateTime": "2015-01-03T00:00:00.000-05:00"},{"streamflow": "0.80","dateTime": "2015-01-04T00:00:00.000-05:00"},{"streamflow": "0.90","dateTime": "2015-01-05T00:00:00.000-05:00"},{"streamflow": "1.0","dateTime": "2015-01-06T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-07T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-08T00:00:00.000-05:00"},{"streamflow": "0.90","dateTime": "2015-01-09T00:00:00.000-05:00"},{"streamflow": "0.90","dateTime": "2015-01-10T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-11T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-12T00:00:00.000-05:00"},{"streamflow": "1.0","dateTime": "2015-01-13T00:00:00.000-05:00"},{"streamflow": "1.0","dateTime": "2015-01-14T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-15T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-16T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-17T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-18T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-19T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-20T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-21T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-22T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-23T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-24T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-25T00:00:00.000-05:00"},{"streamflow": "1.3","dateTime": "2015-01-26T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-27T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-01-28T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-29T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-30T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-01-31T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-02-01T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-02-02T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-02-03T00:00:00.000-05:00"},{"streamflow": "1.1","dateTime": "2015-02-04T00:00:00.000-05:00"},{"streamflow": "1.2","dateTime": "2015-02-05T00:00:00.000-05:00"},{"streamflow": "1.5","dateTime": "2015-02-06T00:00:00.000-05:00"},{"streamflow": "2.0","dateTime": "2015-02-07T00:00:00.000-05:00"},{"streamflow": "2.5","dateTime": "2015-02-08T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-02-09T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-10T00:00:00.000-05:00"},{"streamflow": "3.4","dateTime": "2015-02-11T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-02-12T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-02-13T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-14T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-15T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-16T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-17T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-18T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-19T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-20T00:00:00.000-05:00"},{"streamflow": "3.5","dateTime": "2015-02-21T00:00:00.000-05:00"},{"streamflow": "3.4","dateTime": "2015-02-22T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-02-23T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-02-24T00:00:00.000-05:00"},{"streamflow": "3.4","dateTime": "2015-02-25T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-02-26T00:00:00.000-05:00"},{"streamflow": "3.4","dateTime": "2015-02-27T00:00:00.000-05:00"},{"streamflow": "3.4","dateTime": "2015-02-28T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-03-01T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-03-02T00:00:00.000-05:00"},{"streamflow": "3.3","dateTime": "2015-03-03T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-03-04T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-03-05T00:00:00.000-05:00"},{"streamflow": "3.1","dateTime": "2015-03-06T00:00:00.000-05:00"},{"streamflow": "3.0","dateTime": "2015-03-07T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-03-08T00:00:00.000-05:00"},{"streamflow": "3.2","dateTime": "2015-03-09T00:00:00.000-04:00"},{"streamflow": "3.5","dateTime": "2015-03-10T00:00:00.000-04:00"},{"streamflow": "3.5","dateTime": "2015-03-11T00:00:00.000-04:00"},{"streamflow": "4.0","dateTime": "2015-03-12T00:00:00.000-04:00"},{"streamflow": "4.5","dateTime": "2015-03-13T00:00:00.000-04:00"},{"streamflow": "5.0","dateTime": "2015-03-14T00:00:00.000-04:00"},{"streamflow": "5.7","dateTime": "2015-03-15T00:00:00.000-04:00"},{"streamflow": "9.1","dateTime": "2015-03-16T00:00:00.000-04:00"},{"streamflow": "9.7","dateTime": "2015-03-17T00:00:00.000-04:00"},{"streamflow": "9.0","dateTime": "2015-03-18T00:00:00.000-04:00"},{"streamflow": "8.0","dateTime": "2015-03-19T00:00:00.000-04:00"},{"streamflow": "7.5","dateTime": "2015-03-20T00:00:00.000-04:00"},{"streamflow": "7.0","dateTime": "2015-03-21T00:00:00.000-04:00"},{"streamflow": "7.3","dateTime": "2015-03-22T00:00:00.000-04:00"},{"streamflow": "6.5","dateTime": "2015-03-23T00:00:00.000-04:00"},{"streamflow": "6.9","dateTime": "2015-03-24T00:00:00.000-04:00"},{"streamflow": "6.3","dateTime": "2015-03-25T00:00:00.000-04:00"},{"streamflow": "5.9","dateTime": "2015-03-26T00:00:00.000-04:00"},{"streamflow": "5.8","dateTime": "2015-03-27T00:00:00.000-04:00"},{"streamflow": "6.1","dateTime": "2015-03-28T00:00:00.000-04:00"},{"streamflow": "6.3","dateTime": "2015-03-29T00:00:00.000-04:00"},{"streamflow": "5.9","dateTime": "2015-03-30T00:00:00.000-04:00"},{"streamflow": "5.5","dateTime": "2015-03-31T00:00:00.000-04:00"},{"streamflow": "5.3","dateTime": "2015-04-01T00:00:00.000-04:00"},{"streamflow": "5.0","dateTime": "2015-04-02T00:00:00.000-04:00"},{"streamflow": "4.9","dateTime": "2015-04-03T00:00:00.000-04:00"},{"streamflow": "4.8","dateTime": "2015-04-04T00:00:00.000-04:00"},{"streamflow": "4.7","dateTime": "2015-04-05T00:00:00.000-04:00"},{"streamflow": "4.7","dateTime": "2015-04-06T00:00:00.000-04:00"},{"streamflow": "4.7","dateTime": "2015-04-07T00:00:00.000-04:00"},{"streamflow": "4.5","dateTime": "2015-04-08T00:00:00.000-04:00"},{"streamflow": "4.4","dateTime": "2015-04-09T00:00:00.000-04:00"},{"streamflow": "4.3","dateTime": "2015-04-10T00:00:00.000-04:00"},{"streamflow": "4.2","dateTime": "2015-04-11T00:00:00.000-04:00"},{"streamflow": "4.1","dateTime": "2015-04-12T00:00:00.000-04:00"},{"streamflow": "3.9","dateTime": "2015-04-13T00:00:00.000-04:00"},{"streamflow": "3.9","dateTime": "2015-04-14T00:00:00.000-04:00"},{"streamflow": "3.8","dateTime": "2015-04-15T00:00:00.000-04:00"},{"streamflow": "3.7","dateTime": "2015-04-16T00:00:00.000-04:00"},{"streamflow": "3.6","dateTime": "2015-04-17T00:00:00.000-04:00"},{"streamflow": "3.5","dateTime": "2015-04-18T00:00:00.000-04:00"},{"streamflow": "3.4","dateTime": "2015-04-19T00:00:00.000-04:00"},{"streamflow": "3.4","dateTime": "2015-04-20T00:00:00.000-04:00"},{"streamflow": "3.3","dateTime": "2015-04-21T00:00:00.000-04:00"},{"streamflow": "3.3","dateTime": "2015-04-22T00:00:00.000-04:00"},{"streamflow": "3.1","dateTime": "2015-04-23T00:00:00.000-04:00"},{"streamflow": "3.1","dateTime": "2015-04-24T00:00:00.000-04:00"},{"streamflow": "3.1","dateTime": "2015-04-25T00:00:00.000-04:00"},{"streamflow": "3.2","dateTime": "2015-04-26T00:00:00.000-04:00"},{"streamflow": "3.2","dateTime": "2015-04-27T00:00:00.000-04:00"},{"streamflow": "3.1","dateTime": "2015-04-28T00:00:00.000-04:00"},{"streamflow": "2.9","dateTime": "2015-04-29T00:00:00.000-04:00"},{"streamflow": "2.8","dateTime": "2015-04-30T00:00:00.000-04:00"},{"streamflow": "2.8","dateTime": "2015-05-01T00:00:00.000-04:00"},{"streamflow": "2.8","dateTime": "2015-05-02T00:00:00.000-04:00"},{"streamflow": "2.7","dateTime": "2015-05-03T00:00:00.000-04:00"},{"streamflow": "2.7","dateTime": "2015-05-04T00:00:00.000-04:00"},{"streamflow": "2.6","dateTime": "2015-05-05T00:00:00.000-04:00"},{"streamflow": "2.5","dateTime": "2015-05-06T00:00:00.000-04:00"},{"streamflow": "2.5","dateTime": "2015-05-07T00:00:00.000-04:00"},{"streamflow": "2.5","dateTime": "2015-05-08T00:00:00.000-04:00"},{"streamflow": "2.4","dateTime": "2015-05-09T00:00:00.000-04:00"},{"streamflow": "2.4","dateTime": "2015-05-10T00:00:00.000-04:00"},{"streamflow": "2.3","dateTime": "2015-05-11T00:00:00.000-04:00"},{"streamflow": "2.3","dateTime": "2015-05-12T00:00:00.000-04:00"},{"streamflow": "2.4","dateTime": "2015-05-13T00:00:00.000-04:00"},{"streamflow": "2.6","dateTime": "2015-05-14T00:00:00.000-04:00"},{"streamflow": "2.5","dateTime": "2015-05-15T00:00:00.000-04:00"},{"streamflow": "2.4","dateTime": "2015-05-16T00:00:00.000-04:00"},{"streamflow": "2.3","dateTime": "2015-05-17T00:00:00.000-04:00"},{"streamflow": "2.2","dateTime": "2015-05-18T00:00:00.000-04:00"},{"streamflow": "2.1","dateTime": "2015-05-19T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-20T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-21T00:00:00.000-04:00"},{"streamflow": "1.9","dateTime": "2015-05-22T00:00:00.000-04:00"},{"streamflow": "1.9","dateTime": "2015-05-23T00:00:00.000-04:00"},{"streamflow": "1.8","dateTime": "2015-05-24T00:00:00.000-04:00"},{"streamflow": "1.9","dateTime": "2015-05-25T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-26T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-27T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-28T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-05-29T00:00:00.000-04:00"},{"streamflow": "2.1","dateTime": "2015-05-30T00:00:00.000-04:00"},{"streamflow": "2.3","dateTime": "2015-05-31T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-06-01T00:00:00.000-04:00"},{"streamflow": "2.2","dateTime": "2015-06-02T00:00:00.000-04:00"},{"streamflow": "2.2","dateTime": "2015-06-03T00:00:00.000-04:00"},{"streamflow": "2.0","dateTime": "2015-06-04T00:00:00.000-04:00"},}}

At the very end there you can see that my efforts to alter the ending on the last iteration through the data aren't working.

This is supposed to close off the time-series array:
	
	if counter2 == len(chunk['value']):
					json_data = json_data + '}]'
				else:
					json_data = json_data +'},'

And this is supposed to close off the object for this site before moving on to the next one:

	if counter == len(timeSeries):
			json_data = json_data + '}}'
		else:
			json_data = json_data + '},'

Manually changing this ``},}}`` to this ``}]}}`` makes it valid (fig 9.0). I do, however, need to add a comma at the end so I can move to the next site.

I've gotten to here:

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

	timeSeries = data['value']['timeSeries']
	counter = 0
	#reserialize the content and write it to 'data.json'
	with open('newdata.json', 'a') as f:
		for site in timeSeries:
			counter+=1
			json_data = '{"site": { "properties": { "usgs_name":  ' + '"' + site['sourceInfo']['siteName'] + '",' + \
			'"HUC": "{}"'.format(site['sourceInfo']['siteProperty'][1]['value']) + ',' + \
			'"Latitude": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['latitude']) + ',' + \
			'"Longitude": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['longitude']) + \
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
				json_data = json_data + '}}'
		f.write(json_data)

But it gets screwed up between sites 

	}]}},"site": {
	   ^
Also, even though I changed the file mode to append it's only writing two sites...

Now I'm getting the error, "duplicate key: sites"

I need a break.
	**
    ** 
    /\
   /||\
  /~||~\
 /~~||~~\
/~~~||~~~\
    ||

For clarity, I'm breaking this out into sections.

Setup - 

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

	timeSeries = data['value']['timeSeries']
	counter = 0

Site description and properties-

	with open('newdata.json', 'a') as f:
		for site in timeSeries:
			json_data = '{'
			counter+=1
			json_data = json_data + '"sitecode": "{}"'.format(site['sourceInfo']['siteCode'][0]['value']) + ',' + \
			'"properties": { "usgs_name":  ' + '"' + site['sourceInfo']['siteName'] + '",' + \
			'"HUC": "{}"'.format(site['sourceInfo']['siteProperty'][1]['value']) + ',' + \
			'"lat": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['latitude']) + ',' + \
			'"long": "{}"'.format(site['sourceInfo']['geoLocation']['geogLocation']['longitude']) + \
			'},

Streamflow timeseries data-

	"timeSeries": ['
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

The finish-

	if counter < len(timeSeries):
			json_data = json_data + '},'
		else:
			json_data = json_data + '}'
	f.write(json_data)

Interesting: http://water.usgs.gov/nsip/

My problem is in the finish somehwere, I think. Each site ([stream gage](http://water.usgs.gov/nsip/definition9.html)) needs to be a self-contained object, separated by commas until the last one, which should not be followed by a comma. I'm trying to accomplish that with an if statement dictating that while a 'counter' variable is less than the length of the time-series (the list of retrieved gage sites, in this request that's 678 objecst (fig 9.1, 9.2)) the site object terminates in '}'. When it reaches the last object, it should terminate in a simple, '}'.


testing my logic:

	>>> counter = 0
	>>> for site in timeSeries:
	...     counter += 1
	...     if counter < len(timeSeries):
	...         print("not the end")
	...     else:
	...         print("the end")
	...

	...
	not the end
	not the end
	not the end
	not the end
	the end
	>>> 

That looks right.

Hmm, since I was in "append" mode I was just adding data to my json file everytime I ran the script, keeping all the old problems. Great.

This should prevent that in the future:

	try:
	    os.remove('newdata.json')
	except OSError:
	    pass

Ha. Now it works. Or, at least, it's valid JSON. I again only have one site in my resulting object... It's the Libby Wetland Site near Libby Montana. All alone. Why!?

I see 678 objects in the raw response. I see 678 objects when I iterate over 'site in timeSeries'.

	>>> for site in timeSeries:
	...     x+=1
	...     print(x)
	... 
	1
	2
	3
	4
	5
	...



I posted a question on Stack Overflow asking for advice. While no one solved this problem, several people told me I shouldn't be building JSON from strings, and that I should build a dictionary instead. Obviously. 

I have 8 hours until I have to turn in a poster for this.

http://www.yilmazhuseyin.com/blog/dev/advanced_json_manipulation_with_python/