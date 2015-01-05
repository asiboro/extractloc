/**
 * This script takes a directory of images, looks for GPS 
 * coordinates in each file, and then writes the filename and
 * decimal degrees to CSV. If you're pulling images off of your
 * iPhone, using Image Capture is a quick way to move them onto
 * your computer and get started.
 * 
 * Make sure you have imagemagick installed:
 *   $ brew install imagemagick
 * Download these files and install dependencies:
 *   $ npm install
 * Run:
 *   $ node index.js ~/Pictures/iphone/ > images.csv
 * 
 * Graph them on a map using something like TileMill, here's a good starter:
 *   http://mapbox.com/tilemill/docs/crashcourse/point-data/
 */
var im = require('imagemagick');
var fs = require('fs');
var async = require('async');

// https://www.npmjs.org/package/search-osm-geocode
var geocoder = require('search-osm-geocode');
var gpsvillage, gpsstate, gpsdisplayname;
const LANGUAGE = 'en';
var options = {
    'accept-language': LANGUAGE
};

var JSONFILE = 1;

if(!JSONFILE) console.log(['file', 'latitude', 'longitude'].join(','));
if(JSONFILE){
var locdata = new Object();
locdata.Order=0;
var memberfilter = new Array();
memberfilter[0] = "CapitalLatitude";
memberfilter[1] = "CapitalLongitude";
memberfilter[2] = "Order";
memberfilter[3] = "FileName";
memberfilter[4] = "CapitalName";
console.log("[");
}

//This is the regular readdir which does not work recursively
/*
fs.readdir(process.argv[2], function(err, files) {
  if (err) throw err;
  // Limit im.readMetadata since it doesn't like having too many open file descriptors.
  async.eachLimit(files, 50, readData, function(err) {
    if (err) throw err;
    // done!
  });
});
*/

var recursive = require('recursive-readdir');
recursive(process.argv[2], function (err, files) {
  if (err) throw err;
  // Limit im.readMetadata since it doesn't like having too many open file descriptors.
  async.eachLimit(files, 50, readData, function(err) {
    if (err) throw err;
    // done!
  });
});



var readData = function(file, callback) {
  if (file.match(/\.jpg/i) !== null) {
    //im.readMetadata(process.argv[2] + file, function(err, metadata) {
	//when using recursive-readdir, full path is given, so just use "file"
    im.readMetadata(file, function(err, metadata) {
      if (err) throw err;
      if (typeof metadata.exif !== 'undefined' && typeof metadata.exif.gpsLatitude !== 'undefined' && typeof metadata.exif.gpsLongitude !== 'undefined') {
        var degreeLatitude = metadata.exif.gpsLatitude.split(', ')
        var degreeLongitude = metadata.exif.gpsLongitude.split(', ')
        var latitude = ConvertDMSToDD(parseInt(degreeLatitude[0].split('/')), parseInt(degreeLatitude[1].split('/'))/100, parseInt(degreeLatitude[2].split('/')), metadata.exif.gpsLatitudeRef);
        var longitude = ConvertDMSToDD(parseInt(degreeLongitude[0].split('/')), parseInt(degreeLongitude[1].split('/'))/100, parseInt(degreeLongitude[2].split('/')), metadata.exif.gpsLongitudeRef);


        async.series(
        [
        	function(callback) {
//				gpsdisplayname="undefined";

        		geocoder.reverseGeocode(latitude, longitude, function(error, result) {
                	if (error) console.log(error); // on error
                	else {
                   		//console.log(result);
                   		//gpsvillage = result.address.village;
                   		//gpsstate = result.address.country;
                   		gpsdisplayname = result.display_name;
                 	}
                 	callback();
            	}, options);

                callback();
            },
        	function(callback) {
        		if(!JSONFILE) console.log([file, latitude, longitude].join(','));
				if(JSONFILE){
					locdata.CapitalLatitude = latitude;
					locdata.CapitalLongitude = longitude;
					locdata.Order=locdata.Order+1;
					locdata.FileName = file;
					locdata.CapitalName = gpsdisplayname;
					var jsonText = JSON.stringify(locdata, memberfilter, "\t");
					console.log(jsonText+",");
				}
                callback();
            }
		], function(err) {
                if (err) callback(err);
                //console.log(logdata);
        });




      }
      callback();
    });
  }
  else {
    callback();
  }
};

// http://stackoverflow.com/questions/1140189/converting-latitude-and-longitude-to-decimal-values
var ConvertDMSToDD = function(days, minutes, seconds, direction) {
  var dd = days + minutes/60 + seconds/(60*60);
  // Invert south and west.
  if (direction == 'S' || direction == 'W') {
    dd = dd * -1;
  }
  return dd;
}
