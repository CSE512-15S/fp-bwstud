5.16.15
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
 