module.exports = {
    /**
     * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
     * 
     * @see http://stackoverflow.com/a/5827895/4241030
     * @param {String} dir 
     * @param {Function} done 
     */
    filewalker: function (dir, done) {
        let results = [];

        const fs = require('fs');
        const path = require('path');
        fs.readdir(dir, function (err, list) {
            if (err) return done(err);

            var pending = list.length;

            if (!pending) return done(null, results);

            list.forEach(function (file) {
                file = path.resolve(dir, file);

                fs.stat(file, function (err, stat) {
                    // If directory, execute a recursive call
                    if (stat && stat.isDirectory()) {
                        // Add directory to array [comment if you need to remove the directories from the array]
                        // results.push(file);

                        //weird, "this." doesn't work here, has to use "module.exports."
                        module.exports.filewalker(file, function (err, res) {
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                        });
                    } else {
                        results.push(file);

                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    },

    findImageFiles: function (files, folderPath, cb) {
        var imageMimeTypes = [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/pjpeg',
            'image/tiff',
            'image/webp',
            'image/x-tiff',
            'image/x-windows-bmp'
        ];
        const mime = require('mime');
        const path = require('path');

        var imageFiles = [];
        files.forEach(function (file) {
            var fullFilePath = path.resolve(folderPath, file);
            var extension = mime.getType(fullFilePath);
            if (imageMimeTypes.indexOf(extension) !== -1) {
                if (path.parse(fullFilePath).name.charAt(0) != ".") {
                    imageFiles.push({ name: file, path: fullFilePath });
                }
            }
            if (files.indexOf(file) === files.length - 1) {
                cb(imageFiles);
            }
        });
    },

    //todo: these below 4 functions are no not needed to export
    isEmpty: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    pad: function (number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    },

    toChinaDate: function (date) {
        return date.getUTCFullYear() + '/' + this.pad(date.getUTCMonth() + 1) + '/' + this.pad(date.getUTCDate());
    },

    toChinaTime: function (date) {
        return this.pad(date.getUTCHours()) + '' + this.pad(date.getUTCMinutes()) + '' + this.pad(date.getUTCSeconds());
    },

    newFileName: function (file, cb) {
        const fs = require('fs');
        const path = require('path');
        
        var noExif = false;
        var creationDateTime = "", creationDate = "", creationTime = "", baseName = "";
        var location = "", nfn = "";

        try {
            var ExifImage = require('exif').ExifImage;
            new ExifImage({ image: file }, function (error, exifData) {
                if (error) {
                    console.log('Error: ' + error.message);
                    if (error.message.substring("No Exif segment") < 0) return;
                    noExif = true;
                }
                else {
                    noExif = module.exports.isEmpty(exifData.exif.DateTimeOriginal);
                }
                baseName = path.basename(file, path.extname(file));
                if (noExif) {
                    var mtime = fs.statSync(file).mtime;
                    creationDate = module.exports.toChinaDate(mtime);
                    creationTime = module.exports.toChinaTime(mtime);
                    nfn = baseName + "-" + creationTime + ".jpg";
                }
                else {
                    creationDateTime = exifData.exif.DateTimeOriginal.split(" ");
                    creationDate = creationDateTime[0].replace(/:/g, "/");
                    creationTime = creationDateTime[1].replace(/:/g, "");
                    if (!module.exports.isEmpty(exifData.gps)) {
                        location = exifData.gps.GPSLatitude.join(".") + "_" + exifData.gps.GPSLongitude.join(".");
                    }
                    nfn = baseName + "-" + creationTime + "-" + location + ".jpg";
                }

                return cb(file, creationDate + "/" + nfn);
            });
        } catch (error) {
            console.log('Error: ' + error.message, file);
        }
    },

}
