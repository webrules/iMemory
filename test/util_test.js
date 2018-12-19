var test = require('tape')
var util = require('../lib/util.js')

test('Pad should pad zero for any number less than 9 or keep it as is', function (t) {
    t.equal(util.pad("2"),"02","2 should become 02")
    t.equal(util.pad("4"),"04","4 should become 02")
    t.equal(util.pad("9"),"09","9 should become 02")
    t.equal(util.pad("11"),"11","11 should still be 11")
    t.equal(util.pad("36"),"36","11 should still be 36")
    t.equal(util.pad("980"),"980","980 should still be 980")
    t.end()
});

//has to use UTC, or nasty timezone issue
test('ToChinaDate should return as a string of yyyy/mm/dd', function (t) {
    t.equal(util.toChinaDate(new Date(Date.UTC(2018,1,1))),"2018/02/01","Feb 1, 2018 should be 2018/02/01")
    t.equal(util.toChinaDate(new Date(Date.UTC(2018,2,8))),"2018/03/08","Mar 8, 2018 should be 2018/03/01")
    t.equal(util.toChinaDate(new Date(Date.UTC(2018,3,10))),"2018/04/10", "Apr 10, 2018 should be 2018/04/10")
    t.equal(util.toChinaDate(new Date(Date.UTC(2006,8,18))),"2006/09/18", "Sep 18, 2006 should be 2006/09/18")
    t.equal(util.toChinaDate(new Date(Date.UTC(2007,9,19))),"2007/10/19", "Oct 19, 2007 should be 2006/10/19")
    t.equal(util.toChinaDate(new Date(Date.UTC(2008,11,31))),"2008/12/31", "Dec 31, 2008 should be 2008/12/31")
    t.end()
});

test('ToChinaTime should return as a string of hh_mm_ss', function (t) {
    t.equal(util.toChinaTime(new Date(Date.UTC(2018,1,1,1,2,3))),"01_02_03","01:02:03 should be 01_02_03")
    t.equal(util.toChinaTime(new Date(Date.UTC(2018,1,1,1,2,25))),"01_02_25","01:02:25 should be 01_02_25")
    t.equal(util.toChinaTime(new Date(Date.UTC(2018,1,1,1,10,36))),"01_10_36","01:10:36 should be 01_10_36")
    t.equal(util.toChinaTime(new Date(Date.UTC(2018,1,1,12,2,3))),"12_02_03","12:02:03 should be 12_02_03")
    t.equal(util.toChinaTime(new Date(Date.UTC(2018,1,1,18,24,48))),"18_24_48","18:24:48 should be 18_24_48")
    t.end()
});

test('IsEmpty should return true for null and empty string', function (t) {
    var nullObj;
    t.true(util.isEmpty(nullObj),"null should be empty")

    var emptyString = "";
    t.true(util.isEmpty(emptyString),"empty string should be empty")

    var emptyArray = [];
    t.true(util.isEmpty(emptyArray),"empty array should be empty")

    t.end()
});

test('FileWalker should return all the files recursively in a given directory', function(t) {
    util.filewalker("./samples", function (err, files) {
        // console.log(files);
        t.equal(files.length, 16, "there should be 16 files in the samples folder")
    });
    t.end()
});

test('FindImageFiles should return all the image files in a given array', function(t) {
    var folderPath = "./samples";
    util.filewalker(folderPath, function (err, files) {
        // console.log(files);
        util.findImageFiles(files, folderPath, function (imageFiles) {
            // console.log(imageFiles);
            t.equal(imageFiles.length, 9, "there should be 9 photo files in the samples folder")
        });
    });
    t.end()
});
