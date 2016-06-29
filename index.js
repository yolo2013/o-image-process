#!/usr/bin/env node

require('shelljs/global');
const fs = require("fs");
const path = require('path');
const program = require('commander');
const jimp = require("jimp");

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// supported file types.
const exts = ['.jpg', '.jpeg', '.png'];

program
    .version('1.0.6')
    .option('-s, --scale', 'image scaling')
    .option('-e, --extra', 'extra string append to the file name')
    .option('-f, --folder', 'original image folder name')
    .option('-o, --output', 'output image folder name')
    .parse(process.argv);

let scale = program.scale ? parseFloat(program.scale) : 0.5;

let imageFolderName = program.folder || 'images';
let outputFolderName = program.folder || 'output';
let extra = program.extra || '@small';


if (!fs.existsSync(imageFolderName)) {
    console.error('The original image folder not exists. Please check again.');
    process.exit(1);

}

// read the original image folder.
fs.readdir(imageFolderName, (err, files) => {

    let count = 0;
    let resizeCount = 0;

    files.forEach((name) => {

        if (exts.indexOf(path.extname(name)) === -1) {
            return;
        }

        count++;

        jimp.read(path.join(imageFolderName, name), (err, lenna) => {
            if (err) throw err;

            // if output folder not exists, create it.
            if (!fs.existsSync(outputFolderName)) {
                fs.mkdirSync(outputFolderName);
            }

            lenna.scale(scale)
                .write(path.join(outputFolderName, name.replace(/\.[^/.]+$/, "") + extra + path.extname(name)));

            resizeCount++;
            // resize complete.
            // start compress.
            if(count === resizeCount) {
                imagemin([outputFolderName + '/*{' + exts.join(',') + '}'], outputFolderName, {
                    plugins: [
                        imageminMozjpeg(),
                        imageminPngquant({quality: '65-80'})
                    ]
                }).then(files => {
                    console.info('Complete!')
                });
            }

        });

    });
});