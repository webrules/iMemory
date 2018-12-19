'use strict';
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const mkdirp = require('mkdirp');
const Jimp = require('jimp');
const util = require('./lib/util.js')

function addImageToPhotosArea(file) {
    var photosArea = document.getElementById('photos');
    var template = document.querySelector('#photo-template');
    template.content.querySelector('img').src = 'images/blank.gif';
    template.content.querySelector('img').setAttribute('data-echo', file.path);
    template.content.querySelector('img').setAttribute('data-name', file.name);
    var clone = window.document.importNode(template.content, true);
    photosArea.appendChild(clone);
}

function hideSelectFolderButton() {
    var button = document.querySelector('#select_folder');
    button.style.display = 'none';
}

function bindSelectFolderClick(cb) {
    var button = document.querySelector('#select_folder');
    button.addEventListener('click', function () {
        openFolderDialog(cb);
    });
}

function openFolderDialog(cb) {
    var inputField = document.querySelector('#folderSelector');
    inputField.addEventListener('change', function () {
        var folderPath = path.dirname(document.getElementById("folderSelector").files[0].path);
        cb(folderPath);
    });
    inputField.click();
}

function bindClickingOnAllPhotos() {
    var photos = document.querySelectorAll('.photo');
    for (var i = 0; i < photos.length; i++) {
        var photo = photos[i];
        bindClickingOnAPhoto(photo);
    }

    var fullViewPhoto = document.querySelector('#fullViewPhoto');
    fullViewPhoto.onclick = function () {
        fullViewPhoto.style.display = 'none';
    }
}

function backToGridView() {
    document.querySelector('#fullViewPhoto').style.display = 'none';
}

function bindClickingOnAPhoto(photo) {
    photo.onclick = function () {
        // console.log(this); // A placeholder until we load full view mode here
        displayPhotoInFullView(photo);
    };
}

function displayPhotoInFullView(photo) {
    var filePath = photo.querySelector('img').src;
    var fileName = photo.querySelector('img').attributes[1].value;
    document.querySelector('#fullViewPhoto > img').src = filePath.replace("/photos/thumbnails/", "/photos/normal/");
    document.querySelector('#fullViewPhoto > img').setAttribute('data-name', fileName);
    document.querySelector('#fullViewPhoto').style.display = 'block';
}

// fn: file name, nfn: new file name
// nDir: new directory, tDir: thumbnail directory
function duplicatePhoto(fn) {
    newFileName(fn, function (fn, nfn) {
        const nDir = "./photos/normal/";
        mkdirp(path.dirname(nDir + nfn), function (err) {
            if (err) console.error(err)
            fs.copyFile(fn, nDir +"/" + nfn, function () { })
            // console.log("copy photos ", fn, nDir +"/" + nfn)
        });

        const tDir = "./photos/thumbnails/";
        Jimp.read(fn)
            .then(lenna => {
                // console.log(fn, tDir + "/" + nfn);
                return lenna
                    .resize(512, 384) // resize
                    .quality(80) // set JPEG quality
                    .write(tDir + "/" + nfn); // save
            })
            .catch(err => {
                console.error(err);
            });

    });
}

async function newFileName(file, cb) {
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
                noExif = util.isEmpty(exifData.exif.DateTimeOriginal);
            }
            baseName = path.basename(file);
            if (noExif) {
                var mtime = fs.statSync(file).mtime;
                creationDate = util.toChinaDate(mtime);
                creationTime = util.toChinaTime(mtime);
                nfn = baseName + "-" + creationTime + ".jpg";
            }
            else {
                creationDateTime = exifData.exif.DateTimeOriginal.split(" ");
                creationDate = creationDateTime[0].replace(/:/g, "/");
                creationTime = creationDateTime[1].replace(/:/g, "_");
                if (!util.isEmpty(exifData.gps)) {
                    location = exifData.gps.GPSLatitude.join("_") + "_" + exifData.gps.GPSLongitude.join("_");
                }
                nfn = baseName + "-" + creationTime + "-" + location + ".jpg";
            }

            return cb(file, creationDate + "/" + nfn);
        });
    } catch (error) {
        console.log('Error: ' + error.message, file);
    }
}

window.onload = function () {
    // lazy loading
    echo.init({
        offset: 0,
        throttle: 0,
        unload: false
    });

    const isImport = true;

    bindSelectFolderClick(function (folderPath) {
        hideSelectFolderButton();

        if (!isImport) folderPath = "./photos/thumbnails";

        util.filewalker(folderPath, function (err, files) {
            if (err) {
                console.log(err);
                return;
            }

            util.findImageFiles(files, folderPath, function (imageFiles) {
                imageFiles.forEach(function (file, index) {
                    addImageToPhotosArea(file);
                    if (isImport) {
                        duplicatePhoto(file.name);
                    }
                    if (index === imageFiles.length - 1) {
                        echo.render();
                        bindClickingOnAllPhotos();
                    }
                });
            });

        });
    });
};
