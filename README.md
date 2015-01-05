# **Extract GPS data from photo**

**Application name**: extractloc  
**Platform**: node.js  
**Deployment target**: 
**Library**: imagemagick, recursive-readdir, search-osm-geocode

## Description

This program extracts GPS data (long/lat) from JPG file's EXIF metadata and output to stdout as CSV or JSON.  
Execute like below:

`node extractloc.js /pict/dir/ > result.json`

However, the json file is not complete, as you have to delete the last "," and add a "]".

## Prerequisite
npm install imagemagick
npm install recursive-readdir
npm install search-osm-geocode

