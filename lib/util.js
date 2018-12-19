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
        return this.pad(date.getUTCHours()) + '_' + this.pad(date.getUTCMinutes()) + '_' + this.pad(date.getUTCSeconds());
    },

}
